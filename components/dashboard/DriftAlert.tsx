'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { HelaDriftResult } from '../../lib/types'

interface DriftAlertProps {
  drift: HelaDriftResult | null
  loading: boolean
}

export default function DriftAlert({ drift, loading }: DriftAlertProps) {
  if (loading) {
    return (
      <div className="h-24 w-full bg-slate-50 rounded-2xl animate-pulse mb-6" />
    )
  }

  if (!drift) return null

  // If no notification triggered AND drop is low, don't show anything
  if (!drift.trigger_notification && drift.adherence_drop < 20) {
    return null
  }

  return (
    <div className="mb-8 bg-amber-50 border border-amber-200 rounded-[32px] p-6 shadow-sm animate-in fade-in slide-in-from-top-2">
      <div className="flex gap-5">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-amber-500 flex-shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight mb-1">
            Adherence drift detected
          </h4>
          <p className="text-xs text-amber-700 font-bold leading-relaxed">
            Short-term adherence: {(drift.short_term_adherence * 100).toFixed(0)}% vs 
            long-term: {(drift.long_term_adherence * 100).toFixed(0)}% — a drop of 
            {drift.adherence_drop.toFixed(1)}% in the last 3 days
          </p>

          {drift.trigger_notification && (
            <div className="mt-4 bg-white/60 backdrop-blur-sm border border-amber-100 rounded-2xl p-4">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">
                Suggested Nour message
              </p>
              <p 
                className="text-[16px] text-slate-800 font-bold leading-relaxed text-right"
                style={{ direction: 'rtl' }}
              >
                {drift.nurture_message_darija}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
