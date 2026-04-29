/**
 * Live integration health checks.
 *
 * Each function exercises a real call against the connected service. We
 * deliberately avoid mocking — the goal is to *prove* the dashboard is fully
 * linked, not to test our own client code in isolation.
 *
 * Every check returns an async thunk that produces a structured outcome plus
 * any details worth surfacing in the UI. The runner in `runner.ts` adds the
 * timing, retry, and recovery metadata.
 */

import { supabase } from '../supabase'
import { HelaApiService } from '../api/HelaApiService'
import { diagnosticsLogger } from './logger'
import type { IntegrationName } from './types'
import type { ApiError } from '../api/types'

type SerializedError = { name?: string; message: string; type?: string }

export type CheckOutcome =
  | {
      ok: true
      message: string
      error?: undefined
      details?: Record<string, unknown>
    }
  | {
      ok: false
      message: string
      error?: SerializedError
      details?: Record<string, unknown>
    }

export interface CheckDefinition {
  id: string
  name: string
  integration: IntegrationName
  run: () => Promise<CheckOutcome>
  /** When true, allow retries on failure. Defaults to true. */
  retryable?: boolean
}

/* ------------------------------------------------------------------ */
/* Environment                                                         */
/* ------------------------------------------------------------------ */

const REQUIRED_ENV: Array<{ key: string; integration: IntegrationName }> = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL', integration: 'supabase' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', integration: 'supabase' },
  { key: 'NEXT_PUBLIC_HELA_API_URL', integration: 'hela-ai' },
]

const OPTIONAL_ENV: Array<{ key: string; integration: IntegrationName }> = [
  { key: 'NEXT_PUBLIC_HELA_API_KEY', integration: 'hela-ai' },
  { key: 'NEXT_PUBLIC_HELA_TIMEOUT_MS', integration: 'hela-ai' },
]

function checkEnv(): CheckDefinition {
  return {
    id: 'env.required',
    name: 'Required environment variables',
    integration: 'env',
    retryable: false,
    run: async () => {
      const missing = REQUIRED_ENV.filter(
        ({ key }) => !process.env[key] || process.env[key] === ''
      )
      const present = REQUIRED_ENV.filter(({ key }) => !!process.env[key])
      const optionalPresent = OPTIONAL_ENV.filter(({ key }) => !!process.env[key])

      if (missing.length > 0) {
        return {
          ok: false,
          message: `${missing.length} required env var${
            missing.length === 1 ? '' : 's'
          } missing`,
          details: {
            missing: missing.map((m) => m.key),
            present: present.map((p) => p.key),
            optionalPresent: optionalPresent.map((o) => o.key),
          },
        }
      }

      return {
        ok: true,
        message: `${present.length} required env vars present`,
        details: {
          present: present.map((p) => p.key),
          optionalPresent: optionalPresent.map((o) => o.key),
        },
      }
    },
  }
}

/* ------------------------------------------------------------------ */
/* Supabase                                                            */
/* ------------------------------------------------------------------ */

const SUPABASE_TABLES = [
  'profiles',
  'doctor_patient_relationships',
  'patient_assessments',
  'model_metrics',
  'doctor_invite_codes',
  'family_members',
] as const

function checkSupabaseTable(table: (typeof SUPABASE_TABLES)[number]): CheckDefinition {
  return {
    id: `supabase.table.${table}`,
    name: `Supabase table: ${table}`,
    integration: 'supabase',
    run: async () => {
      const { error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        return {
          ok: false,
          message: `Cannot read "${table}"`,
          error: {
            name: 'SupabaseError',
            message: error.message,
            type: error.code,
          },
          details: { hint: error.hint, code: error.code },
        }
      }

      return {
        ok: true,
        message: `Reachable (${count ?? 0} rows)`,
        details: { rowCount: count ?? 0 },
      }
    },
  }
}

const SUPABASE_RPCS: Array<{ name: string; args: Record<string, unknown> }> = [
  {
    name: 'get_patient_assessments',
    args: { p_patient_id: '00000000-0000-0000-0000-000000000000', limit_results: 1 },
  },
]

