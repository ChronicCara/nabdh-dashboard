'use client'
import React, { useEffect, useState } from 'react'
import { 
  PatientWithLatestAssessment, 
  PatientAssessment, 
  FamilyMember, 
  HelaHistoryPoint, 
  HelaDriftResult, 
  ClinicalEntities, 
  RiskAssessmentResponse 
} from '../../lib/types'
import { generatePDFReport } from '../../lib/helaApi'
import { X, Cigarette, Dna, Scale, Activity, Phone, Users, ShieldCheck, Download, Loader2, Sparkles, HeartPulse } from 'lucide-react'

// Standard imports are safer when the parent is already dynamically loaded with ssr: false
import VitalTrendCharts from './VitalTrendCharts'
import DriftAlert from './DriftAlert'
import ClinicalEntityCard from './ClinicalEntityCard'
import DoctorChat from './DoctorChat'

interface PatientDrawerProps {
  patient: (PatientWithLatestAssessment & { consent_given?: boolean }) | null
  assessmentHistory: PatientAssessment[]
  loadingHistory: boolean
  onClose: () => void
  familyMembers?: FamilyMember[]
  loadingFamily?: boolean
  // New Hela Props (Optional to support legacy pages)
  history?: HelaHistoryPoint[]
  drift?: HelaDriftResult | null
  loadingDrift?: boolean
  clinicalEntities?: ClinicalEntities | null
  riskAssessment?: RiskAssessmentResponse | null
}

