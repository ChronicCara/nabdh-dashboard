'use client'
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface RiskChartProps {
  data: { risk_level: string; count: number }[]
  loading: boolean
}

export default function RiskChart({ data, loading }: RiskChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">Risk Distribution — Today</h3>
        <div className="h-[200px] w-full bg-slate-100 animate-pulse rounded-xl"></div>
      </div>
    )
  }

  // Ensure data has the three levels for consistent colors even if count is 0
  const chartData = ['LOW', 'MODERATE', 'HIGH'].map(level => {
    const found = data.find(d => d.risk_level === level)
    return {
      risk_level: level,
      count: found ? found.count : 0
    }
  })

  const getColor = (level: string) => {
    switch (level) {
      case 'LOW': return '#10b981' // emerald-500
      case 'MODERATE': return '#f59e0b' // amber-500
      case 'HIGH': return '#ef4444' // red-500
      default: return '#94a3b8'
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm shadow-xl border border-slate-700 font-medium">
          {payload[0].value} patients
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-full w-full">
      {typeof window !== 'undefined' && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="risk_level" 
              tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} 
              tickMargin={20} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              allowDecimals={false} 
              tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 700 }} 
              axisLine={false} 
              tickLine={false} 
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: 'rgba(241, 245, 249, 0.5)', radius: 12 }} 
            />
            <Bar dataKey="count" radius={[12, 12, 12, 12]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.risk_level)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
