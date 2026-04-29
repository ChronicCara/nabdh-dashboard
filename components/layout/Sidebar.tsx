'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Users,
  Bell,
  BarChart2,
  Settings,
  ShieldPlus,
  LayoutDashboard,
  Activity,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: typeof LayoutDashboard
  badge?: number
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
  { name: 'Patients', href: '/doctor/patients', icon: Users },
  { name: 'Alerts', href: '/doctor/alerts', icon: Bell, badge: 3 },
  { name: 'Reports', href: '/doctor/reports', icon: BarChart2 },
  { name: 'Diagnostics', href: '/doctor/diagnostics', icon: Activity },
  { name: 'Settings', href: '/doctor/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const isActive = (path: string) =>
    pathname === path || pathname?.startsWith(path + '/')

  return (
    <aside className="fixed left-0 top-0 w-64 h-full bg-white flex flex-col z-20 border-r border-slate-100">
      {/* Logo */}
      <div className="h-24 flex items-center px-8">
        <div className="mr-3 p-1 bg-primary/5 rounded-2xl border border-primary/10">
          <Image
            src="https://res.cloudinary.com/dfxhtf6xh/image/upload/v1777473205/HEALA_Medical_Health_App_Logo-removebg-preview_mv8qji.png"
            alt="Heala logo"
            width={48}
            height={48}
            className="w-12 h-12 object-contain"
          />
        </div>
        <span className="text-2xl font-black text-slate-900 tracking-tighter">
          HEALA<span className="text-primary">.</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3.5 rounded-[20px] group transition-all duration-300 ${
                active
                  ? 'bg-primary/5 text-primary'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <div className="flex items-center">
                <Icon
                  className={`w-5 h-5 mr-3.5 transition-colors ${
                    active
                      ? 'text-primary'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={`text-[14px] ${active ? 'font-black' : 'font-bold'}`}>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                    active
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer Card */}
      <div className="p-6">
        <div className="bg-slate-50 rounded-[28px] p-5 border border-slate-100/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-slate-100 shadow-sm">
              <ShieldPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Trusted by
              </p>
              <p className="text-xs font-black text-slate-800 tracking-tight">
                BioVatech Axis
              </p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
            Secure clinical-grade AI monitoring active.
          </p>
        </div>
      </div>
    </aside>
  )
}
