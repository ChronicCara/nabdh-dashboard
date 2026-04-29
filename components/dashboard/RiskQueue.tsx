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

  const highRisk = items.filter(i => i.category === 'HIGH')
  const moderateRisk = items.filter(i => i.category === 'MODERATE')
  const lowRisk = items.filter(i => i.category === 'LOW')

  const renderGroup = (groupItems: HelaRiskQueueItem[], title: string, colorClass: string) => {
    if (groupItems.length === 0) return null

    return (
      <div key={title}>
        <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-3 z-10 border-b border-slate-50">
          <h4 className={`text-[11px] font-black uppercase tracking-widest ${colorClass}`}>
            {title} ({groupItems.length})
          </h4>
        </div>
        <div className="divide-y divide-slate-50">
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
                className={`relative group flex items-center px-6 py-5 cursor-pointer transition-all duration-300 ${
                  isSelected ? 'bg-indigo-50/80' : 'hover:bg-slate-50/80'
                }`}
              >
                {/* Risk Indicator Bar or Selected Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  isSelected 
                    ? 'bg-indigo-600' 
                    : item.category === 'HIGH' ? 'bg-red-500' 
                    : item.category === 'MODERATE' ? 'bg-amber-500' 
                    : 'bg-green-500'
                }`} />

                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shadow-sm ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {initials}
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient'}
                      </p>
                      {item.category === 'HIGH' && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                      ID: {item.patient_id}
                    </p>
                  </div>
                </div>

                <div className={`px-3 py-1.5 rounded-xl text-[11px] font-black shadow-sm ${
                  item.category === 'HIGH' ? 'bg-red-500 text-white' :
                  item.category === 'MODERATE' ? 'bg-amber-500 text-white' :
                  'bg-green-500 text-white'
                }`}>
                  {(item.risk_score / 10 * 100).toFixed(0)}%
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)] overflow-y-auto bg-white rounded-[32px] border border-slate-50 shadow-sm scrollbar-hide">
      {renderGroup(highRisk, "High Risk", "text-red-500")}
      {renderGroup(moderateRisk, "Moderate Risk", "text-amber-500")}
      {renderGroup(lowRisk, "Low Risk", "text-green-500")}
    </div>
  )
}
