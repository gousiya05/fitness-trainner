import axios from 'axios'
import { API_BASE, AI_BASE, TOKEN_KEY } from '@/utils/constants'

// ─── Backend API client ────────────────────────────────────────────────
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global 401 handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── AI Service client ──────────────────────────────────────────────────
export const aiApi = axios.create({
  baseURL: AI_BASE,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

export default api
