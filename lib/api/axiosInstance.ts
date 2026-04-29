import axios from 'axios';
import { ApiError } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HELA_API_URL || "https://web-production-fadce.up.railway.app/api/v1",
  timeout: Number(process.env.NEXT_PUBLIC_HELA_TIMEOUT_MS) || 15000,
});

api.interceptors.request.use((config) => {
  const key = process.env.NEXT_PUBLIC_HELA_API_KEY;
  if (key) {
    config.headers['X-Internal-Key'] = key;
  }
  return config;
});

/* Global error handling – converts to a typed ApiError */
api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    let apiError: ApiError;
    if (!error.response) {
      apiError = { type: 'NetworkError', message: error.message };
    } else if (error.response.status === 401) {
      apiError = { type: 'UnauthorizedError', message: 'Invalid internal key' };
    } else if (error.response.status >= 500) {
      apiError = {
        type: 'ServerError',
        message: `Server error (${error.response.status})`,
      };
    } else {
      apiError = {
        type: 'HttpError',
        status: error.response.status,
        message: error.response.data?.detail || 'Unexpected error',
      };
    }
    return Promise.reject(apiError);
  }
);

export default api;
