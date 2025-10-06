"""Analytics API endpoints"""

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import schemas
from app.api.auth import get_current_user
from app.database import get_db
from app.models import Assessment, AssessmentStatus, User

router = APIRouter()


@router.get("/summary", response_model=schemas.AnalyticsSummary)
async def get_analytics_summary(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Get overall analytics summary"""

    # Total assessments
    total_assessments = (
        db.query(func.count(Assessment.id))
        .filter(Assessment.assessor_id == current_user.id)
        .scalar()
    )

    # Completed assessments
    completed_assessments = (
        db.query(func.count(Assessment.id))
        .filter(
            Assessment.assessor_id == current_user.id, Assessment.status == AssessmentStatus.COMPLETED
        )
        .scalar()
    )

    # Average score
    avg_score = (
        db.query(func.avg(Assessment.overall_score))
        .filter(
            Assessment.assessor_id == current_user.id, Assessment.status == AssessmentStatus.COMPLETED
        )
        .scalar()
    ) or 0.0

    # Average maturity level
    avg_maturity = (
        db.query(func.avg(Assessment.maturity_level))
        .filter(
            Assessment.assessor_id == current_user.id, Assessment.status == AssessmentStatus.COMPLETED
        )
        .scalar()
    ) or 0.0

    return {
        "total_assessments": total_assessments or 0,
        "completed_assessments": completed_assessments or 0,
        "average_score": round(float(avg_score), 2),
        "average_maturity_level": round(float(avg_maturity), 2),
    }
