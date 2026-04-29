'use client'

import React from 'react'
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  ReferenceLine, AreaChart, Area, Legend, CartesianGrid 
} from 'recharts'
import { HelaHistoryPoint } from '../../lib/types'

interface VitalTrendChartsProps {
  history: HelaHistoryPoint[]
  loading: boolean
}

const CustomTooltip = ({ active, payload, label, unit = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-[20px] shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-[11px] font-bold text-slate-400">{entry.name}</span>
              <span className="text-sm font-black text-white">
                {entry.value?.toFixed(0)}{unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

const ChartCard = ({ title, children, loading }: { title: string, children: React.ReactNode, loading: boolean }) => (
  <div className="bg-slate-50/50 rounded-[32px] p-8 border border-slate-100 mb-8 last:mb-0 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">{title}</h3>
      <div className="w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
    </div>
    <div className="h-[220px] w-full">
      {loading ? (
        <div className="w-full h-full bg-slate-100 rounded-[24px] animate-pulse" />
      ) : children}
    </div>
  </div>
)

export default function VitalTrendCharts({ history, loading }: VitalTrendChartsProps) {
  if (!loading && history.length === 0) {
    return (
      <div className="bg-slate-50 rounded-[40px] p-16 text-center border border-dashed border-slate-200">
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No clinical data available for this range</p>
      </div>
    )
  }

  const formatXAxis = (tickItem: string) => {
    const d = new Date(tickItem)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  const bpData = history.filter(h => h.systolic !== null && h.diastolic !== null)
  const glucoseData = history.filter(h => h.glucose !== null)
  const riskData = history.filter(h => h.risk !== null).map(h => ({
    ...h,
    normalized_score: h.risk === 'HIGH' ? 100 : h.risk === 'MODERATE' ? 50 : 10
  }))

  // Guard for Recharts SSR
  if (typeof window === 'undefined') {
    return <div className="h-[200px] w-full bg-slate-50 rounded-2xl animate-pulse" />
  }

  return (
    <div className="space-y-2">
      {/* CHART 1 — Blood Pressure */}
      <ChartCard title="Blood Pressure Intensity" loading={loading}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={bpData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
            <XAxis dataKey="date" tickFormatter={formatXAxis} hide={false} tick={{fontSize: 10, fontWeight: 900, fill: '#cbd5e1'}} axisLine={false} tickLine={false} />
            <YAxis domain={[60, 200]} hide={false} tick={{fontSize: 10, fontWeight: 700, fill: '#cbd5e1'}} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip unit=" mmHg" />} />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', paddingBottom: '20px' }} />
            <ReferenceLine y={140} stroke="#EF4444" strokeDasharray="6 6" label={{ position: 'right', value: 'HYPERTENSIVE', fill: '#EF4444', fontSize: 9, fontWeight: 900 }} />
            <Line name="Systolic" type="monotone" dataKey="systolic" stroke="#EF4444" strokeWidth={5} dot={false} activeDot={{ r: 8, strokeWidth: 0 }} />
            <Line name="Diastolic" type="monotone" dataKey="diastolic" stroke="#3B82F6" strokeWidth={5} dot={false} activeDot={{ r: 8, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* CHART 2 — Blood Glucose */}
      <ChartCard title="Glucose Stability" loading={loading}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={glucoseData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
            <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{fontSize: 10, fontWeight: 900, fill: '#cbd5e1'}} axisLine={false} tickLine={false} />
            <YAxis domain={[60, 400]} tick={{fontSize: 10, fontWeight: 700, fill: '#cbd5e1'}} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip unit=" mg/dL" />} />
            <ReferenceLine y={126} stroke="#F59E0B" strokeDasharray="6 6" label={{ position: 'right', value: 'DIABETIC', fill: '#F59E0B', fontSize: 9, fontWeight: 900 }} />
            <Line name="Glucose" type="monotone" dataKey="glucose" stroke="#F59E0B" strokeWidth={5} dot={false} activeDot={{ r: 8, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* CHART 3 — Risk Score Trend */}
      <ChartCard title="AI Risk Trajectory" loading={loading}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={riskData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2}/>
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
            <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{fontSize: 10, fontWeight: 900, fill: '#cbd5e1'}} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{fontSize: 10, fontWeight: 700, fill: '#cbd5e1'}} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip unit="%" />} />
            <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="6 6" label={{ position: 'right', value: 'CRITICAL', fill: '#EF4444', fontSize: 9, fontWeight: 900 }} />
            <Area 
              name="Risk Level" 
              type="monotone" 
              dataKey="normalized_score"
              stroke="#3B82F6"
              strokeWidth={5}
              fillOpacity={1} 
              fill="url(#riskGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
