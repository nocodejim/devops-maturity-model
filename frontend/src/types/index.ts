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
  functional_role?: string
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

// Framework Types
export interface Framework {
  id: string
  name: string
  description?: string
  version: string
  created_at: string
  updated_at: string
}

export interface FrameworkQuestion {
  id: string
  text: string
  guidance?: string
  order: number
}

export interface FrameworkGate {
  id: string
  name: string
  description?: string
  order: number
  questions: FrameworkQuestion[]
}

export interface FrameworkDomain {
  id: string
  name: string
  description?: string
  weight: number
  order: number
  gates: FrameworkGate[]
}

export interface FrameworkStructure {
  framework: Framework
  domains: FrameworkDomain[]
}

export interface Assessment {
  id: string
  team_name: string
  organization_id?: string
  project_id?: string
  tags?: string[]
  campaign_id?: string
  assessor_id: string
  framework_id: string
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
  domain_id: string
  domain_name?: string
  score: number
  maturity_level: number
  strengths: string[]
  gaps: string[]
  created_at: string
}

export interface GateResponse {
  id: string
  assessment_id: string
  question_id: string
  score: number
  notes?: string
  evidence?: string[]
  created_at: string
  updated_at: string
}

export interface GateResponseCreate {
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

// Framework Admin types
export interface FrameworkAdminResponse extends Framework {
  domain_count: number
  question_count: number
  assessment_count: number
}

export interface FrameworkCreate {
  name: string
  description?: string
  version: string
}

export interface FrameworkUpdate {
  name?: string
  description?: string
  version?: string
}

export interface FrameworkDomainCreate {
  name: string
  description?: string
  weight: number
  order: number
}

export interface FrameworkGateCreate {
  name: string
  description?: string
  order: number
}

export interface FrameworkQuestionCreate {
  text: string
  guidance?: string
  order: number
}

// Admin types
export interface UserCreate {
  email: string
  full_name: string
  password: string
  role?: UserRole
  functional_role?: string
  organization_id?: string
}

export interface UserAdminUpdate {
  full_name?: string
  email?: string
  role?: UserRole
  functional_role?: string
  organization_id?: string
  is_active?: boolean
}

export interface UserListResponse {
  users: User[]
  total: number
}

// Backup types
export interface BackupInfo {
  filename: string
  size_bytes: number
  created_at: string
}

export interface BackupResult {
  filename: string
  size_bytes: number
  message: string
}

export interface RestoreResult {
  message: string
}

// Project types
export interface Project {
  id: string
  organization_id?: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  assessment_count: number
}

export interface ProjectCreate {
  name: string
  description?: string
  organization_id?: string
}

// Team Insights types
export interface QuestionInsight {
  question_id: string
  question_text: string
  gate_name: string
  domain_name: string
  mean: number
  stddev: number
  variance: number
  min_score: number
  max_score: number
  response_count: number
  scores: number[]
}

export interface InsightsResponse {
  project_id: string
  project_name: string
  total_assessments: number
  total_respondents: number
  perception_gaps: QuestionInsight[]
  areas_of_praise: QuestionInsight[]
  universal_needs: QuestionInsight[]
  all_questions: QuestionInsight[]
  discussion_starters: QuestionInsight[]
}

export interface RoleHeatmapEntry {
  question_id: string
  question_text: string
  gate_name: string
  domain_name: string
  role_scores: Record<string, number>
}

export interface RoleHeatmapResponse {
  project_id: string
  entries: RoleHeatmapEntry[]
  roles: string[]
}

export interface TrendComparison {
  question_id: string
  question_text: string
  gate_name: string
  domain_name: string
  baseline_mean: number
  baseline_stddev: number
  current_mean: number
  current_stddev: number
  delta_mean: number
  delta_variance: number
}

export interface TrendComparisonResponse {
  project_id: string
  baseline_campaign: string
  current_campaign: string
  comparisons: TrendComparison[]
}

export const FUNCTIONAL_ROLES = [
  'developer',
  'qa',
  'security',
  'ops',
  'management',
  'architect',
  'other',
] as const

export type FunctionalRole = typeof FUNCTIONAL_ROLES[number]
