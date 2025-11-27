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

// Detect backend URL based on current host
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // Use same host as frontend but port 8000
  const host = window.location.hostname
  const url = `http://${host}:8000/api`
  console.log('[API] Detected backend URL:', url)
  return url
}

const API_URL = getApiUrl()

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

// DEPRECATED: Gates API (kept for compilation safety if needed, but should be unused)
export const gatesApi = {
  getAll: async (): Promise<any> => {
    return Promise.resolve({ gates: [], total_gates: 0, total_questions: 0 })
  },
}

export default api
