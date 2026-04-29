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
import { X, Cigarette, Dna, Scale, Activity, Phone, Users, ShieldCheck, Download, Loader2 } from 'lucide-react'

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
        a.download = `nabdh_${patient.patient_id}.pdf`
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
        className="fixed inset-0 bg-slate-900/10 backdrop-blur-md z-40 lg:hidden"
        onClick={onClose}
      />
      
      <div 
        className={`fixed right-0 top-0 h-full w-full sm:w-[560px] bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-out flex flex-col border-l border-slate-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* HEADER ACTIONS */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
          <button 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm border ${
              pdfError 
                ? 'bg-rose-50 border-rose-100 text-rose-600' 
                : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {isGeneratingPdf ? 'Generating...' : pdfError ? 'Failed — Retry' : 'Download PDF'}
          </button>
          
          <button 
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-10 scrollbar-hide">
          {/* HEADER AREA */}
          <div className="pt-12 pb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-5">
                <div className="w-20 h-20 rounded-[32px] bg-sky-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-sky-100">
                  {patient?.first_name?.[0]}{patient?.last_name?.[0]}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">{patient?.first_name} {patient?.last_name}</h2>
                  <div className="flex items-center space-x-2 text-[13px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                    <span>{patient?.age} yrs</span>
                    <span>&middot;</span>
                    <span>{patient?.gender?.toLowerCase()}</span>
                    <span>&middot;</span>
                    <span className="text-sky-500 font-black">ID: {patient?.patient_id}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {patient?.consent_given ? (
                <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-[11px] font-black border border-emerald-100 uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" />
                  CONSENT VERIFIED
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-2xl text-[11px] font-black border border-amber-100 uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" />
                  PENDING CONSENT
                </span>
              )}
            </div>
          </div>

          {/* DRIFT ALERT */}
          <DriftAlert drift={drift} loading={loadingDrift} />

          {/* MAIN STATS GRID */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 rounded-[32px] p-6 text-center border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">AI Risk Level</p>
              <div className={`text-2xl font-black tracking-tight ${
                riskAssessment?.category === 'LOW' ? 'text-emerald-500' : 
                riskAssessment?.category === 'MODERATE' ? 'text-amber-500' : 
                riskAssessment?.category === 'HIGH' ? 'text-rose-500' : 'text-slate-300'
              }`}>
                {riskAssessment?.category || '---'}
              </div>
            </div>
            <div className="bg-slate-50 rounded-[32px] p-6 text-center border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Confidence</p>
              <div className="text-2xl font-black text-slate-800 tracking-tight">
                {riskAssessment ? `${(riskAssessment.risk_score / 10 * 100).toFixed(0)}%` : '---'}
              </div>
            </div>
          </div>

          {/* TREND CHARTS */}
          <div className="mb-10">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Clinical Progression</h3>
            <VitalTrendCharts history={history} loading={loadingHistory} />
          </div>

          {/* RISK FACTORS */}
          <div className="mb-10">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Baseline Factors</h3>
            <div className="grid grid-cols-2 gap-3">
              {a?.smoking && (
                <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <div className="p-2 bg-slate-50 rounded-xl mr-3"><Cigarette className="w-5 h-5 text-slate-400" /></div>
                  <span className="text-sm font-bold text-slate-700">Smoker</span>
                </div>
              )}
              {a?.family_history && (
                <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <div className="p-2 bg-sky-50 rounded-xl mr-3"><Dna className="w-5 h-5 text-sky-500" /></div>
                  <span className="text-sm font-bold text-slate-700">Family History</span>
                </div>
              )}
              {a?.bmi && a.bmi > 30 && (
                <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <div className="p-2 bg-amber-50 rounded-xl mr-3"><Scale className="w-5 h-5 text-amber-500" /></div>
                  <span className="text-sm font-bold text-slate-700">Obese (BMI: {a.bmi.toFixed(1)})</span>
                </div>
              )}
              {a?.systolic_bp && a.systolic_bp > 140 && (
                <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <div className="p-2 bg-rose-50 rounded-xl mr-3"><Activity className="w-5 h-5 text-rose-500" /></div>
                  <span className="text-sm font-bold text-slate-700">Hypertensive</span>
                </div>
              )}
            </div>
          </div>

          {/* LATEST AI ANALYSIS */}
          <div className="mb-10">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Latest AI Analysis</h3>
            <ClinicalEntityCard 
              entities={clinicalEntities}
              riskAssessment={riskAssessment}
              loading={loadingHistory}
            />
          </div>

          {/* FAMILY SECTION */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em]">Family Care Group</h3>
              <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest cursor-pointer">Manage +</span>
            </div>
            {familyMembers.length > 0 ? (
              <div className="space-y-3">
                {familyMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-[24px] border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 font-black shadow-sm">
                        {member.first_name?.[0]}{member.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{member.first_name} {member.last_name}</p>
                        <div className="flex items-center text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                          <Phone className="w-3 h-3 mr-1" /> {member.phone || 'No phone'}
                        </div>
                      </div>
                    </div>
                    <span className="bg-sky-50 text-sky-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-sky-100">
                      {member.relationship}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 text-center">
                <Users className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400 italic">No family members linked</p>
              </div>
            )}
          </div>

          {/* CLINICAL Q&A */}
          <div className="mb-10">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Clinical Q&A</h3>
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
