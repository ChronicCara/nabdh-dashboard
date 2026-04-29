'use client'

import React from 'react'
import { HelaRiskQueueItem, PatientWithLatestAssessment } from '../../lib/types'

interface RiskQueueProps {
  items: HelaRiskQueueItem[]
  patients: PatientWithLatestAssessment[]
  loading: boolean
  selectedPatientId: string | null
  onPatientSelect: (patientId: string) => void
}

export default function RiskQueue({
  items,
  patients,
  loading,
  selectedPatientId,
  onPatientSelect
}: RiskQueueProps) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="text-sm font-medium">No patients in queue</p>
      </div>
    )
  }

  const highRisk = items.filter(i => i.predicted_risk_level === 2)
  const moderateRisk = items.filter(i => i.predicted_risk_level === 1)
  const lowRisk = items.filter(i => i.predicted_risk_level === 0)

  const renderGroup = (groupItems: HelaRiskQueueItem[], title: string, colorClass: string) => {
    if (groupItems.length === 0) return null

    return (
      <div key={title}>
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-10 py-4 z-10 border-b border-slate-50 flex items-center justify-between">
          <h4 className={`text-[10px] font-black uppercase tracking-[0.25em] ${colorClass}`}>
            {title}
          </h4>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg">
            {groupItems.length} patients
          </span>
        </div>
        <div className="divide-y divide-slate-50/50">
          {groupItems.map((item) => {
            const patient = patients.find(p => p.patient_id === item.patient_id)
            const isSelected = selectedPatientId === item.patient_id
            const initials = patient 
              ? `${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}`
              : '??'

            return (
              <div
                key={item.patient_id}
                onClick={() => onPatientSelect(item.patient_id)}
                className={`relative group flex items-center px-10 py-6 cursor-pointer transition-all duration-300 ${
                  isSelected ? 'bg-primary/[0.03]' : 'hover:bg-slate-50/50'
                }`}
              >
                {/* Active Indicator Dot */}
                {isSelected && (
                  <div className="absolute left-4 w-1.5 h-10 bg-primary rounded-full animate-in fade-in slide-in-from-left duration-500" />
                )}

                <div className="flex items-center gap-6 flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black shadow-sm border transition-all duration-300 ${
                    isSelected ? 'bg-white border-primary/20 text-primary scale-110' : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}>
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <p className={`font-black text-[16px] tracking-tight truncate ${isSelected ? 'text-primary' : 'text-slate-800'}`}>
                        {patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient'}
                      </p>
                      {item.predicted_risk_level === 2 && (
                        <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-sm shadow-rose-200" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        ID: {item.patient_id.slice(0, 8)}...
                      </p>
                      {item.symptoms && (
                        <>
                          <div className="h-1 w-1 rounded-full bg-slate-200" />
                          <p className="text-[11px] text-slate-400 font-bold italic line-clamp-1">
                            {item.symptoms}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Assessment</p>
                    <p className="text-sm font-black text-slate-800">{(item.risk_score * 10).toFixed(0)}%</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[11px] font-black shadow-sm ${
                    item.predicted_risk_level === 2 ? 'bg-[#EF4444] text-white shadow-rose-100' :
                    item.predicted_risk_level === 1 ? 'bg-[#F59E0B] text-white shadow-amber-100' :
                    'bg-[#10B981] text-white shadow-emerald-100'
                  }`}>
                    {item.category}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-hide">
      {renderGroup(highRisk, "Immediate Attention Required", "text-[#EF4444]")}
      {renderGroup(moderateRisk, "Monitored / Stable", "text-[#F59E0B]")}
      {renderGroup(lowRisk, "Optimal Health", "text-[#10B981]")}
    </div>
  )
}
