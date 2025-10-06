"""Assessment API endpoints"""

from datetime import datetime
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.api.auth import get_current_user
from app.core import scoring
from app.database import get_db
from app.models import Assessment, Response, User, AssessmentStatus

router = APIRouter()


@router.get("/", response_model=List[schemas.AssessmentResponse])
async def list_assessments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all assessments for current user"""
    assessments = (
        db.query(Assessment)
        .filter(Assessment.assessor_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return assessments


@router.post("/", response_model=schemas.AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    assessment_in: schemas.AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create new assessment"""
    db_assessment = Assessment(
        team_name=assessment_in.team_name,
        assessor_id=current_user.id,
        status=AssessmentStatus.DRAFT,
        started_at=datetime.utcnow(),
    )

    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)

    return db_assessment


@router.get("/{assessment_id}", response_model=schemas.AssessmentResponse)
async def get_assessment(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get specific assessment"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    if assessment.assessor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return assessment


@router.put("/{assessment_id}", response_model=schemas.AssessmentResponse)
async def update_assessment(
    assessment_id: UUID,
    assessment_update: schemas.AssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update assessment"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    if assessment.assessor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Update fields
    if assessment_update.team_name is not None:
        assessment.team_name = assessment_update.team_name
    if assessment_update.status is not None:
        assessment.status = assessment_update.status

    assessment.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(assessment)

    return assessment


@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assessment(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete assessment"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    if assessment.assessor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    db.delete(assessment)
    db.commit()

    return None


@router.post("/{assessment_id}/responses", response_model=List[schemas.ResponseData])
async def save_responses(
    assessment_id: UUID,
    responses_in: schemas.ResponseBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save or update assessment responses"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    if assessment.assessor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    saved_responses = []

    for response_data in responses_in.responses:
        # Check if response already exists
        existing_response = (
            db.query(Response)
            .filter(
                Response.assessment_id == assessment_id,
                Response.question_number == response_data.question_number,
            )
            .first()
        )

        if existing_response:
            # Update existing response
            existing_response.score = response_data.score
            existing_response.notes = response_data.notes
            existing_response.updated_at = datetime.utcnow()
            saved_responses.append(existing_response)
        else:
            # Create new response
            db_response = Response(
                assessment_id=assessment_id,
                question_number=response_data.question_number,
                domain=response_data.domain,
                score=response_data.score,
                notes=response_data.notes,
            )
            db.add(db_response)
            saved_responses.append(db_response)

    # Update assessment status to in_progress if it was draft
    if assessment.status == AssessmentStatus.DRAFT:
        assessment.status = AssessmentStatus.IN_PROGRESS
        assessment.updated_at = datetime.utcnow()

    db.commit()

    # Refresh all responses
    for response in saved_responses:
        db.refresh(response)

    return saved_responses


@router.get("/{assessment_id}/responses", response_model=List[schemas.ResponseData])
async def get_responses(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all responses for an assessment"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    if assessment.assessor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    responses = (
        db.query(Response)
        .filter(Response.assessment_id == assessment_id)
        .order_by(Response.question_number)
        .all()
    )

    return responses


@router.post("/{assessment_id}/submit", response_model=schemas.AssessmentResponse)
async def submit_assessment(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit assessment for scoring"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    if assessment.assessor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Get all responses
    responses = db.query(Response).filter(Response.assessment_id == assessment_id).all()

    if len(responses) < 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"All 20 questions must be answered. Currently answered: {len(responses)}",
        )

    # Calculate scores
    domain_scores = scoring.calculate_domain_scores(responses)
    overall_score = scoring.calculate_overall_score(domain_scores)
    maturity_level, _ = scoring.get_maturity_level(overall_score)

    # Update assessment
    assessment.domain1_score = domain_scores.get("domain1")
    assessment.domain2_score = domain_scores.get("domain2")
    assessment.domain3_score = domain_scores.get("domain3")
    assessment.overall_score = overall_score
    assessment.maturity_level = maturity_level
    assessment.status = AssessmentStatus.COMPLETED
    assessment.completed_at = datetime.utcnow()
    assessment.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(assessment)

    return assessment


@router.get("/{assessment_id}/report", response_model=schemas.AssessmentReport)
async def get_assessment_report(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate assessment report"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    if assessment.assessor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if assessment.status != AssessmentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assessment must be completed to generate report",
        )

    # Get responses
    responses = db.query(Response).filter(Response.assessment_id == assessment_id).all()

    # Generate report
    report = scoring.generate_report(assessment, responses)

    return report