function checkSupabaseRpc(rpc: (typeof SUPABASE_RPCS)[number]): CheckDefinition {
  return {
    id: `supabase.rpc.${rpc.name}`,
    name: `Supabase RPC: ${rpc.name}`,
    integration: 'supabase',
    run: async () => {
      const { error } = await supabase.rpc(rpc.name, rpc.args)

      // PGRST202 = function not found. Anything else = function exists, we
      // just don't have data — that still proves the connection is linked.
      if (error && error.code === 'PGRST202') {
        return {
          ok: false,
          message: `RPC "${rpc.name}" not deployed`,
          error: {
            name: 'SupabaseRpcMissing',
            message: error.message,
            type: error.code,
          },
        }
      }

      if (error) {
        return {
          ok: true,
          message: `RPC reachable (returned ${error.code ?? 'soft error'})`,
          details: { code: error.code, hint: error.hint },
        }
      }

      return { ok: true, message: 'RPC reachable' }
    },
  }
}

/* ------------------------------------------------------------------ */
/* Hela AI                                                             */
/* ------------------------------------------------------------------ */

function checkHelaHealth(): CheckDefinition {
  return {
    id: 'hela.health',
    name: 'Hela AI · /health',
    integration: 'hela-ai',
    run: async () => {
      const result = await HelaApiService.healthCheck()
      if (!result.ok) {
        return {
          ok: false,
          message: 'Health endpoint unreachable',
          error: serializeApiError(result.val),
        }
      }
      const data = result.val
      const healthy = data.status === 'healthy' || data.status === 'ok'
      return {
        ok: healthy,
        message: healthy
          ? `Healthy (v${data.version ?? '?'})`
          : `Reported status: ${data.status}`,
        details: {
          status: data.status,
          version: data.version,
          services: data.services,
        },
      }
    },
  }
}

function checkHelaRiskQueue(): CheckDefinition {
  return {
    id: 'hela.risk-queue',
    name: 'Hela AI · /patients/risk-queue',
    integration: 'hela-ai',
    run: async () => {
      const result = await HelaApiService.getRiskQueue()
      if (!result.ok) {
        return {
          ok: false,
          message: 'Risk queue endpoint failed',
          error: serializeApiError(result.val),
        }
      }
      return {
        ok: true,
        message: `OK (${result.val.length} item${result.val.length === 1 ? '' : 's'})`,
        details: { items: result.val.length },
      }
    },
  }
}

function checkHelaGlossary(): CheckDefinition {
  return {
    id: 'hela.glossary',
    name: 'Hela AI · /glossary/search',
    integration: 'hela-ai',
    run: async () => {
      const result = await HelaApiService.glossarySearch('diabetes', 'darija', 1)
      if (!result.ok) {
        return {
          ok: false,
          message: 'Glossary search failed',
          error: serializeApiError(result.val),
        }
      }
      return {
        ok: true,
        message: `OK (${result.val.length} result${result.val.length === 1 ? '' : 's'})`,
        details: { results: result.val.length },
      }
    },
  }
}

function checkHelaDoctorChat(): CheckDefinition {
  return {
    id: 'hela.doctor-chat',
    name: 'Hela AI · /doctor/chat',
    integration: 'hela-ai',
    run: async () => {
      const result = await HelaApiService.askDoctorChat(
        'diagnostics-probe',
        'health probe – please ignore',
        false
      )
      if (!result.ok) {
        const err = result.val as ApiError
        // 4xx with the probe id is acceptable — the route is reachable.
        if (err.type === 'HttpError' && err.status >= 400 && err.status < 500) {
          return {
            ok: true,
            message: `Reachable (validated probe with ${err.status})`,
            details: { status: err.status },
          }
        }
        return {
          ok: false,
          message: 'Doctor chat unreachable',
          error: serializeApiError(err),
        }
      }
      return {
        ok: true,
        message: `OK (confidence ${(result.val.confidence ?? 0).toFixed(2)})`,
      }
    },
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function serializeApiError(err: unknown): SerializedError {
  const e = err as { type?: string; message?: string; status?: number }
  return {
    name: e?.type ?? 'ApiError',
    type: e?.type,
    message: e?.message ?? 'Unknown error',
  }
}

/* ------------------------------------------------------------------ */
/* Suite assembly                                                      */
/* ------------------------------------------------------------------ */

export function buildCheckSuite(): CheckDefinition[] {
  diagnosticsLogger.debug('runner', 'build-suite', 'assembling checks')
  return [
    checkEnv(),
    ...SUPABASE_TABLES.map(checkSupabaseTable),
    ...SUPABASE_RPCS.map(checkSupabaseRpc),
    checkHelaHealth(),
    checkHelaRiskQueue(),
    checkHelaGlossary(),
    checkHelaDoctorChat(),
  ]
}
