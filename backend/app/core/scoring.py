"""Scoring engine for assessments - Complete Spec"""

from typing import Dict, List, Tuple

from app import schemas
from app.models import Assessment, DomainType, GateResponse, DomainScore


# Domain weights as per complete spec
DOMAIN_WEIGHTS = {
    DomainType.DOMAIN1: 0.15,  # Source Control & Development Practices - 15%
    DomainType.DOMAIN2: 0.25,  # Security & Compliance - 25%
    DomainType.DOMAIN3: 0.25,  # CI/CD & Deployment - 25%
    DomainType.DOMAIN4: 0.20,  # Infrastructure & Platform Engineering - 20%
    DomainType.DOMAIN5: 0.15,  # Observability & Continuous Improvement - 15%
}

DOMAIN_NAMES = {
    DomainType.DOMAIN1: "Source Control & Development Practices",
    DomainType.DOMAIN2: "Security & Compliance",
    DomainType.DOMAIN3: "CI/CD & Deployment",
    DomainType.DOMAIN4: "Infrastructure & Platform Engineering",
    DomainType.DOMAIN5: "Observability & Continuous Improvement",
}

# Gate names per domain (4 gates per domain = 20 gates total)
GATE_NAMES = {
    # Domain 1: Source Control & Development
    "gate_1_1": "Version Control & Branching",
    "gate_1_2": "Code Review & Quality",
    "gate_1_3": "Testing Practices",
    "gate_1_4": "Build & Integration",
    # Domain 2: Security & Compliance
    "gate_2_1": "Security Scanning & Vulnerability Management",
    "gate_2_2": "Secrets & Access Management",
    "gate_2_3": "Supply Chain Security",
    "gate_2_4": "Compliance & Audit",
    # Domain 3: CI/CD & Deployment
    "gate_3_1": "Continuous Integration",
    "gate_3_2": "Deployment Automation",
    "gate_3_3": "Release Management",
    "gate_3_4": "Feature Management",
    # Domain 4: Infrastructure & Platform
    "gate_4_1": "Infrastructure as Code",
    "gate_4_2": "Cloud & Container Orchestration",
    "gate_4_3": "Platform Services",
    "gate_4_4": "Disaster Recovery & Resilience",
    # Domain 5: Observability & Improvement
    "gate_5_1": "Monitoring & Alerting",
    "gate_5_2": "Logging & Tracing",
    "gate_5_3": "Performance & SLOs",
    "gate_5_4": "Continuous Improvement & Feedback",
}


def calculate_domain_scores(gate_responses: List[GateResponse]) -> Dict[DomainType, Dict]:
    """
    Calculate scores for each domain from gate responses.

    Returns dict with domain -> {score, maturity_level, strengths, gaps}
    Formula: (total_score / max_possible) * 100
    """
    domain_scores = {}

    for domain in DomainType:
        domain_responses = [r for r in gate_responses if r.domain == domain]

        if not domain_responses:
            domain_scores[domain] = {
                "score": 0.0,
                "maturity_level": 1,
                "strengths": [],
                "gaps": [],
            }
            continue

        total_score = sum(r.score for r in domain_responses)
        max_possible = len(domain_responses) * 5  # Max score per question is 5

        score = (total_score / max_possible) * 100 if max_possible > 0 else 0.0
        maturity_level, _ = get_maturity_level(score)

        # Identify strengths (scores >= 4) and gaps (scores <= 2)
        strengths = []
        gaps = []
        for r in domain_responses:
            gate_name = GATE_NAMES.get(r.gate_id, r.gate_id)
            if r.score >= 4:
                strengths.append(f"{gate_name} - Q{r.question_id}: Score {r.score}/5")
            elif r.score <= 2:
                gaps.append(f"{gate_name} - Q{r.question_id}: Score {r.score}/5")

        domain_scores[domain] = {
            "score": round(score, 2),
            "maturity_level": maturity_level,
            "strengths": strengths[:5],  # Top 5
            "gaps": gaps[:5],  # Top 5
        }

    return domain_scores


def calculate_overall_score(domain_scores: Dict[DomainType, Dict]) -> float:
    """
    Calculate weighted average of domain scores.

    Formula: sum(domain_score * weight)
    """
    overall = sum(
        domain_scores.get(domain, {}).get("score", 0) * weight
        for domain, weight in DOMAIN_WEIGHTS.items()
    )
    return round(overall, 2)


def get_maturity_level(score: float) -> Tuple[int, str]:
    """
    Map overall score to maturity level.

    Levels:
    1. Initial (0-20%)
    2. Developing (21-40%)
    3. Defined (41-60%)
    4. Managed (61-80%)
    5. Optimizing (81-100%)
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
    assessment: Assessment, gate_responses: List[GateResponse], domain_scores: List[DomainScore]
) -> schemas.AssessmentReport:
    """Generate complete assessment report"""

    # Get maturity level info
    level, level_name = get_maturity_level(assessment.overall_score)

    maturity_level = schemas.MaturityLevel(
        level=level, name=level_name, description=get_maturity_level_description(level)
    )

    # Domain breakdown
    domain_breakdown = []
    for ds in domain_scores:
        domain_breakdown.append(
            schemas.DomainBreakdown(
                domain=DOMAIN_NAMES.get(ds.domain, ds.domain.value),
                score=ds.score,
                maturity_level=ds.maturity_level,
                strengths=ds.strengths or [],
                gaps=ds.gaps or [],
            )
        )

    # Gate scores
    gate_scores = []
    gate_score_map = {}
    for response in gate_responses:
        if response.gate_id not in gate_score_map:
            gate_score_map[response.gate_id] = {"total": 0, "count": 0}
        gate_score_map[response.gate_id]["total"] += response.score
        gate_score_map[response.gate_id]["count"] += 1

    for gate_id, data in gate_score_map.items():
        max_score = data["count"] * 5
        score = data["total"]
        percentage = (score / max_score * 100) if max_score > 0 else 0

        gate_scores.append(
            schemas.GateScore(
                gate_id=gate_id,
                gate_name=GATE_NAMES.get(gate_id, gate_id),
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
