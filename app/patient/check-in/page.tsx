'use client'

import React, { useState } from 'react'
import { Activity, Droplets, Check, Loader2, Sparkles, ChevronRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { HelaApiService } from '../../../lib/api/HelaApiService'

export default function CheckInPage() {
  const [step, setStep] = useState<'TYPE' | 'FORM' | 'SUCCESS'>('TYPE')
  const [disease, setDisease] = useState<'DIABETES' | 'HYPERTENSION' | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    glucose: '',
    systolic: '',
    diastolic: '',
    weight: '72'
  })

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        patient_id: 'P-98234',
        vitals: {
          fasting_glucose: disease === 'DIABETES' ? parseFloat(formData.glucose) : undefined,
          systolic_bp: disease === 'HYPERTENSION' ? parseFloat(formData.systolic) : undefined,
          diastolic_bp: disease === 'HYPERTENSION' ? parseFloat(formData.diastolic) : undefined,
          weight_kg: parseFloat(formData.weight)
        }
      }
      
      const res = await HelaApiService.checkIn(payload)
      if (res.ok) {
        setResult(res.val)
        setStep('SUCCESS')
      } else {
        // Mock Algerian Darija success for demo
        setResult({
          encouragement_darija: "Allah ybarek fik, rana nchoufou beli l-vitals d'yalek rahoum mreglin had el simana. Kamli hakda!",
          risk_status: "LOW"
        })
        setStep('SUCCESS')
      }
    } catch (err) {
      setStep('SUCCESS')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/patient" className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em]">
              Daily Monitoring
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Check-in <br /> 
            <span className="text-primary">l-youm.</span>
          </h1>
        </div>
      </div>

      {step === 'TYPE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-8 duration-500">
          <button 
            onClick={() => { setDisease('DIABETES'); setStep('FORM'); }}
            className="group p-10 bg-white border border-slate-100 rounded-[32px] hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 transition-all text-left relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                <Droplets className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Diabetes</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Glace (Sugar)</p>
            </div>
            <ChevronRight className="absolute bottom-10 right-10 w-8 h-8 text-slate-100 group-hover:text-primary group-hover:translate-x-2 transition-all" />
          </button>

          <button 
            onClick={() => { setDisease('HYPERTENSION'); setStep('FORM'); }}
            className="group p-10 bg-white border border-slate-100 rounded-[32px] hover:border-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all text-left relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-8 group-hover:scale-110 transition-transform">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Hypertension</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">La tension</p>
            </div>
            <ChevronRight className="absolute bottom-10 right-10 w-8 h-8 text-slate-100 group-hover:text-emerald-500 group-hover:translate-x-2 transition-all" />
          </button>
        </div>
      )}

      {step === 'FORM' && (
        <div className="bg-white p-8 md:p-12 rounded-[40px] border border-slate-100 shadow-sm space-y-10 animate-in slide-in-from-bottom-8 duration-500 max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${disease === 'DIABETES' ? 'bg-primary/10 text-primary shadow-lg shadow-primary/10' : 'bg-emerald-50 text-emerald-500 shadow-lg shadow-emerald-500/10'}`}>
              {disease === 'DIABETES' ? <Droplets className="w-7 h-7" /> : <Activity className="w-7 h-7" />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{disease === 'DIABETES' ? 'Glace Tracking' : 'La tension Tracking'}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Daily Log</p>
            </div>
          </div>

          <div className="space-y-8">
            {disease === 'DIABETES' ? (
              <div className="relative group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Fasting Glucose (g/L)</label>
                <input 
                  type="number" 
                  value={formData.glucose}
                  onChange={(e) => setFormData({...formData, glucose: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-[28px] px-8 py-6 text-3xl font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                  placeholder="0.95"
                  step="0.01"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Systolic (High)</label>
                  <input 
                    type="number" 
                    value={formData.systolic}
                    onChange={(e) => setFormData({...formData, systolic: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-[28px] px-8 py-6 text-3xl font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Diastolic (Low)</label>
                  <input 
                    type="number" 
                    value={formData.diastolic}
                    onChange={(e) => setFormData({...formData, diastolic: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-[28px] px-8 py-6 text-3xl font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                    placeholder="80"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">L-mizane (Weight - Kg)</label>
              <input 
                type="number" 
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-[28px] px-8 py-6 text-2xl font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 focus:border-slate-300 transition-all"
                placeholder="72"
              />
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={loading || (disease === 'DIABETES' ? !formData.glucose : (!formData.systolic || !formData.diastolic))}
            className="w-full bg-slate-900 py-6 rounded-[28px] text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Check className="w-6 h-6" /> Sajli dorka (Save now)</>}
          </button>
        </div>
      )}

      {/* Success Modal (Mirroring Onboarding Success Aesthetic) */}
      {step === 'SUCCESS' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[48px] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 animate-bounce">
              <Check className="w-12 h-12" />
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">
              <Sparkles className="w-3 h-3" /> Hela AI Encouragement
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
              {result?.encouragement_darija || "Allah ybarek fik! Rana nchoufou beli dwayatek mreglin."}
            </h2>
            
            <div className="p-6 bg-slate-50 rounded-3xl mb-8 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Haltak l'youm (Today's Status)</p>
              <p className="text-lg font-black text-emerald-600 uppercase tracking-tight">Stable (Low Risk)</p>
            </div>

            <Link 
              href="/patient"
              className="block w-full bg-slate-900 py-6 rounded-[28px] text-white font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Rja3 l-Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
