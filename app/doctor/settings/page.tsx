import React from 'react'
import {
  SlidersHorizontal,
  MessageSquareText,
  Palette,
  Plug,
  Sparkles,
} from 'lucide-react'

interface ThresholdField {
  label: string
  unit: string
  defaultValue: string
}

const THRESHOLDS: ThresholdField[] = [
  { label: 'Systolic BP — Max', unit: 'mmHg', defaultValue: '140' },
  { label: 'Diastolic BP — Max', unit: 'mmHg', defaultValue: '90' },
  { label: 'Fasting Glucose — Min', unit: 'mg/dL', defaultValue: '80' },
  { label: 'Fasting Glucose — Max', unit: 'mg/dL', defaultValue: '200' },
]

interface SmsTemplate {
  key: string
  label: string
  body: string
}

const TEMPLATES: SmsTemplate[] = [
  {
    key: 'welcome',
    label: 'Welcome (Onboarding)',
    body: 'Marhab bikom f Biovatech — bach n3awnouk f saha ta3 ammi/khalti.',
  },
  {
    key: 'nurture',
    label: 'Nurture (Adherence drift)',
    body: 'Ammi, labess? Maranich nchoufek tkhd dwak — ji nchoufek hna.',
  },
]

export default function SettingsPage() {
  return (
    <div className="max-w-[1100px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <span className="text-[12px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Personalize Hela
        </span>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          Settings
        </h2>
        <p className="text-slate-500 mt-1 font-medium">
          Tune risk thresholds, Darija templates and clinic integrations.
        </p>
      </div>

      {/* Risk thresholds */}
      <section className="glass-card rounded-[32px] p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-sky-50 rounded-2xl text-sky-500">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              Risk Thresholds
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Customize the cut-offs Hela uses to flag patients in your queue.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {THRESHOLDS.map((field) => (
            <label key={field.label} className="block">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                {field.label}
              </span>
              <div className="relative">
                <input
                  type="number"
                  defaultValue={field.defaultValue}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 pr-16 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  {field.unit}
                </span>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md shadow-sky-200/60 transition-all active:scale-95">
            Save Thresholds
          </button>
        </div>
      </section>

      {/* SMS templates */}
      <section className="glass-card rounded-[32px] p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-sky-50 rounded-2xl text-sky-500">
            <MessageSquareText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              Darija SMS Templates
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Warm, culturally-tuned messages sent on your behalf.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {TEMPLATES.map((tpl) => (
            <div key={tpl.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {tpl.label}
                </span>
                <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">
                  Editable
                </span>
              </div>
              <textarea
                defaultValue={tpl.body}
                rows={2}
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all resize-none"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Theme + Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="glass-card rounded-[32px] p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-sky-50 rounded-2xl text-sky-500">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                Appearance
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                Sky-blue stays consistent in any mode.
              </p>
            </div>
          </div>

          <div className="flex p-1 bg-slate-100/60 rounded-2xl border border-slate-100">
            {(['Light', 'Dark', 'System'] as const).map((mode, idx) => (
              <button
                key={mode}
                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  idx === 0
                    ? 'bg-white text-sky-600 shadow-sm border border-slate-100'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </section>

        <section className="glass-card rounded-[32px] p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-sky-50 rounded-2xl text-sky-500">
              <Plug className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                Integrations
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                Lab APIs, insurance &amp; teammates.
              </p>
            </div>
          </div>

          <ul className="space-y-3">
            {[
              { name: 'Hela AI Backend', status: 'Connected' },
              { name: 'Lab API — Biovatech', status: 'Connected' },
              { name: 'Insurance Portal', status: 'Pending' },
            ].map((int) => (
              <li
                key={int.name}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/60 border border-slate-100"
              >
                <span className="text-sm font-bold text-slate-700">
                  {int.name}
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                    int.status === 'Connected'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}
                >
                  {int.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
