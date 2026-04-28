import React from 'react'
import { Bell } from 'lucide-react'

interface TopNavProps {
  doctorName?: string
}

export default function TopNav({ doctorName }: TopNavProps) {
  const getInitials = (name?: string) => {
    if (!name) return 'DR'
    const parts = name.replace('Dr. ', '').split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
  }

  return (
    <div className="sticky top-0 h-16 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between px-6 z-10">
      <div className="flex items-center">
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">Dashboard</h1>
      </div>
      
      <div className="flex items-center space-x-5">
        {/* Bell Icon */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50 focus:outline-none">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center space-x-3 border-l pl-5 border-gray-100">
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shadow-sm">
            {getInitials(doctorName)}
          </div>
          <span className="text-sm font-semibold text-slate-700 hidden sm:block">
            {doctorName || 'Doctor'}
          </span>
        </div>
      </div>
    </div>
  )
}
