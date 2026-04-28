import React from 'react'
import { PatientWithLatestAssessment, PatientAssessment, FamilyMember } from '../../lib/types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts'
import { X, Cigarette, Dna, Scale, Activity, Droplet, AlertCircle, User, CheckCircle, AlertTriangle, Phone, Users, ShieldCheck, HeartPulse } from 'lucide-react'

interface PatientDrawerProps {
  patient: (PatientWithLatestAssessment & { consent_given?: boolean }) | null
  assessmentHistory: PatientAssessment[]
  loadingHistory: boolean
  onClose: () => void
  familyMembers?: FamilyMember[]
  loadingFamily?: boolean
}

export default function PatientDrawer({ 
  patient, 
  assessmentHistory, 
  loadingHistory, 
  onClose,
  familyMembers = [],
  loadingFamily = false
}: PatientDrawerProps) {
  const isOpen = patient !== null

  if (!isOpen) return null

  const a = patient?.latest_assessment

  const formatChartDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  const chartData = assessmentHistory.map(item => ({
    date: formatChartDate(item.assessment_date),
    score: item.risk_score
  }))

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/10 backdrop-blur-md z-40 lg:hidden"
        onClick={onClose}
      />
      
      <div 
        className={`fixed right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-out flex flex-col border-l border-slate-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Modern Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto px-8 pb-10">
          {/* HEADER AREA */}
          <div className="pt-12 pb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-5">
                <div className="w-20 h-20 rounded-[32px] bg-sky-500 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-sky-100">
                  {patient?.first_name?.[0]}{patient?.last_name?.[0]}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">{patient?.first_name} {patient?.last_name}</h2>
                  <div className="flex items-center space-x-2 text-[13px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                    <span>{patient?.age} yrs</span>
                    <span>&middot;</span>
                    <span>{patient?.gender?.toLowerCase()}</span>
                    <span>&middot;</span>
                    <span className="text-sky-500">ID: {patient?.patient_id}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {patient?.consent_given ? (
                <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-[12px] font-black border border-emerald-100">
                  <ShieldCheck className="w-4 h-4" />
                  CONSENT VERIFIED
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-2xl text-[12px] font-black border border-amber-100">
                  <AlertTriangle className="w-4 h-4" />
                  PENDING CONSENT
                </span>
              )}
            </div>
          </div>

          {/* MAIN STATS GRID */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 rounded-[32px] p-6 text-center border border-slate-100">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Health Index</p>
              <div className={`text-2xl font-black tracking-tight ${
                a?.risk_level === 'LOW' ? 'text-emerald-500' : a?.risk_level === 'MODERATE' ? 'text-amber-500' : 'text-rose-500'
              }`}>
                {a?.risk_level} ({(a?.risk_score ?? 0 * 100).toFixed(0)}%)
              </div>
            </div>
            <div className="bg-slate-50 rounded-[32px] p-6 text-center border border-slate-100">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Vitals Sync</p>
              <div className="text-2xl font-black text-slate-800 tracking-tight">
                {a ? 'Healthy' : 'Syncing...'}
              </div>
            </div>
          </div>

          {/* RISK FACTORS */}
          <div className="mb-10">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Risk Factors</h3>
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

          {/* FAMILY SECTION */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em]">Family Care</h3>
              <span className="text-[10px] font-black text-sky-500 uppercase">Manage +</span>
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
                    <span className="bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {member.relationship}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 text-center">
                <Users className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">No family members linked</p>
              </div>
            )}
          </div>

          {/* TREND CHART */}
          <div className="mb-10">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Risk Trend</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[0, 1]} hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#0EA5E9" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
