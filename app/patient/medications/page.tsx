'use client'

import React, { useState } from 'react'
import { Pill, Check, Clock, Info, ArrowLeft, Camera, Sparkles, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Medication {
  id: string
  name: string
  dosage: string
  instructions_darija: string
  image_url: string
  taken_today: boolean
  frequency: string
}

export default function MedicationsPage() {
  const [meds, setMeds] = useState<Medication[]>([
    {
      id: '1',
      name: 'Metformine 500mg',
      dosage: '1 Tablet',
      instructions_darija: 'Haba ba3d l-ghda (1 pill after lunch)',
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60',
      taken_today: true,
      frequency: 'Once Daily'
    },
    {
      id: '2',
      name: 'Amlodipine 5mg',
      dosage: '1 Tablet',
      instructions_darija: 'Haba ba3d l-ftour (1 pill after breakfast)',
      image_url: 'https://images.unsplash.com/photo-1471864190281-ad5f9f81ce4c?w=800&auto=format&fit=crop&q=60',
      taken_today: false,
      frequency: 'Once Daily'
    },
    {
      id: '3',
      name: 'Doliprane 1g',
      dosage: '1 Tablet',
      instructions_darija: 'Ki yweli ywa3rek rasek (When your head hurts)',
      image_url: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=800&auto=format&fit=crop&q=60',
      taken_today: false,
      frequency: 'As Needed'
    }
  ])

  const toggleTaken = (id: string) => {
    setMeds(prev => prev.map(m => m.id === id ? { ...m, taken_today: !m.taken_today } : m))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header (Mirroring Doctor Top Sections) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/patient" className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em]">
              Digital Ordonnance
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Dwayatek <br /> 
            <span className="text-emerald-500">l-youm.</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 bg-emerald-50 px-6 py-4 rounded-[28px] border border-emerald-100/50 shadow-sm">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Adherence</p>
            <p className="text-xl font-black text-slate-800">86% <span className="text-xs text-slate-400 font-bold ml-1">THIS WEEK</span></p>
          </div>
        </div>
      </div>

      {/* Medication Grid (Mirroring Doctor-style Information Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meds.map((med) => (
          <div key={med.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col md:flex-row">
            {/* Box Photo (Half Width on Tablet/Desktop) */}
            <div className="w-full md:w-48 h-48 md:h-auto relative overflow-hidden bg-slate-100 shrink-0">
              <img 
                src={med.image_url} 
                alt={med.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent md:hidden" />
            </div>

            {/* Details */}
            <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{med.name}</h3>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="p-5 bg-slate-50 border border-slate-100/50 rounded-[24px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Kifach t'aklih (Instructions)</p>
                  <p className="text-lg font-black text-slate-800 leading-tight tracking-tight">
                    {med.instructions_darija}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/10">
                    {med.dosage}
                  </span>
                  <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {med.frequency}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => toggleTaken(med.id)}
                className={`w-full py-5 rounded-[24px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                  med.taken_today 
                    ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/20'
                }`}
              >
                {med.taken_today ? <><Check className="w-6 h-6" /> Khditou (Taken)</> : 'Sajli dorka (Mark as Taken)'}
              </button>
            </div>
          </div>
        ))}

        {/* Scan New Medication Card (Mirroring Doctor Add Button Aesthetic) */}
        <div className="bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-6 group hover:border-primary/40 hover:bg-white transition-all cursor-pointer">
          <div className="w-20 h-20 bg-white rounded-[28px] flex items-center justify-center text-slate-300 group-hover:text-primary shadow-sm group-hover:shadow-xl group-hover:shadow-primary/10 transition-all">
            <Camera className="w-10 h-10" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Zidi dwa jdid</h3>
            <p className="text-sm font-medium text-slate-400 max-w-[200px] mx-auto mt-1">Sajli l-kartouna ta3 dwa jdid bach t'tab3ih.</p>
          </div>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-2xl text-[10px] font-black text-primary uppercase tracking-widest border border-slate-100 shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
            Open Scanner <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
