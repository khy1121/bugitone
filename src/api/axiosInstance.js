import axios from 'axios'
import { normalizeApiError } from '../utils/normalizeApiError'
import {
  clearAuthStorage,
  isBackgroundSessionExpired,
} from '../utils/authStorage'

const DEFAULT_API_BASE_URL = '/api'
const INSECURE_HTTP_URL = /^http:\/\//i

function resolveApiBaseURL() {
  const configuredBaseURL = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!configuredBaseURL) {
    return DEFAULT_API_BASE_URL
  }

  const isHttpsPage = typeof window !== 'undefined' && window.location.protocol === 'https:'

  if (isHttpsPage && INSECURE_HTTP_URL.test(configuredBaseURL)) {
    return DEFAULT_API_BASE_URL
  }

  return configuredBaseURL
}

const axiosInstance = axios.create({
  baseURL: resolveApiBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use((config) => {
  if (isBackgroundSessionExpired()) {
    clearAuthStorage()

    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.replace('/login')
    }

    throw new axios.CanceledError('Background session expired')
  }

  const token = localStorage.getItem('accessToken')

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (typeof config.headers?.delete === 'function') {
      config.headers.delete('Content-Type')
    } else if (config.headers) {
      delete config.headers['Content-Type']
      delete config.headers['content-type']
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeApiError(error))
)

export default axiosInstance
