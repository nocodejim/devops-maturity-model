"""Pydantic schemas for request/response validation - Complete Spec"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field

from app.models import AssessmentStatus, UserRole, OrganizationSize


# Organization schemas
class OrganizationBase(BaseModel):
    """Base organization schema"""

    name: str
    industry: Optional[str] = None
    size: Optional[OrganizationSize] = None


class OrganizationCreate(OrganizationBase):
    """Schema for creating an organization"""

    pass


class OrganizationUpdate(BaseModel):
    """Schema for updating an organization"""

    name: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[OrganizationSize] = None


class OrganizationResponse(OrganizationBase):
    """Schema for organization response"""

    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# User schemas
class UserBase(BaseModel):
    """Base user schema"""

    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    """Schema for creating a user"""

    password: str
    role: Optional[UserRole] = UserRole.ASSESSOR
    organization_id: Optional[UUID] = None
    functional_role: Optional[str] = None


class UserUpdate(BaseModel):
    """Schema for updating a user"""

    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    organization_id: Optional[UUID] = None
    functional_role: Optional[str] = None


class UserAdminUpdate(BaseModel):
    """Schema for admin updating a user (includes is_active and email)"""

    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    organization_id: Optional[UUID] = None
    is_active: Optional[bool] = None
    functional_role: Optional[str] = None


class PasswordReset(BaseModel):
    """Schema for resetting a user password"""

    new_password: str = Field(..., min_length=6)


class UserListResponse(BaseModel):
    """Paginated list of users"""

    users: List["UserResponse"]
    total: int


class UserResponse(UserBase):
    """Schema for user response"""

    id: UUID
    role: UserRole
    functional_role: Optional[str] = None
    organization_id: Optional[UUID] = None
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


# Authentication schemas
class Token(BaseModel):
    """JWT token response"""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data"""

    email: Optional[str] = None


class LoginRequest(BaseModel):
    """Login request schema"""

    email: EmailStr
    password: str


# Framework schemas
class FrameworkBase(BaseModel):
    name: str
    description: Optional[str] = None
    version: str = "1.0"

class FrameworkCreate(FrameworkBase):
    """Schema for creating a framework"""
    pass


class FrameworkUpdate(BaseModel):
    """Schema for updating a framework"""
    name: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None


