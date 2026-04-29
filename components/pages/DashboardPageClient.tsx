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
import OnboardingModal from '../dashboard/OnboardingModal'
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
                risk_level: latest.risk === 'HIGH' ? 2 : latest.risk === 'MODERATE' ? 1 : 0,
                risk_score: 0, // Will be updated if added to spec
                category: latest.risk || 'LOW',
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
    <div className="max-w-[1600px] mx-auto px-4 py-8">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      
      {/* API Health Banner */}
      {apiHealthy === false && (
        <div className="mb-8 bg-rose-50 border border-rose-100 rounded-[32px] px-8 py-5 flex items-center gap-5 animate-in fade-in slide-in-from-top-2">
          <div className="relative flex h-3 w-3 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </div>
          <p className="text-sm font-black text-rose-800">
            AI Service Connectivity Alert: Backend is temporarily unreachable. Risk scores may not reflect real-time data.
          </p>
        </div>
      )}

      {/* Top Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/20">
              Clinical Workspace
            </div>
            <div className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Last synced: Just now
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Welcome back, {DOCTOR_NAME}
          </h1>
          <p className="text-slate-500 font-medium">
            You have <span className="text-primary font-bold">{stats.highRiskToday} high-risk patients</span> requiring attention today.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowGlossary(true)}
            className="inline-flex items-center gap-2.5 bg-white border border-slate-200 px-6 py-4 rounded-[24px] text-xs font-black text-slate-600 hover:text-primary hover:border-primary/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all active:scale-95"
          >
            <BookOpen className="w-4.5 h-4.5" />
            GLOSSARY
          </button>
          
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-[24px] text-sm font-black shadow-2xl shadow-slate-200 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
            ADD PATIENT
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-12">
        <StatsBar stats={stats} loading={loading.stats} pendingCodesCount={pendingCodesCount} />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Main Content Area - Risk Queue */}
        <div className="xl:col-span-8">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center mb-1">
                  AI Risk Queue
                </h3>
                <p className="text-sm font-medium text-slate-400">Real-time clinical triage prioritized by Hela AI</p>
              </div>
              
              <div className="flex-1 max-w-md">
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
            
            <div className="flex-1">
              <RiskQueue 
                items={riskQueue.filter(item => {
                  const p = patients.find(p => p.patient_id === item.patient_id)
                  if (!p) return false
                  const q = searchQuery.toLowerCase()
                  const matchesSearch = (p.first_name?.toLowerCase().includes(q) || p.last_name?.toLowerCase().includes(q))
                  if (!matchesSearch && q !== '') return false
                  const itemRisk = item.predicted_risk_level === 2 ? 'HIGH' : item.predicted_risk_level === 1 ? 'MODERATE' : 'LOW'
                  if (riskFilter !== 'ALL' && itemRisk !== riskFilter) return false
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
        </div>

        {/* Global Risk Distribution */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 h-full">
             <div className="flex items-center gap-5 mb-10">
               <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                 <AlertCircle className="w-7 h-7" />
               </div>
               <div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">Population</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aggregated Risk</p>
               </div>
             </div>
             <div className="h-[400px]">
               <RiskChart data={riskDistribution} loading={loading.chart} />
             </div>
          </div>

          <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden group cursor-pointer shadow-2xl shadow-slate-200">
            <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/40 transition-all duration-500" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-black mb-2">AI Insights</h4>
              <p className="text-sm text-slate-400 font-medium mb-6 leading-relaxed">
                Unlock deeper patterns in your patient data with advanced diagnostic mapping.
              </p>
              <button className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all">
                Learn more <X className="w-4 h-4 rotate-45" />
              </button>
            </div>
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

      <OnboardingModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          // Optionally refresh data
        }}
      />

      {/* Glossary Slide-over */}
      {showGlossary && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
            onClick={() => setShowGlossary(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-[70] animate-in slide-in-from-right duration-500 ease-out border-l border-slate-100 flex flex-col">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Medical Reference</span>
              <button 
                onClick={() => setShowGlossary(false)}
                className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-8">
              <GlossarySearch />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
