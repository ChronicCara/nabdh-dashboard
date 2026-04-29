import React from 'react'
import { DashboardStats } from '../../lib/types'
import { Users, AlertTriangle, TrendingUp, Target, KeyRound, Sparkles } from 'lucide-react'

interface StatsBarProps {
  stats: DashboardStats
  loading: boolean
  pendingCodesCount: number
}

export default function StatsBar({ stats, loading, pendingCodesCount }: StatsBarProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 animate-pulse">
            <div className="flex flex-col items-center space-y-3">
              <div className="h-14 w-14 bg-slate-100 rounded-2xl"></div>
              <div className="h-4 w-20 bg-slate-100 rounded"></div>
              <div className="h-6 w-12 bg-slate-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const statItems = [
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'sky',
      bg: 'bg-sky-50',
      text: 'text-sky-600'
    },
    {
      label: 'High Risk Today',
      value: stats.highRiskToday,
      icon: AlertTriangle,
      color: 'rose',
      bg: stats.highRiskToday > 0 ? 'bg-rose-50' : 'bg-slate-50',
      text: stats.highRiskToday > 0 ? 'text-rose-600' : 'text-slate-400',
      alert: stats.highRiskToday > 0
    },
    {
      label: 'Avg Risk Score',
      value: `${(stats.avgRiskScoreToday * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'amber',
      bg: 'bg-amber-50',
      text: 'text-amber-600'
    },
    {
      label: 'Model Accuracy',
      value: `${(stats.modelAccuracy * 100).toFixed(1)}%`,
      icon: Target,
      color: 'emerald',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600'
    },
    {
      label: 'Pending Codes',
      value: pendingCodesCount,
      icon: KeyRound,
      color: 'sky',
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      pulse: pendingCodesCount > 0
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {statItems.map((item, idx) => {
        const Icon = item.icon
        return (
          <div 
            key={idx} 
            className="bg-white rounded-[28px] p-6 border border-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1.5 flex flex-col group relative overflow-hidden"
          >
            {/* Subtle background decoration */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150 ${item.bg}`} />
            
            <div className="flex items-center gap-4 mb-5">
              <div className={`p-3.5 ${item.bg} ${item.text} rounded-[20px] shadow-sm relative`}>
                <Icon className="w-5 h-5" strokeWidth={2.5} />
                {item.pulse && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                )}
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
                {item.label}
              </p>
            </div>
            
            <div className="flex items-end justify-between">
              <p className={`text-2xl font-black tracking-tight ${item.alert ? 'text-rose-600' : 'text-slate-800'}`}>
                {item.value}
              </p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3 h-3" />
                <span>+2.4%</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
