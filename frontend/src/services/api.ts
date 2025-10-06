import axios from 'axios'
import type {
  Assessment,
  AssessmentReport,
  LoginRequest,
  Response,
  ResponseCreate,
  TokenResponse,
  User,
  AnalyticsSummary,
} from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle auth errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const formData = new FormData()
    formData.append('username', credentials.email)
    formData.append('password', credentials.password)

    const response = await api.post<TokenResponse>('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me')
    return response.data
  },
}

// Assessment API
export const assessmentApi = {
  list: async (): Promise<Assessment[]> => {
    const response = await api.get<Assessment[]>('/assessments/')
    return response.data
  },

  create: async (teamName: string): Promise<Assessment> => {
    const response = await api.post<Assessment>('/assessments/', { team_name: teamName })
    return response.data
  },

  get: async (id: string): Promise<Assessment> => {
    const response = await api.get<Assessment>(`/assessments/${id}`)
    return response.data
  },

  getResponses: async (id: string): Promise<Response[]> => {
    const response = await api.get<Response[]>(`/assessments/${id}/responses`)
    return response.data
  },

  saveResponses: async (id: string, responses: ResponseCreate[]): Promise<Response[]> => {
    const response = await api.post<Response[]>(`/assessments/${id}/responses`, { responses })
    return response.data
  },

  submit: async (id: string): Promise<Assessment> => {
    const response = await api.post<Assessment>(`/assessments/${id}/submit`)
    return response.data
  },

  getReport: async (id: string): Promise<AssessmentReport> => {
    const response = await api.get<AssessmentReport>(`/assessments/${id}/report`)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/assessments/${id}`)
  },
}

// Analytics API
export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    const response = await api.get<AnalyticsSummary>('/analytics/summary')
    return response.data
  },
}

export default api
