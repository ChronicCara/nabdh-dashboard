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
      <div className="bg-white p-4 rounded-[24px] shadow-2xl border border-slate-50">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-black" style={{ color: entry.color }}>
            {entry.name}: {entry.value?.toFixed(1)}{unit}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const ChartCard = ({ title, children, loading }: { title: string, children: React.ReactNode, loading: boolean }) => (
  <div className="bg-white rounded-[32px] p-6 border border-slate-50 shadow-sm mb-6">
    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{title}</h3>
    <div className="h-[180px] w-full">
      {loading ? (
        <div className="w-full h-full bg-slate-50 rounded-2xl animate-pulse" />
      ) : children}
    </div>
  </div>
)

export default function VitalTrendCharts({ history, loading }: VitalTrendChartsProps) {
  if (!loading && history.length === 0) {
    return (
      <div className="bg-slate-50 rounded-[40px] p-12 text-center border border-dashed border-slate-200">
        <p className="text-sm font-bold text-slate-400">No data points yet for this patient</p>
      </div>
    )
  }

  const formatXAxis = (tickItem: string) => {
    const d = new Date(tickItem)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  const bpData = history.filter(h => h.systolic_bp !== null && h.diastolic_bp !== null)
  const glucoseData = history.filter(h => h.fasting_glucose !== null)
  const riskData = history.filter(h => h.risk_score !== null).map(h => ({
    ...h,
    normalized_score: ((h.risk_score || 0) / 10) * 100
  }))

  // Guard for Recharts SSR
  if (typeof window === 'undefined') {
    return <div className="h-[200px] w-full bg-slate-50 rounded-2xl animate-pulse" />
  }

  return (
    <div className="space-y-6">
      {/* CHART 1 — Blood Pressure */}
      <ChartCard title="Blood Pressure Trend" loading={loading}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={bpData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" tickFormatter={formatXAxis} hide={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#cbd5e1'}} axisLine={false} tickLine={false} />
            <YAxis domain={[60, 200]} hide={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#cbd5e1'}} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip unit=" mmHg" />} />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '10px' }} />
            <ReferenceLine y={140} stroke="#DC2626" strokeDasharray="4 4" label={{ position: 'right', value: 'Hypertensive', fill: '#DC2626', fontSize: 10, fontWeight: 'bold' }} />
            <ReferenceLine y={90} stroke="#2563EB" strokeDasharray="4 4" label={{ position: 'right', value: 'High diastolic', fill: '#2563EB', fontSize: 10, fontWeight: 'bold' }} />
            <Line name="Systolic" type="monotone" dataKey="systolic_bp" stroke="#DC2626" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
            <Line name="Diastolic" type="monotone" dataKey="diastolic_bp" stroke="#2563EB" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* CHART 2 — Blood Glucose */}
      <ChartCard title="Blood Glucose Trend" loading={loading}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={glucoseData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{fontSize: 10, fontWeight: 'bold', fill: '#cbd5e1'}} axisLine={false} tickLine={false} />
            <YAxis domain={[60, 400]} tick={{fontSize: 10, fontWeight: 'bold', fill: '#cbd5e1'}} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip unit=" mg/dL" />} />
            <ReferenceLine y={126} stroke="#D97706" strokeDasharray="4 4" label={{ position: 'right', value: 'Diabetic', fill: '#D97706', fontSize: 10, fontWeight: 'bold' }} />
            <ReferenceLine y={100} stroke="#16A34A" strokeDasharray="4 4" label={{ position: 'right', value: 'Normal', fill: '#16A34A', fontSize: 10, fontWeight: 'bold' }} />
            <Line name="Glucose" type="monotone" dataKey="fasting_glucose" stroke="#D97706" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* CHART 3 — Risk Score Trend */}
      <ChartCard title="AI Risk Score Progression" loading={loading}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={riskData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DC2626" stopOpacity={0.3}/>
                <stop offset="50%" stopColor="#D97706" stopOpacity={0.2}/>
                <stop offset="100%" stopColor="#16A34A" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{fontSize: 10, fontWeight: 'bold', fill: '#cbd5e1'}} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{fontSize: 10, fontWeight: 'bold', fill: '#cbd5e1'}} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip unit="%" />} />
            <ReferenceLine y={70} stroke="#DC2626" strokeDasharray="4 4" label={{ position: 'right', value: 'Alert', fill: '#DC2626', fontSize: 10, fontWeight: 'bold' }} />
            <Area 
              name="Risk Score" 
              type="monotone" 
              dataKey="normalized_score"
              stroke="#0EA5E9"
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#riskGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
