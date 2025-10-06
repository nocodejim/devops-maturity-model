"""Pydantic schemas for request/response validation"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field

from app.models import AssessmentStatus, DomainType


# User schemas
class UserBase(BaseModel):
    """Base user schema"""

    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    """Schema for creating a user"""

    password: str


class UserResponse(UserBase):
    """Schema for user response"""

    id: UUID
    is_active: bool
    is_admin: bool
    created_at: datetime

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


# Assessment schemas
class AssessmentBase(BaseModel):
    """Base assessment schema"""

    team_name: str


class AssessmentCreate(AssessmentBase):
    """Schema for creating an assessment"""

    pass


class AssessmentUpdate(BaseModel):
    """Schema for updating an assessment"""

    team_name: Optional[str] = None
    status: Optional[AssessmentStatus] = None


class AssessmentResponse(AssessmentBase):
    """Schema for assessment response"""

    id: UUID
    assessor_id: UUID
    status: AssessmentStatus
    overall_score: Optional[float] = None
    maturity_level: Optional[int] = None
    domain1_score: Optional[float] = None
    domain2_score: Optional[float] = None
    domain3_score: Optional[float] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Response schemas
class ResponseBase(BaseModel):
    """Base response schema"""

    question_number: int = Field(..., ge=1, le=20)
    domain: DomainType
    score: int = Field(..., ge=0, le=5)
    notes: Optional[str] = None


class ResponseCreate(ResponseBase):
    """Schema for creating a response"""

    pass


class ResponseUpdate(BaseModel):
    """Schema for updating a response"""

    score: Optional[int] = Field(None, ge=0, le=5)
    notes: Optional[str] = None


class ResponseData(ResponseBase):
    """Schema for response data"""

    id: UUID
    assessment_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResponseBulkCreate(BaseModel):
    """Schema for bulk creating/updating responses"""

    responses: List[ResponseCreate]


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
    questions_count: int


class StrengthGap(BaseModel):
    """Strength or gap item"""

    question_number: int
    question_text: str
    score: int
    domain: str


class AssessmentReport(BaseModel):
    """Complete assessment report"""

    assessment: AssessmentResponse
    maturity_level: MaturityLevel
    domain_breakdown: List[DomainBreakdown]
    strengths: List[StrengthGap]
    gaps: List[StrengthGap]


# Analytics schemas
class AnalyticsSummary(BaseModel):
    """Analytics summary"""

    total_assessments: int
    completed_assessments: int
    average_score: float
    average_maturity_level: float
