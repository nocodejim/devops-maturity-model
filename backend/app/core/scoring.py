"""Scoring engine for assessments - Dynamic Spec"""

import logging
from typing import Dict, List, Tuple
from uuid import UUID
from sqlalchemy.orm import Session, joinedload

from app import schemas
from app.models import Assessment, GateResponse, DomainScore, FrameworkDomain, FrameworkQuestion, FrameworkGate

logger = logging.getLogger("app.scoring")


def calculate_scores(db: Session, assessment: Assessment, gate_responses: List[GateResponse]) -> Dict[UUID, Dict]:
    """
    Calculate scores for each domain from gate responses based on Framework definitions.
    """

    # Fetch the whole framework structure in one pass: domains, then all
    # gates and questions for those domains, and build dict lookups —
    # instead of two queries per domain plus a linear gate scan per question.
    framework_id = assessment.framework_id
    domains = db.query(FrameworkDomain).filter(FrameworkDomain.framework_id == framework_id).all()
    domain_ids = [d.id for d in domains]

    gates = (
        db.query(FrameworkGate).filter(FrameworkGate.domain_id.in_(domain_ids)).all()
        if domain_ids
        else []
    )
    gate_by_id = {g.id: g for g in gates}
    gates_by_domain: Dict[UUID, List[FrameworkGate]] = {}
    for g in gates:
        gates_by_domain.setdefault(g.domain_id, []).append(g)

    questions = (
        db.query(FrameworkQuestion).filter(FrameworkQuestion.gate_id.in_(list(gate_by_id))).all()
        if gate_by_id
        else []
    )
    questions_by_domain: Dict[UUID, List[FrameworkQuestion]] = {}
    for q in questions:
        gate = gate_by_id.get(q.gate_id)
        if gate is None:
            # A question pointing at a missing gate is a seed/integrity bug —
            # surface it instead of silently skewing the score.
            logger.error(
                "Question %s references missing gate %s (framework %s)",
                q.id, q.gate_id, framework_id,
            )
            continue
        questions_by_domain.setdefault(gate.domain_id, []).append(q)

    response_map = {r.question_id: r for r in gate_responses}

    domain_scores = {}

    for domain in domains:
        domain_questions = questions_by_domain.get(domain.id, [])

        # Calculate score
        total_score = 0
        max_possible = len(domain_questions) * 5

        strengths = []
        gaps = []

        for q in domain_questions:
            resp = response_map.get(q.id)
            if resp:
                total_score += resp.score

                gate_name = gate_by_id[q.gate_id].name

                if resp.score >= 4:
                    strengths.append(f"{gate_name} - {q.text[:50]}...: Score {resp.score}/5")
                elif resp.score <= 2:
                    gaps.append(f"{gate_name} - {q.text[:50]}...: Score {resp.score}/5")

        score_percent = (total_score / max_possible) * 100 if max_possible > 0 else 0.0
        maturity_level, _ = get_maturity_level(score_percent)

        domain_scores[domain.id] = {
            "domain_name": domain.name,
            "score": round(score_percent, 2),
            "maturity_level": maturity_level,
            "strengths": strengths[:5],
            "gaps": gaps[:5],
            "weight": domain.weight
        }

    return domain_scores


def calculate_overall_score(db: Session, assessment: Assessment, domain_scores: Dict[UUID, Dict]) -> float:
    """
    Calculate weighted average of domain scores.
    """
    # Normalize weights if they don't sum to 1?
    # Assuming weights are relative (e.g. 0.15, 0.25...)

    total_weight = sum(d["weight"] for d in domain_scores.values())
    weighted_sum = sum(d["score"] * d["weight"] for d in domain_scores.values())

    if total_weight == 0:
        return 0.0

    return round(weighted_sum / total_weight, 2)


def get_maturity_level(score: float) -> Tuple[int, str]:
    """
    Map overall score to maturity level.
    """
    if score <= 20:
        return (1, "Initial")
    elif score <= 40:
        return (2, "Developing")
    elif score <= 60:
        return (3, "Defined")
    elif score <= 80:
        return (4, "Managed")
    else:
        return (5, "Optimizing")


