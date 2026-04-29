'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  Gauge,
  Loader2,
  PlayCircle,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react'
import type {
  CheckResult,
  DiagnosticsReport,
  IntegrationName,
  LogEntry,
  LogLevel,
} from '@/lib/diagnostics/types'

const LEVEL_FILTERS: Array<{ key: LogLevel | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'info', label: 'Info' },
  { key: 'warn', label: 'Warnings' },
  { key: 'error', label: 'Errors' },
]

const INTEGRATION_META: Record<
  IntegrationName,
  { label: string; icon: typeof Activity }
> = {
  env: { label: 'Environment', icon: ShieldAlert },
  supabase: { label: 'Supabase', icon: Database },
  'hela-ai': { label: 'Hela AI Backend', icon: Sparkles },
}

export default function DiagnosticsPageClient() {
  const [report, setReport] = useState<DiagnosticsReport | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logFilter, setLogFilter] = useState<LogLevel | 'all'>('all')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const runSuite = useCallback(async () => {
    setRunning(true)
    setError(null)
    try {
      const res = await fetch('/api/diagnostics', { cache: 'no-store' })
      const data = (await res.json()) as DiagnosticsReport | { error: string }
      if ('error' in data) {
        setError(data.error)
      } else {
        setReport(data)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setRunning(false)
    }
  }, [])

  const fetchLogs = useCallback(async () => {
    try {
      const url =
        logFilter === 'all'
          ? '/api/diagnostics/logs?limit=200'
          : `/api/diagnostics/logs?limit=200&level=${logFilter}`
      const res = await fetch(url, { cache: 'no-store' })
      const data = (await res.json()) as { entries: LogEntry[] }
      setLogs(data.entries)
    } catch {
      /* swallow — logs are best-effort */
    }
  }, [logFilter])

  const clearLogs = useCallback(async () => {
    await fetch('/api/diagnostics/logs', { method: 'DELETE' })
    setLogs([])
  }, [])

  // Initial run on mount
  useEffect(() => {
    runSuite().then(fetchLogs)
  }, [runSuite, fetchLogs])

  // Refetch logs whenever filter changes
  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Auto-refresh loop
  useEffect(() => {
    if (autoRefresh) {
      autoRefreshRef.current = setInterval(() => {
        runSuite().then(fetchLogs)
      }, 15000)
    } else if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current)
      autoRefreshRef.current = null
    }
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current)
    }
  }, [autoRefresh, runSuite, fetchLogs])

  const grouped = useMemo(() => {
    if (!report) return new Map<IntegrationName, CheckResult[]>()
    const map = new Map<IntegrationName, CheckResult[]>()
    for (const check of report.checks) {
      const list = map.get(check.integration) ?? []
      list.push(check)
      map.set(check.integration, list)
    }
    return map
  }, [report])

  const avgLatency = useMemo(() => {
    if (!report) return 0
    const ran = report.checks.filter((c) => c.status !== 'skipped' && c.attempts > 0)
    if (ran.length === 0) return 0
    return Math.round(ran.reduce((acc, c) => acc + c.durationMs, 0) / ran.length)
  }, [report])

  const slowest = useMemo(() => {
    if (!report) return null
    return [...report.checks]
      .filter((c) => c.status !== 'skipped')
      .sort((a, b) => b.durationMs - a.durationMs)[0]
  }, [report])

  const recovered = useMemo(
    () => report?.checks.filter((c) => c.recovered) ?? [],
    [report]
  )

  return (
    <div className="px-8 py-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[24px] bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-200/60 border-2 border-white">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-black text-sky-500 uppercase tracking-widest mb-1">
              Integration Diagnostics
            </p>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Connection Health
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live integration tests with structured logging, retries, and recovery tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 glass-card px-4 py-3 rounded-[20px] text-xs font-bold text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500/40"
            />
            AUTO-REFRESH (15s)
          </label>
          <button
            onClick={() => {
              runSuite().then(fetchLogs)
            }}
            disabled={running}
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-[24px] font-black shadow-xl shadow-sky-200/60 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
          >
            {running ? (
              <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
            ) : (
              <PlayCircle className="w-5 h-5" strokeWidth={3} />
            )}
            {running ? 'RUNNING…' : 'RUN DIAGNOSTICS'}
          </button>
        </div>
      </div>

      {/* Summary banner */}
      <SummaryBanner report={report} error={error} />

      {/* Metric strip */}
      <MetricStrip
        report={report}
        avgLatency={avgLatency}
        slowest={slowest}
        recovered={recovered.length}
      />

      {/* Integration sections */}
      <div className="grid gap-6 mb-10">
        {Array.from(grouped.entries()).map(([integration, checks]) => (
          <IntegrationCard
            key={integration}
            integration={integration}
            checks={checks}
          />
        ))}
        {!report && !error && (
          <div className="glass-card rounded-[32px] p-12 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-sky-500" />
            Running first diagnostics pass…
          </div>
        )}
      </div>

      {/* Log stream */}
      <LogStream
        logs={logs}
        filter={logFilter}
        onFilter={setLogFilter}
        onRefresh={fetchLogs}
        onClear={clearLogs}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */

function SummaryBanner({
  report,
  error,
}: {
  report: DiagnosticsReport | null
  error: string | null
}) {
  if (error) {
    return (
      <div className="mb-8 glass-card rounded-[32px] p-6 border-l-4 border-rose-500 flex items-center gap-4">
        <XCircle className="w-8 h-8 text-rose-500 flex-shrink-0" />
        <div>
          <p className="font-black text-slate-800">Diagnostics suite failed to start</p>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!report) return null

  const accent = report.fullyLinked
    ? 'border-emerald-500'
    : report.failed > 0
      ? 'border-rose-500'
      : 'border-amber-500'

  const Icon = report.fullyLinked
    ? CheckCircle2
    : report.failed > 0
      ? XCircle
      : AlertTriangle

  const iconColor = report.fullyLinked
    ? 'text-emerald-500'
    : report.failed > 0
      ? 'text-rose-500'
      : 'text-amber-500'

  return (
    <div
      className={`mb-8 glass-card rounded-[32px] p-6 border-l-4 ${accent} flex flex-col md:flex-row md:items-center justify-between gap-4`}
    >
      <div className="flex items-center gap-4">
        <Icon className={`w-9 h-9 flex-shrink-0 ${iconColor}`} />
        <div>
          <p className="font-black text-slate-800 text-lg">
            {report.fullyLinked
              ? `All systems linked · ${report.successRate}% success`
              : `${report.failed} failure${report.failed === 1 ? '' : 's'} detected · ${report.successRate}% success`}
          </p>
          <p className="text-sm text-slate-500">
            Generated {new Date(report.generatedAt).toLocaleTimeString()} · Suite ran in{' '}
            {report.totalDurationMs}ms
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Pill label="Pass" value={report.passed} tone="emerald" />
        <Pill label="Degraded" value={report.degraded} tone="amber" />
        <Pill label="Fail" value={report.failed} tone="rose" />
        <Pill label="Skipped" value={report.skipped} tone="slate" />
      </div>
    </div>
  )
}

function Pill({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'emerald' | 'amber' | 'rose' | 'slate'
}) {
  const tones: Record<typeof tone, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-100 text-slate-600',
  }
  return (
    <div
      className={`px-4 py-2 rounded-2xl ${tones[tone]} text-center min-w-[78px]`}
    >
      <div className="text-xl font-black leading-none">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5">
        {label}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function MetricStrip({
  report,
  avgLatency,
  slowest,
  recovered,
}: {
  report: DiagnosticsReport | null
  avgLatency: number
  slowest: CheckResult | null
  recovered: number
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <Metric
        icon={Gauge}
        label="Success Rate"
        value={report ? `${report.successRate}%` : '—'}
        sub={
          report
            ? `${report.passed + report.degraded}/${report.total - report.skipped} healthy`
            : 'Awaiting run'
        }
      />
      <Metric
        icon={Activity}
        label="Avg Latency"
        value={avgLatency ? `${avgLatency}ms` : '—'}
        sub="Per check (incl. retries)"
      />
      <Metric
        icon={RefreshCw}
        label="Recoveries"
        value={String(recovered)}
        sub="Checks that retried successfully"
      />
      <Metric
        icon={AlertTriangle}
        label="Slowest"
        value={slowest ? `${slowest.durationMs}ms` : '—'}
        sub={slowest ? slowest.name : 'Awaiting run'}
      />
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Activity
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="glass-card rounded-[28px] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <Icon className="w-4 h-4 text-sky-500" />
      </div>
      <p className="text-2xl font-black text-slate-800 tracking-tight leading-none">
        {value}
      </p>
      <p className="text-xs text-slate-500 mt-2 truncate">{sub}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function IntegrationCard({
  integration,
  checks,
}: {
  integration: IntegrationName
  checks: CheckResult[]
}) {
  const meta = INTEGRATION_META[integration]
  const Icon = meta.icon
  const failed = checks.filter((c) => c.status === 'fail').length
  const passed = checks.filter((c) => c.status === 'pass').length
  const degraded = checks.filter((c) => c.status === 'degraded').length

  return (
    <div className="glass-card rounded-[32px] overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-sky-50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 tracking-tight">
              {meta.label}
            </h3>
            <p className="text-xs text-slate-500">
              {checks.length} check{checks.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold">
          {failed > 0 && (
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700">
              {failed} fail
            </span>
          )}
          {degraded > 0 && (
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700">
              {degraded} degraded
            </span>
          )}
          {passed > 0 && (
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
              {passed} pass
            </span>
          )}
        </div>
      </div>

      <ul className="divide-y divide-slate-50">
        {checks.map((check) => (
          <CheckRow key={check.id} check={check} />
        ))}
      </ul>
    </div>
  )
}

function CheckRow({ check }: { check: CheckResult }) {
  const statusMeta = {
    pass: {
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500',
      label: 'PASS',
    },
    fail: {
      icon: XCircle,
      color: 'text-rose-500',
      bg: 'bg-rose-500',
      label: 'FAIL',
    },
    degraded: {
      icon: RefreshCw,
      color: 'text-amber-500',
      bg: 'bg-amber-500',
      label: 'DEGRADED',
    },
    skipped: {
      icon: AlertTriangle,
      color: 'text-slate-400',
      bg: 'bg-slate-400',
      label: 'SKIPPED',
    },
  }[check.status]

  const Icon = statusMeta.icon
  const [open, setOpen] = useState(false)
  const hasDetails =
    !!check.error || (check.details && Object.keys(check.details).length > 0)

  return (
    <li>
      <button
        type="button"
        onClick={() => hasDetails && setOpen((o) => !o)}
        className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-colors ${
          hasDetails ? 'hover:bg-slate-50/80 cursor-pointer' : 'cursor-default'
        }`}
      >
        <div
          className={`w-1 self-stretch rounded-full ${statusMeta.bg} flex-shrink-0`}
        />
        <Icon className={`w-5 h-5 flex-shrink-0 ${statusMeta.color}`} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 truncate">{check.name}</p>
          <p className="text-xs text-slate-500 truncate">{check.message}</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
          <span>{check.durationMs}ms</span>
          <span>
            {check.attempts} attempt{check.attempts === 1 ? '' : 's'}
          </span>
          <span
            className={`px-2 py-1 rounded-md ${statusMeta.color} bg-current/10 font-bold tracking-wider`}
            style={{ backgroundColor: 'transparent' }}
          >
            {statusMeta.label}
          </span>
        </div>
      </button>

      {open && hasDetails && (
        <div className="px-6 pb-5 -mt-1">
          <pre className="bg-slate-900 text-slate-100 text-xs font-mono rounded-2xl p-4 overflow-x-auto">
            {JSON.stringify(
              { error: check.error, details: check.details },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </li>
  )
}

/* ------------------------------------------------------------------ */

function LogStream({
  logs,
  filter,
  onFilter,
  onRefresh,
  onClear,
}: {
  logs: LogEntry[]
  filter: LogLevel | 'all'
  onFilter: (f: LogLevel | 'all') => void
  onRefresh: () => void
  onClear: () => void
}) {
  return (
    <div className="glass-card rounded-[32px] overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-sky-50 flex items-center justify-center">
            <Activity className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 tracking-tight">Log Stream</h3>
            <p className="text-xs text-slate-500">
              {logs.length} recent entries · ring buffer (max 500)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-2xl bg-slate-100 p-1">
            {LEVEL_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => onFilter(f.key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                  filter === f.key
                    ? 'bg-white text-sky-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-colors"
            aria-label="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClear}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            aria-label="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[480px] overflow-auto bg-slate-900 text-slate-100 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">
            No log entries match the current filter.
          </div>
        ) : (
          <ul>
            {logs.slice().reverse().map((entry, idx) => (
              <LogRow key={`${entry.timestamp}-${idx}`} entry={entry} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function LogRow({ entry }: { entry: LogEntry }) {
  const levelColor: Record<LogLevel, string> = {
    debug: 'text-slate-400',
    info: 'text-sky-300',
    warn: 'text-amber-300',
    error: 'text-rose-300',
  }
  const time = new Date(entry.timestamp).toLocaleTimeString(undefined, {
    hour12: false,
  })
  return (
    <li className="px-5 py-2 border-b border-slate-800 hover:bg-slate-800/50">
      <div className="flex items-baseline gap-3">
        <span className="text-slate-500 tabular-nums">{time}</span>
        <span
          className={`font-bold uppercase tracking-wider ${levelColor[entry.level]}`}
        >
          {entry.level}
        </span>
        <span className="text-slate-400">{entry.service}</span>
        <span className="text-slate-200 truncate flex-1">
          {entry.operation} → {entry.message}
        </span>
        {entry.durationMs !== undefined && (
          <span className="text-slate-500 tabular-nums">{entry.durationMs}ms</span>
        )}
        {entry.attempt !== undefined && entry.attempt > 1 && (
          <span className="text-amber-300">retry {entry.attempt}</span>
        )}
      </div>
      {entry.error && (
        <div className="ml-[5.5rem] text-rose-300 mt-1">
          {entry.error.type ?? entry.error.name ?? 'Error'}: {entry.error.message}
        </div>
      )}
    </li>
  )
}
