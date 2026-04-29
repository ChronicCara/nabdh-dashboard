'use client'

import React, { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { 
  DashboardStats, 
  PatientWithLatestAssessment, 
  PatientAssessment,
  FamilyMember,
  HelaRiskQueueItem,
  HelaHistoryPoint,
  HelaDriftResult,
  ClinicalEntities,
  RiskAssessmentResponse
} from '../../lib/types'
import { 
  getDashboardStats, 
  getAllPatientsWithLatestAssessment, 
  getRiskDistributionToday, 
  getPatientAssessmentHistory,
  getActiveInviteCodes,
  getPatientFamilyMembers
} from '../../lib/queries'
import {
  checkHealth,
  getRiskQueue,
  getPatientHistory,
  checkPatientDrift
} from '../../lib/helaApi'

import StatsBar from '../dashboard/StatsBar'
import FilterBar from '../dashboard/FilterBar'
import InviteCodeModal from '../dashboard/InviteCodeModal'
import RiskQueue from '../dashboard/RiskQueue'
import { Plus, X, Bell, Calendar, Sparkles, Users as UsersIcon, BookOpen, AlertCircle, Loader2 } from 'lucide-react'

const RiskChart = dynamic(() => import('../dashboard/RiskChart'), { ssr: false })
const PatientDrawer = dynamic(() => import('../dashboard/PatientDrawer'), { ssr: false })
const GlossarySearch = dynamic(() => import('../dashboard/GlossarySearch'), { ssr: false })

const DOCTOR_ID = "00000000-0000-0000-0000-000000000000"
const DOCTOR_NAME = "Dr. Benali"

function ErrorBanner({ message, onDismiss }: { message: string, onDismiss: () => void }) {
  return (
    <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-700 px-5 py-4 rounded-[24px] relative flex items-start justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center">
        <div className="p-2 bg-rose-100 rounded-xl mr-3">
          <X className="w-4 h-4 text-rose-600" />
        </div>
        <span className="font-bold text-sm">{message}</span>
      </div>
      <button onClick={onDismiss} className="p-1 hover:bg-rose-100 rounded-full transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function DashboardPageClient() {
  // Existing Supabase State
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    highRiskToday: 0,
    avgRiskScoreToday: 0,
    modelAccuracy: 0
  })
  const [patients, setPatients] = useState<PatientWithLatestAssessment[]>([])
  const [riskDistribution, setRiskDistribution] = useState<{ risk_level: string; count: number }[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientWithLatestAssessment | null>(null)
  const [assessmentHistory, setAssessmentHistory] = useState<PatientAssessment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'LOW' | 'MODERATE' | 'HIGH'>('ALL')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [familyCounts, setFamilyCounts] = useState<Record<string, number>>({})
  const [familyMembersByPatient, setFamilyMembersByPatient] = useState<Record<string, FamilyMember[]>>({})
  const [pendingCodesCount, setPendingCodesCount] = useState(0)

  // New Hela AI State
  const [riskQueue, setRiskQueue] = useState<HelaRiskQueueItem[]>([])
  const [patientHistory, setPatientHistory] = useState<HelaHistoryPoint[]>([])
  const [driftData, setDriftData] = useState<HelaDriftResult | null>(null)
  const [clinicalEntities, setClinicalEntities] = useState<ClinicalEntities | null>(null)
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessmentResponse | null>(null)
  const [helaLoading, setHelaLoading] = useState({
    queue: true,
    history: false,
    drift: false
  })
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null)
  const [showGlossary, setShowGlossary] = useState(false)

  const [loading, setLoading] = useState({
    stats: true,
    patients: true,
    chart: true,
    drawer: false
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const fetchAll = async () => {
      // Supabase Calls
      getDashboardStats(DOCTOR_ID).then(res => {
        if (isMounted) {
          setStats(res)
          setLoading(prev => ({ ...prev, stats: false }))
        }
      })
      getAllPatientsWithLatestAssessment(DOCTOR_ID).then(async (res) => {
        if (isMounted) {
          setPatients(res)
          setLoading(prev => ({ ...prev, patients: false }))
          const familyData: Record<string, FamilyMember[]> = {}
          const counts: Record<string, number> = {}
          await Promise.all(res.map(async (p) => {
            const members = await getPatientFamilyMembers(p.id)
            familyData[p.id] = members
            counts[p.id] = members.length
          }))
          if (isMounted) {
            setFamilyMembersByPatient(familyData)
            setFamilyCounts(counts)
          }
        }
      })
      getRiskDistributionToday().then(res => {
        if (isMounted) {
          setRiskDistribution(res)
          setLoading(prev => ({ ...prev, chart: false }))
        }
      })
      getActiveInviteCodes(DOCTOR_ID).then(res => {
        if (isMounted) setPendingCodesCount(res.length)
      })

      // Hela AI Calls
      checkHealth().then(healthy => {
        if (isMounted) setApiHealthy(healthy)
      })
      getRiskQueue().then(queue => {
        if (isMounted) {
          setRiskQueue(queue)
          setHelaLoading(prev => ({ ...prev, queue: false }))
        }
      })
    }
    fetchAll()
    return () => { isMounted = false }
  }, [])

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = (p.first_name?.toLowerCase().includes(q) || p.last_name?.toLowerCase().includes(q))
      if (!matchesSearch && q !== '') return false
      if (riskFilter !== 'ALL' && p.latest_assessment?.risk_level !== riskFilter) return false
      return true
    })
  }, [patients, searchQuery, riskFilter])

  const handlePatientClick = async (patient: PatientWithLatestAssessment) => {
    setSelectedPatient(patient)
    setLoading(prev => ({ ...prev, drawer: true }))
    setHelaLoading(prev => ({ ...prev, history: true, drift: true }))
    
    try {
      // Supabase call
      const history = await getPatientAssessmentHistory(patient.id)
      setAssessmentHistory(history)

      // Hela AI calls in parallel
      if (patient.patient_id) {
        Promise.all([
          getPatientHistory(patient.patient_id, 30).then(res => {
            setPatientHistory(res)
            setHelaLoading(prev => ({ ...prev, history: false }))
            
            // Extract latest point for entities/assessment if needed
            if (res.length > 0) {
              const latest = res[res.length - 1]
              // Note: In a real scenario, these would come from specific endpoints 
              // but we map them from history for the UI demonstration
              setRiskAssessment({
                risk_level: latest.category === 'HIGH' ? 2 : latest.category === 'MODERATE' ? 1 : 0,
                risk_score: latest.risk_score || 0,
                category: (latest.category as any) || 'LOW',
                probabilities: { low: 0, moderate: 0, high: 0 },
                recommendations: [],
                monitoring_frequency: 'Daily'
              })
            }
          }),
          checkPatientDrift(patient.patient_id).then(res => {
            setDriftData(res)
            setHelaLoading(prev => ({ ...prev, drift: false }))
          })
        ])
      }
    } catch (err) {
      setError(`Failed to load data for ${patient.first_name}`)
    } finally {
      setLoading(prev => ({ ...prev, drawer: false }))
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto relative">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      
      {/* API Health Banner */}
      {apiHealthy === false && (
        <div className="mb-6 bg-rose-50 border border-rose-200 rounded-[24px] px-6 py-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </div>
          <p className="text-sm font-bold text-rose-700">
            AI backend is unavailable — risk scores may be outdated. Supabase data is still live.
          </p>
        </div>
      )}

      {/* Glossary Slide-in Panel */}
      {showGlossary && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/5 backdrop-blur-sm z-30" 
            onClick={() => setShowGlossary(false)} 
          />
          <div className="fixed left-64 top-16 w-[360px] h-[calc(100vh-64px)] bg-white border-r border-slate-100 shadow-2xl z-40 animate-in slide-in-from-left duration-500 ease-out p-8">
            <button 
              onClick={() => setShowGlossary(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-800 bg-slate-50 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            <GlossarySearch />
          </div>
        </>
      )}

      {/* Top Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-[24px] bg-indigo-600 flex items-center justify-center mr-5 shadow-lg shadow-indigo-100 border-2 border-white">
            <span className="text-2xl font-bold text-white">NH</span>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[13px] font-black text-indigo-500 uppercase tracking-widest flex items-center">
                <Sparkles className="w-3 h-3 mr-1" /> Welcome back
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Good morning, {DOCTOR_NAME}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowGlossary(true)}
            className="inline-flex items-center gap-2 bg-white border border-slate-100 px-5 py-3 rounded-[20px] text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            GLOSSARY
          </button>
          <button className="p-3 bg-white border border-slate-100 rounded-[20px] text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all shadow-sm">
            <Bell className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-[24px] font-black shadow-xl shadow-indigo-100 transition-all duration-300 hover:-translate-y-1 active:scale-95"
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
            ADD PATIENT
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-10">
        <StatsBar stats={stats} loading={loading.stats} pendingCodesCount={pendingCodesCount} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area - Risk Queue */}
        <div className="lg:col-span-12">
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center">
                <UsersIcon className="w-6 h-6 mr-3 text-indigo-500" />
                AI-Prioritized Risk Queue
              </h3>
              
              <div className="flex-1 max-w-xl">
                <FilterBar 
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  riskFilter={riskFilter}
                  onRiskFilterChange={setRiskFilter}
                  totalShown={filteredPatients.length}
                  totalAll={patients.length}
                />
              </div>
            </div>
            
            <RiskQueue 
              items={riskQueue.filter(item => {
                // Connect filtering from FilterBar to RiskQueue items
                const p = patients.find(p => p.patient_id === item.patient_id)
                if (!p) return false
                const q = searchQuery.toLowerCase()
                const matchesSearch = (p.first_name?.toLowerCase().includes(q) || p.last_name?.toLowerCase().includes(q))
                if (!matchesSearch && q !== '') return false
                if (riskFilter !== 'ALL' && item.category !== riskFilter) return false
                return true
              })}
              patients={patients}
              loading={helaLoading.queue}
              selectedPatientId={selectedPatient?.patient_id ?? null}
              onPatientSelect={(pid) => {
                const p = patients.find(p => p.patient_id === pid)
                if (p) handlePatientClick(p)
              }}
            />
          </div>
        </div>

        {/* Global Risk Distribution */}
        <div className="lg:col-span-12 mt-4">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50">
             <div className="flex items-center mb-8">
               <div className="p-3 bg-indigo-50 rounded-2xl mr-4">
                 <AlertCircle className="w-6 h-6 text-indigo-500" />
               </div>
               <div>
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">Population Overview</h3>
                 <p className="text-sm font-medium text-slate-400">Aggregated risk metrics across all synced profiles</p>
               </div>
             </div>
             <RiskChart data={riskDistribution} loading={loading.chart} />
          </div>
        </div>
      </div>

      <PatientDrawer 
        patient={selectedPatient}
        assessmentHistory={assessmentHistory}
        loadingHistory={loading.drawer || helaLoading.history}
        onClose={() => setSelectedPatient(null)}
        familyMembers={selectedPatient ? familyMembersByPatient[selectedPatient.id] : []}
        loadingFamily={false}
        // New Hela Props
        history={patientHistory}
        drift={driftData}
        loadingDrift={helaLoading.drift}
        clinicalEntities={clinicalEntities}
        riskAssessment={riskAssessment}
      />

      <InviteCodeModal
        isOpen={showInviteModal}
        doctorId={DOCTOR_ID}
        doctorName={DOCTOR_NAME}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  )
}
