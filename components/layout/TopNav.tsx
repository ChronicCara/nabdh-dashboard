'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'

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
  const title =
    PAGE_TITLES[pathname] ??
    (Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ??
      'Dashboard')

  return (
    <header className="sticky top-0 h-16 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 z-10">
      <h1 className="text-lg font-bold text-slate-800 tracking-tight">
        {title}
      </h1>

      <div className="flex items-center gap-5">
        <button
          aria-label="Notifications"
          className="relative p-2 text-slate-400 hover:text-sky-500 transition-colors rounded-full hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-3 border-l pl-5 border-slate-100">
          <div className="h-9 w-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 text-xs font-bold shadow-sm">
            {getInitials(doctorName)}
          </div>
          <span className="text-sm font-semibold text-slate-700 hidden sm:block">
            {doctorName || 'Doctor'}
          </span>
        </div>
      </div>
    </header>
  )
}
