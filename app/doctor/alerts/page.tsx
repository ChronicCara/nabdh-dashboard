import React from 'react'
import {
  AlertTriangle,
  Activity,
  HeartPulse,
  ShieldAlert,
  Bell,
  CheckCircle2,
} from 'lucide-react'

interface AlertItem {
  id: string
  patient: string
  patientId: string
  type: 'HIGH_RISK' | 'DRIFT_DETECTED' | 'URGENT_VITALS'
  severity: 'high' | 'medium' | 'low'
  message: string
  suggestedAction: string
  timeAgo: string
}

// Placeholder feed — wired to GET /api/v1/alerts/pending in the next iteration
const ALERTS: AlertItem[] = [
  {
    id: 'a1',
    patient: 'Ammi Ahmed',
    patientId: 'p_8821',
    type: 'HIGH_RISK',
    severity: 'high',
    message: 'Risk score escalated to 8.5 / 10 overnight',
    suggestedAction: 'Schedule same-day teleconsult',
    timeAgo: '12 min ago',
  },
  {
    id: 'a2',
    patient: 'Khalti Zohra',
    patientId: 'p_4412',
    type: 'DRIFT_DETECTED',
    severity: 'medium',
    message: 'Adherence dropped 95% → 40% in 3 days',
    suggestedAction: 'Send Darija nurture nudge',
    timeAgo: '1 h ago',
  },
  {
    id: 'a3',
    patient: 'Si Mohamed',
    patientId: 'p_7702',
    type: 'URGENT_VITALS',
    severity: 'high',
    message: 'BP spiked to 168 / 102 mmHg',
    suggestedAction: 'Review medication titration',
    timeAgo: '3 h ago',
  },
]

const TYPE_META: Record<
  AlertItem['type'],
  { icon: typeof AlertTriangle; label: string }
> = {
  HIGH_RISK: { icon: ShieldAlert, label: 'High Risk' },
  DRIFT_DETECTED: { icon: Activity, label: 'Clinical Drift' },
  URGENT_VITALS: { icon: HeartPulse, label: 'Urgent Vitals' },
}

const SEVERITY_STYLES: Record<
  AlertItem['severity'],
  { dot: string; chip: string; bar: string }
> = {
  high: {
    dot: 'bg-rose-500',
    chip: 'bg-rose-50 text-rose-600 border-rose-100',
    bar: 'bg-rose-500',
  },
  medium: {
    dot: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-600 border-amber-100',
    bar: 'bg-amber-500',
  },
  low: {
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    bar: 'bg-emerald-500',
  },
}

export default function AlertsPage() {
  const highCount = ALERTS.filter((a) => a.severity === 'high').length

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[12px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Bell className="w-3.5 h-3.5" /> Live feed
          </span>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Pending Alerts
          </h2>
          <p className="text-slate-500 mt-1 font-medium">
            {ALERTS.length} unacknowledged signal{ALERTS.length === 1 ? '' : 's'} —{' '}
            {highCount} requiring same-day attention.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 bg-white border border-slate-100 px-5 py-3 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
          <CheckCircle2 className="w-4 h-4" />
          ACKNOWLEDGE ALL
        </button>
      </div>

      {/* Alert cards */}
      <div className="space-y-4">
        {ALERTS.map((alert) => {
          const meta = TYPE_META[alert.type]
          const styles = SEVERITY_STYLES[alert.severity]
          const Icon = meta.icon

          return (
            <article
              key={alert.id}
              className="relative glass-card rounded-3xl p-6 flex flex-col md:flex-row md:items-center gap-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glass-lg"
            >
              <span
                className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${styles.bar}`}
                aria-hidden
              />

              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center flex-shrink-0 ${styles.chip}`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-base font-black text-slate-800 tracking-tight truncate">
                      {alert.patient}
                    </h3>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${styles.chip}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-600 truncate">
                    {alert.message}
                  </p>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                    ID: {alert.patientId} &middot; {alert.timeAgo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="hidden md:block text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Suggested
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {alert.suggestedAction}
                  </p>
                </div>
                <button className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-2xl shadow-md shadow-sky-200/60 transition-all active:scale-95">
                  Review
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {ALERTS.length === 0 && (
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight mb-1">
            All clear
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            No pending alerts. Hela AI is monitoring 24/7.
          </p>
        </div>
      )}
    </div>
  )
}