class FrameworkResponse(FrameworkBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FrameworkAdminResponse(FrameworkResponse):
    """Extended framework response with counts for admin views"""
    domain_count: int = 0
    question_count: int = 0
    assessment_count: int = 0


# Framework Domain create/update schemas
class FrameworkDomainCreate(BaseModel):
    name: str
    description: Optional[str] = None
    weight: float = 1.0
    order: int = 0


class FrameworkDomainUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    weight: Optional[float] = None
    order: Optional[int] = None


# Framework Gate create/update schemas
class FrameworkGateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    order: int = 0


class FrameworkGateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None


# Framework Question create/update schemas
class FrameworkQuestionCreate(BaseModel):
    text: str
    guidance: Optional[str] = None
    order: int = 0


class FrameworkQuestionUpdate(BaseModel):
    text: Optional[str] = None
    guidance: Optional[str] = None
    order: Optional[int] = None


class FrameworkQuestionResponse(BaseModel):
    id: UUID
    text: str
    guidance: Optional[str] = None
    order: int

    class Config:
        from_attributes = True

class FrameworkGateResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    order: int
    questions: List[FrameworkQuestionResponse]

    class Config:
        from_attributes = True

class FrameworkDomainResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    weight: float
    order: int
    gates: List[FrameworkGateResponse]

    class Config:
        from_attributes = True

class FrameworkStructure(BaseModel):
    """Complete framework structure with nested domains/gates/questions"""
    framework: FrameworkResponse
    domains: List[FrameworkDomainResponse]


# Assessment schemas
class AssessmentBase(BaseModel):
    """Base assessment schema"""

    team_name: str
    organization_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    tags: Optional[List[str]] = None
    campaign_id: Optional[str] = None


class AssessmentCreate(AssessmentBase):
    """Schema for creating an assessment"""
    framework_id: UUID


class AssessmentUpdate(BaseModel):
    """Schema for updating an assessment"""

    team_name: Optional[str] = None
    status: Optional[AssessmentStatus] = None
    project_id: Optional[UUID] = None
    tags: Optional[List[str]] = None
    campaign_id: Optional[str] = None


class AssessmentResponse(AssessmentBase):
    """Schema for assessment response"""

    id: UUID
    assessor_id: UUID
    framework_id: UUID
    status: AssessmentStatus
    overall_score: Optional[float] = None
    maturity_level: Optional[int] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Domain Score schemas
class DomainScoreResponse(BaseModel):
    """Schema for domain score response"""

    id: UUID
    assessment_id: UUID
    domain_id: UUID
    domain_name: Optional[str] = None # Enriched field
    score: float
    maturity_level: int
    strengths: Optional[List[str]] = []
    gaps: Optional[List[str]] = []
    created_at: datetime

    class Config:
        from_attributes = True


# Gate Response schemas
class GateResponseBase(BaseModel):
    """Base gate response schema"""

    question_id: UUID = Field(..., description="Question UUID")
    score: int = Field(..., ge=0, le=5, description="Score from 0-5")
    notes: Optional[str] = None
    evidence: Optional[List[str]] = []


class GateResponseCreate(GateResponseBase):
    """Schema for creating a gate response"""

    pass


class GateResponseUpdate(BaseModel):
    """Schema for updating a gate response"""

    score: Optional[int] = Field(None, ge=0, le=5)
    notes: Optional[str] = None
    evidence: Optional[List[str]] = None


class GateResponseData(GateResponseBase):
    """Schema for gate response data"""

    id: UUID
    assessment_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GateResponseBulkCreate(BaseModel):
    """Schema for bulk creating/updating gate responses"""

    responses: List[GateResponseCreate]


# Report schemas
class MaturityLevel(BaseModel):
    """Maturity level information"""

    level: int
    name: str
    description: str


class DomainBreakdown(BaseModel):
    """Domain score breakdown"""

    domain: str
    score: float
    maturity_level: int
    strengths: List[str]
    gaps: List[str]


class GateScore(BaseModel):
    """Gate-level score"""

    gate_id: str
    gate_name: str
    score: float
    max_score: float
    percentage: float


class AssessmentReport(BaseModel):
    """Complete assessment report"""

    assessment: AssessmentResponse
    maturity_level: MaturityLevel
    domain_breakdown: List[DomainBreakdown]
    gate_scores: List[GateScore]
    top_strengths: List[str]
    top_gaps: List[str]
    recommendations: List[str]


# Analytics schemas
class AnalyticsSummary(BaseModel):
    """Analytics summary"""

    total_assessments: int
    completed_assessments: int
    average_score: float
    average_maturity_level: float
    assessments_by_domain: dict


class TrendData(BaseModel):
    """Historical trend data"""

    date: datetime
    score: float
    maturity_level: int


class AssessmentTrends(BaseModel):
    """Assessment trends over time"""

    overall_trends: List[TrendData]
    domain_trends: dict  # domain_name -> List[TrendData]


# Project schemas
class ProjectBase(BaseModel):
    """Base project schema"""

    name: str
    description: Optional[str] = None
    organization_id: Optional[UUID] = None


class ProjectCreate(ProjectBase):
    """Schema for creating a project"""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating a project"""

    name: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(ProjectBase):
    """Schema for project response"""

    id: UUID
    created_at: datetime
    updated_at: datetime
    assessment_count: int = 0

    class Config:
        from_attributes = True


# Team Insights schemas
class QuestionInsight(BaseModel):
    """Statistical insight for a single question across team assessments"""

    question_id: UUID
    question_text: str
    gate_name: str
    domain_name: str
    mean: float
    stddev: float
    variance: float
    min_score: int
    max_score: int
    response_count: int
    scores: List[int]


class InsightsResponse(BaseModel):
    """Full insights response for a project"""

    project_id: UUID
    project_name: str
    total_assessments: int
    total_respondents: int
    perception_gaps: List[QuestionInsight]
    areas_of_praise: List[QuestionInsight]
    universal_needs: List[QuestionInsight]
    all_questions: List[QuestionInsight]
    discussion_starters: List[QuestionInsight]


class RoleHeatmapEntry(BaseModel):
    """Heatmap entry: question scores broken down by role"""

    question_id: UUID
    question_text: str
    gate_name: str
    domain_name: str
    role_scores: Dict[str, float]


class RoleHeatmapResponse(BaseModel):
    """Role-based heatmap response"""

    project_id: UUID
    entries: List[RoleHeatmapEntry]
    roles: List[str]


class TrendComparison(BaseModel):
    """Longitudinal comparison for a single question between two campaigns"""

    question_id: UUID
    question_text: str
    gate_name: str
    domain_name: str
    baseline_mean: float
    baseline_stddev: float
    current_mean: float
    current_stddev: float
    delta_mean: float
    delta_variance: float


class TrendComparisonResponse(BaseModel):
    """Longitudinal trend comparison response"""

    project_id: UUID
    baseline_campaign: str
    current_campaign: str
    comparisons: List[TrendComparison]
