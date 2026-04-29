import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ApiError } from './types'

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
  return config
})

/* Convert errors to typed ApiError. */
api.interceptors.response.use(
  (resp) => resp,
  (error: AxiosError<{ detail?: string | Array<{ loc: string[]; msg: string; type: string }> }>) => {
    let apiError: ApiError

    // Log the full error for debugging
    if (error.response) {
      console.error('HEALA API Error:', error.response.status, JSON.stringify(error.response.data, null, 2))
    }

    if (!error.response) {
      apiError = { type: 'NetworkError', message: error.message }
    } else if (error.response.status === 401) {
      apiError = { type: 'UnauthorizedError', message: 'Invalid internal key' }
    } else if (error.response.status === 422) {
      // Handle both FastAPI standard and custom validation error formats
      const respData = error.response.data as any
      let message = 'Validation error'
      
      // Custom format: { details: { errors: [{ field, message }] } }
      if (respData?.details?.errors && Array.isArray(respData.details.errors)) {
        message = respData.details.errors.map((e: any) => `${e.field}: ${e.message}`).join('; ')
      }
      // Standard FastAPI: { detail: [{ loc, msg }] }
      else if (Array.isArray(respData?.detail)) {
        message = respData.detail.map((e: any) => `${e.loc?.join(' → ')}: ${e.msg}`).join('; ')
      }
      // Simple string detail
      else if (typeof respData?.detail === 'string') {
        message = respData.detail
      }
      // Fallback to message field
      else if (typeof respData?.message === 'string') {
        message = respData.message
      }
      apiError = { type: 'HttpError', status: 422, message }
    } else if (error.response.status >= 500) {
      apiError = {
        type: 'ServerError',
        message: `Server error (${error.response.status})`,
      }
    } else {
      const detail = error.response.data?.detail
      apiError = {
        type: 'HttpError',
        status: error.response.status,
        message: typeof detail === 'string' ? detail : 'Unexpected error',
      }
    }

    return Promise.reject(apiError)
  }
)

export default api
