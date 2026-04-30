'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  Loader2, 
  UserPlus, 
  QrCode, 
  ChevronRight, 
  Check, 
  Smartphone, 
  Stethoscope, 
  Activity, 
  Users, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  Camera,
  ArrowRight,
  Info,
  Copy,
  ExternalLink
} from 'lucide-react'
import { onboardPatient } from '../../lib/helaApi'
import { HelaOnboardRequest, HelaOnboardResponse } from '../../lib/types'
import { supabase } from '../../lib/supabase'

const DOCTOR_ID = "00000000-0000-0000-0000-000000000000"

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type OnboardingStep = 'CHOICE' | 'PATH_A_FORM' | 'PATH_B_SCAN' | 'SUCCESS'

export default function OnboardingModal({ isOpen, onClose, onSuccess }: OnboardingModalProps) {
  const [step, setStep] = useState<OnboardingStep>('CHOICE')
  const [formSection, setFormSection] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [onboardResult, setOnboardResult] = useState<HelaOnboardResponse | null>(null)
  const [origin, setOrigin] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    email: '',
    phone: '',
    address: '',
    medical_history_summary: '',
    current_medications: '',
    family_contact_name: '',
    family_contact_phone: '',
    family_access_granted: true
  })

  // Import State
  const [importData, setImportData] = useState({
    patient_id: '',
    otp: ''
  })

  useEffect(() => {
    if (isOpen) {
      setStep('CHOICE')
      setFormSection(1)
      setLoading(false)
      setError(null)
      setOnboardResult(null)
      setLinkCopied(false)
      if (typeof window !== 'undefined') {
        setOrigin(window.location.origin)
      }
    }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Full name is required.'
    const age = parseInt(formData.age)
    if (!age || age <= 0) return 'Patient age is required.'
    if (age > 150) return 'Age must be 150 or less.'
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) return 'A valid email address is required.'
    if (!formData.phone.trim()) return 'Phone number is required.'
    return null
  }

  const handleOnboard = async () => {
    setError(null)
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      const payload: any = {
        profile: {
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          email: formData.email,
          phone: formData.phone,
          address: formData.address || undefined,
          family_contact_name: formData.family_contact_name || undefined,
          family_contact_phone: formData.family_contact_phone || undefined,
          family_access_granted: formData.family_access_granted,
          medical_history_summary: formData.medical_history_summary || undefined
        },
        is_import: false
      }

      const result = await onboardPatient(payload)
      if (result.ok) {
        const onboardedData = result.val
        
        // SYNC TO SUPABASE: Map AI data to your provided 'patients' table schema
        try {
          const ageNum = parseInt(formData.age) || 30
          const birthYear = new Date().getFullYear() - ageNum
          const birthDate = `${birthYear}-01-01` // Calculated from age

          const { error: patientError } = await supabase
            .from('patients')
            .upsert({
              id: onboardedData.patient_id,
              first_name: formData.name.split(' ')[0] || formData.name,
              last_name: formData.name.split(' ').slice(1).join(' ') || 'Patient',
              birth_date: birthDate,
              gender: (formData.gender || 'male').toUpperCase(),
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              medical_history_summary: formData.medical_history_summary,
              family_contact_name: formData.family_contact_name,
              family_contact_phone: formData.family_contact_phone,
              family_access_granted: formData.family_access_granted
            })
          
          if (patientError) {
            console.error('Failed to sync to patients table:', JSON.stringify(patientError, null, 2))
          }
        } catch (supabaseErr) {
          console.error('Supabase sync error:', supabaseErr)
        }

        setOnboardResult(onboardedData)
        setStep('SUCCESS')
        if (onSuccess) onSuccess()
      } else {
        const apiErr = result.val as any
        setError(apiErr?.message || 'Failed to onboard patient. Please check all fields and retry.')
      }
    } catch (err) {
      setError('An unexpected network error occurred. Please verify your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    setLoading(true)
    setError(null)
    try {
      const payload: HelaOnboardRequest = {
        profile: {
          id: importData.patient_id
        },
        is_import: true,
        verification_otp: importData.otp
      }

      const result = await onboardPatient(payload)
      if (result.ok) {
        setOnboardResult(result.val)
        setStep('SUCCESS')
        if (onSuccess) onSuccess()
      } else {
        const apiErr = result.val as any
        setError(apiErr?.message || 'Invalid ID or Verification OTP. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred during patient import.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] transition-opacity animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {step === 'CHOICE' && 'Add New Patient'}
                {step === 'PATH_A_FORM' && `Patient Onboarding (${formSection}/3)`}
                {step === 'PATH_B_SCAN' && 'Import Hela Patient'}
                {step === 'SUCCESS' && 'Onboarding Complete'}
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Clinical Intake Control</p>
            </div>
            <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[70vh] p-10 scrollbar-hide">
            {error && (
              <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-[24px] font-bold flex items-center gap-3">
                <Info className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Step 1: Choice */}
            {step === 'CHOICE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setStep('PATH_A_FORM')}
                  className="group p-8 bg-white border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 rounded-[40px] text-left transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-[24px] flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <UserPlus className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">New Hela User</h3>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed mb-6">
                    Create a fresh medical profile for a new patient including vitals and history.
                  </p>
                  <div className="flex items-center text-xs font-black text-primary uppercase tracking-widest gap-2">
                    Start Intake <ChevronRight className="w-4 h-4" />
                  </div>
                </button>

                <button
                  onClick={() => setStep('PATH_B_SCAN')}
                  className="group p-8 bg-white border border-slate-100 hover:border-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/10 rounded-[40px] text-left transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-emerald-50 rounded-[24px] flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Existing Hela User</h3>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed mb-6">
                    Import an existing patient profile via QR Scan or Patient ID verification.
                  </p>
                  <div className="flex items-center text-xs font-black text-emerald-500 uppercase tracking-widest gap-2">
                    Import Now <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            )}

            {/* Path A: Form */}
            {step === 'PATH_A_FORM' && (
              <div className="space-y-8">
                {formSection === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary"><Users className="w-5 h-5" /></div>
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Section 1: Identity</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                        <input name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all" placeholder="Ahmed Benali" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Age</label>
                        <input name="age" type="number" value={formData.age} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all" placeholder="62" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all">
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                        <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all" placeholder="ahmed@example.com" />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone</label>
                        <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all" placeholder="0550 12 34 56" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Address</label>
                        <input name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all" placeholder="City, Algeria" />
                      </div>
                    </div>
                  </div>
                )}

                {formSection === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary"><Stethoscope className="w-5 h-5" /></div>
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Section 2: Medical Background</h4>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Medical History Summary</label>
                      <textarea name="medical_history_summary" value={formData.medical_history_summary} onChange={handleInputChange} rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all" placeholder="Enter maladies, allergies, or previous conditions..." />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Current Medications</label>
                      <textarea name="current_medications" value={formData.current_medications} onChange={handleInputChange} rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all" placeholder="List of current drugs and dosages..." />
                    </div>
                  </div>
                )}

                {formSection === 3 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary"><MapPin className="w-5 h-5" /></div>
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Section 3: Family Context</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Emergency Contact Name</label>
                        <input name="family_contact_name" value={formData.family_contact_name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all" placeholder="Ahmed (Son)" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Emergency Contact Phone</label>
                        <input name="family_contact_phone" value={formData.family_contact_phone} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all" placeholder="0660 11 22 33" />
                      </div>
                      <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <p className="text-sm font-black text-slate-800">Family Access Granted</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Allow family to receive alerts?</p>
                        </div>
                        <input 
                          type="checkbox" 
                          name="family_access_granted" 
                          checked={formData.family_access_granted} 
                          onChange={handleInputChange}
                          className="w-6 h-6 rounded-lg border-slate-300 text-primary focus:ring-primary" 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Path B: Scan */}
            {step === 'PATH_B_SCAN' && (
              <div className="space-y-8 text-center">
                <div className="relative mx-auto w-full max-w-sm aspect-square bg-slate-900 rounded-[40px] overflow-hidden flex flex-col items-center justify-center p-8">
                  <div className="absolute inset-0 border-[40px] border-black/40" />
                  <div className="relative z-10 text-white flex flex-col items-center">
                    <Camera className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm font-bold opacity-70">Align QR Code within frame</p>
                    <div className="mt-8 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-[10px] font-black tracking-widest uppercase">
                      Scanner Ready
                    </div>
                  </div>
                  {/* Scanner Lines Simulation */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-scan" />
                </div>

                <div className="space-y-4">
                  <div className="text-left">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Patient ID (Manual Entry)</label>
                    <input 
                      value={importData.patient_id} 
                      onChange={(e) => setImportData(prev => ({ ...prev, patient_id: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-800 focus:outline-none focus:border-emerald-500 transition-all text-center tracking-widest uppercase" 
                      placeholder="P-123456" 
                    />
                  </div>
                  <div className="text-left">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Verification OTP (from Patient App)</label>
                    <input 
                      value={importData.otp} 
                      onChange={(e) => setImportData(prev => ({ ...prev, otp: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-800 focus:outline-none focus:border-emerald-500 transition-all text-center tracking-[0.5em]" 
                      placeholder="000000" 
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUCCESS STATE */}
            {step === 'SUCCESS' && onboardResult && (
              <div className="space-y-10">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[28px] flex items-center justify-center mb-6 shadow-sm">
                    <Check className="w-10 h-10" strokeWidth={3} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Onboarding Successful</h3>
                  <p className="text-sm font-medium text-slate-400 mt-2">Patient profile is now active and linked.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* AI Analysis Card */}
                  <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Sparkles className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                          <Stethoscope className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Summary</span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-slate-200">
                        {onboardResult.ai_analysis.clinical_summary}
                      </p>
                    </div>
                  </div>

                  {/* Darija Welcome Card */}
                  <div className="bg-primary/5 border border-primary/10 rounded-[40px] p-8 flex flex-col items-end text-right">
                    <div className="flex items-center gap-3 mb-6 flex-row-reverse">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-primary/10">
                        <Smartphone className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Welcome Message (Darija)</span>
                    </div>
                    <p className="text-xl font-bold text-slate-800 leading-relaxed font-arabic" dir="rtl">
                      {onboardResult.ai_analysis.welcome_message_darija}
                    </p>
                  </div>
                </div>

                {/* QR Code & OTP Area */}
                <div className="bg-slate-50 rounded-[40px] p-10 border border-slate-100">
                   <div className="flex flex-col md:flex-row items-center gap-10">
                      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                        {/* QR Code */}
                        <div className="w-40 h-40 flex flex-col items-center justify-center text-slate-200 relative">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`${origin}/patient/${onboardResult.patient_id}`)}`}
                            alt="Patient QR Code"
                            className="w-full h-full"
                          />
                        </div>
                      </div>
                      <div className="flex-1 space-y-6">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Patient Profile Link</p>
                           <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-2 pl-4">
                             <span className="text-sm font-bold text-slate-600 truncate flex-1">
                               {`${origin}/patient/${onboardResult.patient_id}`}
                             </span>
                             <button
                               onClick={() => {
                                 navigator.clipboard.writeText(`${origin}/patient/${onboardResult.patient_id}`);
                                 setLinkCopied(true);
                                 setTimeout(() => setLinkCopied(false), 2000);
                               }}
                               className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all"
                               title="Copy Link"
                             >
                               {linkCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                             </button>
                             <a 
                               href={`${origin}/patient/${onboardResult.patient_id}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all"
                               title="Open Link"
                             >
                               <ExternalLink className="w-4 h-4" />
                             </a>
                           </div>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Security Verification Code</p>
                           <p className="text-4xl font-black text-slate-900 tracking-[0.3em]">
                             {onboardResult.otp || '--- ---'}
                           </p>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Provide this link or ask the patient to scan the QR code to securely access their medical history and profile directly.
                          </p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-10 py-8 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
            {step === 'PATH_A_FORM' && (
              <>
                <button 
                  onClick={() => formSection === 1 ? setStep('CHOICE') : setFormSection(prev => prev - 1)}
                  className="px-8 py-4 text-sm font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"
                >
                  {formSection === 1 ? 'Cancel' : 'Back'}
                </button>
                <button 
                  onClick={() => formSection === 3 ? handleOnboard() : setFormSection(prev => prev + 1)}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-[24px] text-sm font-black shadow-xl shadow-primary/20 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (formSection === 3 ? <ShieldCheck className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />)}
                  {loading ? 'PROCESSING...' : (formSection === 3 ? 'FINISH ONBOARDING' : 'NEXT SECTION')}
                </button>
              </>
            )}

            {step === 'PATH_B_SCAN' && (
              <>
                <button 
                  onClick={() => setStep('CHOICE')}
                  className="px-8 py-4 text-sm font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleImport}
                  disabled={loading || !importData.patient_id}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-[24px] text-sm font-black shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  {loading ? 'VERIFYING...' : 'CONFIRM IMPORT'}
                </button>
              </>
            )}

            {step === 'SUCCESS' && (
              <button 
                onClick={onClose}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-[24px] text-sm font-black transition-all flex items-center justify-center gap-3"
              >
                RETURN TO DASHBOARD <ArrowRight className="w-5 h-5" />
              </button>
            )}

            {step === 'CHOICE' && (
              <p className="w-full text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                Choose an onboarding path to continue
              </p>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
        .font-arabic {
          font-family: 'Amiri', serif;
        }
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </>
  )
}