def get_maturity_level_description(level: int) -> str:
    """Get description for maturity level"""
    descriptions = {
        1: "Ad-hoc, manual processes",
        2: "Some automation, inconsistent",
        3: "Standardized, documented",
        4: "Metrics-driven, comprehensive automation",
        5: "Industry-leading, continuous improvement",
    }
    return descriptions.get(level, "Unknown")


def generate_report(
    db: Session, assessment: Assessment, gate_responses: List[GateResponse], domain_scores: List[DomainScore]
) -> schemas.AssessmentReport:
    """Generate complete assessment report"""

    # Get maturity level info
    level, level_name = get_maturity_level(assessment.overall_score)

    maturity_level = schemas.MaturityLevel(
        level=level, name=level_name, description=get_maturity_level_description(level)
    )

    # Domain breakdown
    # Need to fetch domain names since they are not stored in DomainScore directly (only ID)
    # Actually, we can fetch the FrameworkDomain objects

    domain_breakdown = []

    # Pre-fetch domain definitions
    framework_domains = db.query(FrameworkDomain).filter(
        FrameworkDomain.id.in_([ds.domain_id for ds in domain_scores])
    ).all()
    domain_name_map = {d.id: d.name for d in framework_domains}

    for ds in domain_scores:
        if ds.domain_id not in domain_name_map:
            logger.error(
                "DomainScore %s references missing domain %s (assessment %s)",
                ds.id, ds.domain_id, assessment.id,
            )
        domain_breakdown.append(
            schemas.DomainBreakdown(
                domain=domain_name_map.get(ds.domain_id, "Unknown Domain"),
                score=ds.score,
                maturity_level=ds.maturity_level,
                strengths=ds.strengths or [],
                gaps=ds.gaps or [],
            )
        )

    # Gate scores
    # Need to map question_id -> gate -> name
    # Fetch all questions involved
    question_ids = [r.question_id for r in gate_responses]
    questions = db.query(FrameworkQuestion).filter(FrameworkQuestion.id.in_(question_ids)).options(joinedload(FrameworkQuestion.gate)).all()

    question_gate_map = {q.id: q.gate for q in questions}

    gate_scores_data = {} # gate_id -> {total, count, name}

    for response in gate_responses:
        gate = question_gate_map.get(response.question_id)
        if not gate:
            logger.error(
                "GateResponse %s references missing question/gate %s (assessment %s)",
                response.id, response.question_id, assessment.id,
            )
            continue

        gate_id = str(gate.id)
        if gate_id not in gate_scores_data:
            gate_scores_data[gate_id] = {"total": 0, "count": 0, "name": gate.name}

        gate_scores_data[gate_id]["total"] += response.score
        gate_scores_data[gate_id]["count"] += 1

    gate_scores = []
    for gate_id, data in gate_scores_data.items():
        max_score = data["count"] * 5
        score = data["total"]
        percentage = (score / max_score * 100) if max_score > 0 else 0

        gate_scores.append(
            schemas.GateScore(
                gate_id=gate_id,
                gate_name=data["name"],
                score=float(score),
                max_score=float(max_score),
                percentage=round(percentage, 2),
            )
        )

    # Aggregate top strengths and gaps from all domains
    all_strengths = []
    all_gaps = []
    for ds in domain_scores:
        all_strengths.extend(ds.strengths or [])
        all_gaps.extend(ds.gaps or [])

    # Generate recommendations based on gaps
    recommendations = []
    for gap in all_gaps[:5]:
        recommendations.append(f"Address identified gap: {gap}")

    return schemas.AssessmentReport(
        assessment=assessment,
        maturity_level=maturity_level,
        domain_breakdown=domain_breakdown,
        gate_scores=gate_scores,
        top_strengths=all_strengths[:10],
        top_gaps=all_gaps[:10],
        recommendations=recommendations,
    )
