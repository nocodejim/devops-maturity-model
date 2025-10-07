"""SQLAlchemy database models"""

import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    """User role enumeration"""

    ADMIN = "admin"
    ASSESSOR = "assessor"
    VIEWER = "viewer"


class OrganizationSize(str, enum.Enum):
    """Organization size enumeration"""

    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"
    ENTERPRISE = "enterprise"


class AssessmentStatus(str, enum.Enum):
    """Assessment status enumeration"""

    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class DomainType(str, enum.Enum):
    """Domain type enumeration - Complete spec has 5 domains"""

    DOMAIN1 = "domain1"  # Source Control & Development Practices
    DOMAIN2 = "domain2"  # Security & Compliance
    DOMAIN3 = "domain3"  # CI/CD & Deployment
    DOMAIN4 = "domain4"  # Infrastructure & Platform Engineering
    DOMAIN5 = "domain5"  # Observability & Continuous Improvement


class Organization(Base):
    """Organization model"""

    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    industry = Column(String(255), nullable=True)
    size = Column(Enum(OrganizationSize), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    users = relationship("User", back_populates="organization")
    assessments = relationship("Assessment", back_populates="organization")


class User(Base):
    """User model"""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.ASSESSOR, nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    organization = relationship("Organization", back_populates="users")
    assessments = relationship("Assessment", back_populates="assessor")


class Assessment(Base):
    """Assessment model - Complete spec version"""

    __tablename__ = "assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    assessor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    team_name = Column(String(255), nullable=False)
    status = Column(Enum(AssessmentStatus), default=AssessmentStatus.DRAFT, nullable=False)

    # Overall Scores
    overall_score = Column(Float, nullable=True)
    maturity_level = Column(Integer, nullable=True)

    # Metadata
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="assessments")
    assessor = relationship("User", back_populates="assessments")
    domain_scores = relationship("DomainScore", back_populates="assessment", cascade="all, delete-orphan")
    gate_responses = relationship("GateResponse", back_populates="assessment", cascade="all, delete-orphan")


class DomainScore(Base):
    """Domain score model - stores calculated scores per domain"""

    __tablename__ = "domain_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(
        UUID(as_uuid=True), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False
    )
    domain = Column(Enum(DomainType), nullable=False)
    score = Column(Float, nullable=False)  # 0-100
    maturity_level = Column(Integer, nullable=False)  # 1-5
    strengths = Column(ARRAY(String), nullable=True)  # Array of strength descriptions
    gaps = Column(ARRAY(String), nullable=True)  # Array of gap descriptions
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    assessment = relationship("Assessment", back_populates="domain_scores")


class GateResponse(Base):
    """Gate response model - Complete spec version with gates and questions"""

    __tablename__ = "gate_responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(
        UUID(as_uuid=True), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False
    )
    domain = Column(Enum(DomainType), nullable=False)
    gate_id = Column(String(50), nullable=False)  # e.g., "gate_1_1", "gate_2_1"
    question_id = Column(String(50), nullable=False)  # e.g., "q1", "q2"
    score = Column(Integer, nullable=False)  # 0-5
    notes = Column(Text, nullable=True)
    evidence = Column(ARRAY(String), nullable=True)  # Array of URLs or evidence descriptions
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    assessment = relationship("Assessment", back_populates="gate_responses")
