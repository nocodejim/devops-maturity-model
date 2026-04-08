import axios from 'axios'
import type {
  Assessment,
  AssessmentReport,
  BackupInfo,
  BackupResult,
  RestoreResult,
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
  FrameworkAdminResponse,
  FrameworkCreate,
  FrameworkUpdate,
  FrameworkStructure,
  FrameworkDomainCreate,
  FrameworkGateCreate,
  FrameworkQuestionCreate,
  FrameworkDomain,
  FrameworkGate,
  FrameworkQuestion,
  Project,
  ProjectCreate,
  InsightsResponse,
  RoleHeatmapResponse,
  TrendComparisonResponse,
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

  create: async (
    teamName: string,
    frameworkId: string,
    organizationId?: string,
    projectId?: string,
    tags?: string[],
    campaignId?: string,
  ): Promise<Assessment> => {
    console.log('[API] Creating assessment:', { teamName, frameworkId, projectId, tags, campaignId })
    const response = await api.post<Assessment>('/assessments/', {
      team_name: teamName,
      framework_id: frameworkId,
      organization_id: organizationId,
      project_id: projectId || undefined,
      tags: tags?.length ? tags : undefined,
      campaign_id: campaignId || undefined,
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

// Admin Framework API
export const adminFrameworkApi = {
  list: async (): Promise<FrameworkAdminResponse[]> => {
    console.log('[AdminFrameworkAPI] Listing frameworks')
    const response = await api.get<FrameworkAdminResponse[]>('/admin/frameworks/')
    return response.data
  },

  create: async (data: FrameworkCreate): Promise<Framework> => {
    console.log('[AdminFrameworkAPI] Creating framework:', data.name)
    const response = await api.post<Framework>('/admin/frameworks/', data)
    return response.data
  },

  update: async (id: string, data: FrameworkUpdate): Promise<Framework> => {
    const response = await api.put<Framework>(`/admin/frameworks/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/frameworks/${id}`)
  },

  // Domain CRUD
  createDomain: async (frameworkId: string, data: FrameworkDomainCreate): Promise<FrameworkDomain> => {
    const response = await api.post<FrameworkDomain>(`/admin/frameworks/${frameworkId}/domains`, data)
    return response.data
  },

  updateDomain: async (frameworkId: string, domainId: string, data: Partial<FrameworkDomainCreate>): Promise<FrameworkDomain> => {
    const response = await api.put<FrameworkDomain>(`/admin/frameworks/${frameworkId}/domains/${domainId}`, data)
    return response.data
  },

  deleteDomain: async (frameworkId: string, domainId: string): Promise<void> => {
    await api.delete(`/admin/frameworks/${frameworkId}/domains/${domainId}`)
  },

  // Gate CRUD
  createGate: async (frameworkId: string, domainId: string, data: FrameworkGateCreate): Promise<FrameworkGate> => {
    const response = await api.post<FrameworkGate>(`/admin/frameworks/${frameworkId}/domains/${domainId}/gates`, data)
    return response.data
  },

  updateGate: async (frameworkId: string, domainId: string, gateId: string, data: Partial<FrameworkGateCreate>): Promise<FrameworkGate> => {
    const response = await api.put<FrameworkGate>(`/admin/frameworks/${frameworkId}/domains/${domainId}/gates/${gateId}`, data)
    return response.data
  },

  deleteGate: async (frameworkId: string, domainId: string, gateId: string): Promise<void> => {
    await api.delete(`/admin/frameworks/${frameworkId}/domains/${domainId}/gates/${gateId}`)
  },

  // Question CRUD
  createQuestion: async (frameworkId: string, domainId: string, gateId: string, data: FrameworkQuestionCreate): Promise<FrameworkQuestion> => {
    const response = await api.post<FrameworkQuestion>(`/admin/frameworks/${frameworkId}/domains/${domainId}/gates/${gateId}/questions`, data)
    return response.data
  },

  updateQuestion: async (frameworkId: string, domainId: string, gateId: string, questionId: string, data: Partial<FrameworkQuestionCreate>): Promise<FrameworkQuestion> => {
    const response = await api.put<FrameworkQuestion>(`/admin/frameworks/${frameworkId}/domains/${domainId}/gates/${gateId}/questions/${questionId}`, data)
    return response.data
  },

  deleteQuestion: async (frameworkId: string, domainId: string, gateId: string, questionId: string): Promise<void> => {
    await api.delete(`/admin/frameworks/${frameworkId}/domains/${domainId}/gates/${gateId}/questions/${questionId}`)
  },

  // Export
  exportFramework: async (id: string, format: 'json' | 'yaml' = 'json'): Promise<{ content: any; filename: string }> => {
    console.log('[AdminFrameworkAPI] Exporting framework:', id, format)
    const response = await api.get(`/admin/frameworks/${id}/export?format=${format}`)
    return response.data
  },

  // Import
  importFramework: async (file: File): Promise<Framework> => {
    console.log('[AdminFrameworkAPI] Importing framework from file:', file.name)
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<Framework>('/admin/frameworks/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}

// Admin Backup API
export const adminBackupApi = {
  list: async (): Promise<BackupInfo[]> => {
    console.log('[AdminBackupAPI] Listing backups')
    const response = await api.get<BackupInfo[]>('/admin/backups/')
    return response.data
  },

  create: async (): Promise<BackupResult> => {
    console.log('[AdminBackupAPI] Creating backup')
    const response = await api.post<BackupResult>('/admin/backups/')
    console.log('[AdminBackupAPI] Backup created:', response.data.filename)
    return response.data
  },

  download: async (filename: string): Promise<void> => {
    console.log('[AdminBackupAPI] Downloading backup:', filename)
    const response = await api.get(`/admin/backups/${filename}/download`, {
      responseType: 'blob',
    })
    const blob = new Blob([response.data], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  },

  restore: async (file: File): Promise<RestoreResult> => {
    console.log('[AdminBackupAPI] Restoring from file:', file.name)
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<RestoreResult>('/admin/backups/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    console.log('[AdminBackupAPI] Restore complete:', response.data.message)
    return response.data
  },

  delete: async (filename: string): Promise<void> => {
    console.log('[AdminBackupAPI] Deleting backup:', filename)
    await api.delete(`/admin/backups/${filename}`)
  },
}

// Projects API
export const projectApi = {
  list: async (): Promise<Project[]> => {
    console.log('[ProjectAPI] Listing projects')
    const response = await api.get<Project[]>('/projects/')
    return response.data
  },

  create: async (data: ProjectCreate): Promise<Project> => {
    console.log('[ProjectAPI] Creating project:', data.name)
    const response = await api.post<Project>('/projects/', data)
    return response.data
  },

  get: async (id: string): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`)
    return response.data
  },

  update: async (id: string, data: Partial<ProjectCreate>): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`)
  },

  listAssessments: async (id: string, tags?: string[], campaignId?: string): Promise<Assessment[]> => {
    const params = new URLSearchParams()
    if (tags) tags.forEach(t => params.append('tags', t))
    if (campaignId) params.append('campaign_id', campaignId)
    const response = await api.get<Assessment[]>(`/projects/${id}/assessments?${params}`)
    return response.data
  },
}

// Insights API
export const insightsApi = {
  getInsights: async (projectId: string, tags?: string[], campaignId?: string): Promise<InsightsResponse> => {
    console.log('[InsightsAPI] Getting insights for project:', projectId)
    const params = new URLSearchParams()
    if (tags) tags.forEach(t => params.append('tags', t))
    if (campaignId) params.append('campaign_id', campaignId)
    const response = await api.get<InsightsResponse>(`/analytics/projects/${projectId}/insights?${params}`)
    return response.data
  },

  getRoleHeatmap: async (projectId: string, tags?: string[], campaignId?: string): Promise<RoleHeatmapResponse> => {
    console.log('[InsightsAPI] Getting role heatmap for project:', projectId)
    const params = new URLSearchParams()
    if (tags) tags.forEach(t => params.append('tags', t))
    if (campaignId) params.append('campaign_id', campaignId)
    const response = await api.get<RoleHeatmapResponse>(`/analytics/projects/${projectId}/heatmap?${params}`)
    return response.data
  },

  getTrends: async (projectId: string, baseline: string, current: string): Promise<TrendComparisonResponse> => {
    console.log('[InsightsAPI] Getting trends for project:', projectId)
    const response = await api.get<TrendComparisonResponse>(
      `/analytics/projects/${projectId}/trends?baseline=${encodeURIComponent(baseline)}&current=${encodeURIComponent(current)}`
    )
    return response.data
  },

  listCampaigns: async (projectId: string): Promise<string[]> => {
    console.log('[InsightsAPI] Listing campaigns for project:', projectId)
    const response = await api.get<string[]>(`/analytics/projects/${projectId}/campaigns`)
    return response.data
  },

  downloadPdf: async (projectId: string, projectName: string): Promise<void> => {
    console.log('[InsightsAPI] Downloading insights PDF for project:', projectId)
    const response = await api.get(`/analytics/projects/${projectId}/insights/pdf`, { responseType: 'blob' })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const safeName = projectName.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '-')
    link.setAttribute('download', `insights-${safeName}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}

// DEPRECATED: Gates API (kept for compilation safety if needed, but should be unused)
export const gatesApi = {
  getAll: async (): Promise<any> => {
    return Promise.resolve({ gates: [], total_gates: 0, total_questions: 0 })
  },
}

export default api
