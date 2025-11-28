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


class UserUpdate(BaseModel):
    """Schema for updating a user"""

    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    organization_id: Optional[UUID] = None


class UserResponse(UserBase):
    """Schema for user response"""

    id: UUID
    role: UserRole
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

class FrameworkResponse(FrameworkBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

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


class AssessmentCreate(AssessmentBase):
    """Schema for creating an assessment"""
    framework_id: UUID


class AssessmentUpdate(BaseModel):
    """Schema for updating an assessment"""

    team_name: Optional[str] = None
    status: Optional[AssessmentStatus] = None


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
