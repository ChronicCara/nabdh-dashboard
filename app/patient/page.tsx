'use client'

import React from 'react'
import { Sparkles, ArrowRight, Heart, Pill, MessageSquare, Activity, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function PatientDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
              Assalam Fatima, Sba7 el khir!
            </div>
            <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Tehlay f'sa7tek <br /> 
            <span className="text-primary">khotwa b khotwa.</span>
          </h1>
        </div>
        <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health Score</p>
            <p className="text-xl font-black text-slate-800">8.4<span className="text-xs text-slate-400 ml-1">/10</span></p>
          </div>
        </div>
      </div>

      {/* Primary Action Cards (Mirroring Doctor Stats Layout but for Patient Actions) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Check-in Card */}
        <Link href="/patient/check-in" className="group h-full">
          <div className="h-full p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-500 relative overflow-hidden flex flex-col">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Check-in l'youm</h3>
            <p className="text-sm font-medium text-slate-400 leading-relaxed mb-8 flex-1">
              Sajli l-vitals d'yalek w choufi l-feedback ta3 Hela AI b l-Algerian Darija.
            </p>
            <div className="flex items-center text-xs font-black text-primary uppercase tracking-widest gap-2">
              Bday dorka <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* Chat Card */}
        <Link href="/patient/chat" className="group h-full">
          <div className="h-full p-8 bg-slate-900 rounded-[32px] shadow-2xl shadow-slate-200 hover:shadow-primary/20 transition-all duration-500 relative overflow-hidden flex flex-col">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-primary/20 rounded-full group-hover:scale-150 transition-transform duration-700 blur-3xl" />
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform relative z-10">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight relative z-10">Hela AI Chat</h3>
            <p className="text-sm font-medium text-slate-300/80 leading-relaxed mb-8 flex-1 relative z-10">
              Sa9si Hela 3la ay 7aja t'khous sa7tek wla dwayatek b l-lahja d'yalna.
            </p>
            <div className="flex items-center text-xs font-black text-white uppercase tracking-widest gap-2 relative z-10">
              Sa9si Hela <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* Meds Tracking Card */}
        <Link href="/patient/medications" className="group h-full">
          <div className="h-full p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/20 transition-all duration-500 relative overflow-hidden flex flex-col">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
              <Pill className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Dwayatek</h3>
            <p className="text-sm font-medium text-slate-400 leading-relaxed mb-8 flex-1">
              Choufi l'ordonnance d'yalek w tab3i dwayatek l'youm m3a l-tsawer.
            </p>
            <div className="flex items-center text-xs font-black text-emerald-500 uppercase tracking-widest gap-2">
              Choufi dwayek <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>

      {/* Adherence Graph (Mocking Doctor-style Analytics) */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Weekly Adherence</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Consistency Tracker</p>
          </div>
          <div className="flex gap-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={day} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${i < 4 ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                {day}
              </div>
            ))}
          </div>
        </div>
        <div className="h-32 flex items-end gap-2 px-2">
          {[40, 70, 45, 90, 65, 80, 50, 75, 60, 85, 95, 70].map((h, i) => (
            <div key={i} className="flex-1 bg-slate-50 rounded-t-lg relative group overflow-hidden">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-primary/20 group-hover:bg-primary transition-all duration-500" 
                style={{ height: `${h}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Check-in Streak', value: '4 Ayam', color: 'text-emerald-500' },
          { label: 'Risk Status', value: 'Stable', color: 'text-primary' },
          { label: 'Next Appointment', value: '12 May', color: 'text-slate-600' },
          { label: 'Meds Today', value: '2 / 3', color: 'text-slate-900' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <p className={`text-lg font-black tracking-tight ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
