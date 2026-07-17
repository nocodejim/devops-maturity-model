import axios from 'axios'
import type {
  Assessment,
  AssessmentReport,
  LoginRequest,
  GateResponse,
  GateResponseCreate,
  TokenResponse,
  User,
  AnalyticsSummary,
  Organization,
  Framework,
  FrameworkStructure,
} from '@/types'

import { logger } from '@/utils/logger'

// Same-origin /api by default: the Vite dev server (dev) and nginx (prod)
// both proxy it to the backend, so the client never guesses ports.
// VITE_API_URL overrides for deployments where the API lives elsewhere.
const API_URL: string = import.meta.env.VITE_API_URL || '/api'
logger.debug('[API] Backend URL:', API_URL)

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
    const params = new URLSearchParams()
    params.append('username', credentials.email)
    params.append('password', credentials.password)

    const response = await api.post<TokenResponse>('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me')
    return response.data
  },
}

// Organizations API
export const organizationApi = {
  list: async (): Promise<Organization[]> => {
    const response = await api.get<Organization[]>('/organizations/')
    return response.data
  },

  create: async (data: Partial<Organization>): Promise<Organization> => {
    const response = await api.post<Organization>('/organizations/', data)
    return response.data
  },

  get: async (id: string): Promise<Organization> => {
    const response = await api.get<Organization>(`/organizations/${id}`)
    return response.data
  },
}

// Frameworks API
export const frameworkApi = {
  list: async (): Promise<Framework[]> => {
    const response = await api.get<Framework[]>('/frameworks/')
    return response.data
  },

  get: async (id: string): Promise<Framework> => {
    const response = await api.get<Framework>(`/frameworks/${id}`)
    return response.data
  },

  getStructure: async (id: string): Promise<FrameworkStructure> => {
    const response = await api.get<FrameworkStructure>(`/frameworks/${id}/structure`)
    return response.data
  }
}

// Assessment API
export const assessmentApi = {
  list: async (): Promise<Assessment[]> => {
    const response = await api.get<Assessment[]>('/assessments/')
    return response.data
  },

  create: async (teamName: string, frameworkId: string, organizationId?: string): Promise<Assessment> => {
    const response = await api.post<Assessment>('/assessments/', {
      team_name: teamName,
      framework_id: frameworkId,
      organization_id: organizationId,
    })
    return response.data
  },

  get: async (id: string): Promise<Assessment> => {
    const response = await api.get<Assessment>(`/assessments/${id}`)
    return response.data
  },

  getResponses: async (id: string): Promise<GateResponse[]> => {
    const response = await api.get<GateResponse[]>(`/assessments/${id}/responses`)
    return response.data
  },

  saveResponses: async (
    id: string,
    responses: GateResponseCreate[]
  ): Promise<GateResponse[]> => {
    const response = await api.post<GateResponse[]>(`/assessments/${id}/responses`, {
      responses,
    })
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

  downloadPdfReport: async (id: string, teamName: string): Promise<void> => {
    logger.debug('[API] Downloading PDF report for assessment:', id)
    try {
      const response = await api.get(`/assessments/${id}/report/pdf`, {
        responseType: 'blob',
      })

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Create safe filename
      const safeTeamName = teamName.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '-')
      link.setAttribute('download', `assessment-${safeTeamName}.pdf`)

      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      logger.debug('[API] PDF download successful')
    } catch (error) {
      logger.error('[API] PDF download failed:', error)
      throw error
    }
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
