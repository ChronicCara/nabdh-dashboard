'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, Users, Bell, BarChart2, Settings, Heart, ShieldPlus, LayoutDashboard } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const navItems = [
    { name: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Patients', href: '/doctor/patients', icon: Users },
    { name: 'Alerts', href: '/doctor/alerts', icon: Bell, badge: 3 },
    { name: 'Reports', href: '/doctor/reports', icon: BarChart2 },
    { name: 'Settings', href: '/doctor/settings', icon: Settings },
  ]

  return (
    <div className="fixed left-0 top-0 w-64 h-full bg-white flex flex-col z-20 border-r border-slate-100">
      {/* Logo Area - Styled like mobile app top */}
      <div className="h-20 flex items-center px-8">
        <div className="mr-3">
          <Image
            src="https://res.cloudinary.com/dfxhtf6xh/image/upload/v1777386537/Nabdh_Health_App_Logo_-_ECG_Version_pnss7x.png"
            alt="Nabdh Health App Logo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">Nabdh Health</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center justify-between px-4 py-3 rounded-2xl group transition-all duration-300 ${
                  active 
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-100' 
                    : 'text-slate-500 hover:bg-sky-50 hover:text-sky-600'
                }`}
              >
                <div className="flex items-center">
                  <Icon className={`w-5 h-5 mr-3 ${active ? 'text-white' : 'text-slate-400 group-hover:text-sky-500'}`} />
                  <span className="font-semibold text-[15px]">{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    active ? 'bg-white text-sky-600' : 'bg-rose-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Mobile-app style footer credit */}
      <div className="p-6 border-t border-slate-50">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center border-2 border-white shadow-sm">
            <ShieldPlus className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by</p>
            <p className="text-sm font-bold text-slate-700 tracking-tight">BioVatech Axis</p>
          </div>
        </div>
      </div>
    </div>
  )
}
