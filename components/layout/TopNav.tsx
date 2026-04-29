'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Activity } from 'lucide-react'
import { checkHealth } from '../../lib/helaApi'

interface TopNavProps {
  doctorName?: string
}

const PAGE_TITLES: Record<string, string> = {
  '/doctor/dashboard': 'Risk Queue',
  '/doctor/patients': 'Patients',
  '/doctor/alerts': 'Alerts',
  '/doctor/reports': 'Reports & Analytics',
  '/doctor/diagnostics': 'Integration Diagnostics',
  '/doctor/settings': 'Settings',
}

function getInitials(name?: string) {
  if (!name) return 'DR'
  const parts = name.replace('Dr. ', '').split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
}

export default function TopNav({ doctorName }: TopNavProps) {
  const pathname = usePathname() || ''
  const [isHealthy, setIsHealthy] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    const check = async () => {
      const healthy = await checkHealth()
      setIsHealthy(healthy)
    }
    check()
    const interval = setInterval(check, 30000) // check every 30s
    return () => clearInterval(interval)
  }, [])

  const title =
    PAGE_TITLES[pathname] ??
    (Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ??
      'Dashboard')

  return (
    <header className="sticky top-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-10 z-10">
      <div className="flex flex-col">
        <h1 className="text-xl font-black text-slate-800 tracking-tight">
          {title}
        </h1>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
          <div className="relative flex h-2 w-2">
            {isHealthy !== false && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isHealthy === false ? 'bg-rose-500' : isHealthy === true ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {isHealthy === false ? 'AI Offline' : isHealthy === true ? 'AI Online' : 'Checking...'}
          </span>
        </div>

        <div className="h-8 w-[1px] bg-slate-100 mx-1" />

        <div className="flex items-center gap-4">
          <button
            aria-label="Notifications"
            className="relative p-2.5 text-slate-400 hover:text-primary transition-all rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-800 leading-none mb-1">
                {doctorName || 'Dr. Benali'}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Chief Resident
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-primary text-white flex items-center justify-center text-sm font-black shadow-lg shadow-primary/20 border-2 border-white">
              {getInitials(doctorName)}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
