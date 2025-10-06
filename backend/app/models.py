"""SQLAlchemy database models"""

import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class AssessmentStatus(str, enum.Enum):
    """Assessment status enumeration"""

    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class DomainType(str, enum.Enum):
    """Domain type enumeration"""

    DOMAIN1 = "domain1"  # Source Control & Development
    DOMAIN2 = "domain2"  # Security & Compliance
    DOMAIN3 = "domain3"  # CI/CD & Deployment


class User(Base):
    """User model"""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    assessments = relationship("Assessment", back_populates="assessor")


class Assessment(Base):
    """Assessment model"""

    __tablename__ = "assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_name = Column(String(255), nullable=False)
    assessor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(AssessmentStatus), default=AssessmentStatus.DRAFT, nullable=False)

    # Scores
    overall_score = Column(Float, nullable=True)
    maturity_level = Column(Integer, nullable=True)
    domain1_score = Column(Float, nullable=True)
    domain2_score = Column(Float, nullable=True)
    domain3_score = Column(Float, nullable=True)

    # Metadata
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    assessor = relationship("User", back_populates="assessments")
    responses = relationship("Response", back_populates="assessment", cascade="all, delete-orphan")


class Response(Base):
    """Assessment response model"""

    __tablename__ = "responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(
        UUID(as_uuid=True), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False
    )
    question_number = Column(Integer, nullable=False)
    domain = Column(Enum(DomainType), nullable=False)
    score = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    assessment = relationship("Assessment", back_populates="responses")

    # Constraints
    __table_args__ = (
        # Unique constraint on assessment_id and question_number
        # This will be handled in Alembic migration
    )
