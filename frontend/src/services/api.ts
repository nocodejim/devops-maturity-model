import axios from 'axios'
import type {
  Assessment,
  AssessmentReport,
  LoginRequest,
  GateResponse,
  GateResponseCreate,
  TokenResponse,
  User,
  UserCreate,
  UserAdminUpdate,
  UserListResponse,
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
  // Use same host as frontend
  const protocol = window.location.protocol
  const host = window.location.hostname

  // If running on non-standard frontend port (8673), use port 8680 (backend)
  // Otherwise use port 8000 (development)
  const port = window.location.port === '8673' ? '8680' : '8000'

  const url = `${protocol}//${host}:${port}/api`
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

  downloadPdfReport: async (id: string, teamName: string): Promise<void> => {
    console.log('[API] Downloading PDF report for assessment:', id)
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

      console.log('[API] PDF download successful')
    } catch (error) {
      console.error('[API] PDF download failed:', error)
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

// Admin API
export const adminApi = {
  listUsers: async (skip = 0, limit = 50, search?: string): Promise<UserListResponse> => {
    console.log('[AdminAPI] Listing users, skip:', skip, 'limit:', limit, 'search:', search)
    const params = new URLSearchParams()
    params.append('skip', String(skip))
    params.append('limit', String(limit))
    if (search) params.append('search', search)
    const response = await api.get<UserListResponse>(`/admin/users?${params}`)
    console.log('[AdminAPI] Got users:', response.data.total)
    return response.data
  },

  getUser: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/admin/users/${id}`)
    return response.data
  },

  createUser: async (data: UserCreate): Promise<User> => {
    console.log('[AdminAPI] Creating user:', data.email)
    const response = await api.post<User>('/admin/users', data)
    console.log('[AdminAPI] User created:', response.data.id)
    return response.data
  },

  updateUser: async (id: string, data: UserAdminUpdate): Promise<User> => {
    console.log('[AdminAPI] Updating user:', id, data)
    const response = await api.put<User>(`/admin/users/${id}`, data)
    return response.data
  },

  deleteUser: async (id: string): Promise<void> => {
    console.log('[AdminAPI] Deactivating user:', id)
    await api.delete(`/admin/users/${id}`)
  },

  resetPassword: async (id: string, newPassword: string): Promise<User> => {
    console.log('[AdminAPI] Resetting password for user:', id)
    const response = await api.post<User>(`/admin/users/${id}/reset-password`, {
      new_password: newPassword,
    })
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
