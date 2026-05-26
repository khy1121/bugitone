import axios from 'axios'
import { normalizeApiError } from '../utils/normalizeApiError'

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
  const token = localStorage.getItem('accessToken')

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
