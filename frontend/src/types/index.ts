// API Types
export enum UserRole {
  ADMIN = 'admin',
  ASSESSOR = 'assessor',
  VIEWER = 'viewer',
}

export enum OrganizationSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ENTERPRISE = 'enterprise',
}

export interface Organization {
  id: string
  name: string
  industry?: string
  size?: OrganizationSize
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  organization_id?: string
  is_active: boolean
  created_at: string
  last_login?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export enum AssessmentStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum DomainType {
  DOMAIN1 = 'domain1', // Source Control & Development
  DOMAIN2 = 'domain2', // Security & Compliance
  DOMAIN3 = 'domain3', // CI/CD & Deployment
  DOMAIN4 = 'domain4', // Infrastructure & Platform
  DOMAIN5 = 'domain5', // Observability & Improvement
}

export interface Assessment {
  id: string
  team_name: string
  organization_id?: string
  assessor_id: string
  status: AssessmentStatus
  overall_score?: number
  maturity_level?: number
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface DomainScore {
  id: string
  assessment_id: string
  domain: DomainType
  score: number
  maturity_level: number
  strengths: string[]
  gaps: string[]
  created_at: string
}

export interface GateResponse {
  id: string
  assessment_id: string
  domain: DomainType
  gate_id: string
  question_id: string
  score: number
  notes?: string
  evidence?: string[]
  created_at: string
  updated_at: string
}

export interface GateResponseCreate {
  domain: DomainType
  gate_id: string
  question_id: string
  score: number
  notes?: string
  evidence?: string[]
}

export interface MaturityLevel {
  level: number
  name: string
  description: string
}

export interface DomainBreakdown {
  domain: string
  score: number
  maturity_level: number
  strengths: string[]
  gaps: string[]
}

export interface GateScore {
  gate_id: string
  gate_name: string
  score: number
  max_score: number
  percentage: number
}

export interface AssessmentReport {
  assessment: Assessment
  maturity_level: MaturityLevel
  domain_breakdown: DomainBreakdown[]
  gate_scores: GateScore[]
  top_strengths: string[]
  top_gaps: string[]
  recommendations: string[]
}

export interface AnalyticsSummary {
  total_assessments: number
  completed_assessments: number
  average_score: number
  average_maturity_level: number
}

// Gates definitions
export interface GateQuestion {
  id: string
  text: string
  guidance: string
}

export interface Gate {
  name: string
  domain: DomainType
  questions: GateQuestion[]
}

export interface GatesResponse {
  gates: Record<string, Gate>
  total_gates: number
  total_questions: number
}
