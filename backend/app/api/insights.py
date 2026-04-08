"""Team Insights API endpoints - statistical analysis and perception gap detection"""

import logging
from typing import List, Optional
from uuid import UUID
from collections import defaultdict
from statistics import mean

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app import schemas
from app.api.auth import get_current_user
from app.core.insights import (
    aggregate_scores_by_question,
    aggregate_scores_by_question_and_role,
    build_question_metadata,
    categorize_insights,
    compute_question_stats,
    get_project_assessments,
)
from app.database import get_db
from app.models import Project, User

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/projects/{project_id}/insights", response_model=schemas.InsightsResponse)
async def get_project_insights(
    project_id: UUID,
    tags: Optional[List[str]] = Query(None),
    campaign_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get statistical insights for a project's completed assessments.

    Aggregates GateResponse scores per question across all completed assessments,
    calculates mean/variance/stddev, and categorizes into perception gaps,
    areas of praise, and universal needs.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    assessments = get_project_assessments(db, project_id, tags=tags, campaign_id=campaign_id)

    if not assessments:
        return schemas.InsightsResponse(
            project_id=project_id,
            project_name=project.name,
            total_assessments=0,
            total_respondents=0,
            perception_gaps=[],
            areas_of_praise=[],
            universal_needs=[],
            all_questions=[],
            discussion_starters=[],
        )

    assessment_ids = [a.id for a in assessments]
    unique_assessors = len(set(a.assessor_id for a in assessments))

    # Aggregate scores by question
    scores_by_question = aggregate_scores_by_question(db, assessment_ids)

    # Compute stats per question
    question_stats = {qid: compute_question_stats(scores) for qid, scores in scores_by_question.items()}

    # Get question metadata
    question_meta = build_question_metadata(db, list(scores_by_question.keys()))

    # Categorize
    all_q, gaps, praise, needs, starters = categorize_insights(question_stats, question_meta)

    return schemas.InsightsResponse(
        project_id=project_id,
        project_name=project.name,
        total_assessments=len(assessments),
        total_respondents=unique_assessors,
        perception_gaps=gaps,
        areas_of_praise=praise,
        universal_needs=needs,
        all_questions=all_q,
        discussion_starters=starters,
    )


@router.get("/projects/{project_id}/heatmap", response_model=schemas.RoleHeatmapResponse)
async def get_role_heatmap(
    project_id: UUID,
    tags: Optional[List[str]] = Query(None),
    campaign_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Build role-based heatmap: for each question, compute mean score per functional_role."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    assessments = get_project_assessments(db, project_id, tags=tags, campaign_id=campaign_id)

    if not assessments:
        return schemas.RoleHeatmapResponse(project_id=project_id, entries=[], roles=[])

    assessment_ids = [a.id for a in assessments]

    # Aggregate scores by (question, role)
    scores_by_q_role = aggregate_scores_by_question_and_role(db, assessment_ids)

    # Get question metadata
    question_meta = build_question_metadata(db, list(scores_by_q_role.keys()))

    # Collect all roles
    all_roles = set()
    for roles in scores_by_q_role.values():
        all_roles.update(roles.keys())
    all_roles = sorted(all_roles)

    # Build entries
    entries = []
    for qid, roles in scores_by_q_role.items():
        meta = question_meta.get(qid, {"text": "Unknown", "gate_name": "Unknown", "domain_name": "Unknown"})
        role_scores = {role: round(mean(scores), 2) for role, scores in roles.items()}
        entries.append(schemas.RoleHeatmapEntry(
            question_id=qid,
            question_text=meta["text"],
            gate_name=meta["gate_name"],
            domain_name=meta["domain_name"],
            role_scores=role_scores,
        ))

    return schemas.RoleHeatmapResponse(
        project_id=project_id,
        entries=entries,
        roles=all_roles,
    )


@router.get("/projects/{project_id}/trends", response_model=schemas.TrendComparisonResponse)
async def get_trends(
    project_id: UUID,
    baseline: str = Query(..., description="Campaign ID for baseline assessment batch"),
    current: str = Query(..., description="Campaign ID for current assessment batch"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Compare two campaign batches within a project longitudinally.

    Returns delta in mean score and variance per question between baseline and current campaigns.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    baseline_assessments = get_project_assessments(db, project_id, campaign_id=baseline)
    current_assessments = get_project_assessments(db, project_id, campaign_id=current)

    if not baseline_assessments:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No completed assessments found for baseline campaign '{baseline}'",
        )
    if not current_assessments:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No completed assessments found for current campaign '{current}'",
        )

    baseline_ids = [a.id for a in baseline_assessments]
    current_ids = [a.id for a in current_assessments]

    baseline_scores = aggregate_scores_by_question(db, baseline_ids)
    current_scores = aggregate_scores_by_question(db, current_ids)

    # Union of all question IDs
    all_question_ids = set(baseline_scores.keys()) | set(current_scores.keys())
    question_meta = build_question_metadata(db, list(all_question_ids))

    comparisons = []
    for qid in all_question_ids:
        b_stats = compute_question_stats(baseline_scores.get(qid, []))
        c_stats = compute_question_stats(current_scores.get(qid, []))
        meta = question_meta.get(qid, {"text": "Unknown", "gate_name": "Unknown", "domain_name": "Unknown"})

        comparisons.append(schemas.TrendComparison(
            question_id=qid,
            question_text=meta["text"],
            gate_name=meta["gate_name"],
            domain_name=meta["domain_name"],
            baseline_mean=b_stats["mean"],
            baseline_stddev=b_stats["stddev"],
            current_mean=c_stats["mean"],
            current_stddev=c_stats["stddev"],
            delta_mean=round(c_stats["mean"] - b_stats["mean"], 2),
            delta_variance=round(c_stats["variance"] - b_stats["variance"], 2),
        ))

    # Sort by absolute delta_variance descending (biggest changes first)
    comparisons.sort(key=lambda x: abs(x.delta_variance), reverse=True)

    return schemas.TrendComparisonResponse(
        project_id=project_id,
        baseline_campaign=baseline,
        current_campaign=current,
        comparisons=comparisons,
    )


@router.get("/projects/{project_id}/campaigns")
async def list_campaigns(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all unique campaign IDs for a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    from app.models import Assessment, AssessmentStatus
    campaigns = (
        db.query(Assessment.campaign_id)
        .filter(
            Assessment.project_id == project_id,
            Assessment.campaign_id.isnot(None),
            Assessment.status == AssessmentStatus.COMPLETED,
        )
        .distinct()
        .all()
    )

    return [c[0] for c in campaigns if c[0]]


@router.get("/projects/{project_id}/insights/pdf")
async def download_insights_pdf(
    project_id: UUID,
    tags: Optional[List[str]] = Query(None),
    campaign_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate and download PDF report for project insights."""
    from io import BytesIO
    from app.utils.pdf_generator import InsightsPDFGenerator

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    assessments = get_project_assessments(db, project_id, tags=tags, campaign_id=campaign_id)
    assessment_ids = [a.id for a in assessments]
    unique_assessors = len(set(a.assessor_id for a in assessments))

    scores_by_question = aggregate_scores_by_question(db, assessment_ids)
    question_stats = {qid: compute_question_stats(scores) for qid, scores in scores_by_question.items()}
    question_meta = build_question_metadata(db, list(scores_by_question.keys()))
    all_q, gaps, praise, needs, starters = categorize_insights(question_stats, question_meta)

    insights_data = {
        "project_name": project.name,
        "total_assessments": len(assessments),
        "total_respondents": unique_assessors,
        "perception_gaps": gaps,
        "areas_of_praise": praise,
        "universal_needs": needs,
        "discussion_starters": starters,
    }

    generator = InsightsPDFGenerator()
    pdf_bytes = generator.generate(insights_data)

    safe_name = project.name.replace(" ", "-").lower()[:30]
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="insights-{safe_name}.pdf"'},
    )
