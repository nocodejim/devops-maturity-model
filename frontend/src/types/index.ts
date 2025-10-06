// API Types
export interface User {
  id: string
  email: string
  full_name: string
  is_active: boolean
  is_admin: boolean
  created_at: string
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
  DOMAIN1 = 'domain1',
  DOMAIN2 = 'domain2',
  DOMAIN3 = 'domain3',
}

export interface Assessment {
  id: string
  team_name: string
  assessor_id: string
  status: AssessmentStatus
  overall_score?: number
  maturity_level?: number
  domain1_score?: number
  domain2_score?: number
  domain3_score?: number
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface Response {
  id: string
  assessment_id: string
  question_number: number
  domain: DomainType
  score: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface ResponseCreate {
  question_number: number
  domain: DomainType
  score: number
  notes?: string
}

export interface MaturityLevel {
  level: number
  name: string
  description: string
}

export interface DomainBreakdown {
  domain: string
  score: number
  questions_count: number
}

export interface StrengthGap {
  question_number: number
  question_text: string
  score: number
  domain: string
}

export interface AssessmentReport {
  assessment: Assessment
  maturity_level: MaturityLevel
  domain_breakdown: DomainBreakdown[]
  strengths: StrengthGap[]
  gaps: StrengthGap[]
}

export interface AnalyticsSummary {
  total_assessments: number
  completed_assessments: number
  average_score: number
  average_maturity_level: number
}
