"""Statistical analysis engine for team insights and perception gap analysis"""

import logging
from statistics import mean, stdev, variance
from typing import Dict, List, Optional, Tuple
from uuid import UUID
from collections import defaultdict

from sqlalchemy.orm import Session

from app.models import (
    Assessment,
    AssessmentStatus,
    GateResponse,
    FrameworkQuestion,
    FrameworkGate,
    FrameworkDomain,
    User,
)

logger = logging.getLogger(__name__)

# Thresholds for categorization
PERCEPTION_GAP_STDDEV = 1.5
PRAISE_MEAN_MIN = 4.0
PRAISE_STDDEV_MAX = 0.8
NEEDS_MEAN_MAX = 2.0
NEEDS_STDDEV_MAX = 0.8


def compute_question_stats(scores: List[int]) -> Dict:
    """Compute statistical metrics for a list of scores for one question."""
    if not scores:
        return {
            "mean": 0.0,
            "stddev": 0.0,
            "variance": 0.0,
            "min_score": 0,
            "max_score": 0,
            "response_count": 0,
            "scores": [],
        }

    m = round(mean(scores), 2)
    if len(scores) < 2:
        sd = 0.0
        var = 0.0
    else:
        sd = round(stdev(scores), 2)
        var = round(variance(scores), 2)

    return {
        "mean": m,
        "stddev": sd,
        "variance": var,
        "min_score": min(scores),
        "max_score": max(scores),
        "response_count": len(scores),
        "scores": scores,
    }


def get_project_assessments(
    db: Session,
    project_id: UUID,
    tags: Optional[List[str]] = None,
    campaign_id: Optional[str] = None,
) -> List[Assessment]:
    """Get completed assessments for a project with optional filters."""
    query = db.query(Assessment).filter(
        Assessment.project_id == project_id,
        Assessment.status == AssessmentStatus.COMPLETED,
    )
    if campaign_id:
        query = query.filter(Assessment.campaign_id == campaign_id)
    if tags:
        query = query.filter(Assessment.tags.overlap(tags))
    return query.all()


def build_question_metadata(
    db: Session, question_ids: List[UUID]
) -> Dict[UUID, Dict]:
    """Build lookup of question_id -> {text, gate_name, domain_name}."""
    if not question_ids:
        return {}

    questions = (
        db.query(
            FrameworkQuestion.id,
            FrameworkQuestion.text,
            FrameworkGate.name.label("gate_name"),
            FrameworkDomain.name.label("domain_name"),
        )
        .join(FrameworkGate, FrameworkQuestion.gate_id == FrameworkGate.id)
        .join(FrameworkDomain, FrameworkGate.domain_id == FrameworkDomain.id)
        .filter(FrameworkQuestion.id.in_(question_ids))
        .all()
    )

    return {
        q.id: {"text": q.text, "gate_name": q.gate_name, "domain_name": q.domain_name}
        for q in questions
    }


def aggregate_scores_by_question(
    db: Session, assessment_ids: List[UUID]
) -> Dict[UUID, List[int]]:
    """Aggregate all GateResponse scores grouped by question_id."""
    if not assessment_ids:
        return {}

    responses = (
        db.query(GateResponse.question_id, GateResponse.score)
        .filter(GateResponse.assessment_id.in_(assessment_ids))
        .all()
    )

    scores_by_question: Dict[UUID, List[int]] = defaultdict(list)
    for r in responses:
        scores_by_question[r.question_id].append(r.score)

    return dict(scores_by_question)


def aggregate_scores_by_question_and_role(
    db: Session, assessment_ids: List[UUID]
) -> Dict[UUID, Dict[str, List[int]]]:
    """Aggregate scores grouped by (question_id, functional_role)."""
    if not assessment_ids:
        return {}

    results = (
        db.query(
            GateResponse.question_id,
            GateResponse.score,
            User.functional_role,
        )
        .join(Assessment, GateResponse.assessment_id == Assessment.id)
        .join(User, Assessment.assessor_id == User.id)
        .filter(GateResponse.assessment_id.in_(assessment_ids))
        .all()
    )

    scores: Dict[UUID, Dict[str, List[int]]] = defaultdict(lambda: defaultdict(list))
    for r in results:
        role = r.functional_role or "unspecified"
        scores[r.question_id][role].append(r.score)

    return {qid: dict(roles) for qid, roles in scores.items()}


def categorize_insights(
    question_stats: Dict[UUID, Dict], question_meta: Dict[UUID, Dict]
) -> Tuple[List[Dict], List[Dict], List[Dict], List[Dict], List[Dict]]:
    """Categorize questions into perception_gaps, areas_of_praise, universal_needs.

    Returns: (all_questions, perception_gaps, areas_of_praise, universal_needs, discussion_starters)
    """
    all_questions = []
    perception_gaps = []
    areas_of_praise = []
    universal_needs = []

    for qid, stats in question_stats.items():
        meta = question_meta.get(qid, {"text": "Unknown", "gate_name": "Unknown", "domain_name": "Unknown"})
        entry = {
            "question_id": qid,
            "question_text": meta["text"],
            "gate_name": meta["gate_name"],
            "domain_name": meta["domain_name"],
            **stats,
        }
        all_questions.append(entry)

        if stats["stddev"] > PERCEPTION_GAP_STDDEV:
            perception_gaps.append(entry)
        if stats["mean"] >= PRAISE_MEAN_MIN and stats["stddev"] <= PRAISE_STDDEV_MAX:
            areas_of_praise.append(entry)
        if stats["mean"] <= NEEDS_MEAN_MAX and stats["stddev"] <= NEEDS_STDDEV_MAX:
            universal_needs.append(entry)

    # Sort perception gaps by stddev descending
    perception_gaps.sort(key=lambda x: x["stddev"], reverse=True)
    areas_of_praise.sort(key=lambda x: x["mean"], reverse=True)
    universal_needs.sort(key=lambda x: x["mean"])

    # Top 3 discussion starters = highest variance questions
    all_sorted = sorted(all_questions, key=lambda x: x["stddev"], reverse=True)
    discussion_starters = all_sorted[:3]

    return all_questions, perception_gaps, areas_of_praise, universal_needs, discussion_starters
