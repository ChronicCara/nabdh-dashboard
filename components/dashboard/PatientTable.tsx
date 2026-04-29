import React from 'react'
import { PatientWithLatestAssessment } from '../../lib/types'
import { Search, Users as UsersIcon, ChevronRight } from 'lucide-react'

interface PatientTableProps {
  patients: PatientWithLatestAssessment[]
  loading: boolean
  onPatientClick: (patient: PatientWithLatestAssessment) => void
  selectedPatientId: string | null
  familyCounts?: Record<string, number>
}

export default function PatientTable({ patients, loading, onPatientClick, selectedPatientId, familyCounts }: PatientTableProps) {
  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-20 bg-white rounded-3xl animate-pulse border border-slate-100"></div>
        ))}
      </div>
    )
  }

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="bg-slate-50 p-6 rounded-[32px] mb-4">
          <Search className="w-10 h-10 text-slate-300" />
        </div>
        <p className="text-xl font-bold text-slate-700 tracking-tight">No patients found</p>
        <p className="text-sm mt-1 text-slate-400">Try adjusting your filters or search query.</p>
      </div>
    )
  }

  const formatDate = (ds: string) => {
    const d = new Date(ds)
    const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${String(d.getDate()).padStart(2,'0')} ${m[d.getMonth()]} ${d.getFullYear()}`
  }

  const isNew = (date?: string) => {
    if (!date) return false
    return new Date(date).getTime() > Date.now() - 86400000
  }

  const sortedPatients = [...patients]

  return (
    <div className="w-full">
      {/* Header labels - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:flex px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">
        <div className="flex-[1.5]">Patient Information</div>
        <div className="flex-1">Clinical Status</div>
        <div className="flex-1">Recent Vitals</div>
        <div className="flex-1">Engagement</div>
        <div className="w-12 text-center">Action</div>
      </div>

      <div className="divide-y divide-slate-50">
        {sortedPatients.map((patient) => {
          const sel = selectedPatientId === patient.id
          const a = patient.latest_assessment
          const fc = familyCounts?.[patient.id] ?? 0
          const patientIsNew = isNew(a?.assessment_date)

          return (
            <div 
              key={patient.id} 
              onClick={() => onPatientClick(patient)}
              className={`group flex flex-col lg:flex-row items-start lg:items-center px-8 py-6 transition-all duration-300 cursor-pointer 
                ${sel ? 'bg-indigo-50/60' : 'bg-white hover:bg-slate-50/80'}
              `}
            >
              {/* Patient Info */}
              <div className="flex-[1.5] flex items-center space-x-4 w-full lg:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm border transition-all duration-300 group-hover:scale-105 ${
                  sel ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-50 text-slate-600 border-slate-100'
                }`}>
                  {patient.first_name?.[0]}{patient.last_name?.[0]}
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-bold text-slate-800 text-[16px] tracking-tight">
                      {patient.first_name} {patient.last_name}
                    </p>
                    {patientIsNew && (
                      <span className="ml-2 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    ID: {patient.patient_id} · {patient.age} yrs · {patient.gender?.toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex-1 mt-4 lg:mt-0 w-full lg:w-auto">
                <div className="lg:hidden text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Risk Status</div>
                {a?.risk_level === 'LOW' && (
                  <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100/50">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[12px] font-bold">Low Risk</span>
                  </div>
                )}
                {a?.risk_level === 'MODERATE' && (
                  <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-100/50">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-[12px] font-bold">Moderate Risk</span>
                  </div>
                )}
                {a?.risk_level === 'HIGH' && (
                  <div className="inline-flex items-center space-x-2 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-xl border border-rose-100/50">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                    <span className="text-[12px] font-bold">High Alert</span>
                  </div>
                )}
                {!a && <span className="text-slate-300 font-medium text-xs">No Recent Assessment</span>}
              </div>

              {/* Vitals */}
              <div className="flex-1 mt-4 lg:mt-0 w-full lg:w-auto">
                <div className="lg:hidden text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Vitals</div>
                {a ? (
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">BP</span>
                      <span className="text-xs font-bold text-slate-700">{a.systolic_bp}/{a.diastolic_bp}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">GLU</span>
                      <span className="text-xs font-bold text-slate-700">{a.fasting_glucose}</span>
                    </div>
                  </div>
                ) : <span className="text-slate-300">—</span>}
              </div>

              {/* Family/Engagement */}
              <div className="flex-1 mt-4 lg:mt-0 w-full lg:w-auto">
                <div className="lg:hidden text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Engagement</div>
                <div className="flex items-center space-x-4">
                  {fc > 0 && (
                    <div className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                      <UsersIcon className="w-4 h-4 mr-1.5" />
                      <span className="text-xs font-bold">{fc}</span>
                    </div>
                  )}
                  <div className="text-slate-400 text-[11px] font-bold">
                    {a ? formatDate(a.assessment_date) : 'Pending'}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="w-12 mt-4 lg:mt-0 flex justify-end lg:justify-center w-full lg:w-auto">
                <div className={`p-2 rounded-xl transition-all duration-300 ${sel ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
