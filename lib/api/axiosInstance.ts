import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ApiError } from './types'
import { diagnosticsLogger } from '../diagnostics/logger'

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_HELA_API_URL ||
    'https://web-production-fadce.up.railway.app/api/v1',
  timeout: Number(process.env.NEXT_PUBLIC_HELA_TIMEOUT_MS) || 15000,
})

interface TimedConfig extends InternalAxiosRequestConfig {
  metadata?: { startedAt: number }
}

/* Inject internal key + start request timer. */
api.interceptors.request.use((config: TimedConfig) => {
  const key = process.env.NEXT_PUBLIC_HELA_API_KEY
  if (key) {
    config.headers['X-Internal-Key'] = key
  }
  config.metadata = { startedAt: Date.now() }
  diagnosticsLogger.debug(
    'hela-ai',
    `${(config.method ?? 'GET').toUpperCase()} ${config.url ?? ''}`,
    'request issued'
  )
  return config
})

/* Convert errors to typed ApiError + log every response (success or failure). */
api.interceptors.response.use(
  (resp) => {
    const cfg = resp.config as TimedConfig
    const durationMs = cfg.metadata
      ? Date.now() - cfg.metadata.startedAt
      : undefined
    diagnosticsLogger.info(
      'hela-ai',
      `${(cfg.method ?? 'GET').toUpperCase()} ${cfg.url ?? ''}`,
      `${resp.status} OK`,
      { durationMs, status: resp.status }
    )
    return resp
  },
  (error: AxiosError<{ detail?: string }>) => {
    const cfg = error.config as TimedConfig | undefined
    const durationMs = cfg?.metadata
      ? Date.now() - cfg.metadata.startedAt
      : undefined
    const op = cfg
      ? `${(cfg.method ?? 'GET').toUpperCase()} ${cfg.url ?? ''}`
      : 'request'

    let apiError: ApiError
    if (!error.response) {
      apiError = { type: 'NetworkError', message: error.message }
    } else if (error.response.status === 401) {
      apiError = { type: 'UnauthorizedError', message: 'Invalid internal key' }
    } else if (error.response.status >= 500) {
      apiError = {
        type: 'ServerError',
        message: `Server error (${error.response.status})`,
      }
    } else {
      apiError = {
        type: 'HttpError',
        status: error.response.status,
        message: error.response.data?.detail || 'Unexpected error',
      }
    }

    diagnosticsLogger.error('hela-ai', op, apiError.message, {
      durationMs,
      status: error.response?.status,
      error: { name: apiError.type, message: apiError.message, type: apiError.type },
    })

    return Promise.reject(apiError)
  }
)

export default api
