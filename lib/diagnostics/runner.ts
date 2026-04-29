/**
 * Diagnostics suite runner.
 *
 * Executes every CheckDefinition with:
 *   - per-attempt timing
 *   - exponential backoff on failure (250ms / 750ms)
 *   - structured logging of every attempt, including recoveries
 *   - aggregate report (pass / fail / degraded / skipped, success rate)
 *
 * The runner stays UI-agnostic: both the API route and any client component
 * can call `runDiagnostics()` and render the result.
 */

import { diagnosticsLogger, serializeError } from './logger'
import { buildCheckSuite, CheckDefinition, CheckOutcome } from './checks'
import type { CheckResult, DiagnosticsReport } from './types'

const DEFAULT_MAX_ATTEMPTS = 2
const BACKOFF_MS = [250, 750]

interface RunOptions {
  /** Max attempts per retryable check. */
  maxAttempts?: number
  /** When provided, only checks whose ids match are run. */
  only?: string[]
}

async function runSingleCheck(
  def: CheckDefinition,
  maxAttempts: number
): Promise<CheckResult> {
  if (def.skip) {
    diagnosticsLogger.info(def.integration, def.id, 'skipped (env not configured)', {})
    return {
      id: def.id,
      name: def.name,
      integration: def.integration,
      status: 'skipped',
      durationMs: 0,
      attempts: 0,
      recovered: false,
      message: 'Skipped (env not configured)',
    }
  }

  const retryable = def.retryable !== false
  const attempts = retryable ? maxAttempts : 1
  const started = Date.now()

  let lastOutcome: CheckOutcome | null = null
  let attemptCount = 0
  let recovered = false
  let firstFailure: CheckOutcome | null = null

  for (let i = 0; i < attempts; i++) {
    attemptCount = i + 1
    const attemptStarted = Date.now()
    diagnosticsLogger.debug(def.integration, def.id, `attempt ${attemptCount}/${attempts}`, {
      attempt: attemptCount,
    })

    try {
      const outcome = await def.run()
      lastOutcome = outcome
      const dur = Date.now() - attemptStarted

      if (outcome.ok) {
        if (firstFailure) {
          recovered = true
          diagnosticsLogger.info(
            def.integration,
            def.id,
            `recovered on attempt ${attemptCount}`,
            { durationMs: dur, attempt: attemptCount }
          )
        } else {
          diagnosticsLogger.info(def.integration, def.id, outcome.message, {
            durationMs: dur,
            attempt: attemptCount,
          })
        }
        break
      }

      // ok=false outcome
      if (!firstFailure) firstFailure = outcome
      diagnosticsLogger.warn(def.integration, def.id, outcome.message, {
        durationMs: dur,
        attempt: attemptCount,
        error: outcome.error,
        meta: outcome.details,
      })
    } catch (err) {
      const dur = Date.now() - attemptStarted
      const serialized = serializeError(err)
      lastOutcome = {
        ok: false,
        message: serialized.message,
        error: serialized,
      }
      if (!firstFailure) firstFailure = lastOutcome
      diagnosticsLogger.error(def.integration, def.id, serialized.message, {
        durationMs: dur,
        attempt: attemptCount,
        error: serialized,
      })
    }

    if (i < attempts - 1) {
      const wait = BACKOFF_MS[Math.min(i, BACKOFF_MS.length - 1)]
      await new Promise((resolve) => setTimeout(resolve, wait))
    }
  }

  const durationMs = Date.now() - started
  const final: CheckOutcome = lastOutcome ?? { ok: false, message: 'No result' }

  if (final.ok) {
    return {
      id: def.id,
      name: def.name,
      integration: def.integration,
      status: recovered ? 'degraded' : 'pass',
      durationMs,
      attempts: attemptCount,
      recovered,
      message: recovered
        ? `Recovered after ${attemptCount} attempt${attemptCount === 1 ? '' : 's'}`
        : final.message,
      details: final.details,
    }
  }

  return {
    id: def.id,
    name: def.name,
    integration: def.integration,
    status: 'fail',
    durationMs,
    attempts: attemptCount,
    recovered: false,
    message: final.message,
    error: final.error,
    details: final.details,
  }
}

export async function runDiagnostics(
  options: RunOptions = {}
): Promise<DiagnosticsReport> {
  const { maxAttempts = DEFAULT_MAX_ATTEMPTS, only } = options
  const suiteStarted = Date.now()
  const suite = buildCheckSuite().filter((c) => !only || only.includes(c.id))

  diagnosticsLogger.info('runner', 'suite.start', `Running ${suite.length} checks`, {
    meta: { maxAttempts, ids: suite.map((c) => c.id) },
  })

  const checks: CheckResult[] = []

  // Run sequentially so logs read like a story and we don't thunder-clap the
  // backend during a probe. Total wall-clock is still small.
  for (const def of suite) {
    // Skip downstream integration checks if env required for them is missing.
    if (def.integration === 'supabase' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      checks.push({
        id: def.id,
        name: def.name,
        integration: def.integration,
        status: 'skipped',
        durationMs: 0,
        attempts: 0,
        recovered: false,
        message: 'Skipped: NEXT_PUBLIC_SUPABASE_URL not set',
      })
      diagnosticsLogger.warn(def.integration, def.id, 'skipped (missing env)')
      continue
    }
    if (def.integration === 'hela-ai' && !process.env.NEXT_PUBLIC_HELA_API_URL) {
      checks.push({
        id: def.id,
        name: def.name,
        integration: def.integration,
        status: 'skipped',
        durationMs: 0,
        attempts: 0,
        recovered: false,
        message: 'Skipped: NEXT_PUBLIC_HELA_API_URL not set',
      })
      diagnosticsLogger.warn(def.integration, def.id, 'skipped (missing env)')
      continue
    }

    checks.push(await runSingleCheck(def, maxAttempts))
  }

  const passed = checks.filter((c) => c.status === 'pass').length
  const failed = checks.filter((c) => c.status === 'fail').length
  const degraded = checks.filter((c) => c.status === 'degraded').length
  const skipped = checks.filter((c) => c.status === 'skipped').length
  const ranCount = checks.length - skipped
  const successRate =
    ranCount === 0 ? 0 : Math.round(((passed + degraded) / ranCount) * 1000) / 10

  const report: DiagnosticsReport = {
    generatedAt: new Date().toISOString(),
    totalDurationMs: Date.now() - suiteStarted,
    passed,
    failed,
    degraded,
    skipped,
    total: checks.length,
    successRate,
    fullyLinked: failed === 0 && ranCount > 0,
    checks,
  }

  diagnosticsLogger.info(
    'runner',
    'suite.end',
    `Done: ${passed} pass · ${degraded} degraded · ${failed} fail · ${skipped} skipped`,
    {
      durationMs: report.totalDurationMs,
      meta: {
        successRate: report.successRate,
        fullyLinked: report.fullyLinked,
      },
    }
  )

  return report
}
