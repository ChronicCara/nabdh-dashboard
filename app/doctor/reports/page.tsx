import React from 'react'
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  ShieldCheck,
  HeartPulse,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'

interface KpiCard {
  label: string
  value: string
  delta: string
  trend: 'up' | 'down' | 'flat'
  icon: typeof FileText
}

const KPIS: KpiCard[] = [
  {
    label: 'Total Patients',
    value: '128',
    delta: '+8 this month',
    trend: 'up',
    icon: Users,
  },
  {
    label: 'Avg Risk Score',
    value: '4.2 / 10',
    delta: '-0.4 vs last month',
    trend: 'down',
    icon: TrendingUp,
  },
  {
    label: 'Adherence Rate',
    value: '87%',
    delta: '+3% vs last month',
    trend: 'up',
    icon: ShieldCheck,
  },
  {
    label: 'Alerts Today',
    value: '14',
    delta: '6 high · 8 moderate',
    trend: 'flat',
    icon: HeartPulse,
  },
]

interface RecentReport {
  id: string
  patient: string
  patientId: string
  type: string
  generatedAt: string
}

const RECENT_REPORTS: RecentReport[] = [
  {
    id: 'r1',
    patient: 'Ammi Ahmed',
    patientId: 'p_8821',
    type: 'Cardiology referral',
    generatedAt: '2 h ago',
  },
  {
    id: 'r2',
    patient: 'Khalti Zohra',
    patientId: 'p_4412',
    type: 'Endocrinology referral',
    generatedAt: 'Yesterday',
  },
  {
    id: 'r3',
    patient: 'Si Mohamed',
    patientId: 'p_7702',
    type: 'Quarterly summary',
    generatedAt: '3 days ago',
  },
]

export default function ReportsPage() {
  return (
    <div className="max-w-[1300px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[12px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Clinic intelligence
          </span>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Reports &amp; Analytics
          </h2>
          <p className="text-slate-500 mt-1 font-medium">
            Cohort-level KPIs and one-click PDF clinical reports for specialist handover.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-200/60 transition-all active:scale-95">
          <Download className="w-4 h-4" />
          Export Cohort CSV
        </button>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon
          const trendColor =
            kpi.trend === 'up'
              ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
              : kpi.trend === 'down'
                ? 'text-sky-600 bg-sky-50 border-sky-100'
                : 'text-slate-600 bg-slate-50 border-slate-100'

          return (
            <div
              key={kpi.label}
              className="glass-card rounded-3xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-glass-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-sky-50 rounded-2xl text-sky-500">
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${trendColor}`}
                >
                  {kpi.delta}
                </span>
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {kpi.label}
              </p>
              <p className="text-3xl font-black text-slate-800 tracking-tight">
                {kpi.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Two-column: Generator + Recent reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PDF generator */}
        <section className="lg:col-span-2 glass-card rounded-[32px] p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-sky-50 rounded-2xl text-sky-500">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                Generate Clinical PDF
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                AI-synthesized report with vitals, adherence and risk reasoning.
              </p>
            </div>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                Patient
              </label>
              <input
                type="text"
                placeholder="Search patient by name or ID…"
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                Adherence window
              </label>
              <select className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Last 6 months</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                Recipient
              </label>
              <select className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all">
                <option>Cardiologist</option>
                <option>Endocrinologist</option>
                <option>Internal — file only</option>
              </select>
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 mt-2">
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-200/60 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                Generate &amp; Download PDF
              </button>
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                Email to Specialist
              </button>
            </div>
          </form>
        </section>

        {/* Recent reports */}
        <section className="glass-card rounded-[32px] p-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em] mb-5">
            Recent Reports
          </h3>
          <ul className="space-y-3">
            {RECENT_REPORTS.map((report) => (
              <li
                key={report.id}
                className="group flex items-center justify-between p-4 rounded-2xl bg-white/60 border border-slate-100 hover:border-sky-200 hover:bg-sky-50/40 transition-all cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-800 truncate">
                    {report.patient}
                  </p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight truncate">
                    {report.type} · {report.generatedAt}
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 flex-shrink-0 ml-3" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
