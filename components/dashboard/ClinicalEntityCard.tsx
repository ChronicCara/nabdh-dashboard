'use client'

import React from 'react'
import { ClinicalEntities, RiskAssessmentResponse } from '../../lib/types'
import { BrainCircuit, Pill, Thermometer, ScrollText, AlertCircle } from 'lucide-react'

interface ClinicalEntityCardProps {
  entities: ClinicalEntities | null
  riskAssessment: RiskAssessmentResponse | null
  loading: boolean
}

const Chip = ({ text, colorClass }: { text: string, colorClass: string }) => (
  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colorClass}`}>
    {text}
  </span>
)

export default function ClinicalEntityCard({ entities, riskAssessment, loading }: ClinicalEntityCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-[32px] p-8 border border-slate-50 shadow-sm space-y-6">
        <div className="h-4 w-24 bg-slate-100 animate-pulse rounded-full" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-slate-50 animate-pulse rounded-2xl" />
          <div className="h-20 bg-slate-50 animate-pulse rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!entities && !riskAssessment) {
    return (
      <div className="bg-slate-50 rounded-[32px] p-10 text-center border border-dashed border-slate-200">
        <BrainCircuit className="w-8 h-8 text-slate-200 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-400 italic">No recent AI analysis for this patient</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 space-y-8">
        {/* Symptoms & Meds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Thermometer className="w-4 h-4" />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Symptoms Reported</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {entities?.symptoms.length ? entities.symptoms.map((s, i) => (
                <Chip key={i} text={s} colorClass="bg-red-50 text-red-600 border border-red-100" />
              )) : <p className="text-xs font-bold text-slate-400 italic">None reported</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Pill className="w-4 h-4" />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Medication Status</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {entities?.missed_medications.length ? entities.missed_medications.map((m, i) => (
                <Chip key={i} text={`Missed: ${m}`} colorClass="bg-amber-50 text-amber-600 border border-amber-100" />
              )) : (
                <Chip text="All medications taken ✓" colorClass="bg-emerald-50 text-emerald-600 border border-emerald-100" />
              )}
            </div>
          </div>
        </div>

        {/* Vitals Extracted */}
        <div className="bg-slate-50 rounded-2xl p-4 flex flex-wrap gap-x-8 gap-y-2 border border-slate-100">
          {entities?.vitals.systolic_bp && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">BP</span>
              <span className="text-sm font-black text-slate-800">{entities.vitals.systolic_bp}/{entities.vitals.diastolic_bp} <span className="text-[10px] text-slate-400 font-bold">mmHg</span></span>
            </div>
          )}
          {entities?.vitals.glucose && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">GLU</span>
              <span className="text-sm font-black text-slate-800">{entities.vitals.glucose} <span className="text-[10px] text-slate-400 font-bold">mg/dL</span></span>
            </div>
          )}
          {entities?.vitals.bmi && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">BMI</span>
              <span className="text-sm font-black text-slate-800">{entities.vitals.bmi.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* AI Note */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-400">
            <ScrollText className="w-4 h-4" />
            <h4 className="text-[10px] font-black uppercase tracking-widest">AI Clinical Synthesis</h4>
          </div>
          <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-4 border-sky-200 pl-5">
            "{entities?.clinical_note || 'Analysis in progress...'}"
          </p>
        </div>

        {/* Risk Summary */}
        {riskAssessment && (
          <div className="pt-8 border-t border-slate-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className={`px-4 py-1.5 rounded-full text-[11px] font-black text-white shadow-sm ${
                  riskAssessment.category === 'HIGH' ? 'bg-red-500' :
                  riskAssessment.category === 'MODERATE' ? 'bg-amber-500' : 'bg-green-500'
                }`}>
                  {riskAssessment.category} RISK
                </div>
                <div className="text-lg font-black text-slate-800 tracking-tight">
                  {(riskAssessment.risk_score / 10 * 100).toFixed(1)}% Score
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-widest">Review {riskAssessment.monitoring_frequency}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recommendations</h5>
              <ul className="space-y-2">
                {riskAssessment.recommendations.slice(0, 3).map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-600 leading-normal">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-300 mt-1.5 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
