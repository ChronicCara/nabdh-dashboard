/**
 * Shared types for the diagnostics layer.
 *
 * These types are deliberately serializable (no functions, no class instances)
 * so the same shape can be returned from server-side API routes, persisted to
 * a ring buffer, and rendered by client components.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type IntegrationName =
  | 'env'
  | 'hela-ai'
  | 'supabase'

export type CheckStatus = 'pass' | 'fail' | 'degraded' | 'skipped'

export interface LogEntry {
  /** ISO timestamp – populated by the logger. */
  timestamp: string
  level: LogLevel
  /** Logical service that produced this entry, e.g. "hela-ai", "supabase". */
  service: IntegrationName | 'runner' | 'http'
  /** Short verb describing what was attempted, e.g. "GET /health". */
  operation: string
  /** Human-readable message. */
  message: string
  /** Latency in milliseconds, when applicable. */
  durationMs?: number
  /** Attempt number for retried operations (1 = first try). */
  attempt?: number
  /** HTTP status code, when applicable. */
  status?: number
  /** Additional structured context, never undefined to keep JSON stable. */
  meta?: Record<string, unknown>
  /** Serialized error info, populated for warn/error entries. */
  error?: {
    name?: string
    message: string
    type?: string
  }
}

export interface CheckResult {
  /** Stable identifier used as a React key, e.g. "hela.health". */
  id: string
  /** Display name for the UI. */
  name: string
  integration: IntegrationName
  status: CheckStatus
  /** Total wall-clock duration including retries. */
  durationMs: number
  /** Number of attempts performed (>=1 unless skipped). */
  attempts: number
  /** Whether the operation eventually succeeded after a prior failure. */
  recovered: boolean
  /** Human-readable summary. */
  message: string
  /** Optional structured details surfaced in the UI (counts, ids, etc.). */
  details?: Record<string, unknown>
  /** Error object if the final attempt failed. */
  error?: {
    name?: string
    message: string
    type?: string
  }
}

export interface DiagnosticsReport {
  /** ISO timestamp when the suite finished. */
  generatedAt: string
  /** Total wall-clock duration of the entire suite. */
  totalDurationMs: number
  /** Number of checks that passed (status === 'pass'). */
  passed: number
  /** Number of checks that failed (status === 'fail'). */
  failed: number
  /** Number of checks that ran but had warnings (status === 'degraded'). */
  degraded: number
  /** Number of checks that did not run (e.g. missing env). */
  skipped: number
  /** Total checks attempted (passed + failed + degraded + skipped). */
  total: number
  /** Pass rate as a percentage (0-100), computed from non-skipped checks. */
  successRate: number
  /** All individual check results. */
  checks: CheckResult[]
  /** Indicates whether the entire dashboard environment is fully linked. */
  fullyLinked: boolean
}