export default function PatientDrawer({ 
  patient, 
  assessmentHistory, 
  loadingHistory, 
  onClose,
  familyMembers = [],
  loadingFamily = false,
  history = [],
  drift = null,
  loadingDrift = false,
  clinicalEntities = null,
  riskAssessment = null
}: PatientDrawerProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [pdfError, setPdfError] = useState(false)

  const isOpen = patient !== null

  if (!isOpen) return null

  const a = patient?.latest_assessment

  const handleDownloadPDF = async () => {
    if (!patient?.patient_id) return
    setIsGeneratingPdf(true)
    setPdfError(false)
    try {
      const name = `${patient.first_name}_${patient.last_name}`
      const blob = await generatePDFReport(patient.patient_id, name)
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `heala_${patient.patient_id}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        setPdfError(true)
      }
    } catch (err) {
      setPdfError(true)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      <div 
        className={`fixed right-0 top-0 h-full w-full sm:w-[640px] bg-white shadow-[0_0_80px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* TOP BAR / ACTIONS */}
        <div className="flex items-center justify-between px-10 py-6 border-b border-slate-50 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Patient Profile</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all border ${
                pdfError 
                  ? 'bg-rose-50 border-rose-100 text-rose-600' 
                  : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-primary/20 hover:text-primary hover:shadow-xl hover:shadow-slate-100'
              }`}
            >
              {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {isGeneratingPdf ? 'Generating...' : pdfError ? 'Failed — Retry' : 'Export Data'}
            </button>
            
            <button 
              onClick={onClose}
              className="p-3 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-[18px] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pb-16 scrollbar-hide">
          {/* HEADER AREA */}
          <div className="pt-12 pb-10">
            <div className="flex items-start gap-8 mb-8">
              <div className="w-24 h-24 rounded-[36px] bg-primary text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-primary/20 border-4 border-white relative">
                {patient?.first_name?.[0]}{patient?.last_name?.[0]}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="pt-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                  {patient?.first_name} {patient?.last_name}
                </h2>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {patient?.age} Years
                  </div>
                  <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {patient?.gender}
                  </div>
                  <div className="h-1 w-1 rounded-full bg-slate-200" />
                  <span className="text-[11px] font-black text-primary uppercase tracking-widest">ID: {patient?.patient_id}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monitoring Status</p>
                  <p className="text-sm font-black text-slate-800">Clinical-grade AI Tracking Active</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-black uppercase tracking-widest">Secure</span>
              </div>
            </div>
          </div>

          {/* DRIFT ALERT */}
          <DriftAlert drift={drift} loading={loadingDrift} />

          {/* MAIN STATS GRID */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-50 rounded-full opacity-50 transition-transform group-hover:scale-150" />
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Risk Severity</p>
              <div className={`text-4xl font-black tracking-tighter ${
                riskAssessment?.category === 'LOW' ? 'text-emerald-500' : 
                riskAssessment?.category === 'MODERATE' ? 'text-amber-500' : 
                riskAssessment?.category === 'HIGH' ? 'text-rose-500' : 'text-slate-300'
              }`}>
                {riskAssessment?.category || '---'}
              </div>
            </div>
            <div className="bg-slate-900 rounded-[32px] p-8 shadow-2xl shadow-slate-200 relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/20 rounded-full blur-xl transition-transform group-hover:scale-150" />
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">AI Confidence</p>
              <div className="text-4xl font-black text-white tracking-tighter">
                {riskAssessment ? `${(riskAssessment.risk_score / 10 * 100).toFixed(0)}%` : '---'}
              </div>
            </div>
          </div>

          {/* TREND CHARTS */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Clinical Progression</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vital signs history (30 days)</p>
              </div>
              <button className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-xl">Full View</button>
            </div>
            <VitalTrendCharts history={history} loading={loadingHistory} />
          </div>

          {/* RISK FACTORS */}
          <div className="mb-12">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Baseline Risk Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              {a?.smoking && (
                <div className="flex items-center bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm group hover:border-slate-200 transition-all">
                  <div className="p-3 bg-slate-50 rounded-[18px] mr-4 group-hover:bg-slate-100 transition-colors"><Cigarette className="w-5 h-5 text-slate-400" /></div>
                  <span className="text-sm font-black text-slate-800">Smoker</span>
                </div>
              )}
              {a?.family_history && (
                <div className="flex items-center bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm group hover:border-slate-200 transition-all">
                  <div className="p-3 bg-primary/5 rounded-[18px] mr-4 group-hover:bg-primary/10 transition-colors"><Dna className="w-5 h-5 text-primary" /></div>
                  <span className="text-sm font-black text-slate-800">Genetics</span>
                </div>
              )}
              {a?.bmi && a.bmi > 30 && (
                <div className="flex items-center bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm group hover:border-slate-200 transition-all">
                  <div className="p-3 bg-amber-50 rounded-[18px] mr-4 group-hover:bg-amber-100 transition-colors"><Scale className="w-5 h-5 text-amber-500" /></div>
                  <span className="text-sm font-black text-slate-800">Obese (BMI: {a.bmi.toFixed(1)})</span>
                </div>
              )}
              {a?.systolic_bp && a.systolic_bp > 140 && (
                <div className="flex items-center bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm group hover:border-slate-200 transition-all">
                  <div className="p-3 bg-rose-50 rounded-[18px] mr-4 group-hover:bg-rose-100 transition-colors"><Activity className="w-5 h-5 text-rose-500" /></div>
                  <span className="text-sm font-black text-slate-800">Hypertensive</span>
                </div>
              )}
            </div>
          </div>

          {/* LATEST AI ANALYSIS */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-black text-slate-900 tracking-tight">HEALA AI Diagnostics</h3>
            </div>
            <ClinicalEntityCard 
              entities={clinicalEntities}
              riskAssessment={riskAssessment}
              loading={loadingHistory}
            />
          </div>

          {/* FAMILY SECTION */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Family Care Group</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Linked relatives for emergency contact</p>
              </div>
              <button className="p-2 bg-slate-50 text-slate-400 hover:text-primary rounded-xl transition-all">
                <Users className="w-5 h-5" />
              </button>
            </div>
            {familyMembers.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {familyMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[28px] border border-slate-100 group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 font-black shadow-sm group-hover:text-primary transition-colors">
                        {member.first_name?.[0]}{member.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-[15px] font-black text-slate-900">{member.first_name} {member.last_name}</p>
                        <div className="flex items-center text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          <Phone className="w-3.5 h-3.5 mr-1.5" /> {member.phone || 'No phone'}
                        </div>
                      </div>
                    </div>
                    <span className="bg-white text-primary px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/10 shadow-sm">
                      {member.relationship}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 bg-slate-50 rounded-[40px] border border-dashed border-slate-200 text-center">
                <Users className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-black text-slate-400">No family members linked to this profile.</p>
                <button className="mt-4 text-[10px] font-black text-primary uppercase tracking-[0.2em]">Add Member +</button>
              </div>
            )}
          </div>

          {/* CLINICAL Q&A */}
          <div className="mb-12">
             <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Direct Clinical Inquiry</h3>
            </div>
            <DoctorChat 
              patientId={patient?.patient_id ?? null}
              patientName={`${patient?.first_name} ${patient?.last_name}`}
            />
          </div>
        </div>
      </div>
    </>
  )
}
