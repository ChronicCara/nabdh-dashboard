'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  DashboardStats, 
  PatientWithLatestAssessment, 
  PatientAssessment,
  FamilyMember
} from '../../../lib/types'
import { 
  getDashboardStats, 
  getAllPatientsWithLatestAssessment, 
  getRiskDistributionToday, 
  getPatientAssessmentHistory,
  getActiveInviteCodes,
  getPatientFamilyMembers,
  getNewPatientsSince
} from '../../../lib/queries'

import StatsBar from '../../../components/dashboard/StatsBar'
import RiskChart from '../../../components/dashboard/RiskChart'
import FilterBar from '../../../components/dashboard/FilterBar'
import PatientTable from '../../../components/dashboard/PatientTable'
import PatientDrawer from '../../../components/dashboard/PatientDrawer'
import InviteCodeModal from '../../../components/dashboard/InviteCodeModal'
import { Plus, X, Search, Bell, Calendar, User, LayoutDashboard, Sparkles, Users as UsersIcon } from 'lucide-react'

const DOCTOR_ID = "DOCTOR_ID_PLACEHOLDER"
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

export default function DoctorDashboard() {
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
  const [familyCounts, setFamilyCounts] = useState<Record<number, number>>({})
  const [familyMembersByPatient, setFamilyMembersByPatient] = useState<Record<number, FamilyMember[]>>({})
  const [pendingCodesCount, setPendingCodesCount] = useState(0)
  const [newPatientsToday, setNewPatientsToday] = useState<PatientWithLatestAssessment[]>([])
  const [showNewPatientsBanner, setShowNewPatientsBanner] = useState(true)

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
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      Promise.all([
        getDashboardStats(DOCTOR_ID).then(res => {
          if (isMounted) {
            setStats(res)
            setLoading(prev => ({ ...prev, stats: false }))
          }
        }),
        getAllPatientsWithLatestAssessment(DOCTOR_ID).then(async (res) => {
          if (isMounted) {
            setPatients(res)
            setLoading(prev => ({ ...prev, patients: false }))
            const familyData: Record<number, FamilyMember[]> = {}
            const counts: Record<number, number> = {}
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
        }),
        getRiskDistributionToday().then(res => {
          if (isMounted) {
            setRiskDistribution(res)
            setLoading(prev => ({ ...prev, chart: false }))
          }
        }),
        getActiveInviteCodes(DOCTOR_ID).then(res => {
          if (isMounted) setPendingCodesCount(res.length)
        }),
        getNewPatientsSince(DOCTOR_ID, yesterday).then(res => {
          if (isMounted) setNewPatientsToday(res)
        })
      ]).catch(() => {
        if (isMounted) setError('Connection error. Please check your Supabase credentials.')
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
    try {
      const history = await getPatientAssessmentHistory(patient.id)
      setAssessmentHistory(history)
    } catch (err) {
      setError(`Failed to load history for ${patient.first_name}`)
    } finally {
      setLoading(prev => ({ ...prev, drawer: false }))
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      
      {/* Top Header - Mobile App Style */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-[24px] bg-sky-100 flex items-center justify-center mr-5 shadow-sm border-2 border-white">
            <span className="text-2xl font-bold text-sky-600">DB</span>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[13px] font-black text-sky-500 uppercase tracking-widest flex items-center">
                <Sparkles className="w-3 h-3 mr-1" /> Welcome back
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Good morning, {DOCTOR_NAME}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all shadow-sm">
            <Bell className="w-6 h-6" />
          </button>
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all shadow-sm">
            <Calendar className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-3.5 rounded-[24px] font-black shadow-lg shadow-sky-100 transition-all duration-300 hover:-translate-y-1 active:scale-95"
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
            ADD PATIENT
          </button>
        </div>
      </div>

      {/* New Patients Notification */}
      {newPatientsToday.length > 0 && showNewPatientsBanner && (
        <div className="mb-8 bg-gradient-to-r from-sky-500 to-sky-400 rounded-[32px] p-6 flex items-center justify-between shadow-xl shadow-sky-100 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-lg tracking-tight">
                New clinical activity!
              </p>
              <p className="text-sky-50 text-sm font-medium">
                {newPatientsToday.length} new patient(s) have joined your care group today.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowNewPatientsBanner(false)}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats Section */}
      <div className="mb-10">
        <StatsBar stats={stats} loading={loading.stats} pendingCodesCount={pendingCodesCount} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-12">
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-50 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center">
                <UsersIcon className="w-6 h-6 mr-3 text-sky-500" />
                Active Patient Roster
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
            
            <PatientTable 
              patients={filteredPatients}
              loading={loading.patients}
              onPatientClick={handlePatientClick}
              selectedPatientId={selectedPatient?.id ?? null}
              familyCounts={familyCounts}
            />
          </div>
        </div>

        {/* Chart Section - Re-designed to be cleaner */}
        <div className="lg:col-span-12 mt-4">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50">
             <div className="flex items-center mb-8">
               <div className="p-3 bg-amber-50 rounded-2xl mr-4">
                 <LayoutDashboard className="w-6 h-6 text-amber-500" />
               </div>
               <div>
                 <h3 className="text-xl font-black text-slate-800 tracking-tight">Risk Distribution</h3>
                 <p className="text-sm font-medium text-slate-400">Live population assessment metrics</p>
               </div>
             </div>
             <RiskChart data={riskDistribution} loading={loading.chart} />
          </div>
        </div>
      </div>

      <PatientDrawer 
        patient={selectedPatient}
        assessmentHistory={assessmentHistory}
        loadingHistory={loading.drawer}
        onClose={() => setSelectedPatient(null)}
        familyMembers={selectedPatient ? familyMembersByPatient[selectedPatient.id] : []}
        loadingFamily={false}
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
