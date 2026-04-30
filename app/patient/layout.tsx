'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Heart, 
  MessageSquare, 
  Pill, 
  Menu, 
  X,
  Bell,
  User,
  ShieldPlus
} from 'lucide-react'

const NAV_ITEMS = [
  { name: 'Rana Hna', href: '/patient', icon: LayoutDashboard }, // "Rana Hna" = Home/Overview
  { name: 'Check-in', href: '/patient/check-in', icon: Heart },
  { name: 'Hela Chat', href: '/patient/chat', icon: MessageSquare },
  { name: 'Dwayati', href: '/patient/medications', icon: Pill }, // "Dwayati" = My Medications
]

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'hsl(210 40% 98%)' }}>
      {/* Aurora Background (Identical to Doctor Layout) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 40% at 0% 0%, rgba(14, 165, 233, 0.10) 0%, transparent 60%), radial-gradient(50% 35% at 100% 0%, rgba(224, 242, 254, 0.6) 0%, transparent 60%)',
        }}
      />

      {/* Desktop Sidebar (Mirroring Doctor Sidebar) */}
      <aside className="hidden lg:flex fixed left-0 top-0 w-64 h-full bg-white flex-col z-20 border-r border-slate-100">
        <div className="h-24 flex items-center px-8">
          <div className="mr-3 p-1 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Heart className="w-6 h-6" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">
            HEALA<span className="text-primary">.</span>
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3.5 rounded-[20px] group transition-all duration-300 ${
                  active
                    ? 'bg-primary/5 text-primary'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mr-3.5 transition-colors ${
                    active ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={`text-[14px] ${active ? 'font-black' : 'font-bold'}`}>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-6">
          <div className="bg-slate-50 rounded-[28px] p-5 border border-slate-100/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                <ShieldPlus className="w-5 h-5 text-primary" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Patient Portal
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
              Your health data is secured with AES-256 encryption.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* TopNav (Mirroring Doctor TopNav) */}
        <header className="sticky top-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-primary transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-800 tracking-tight">
                {NAV_ITEMS.find(i => isActive(i.href))?.name || 'Home'}
              </h1>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2.5 text-slate-400 hover:text-primary transition-all rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-800 leading-none mb-1">Fatima Zahra</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">P-98234</p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-emerald-500/20 border-2 border-white">
                FZ
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden">
          <div className="absolute left-0 top-0 w-72 h-full bg-white shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
              <span className="text-xl font-black text-slate-900 tracking-tighter">HEALA<span className="text-primary">.</span></span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400"><X className="w-6 h-6" /></button>
            </div>
            <nav className="p-4 space-y-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-4 rounded-2xl transition-all ${
                    isActive(item.href) ? 'bg-primary/5 text-primary font-black' : 'text-slate-400 font-bold'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
