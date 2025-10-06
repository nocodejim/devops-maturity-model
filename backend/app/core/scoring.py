"""Scoring engine for assessments"""

from typing import Dict, List, Tuple

from app import schemas
from app.models import Assessment, DomainType, Response


# Domain weights as per spec
DOMAIN_WEIGHTS = {
    "domain1": 0.35,  # Source Control & Development
    "domain2": 0.30,  # Security & Compliance
    "domain3": 0.35,  # CI/CD & Deployment
}

# Question distribution by domain (as per spec)
DOMAIN_QUESTIONS = {
    "domain1": [1, 2, 3, 4, 5, 6, 7],
    "domain2": [8, 9, 10, 11, 12, 13],
    "domain3": [14, 15, 16, 17, 18, 19, 20],
}

# Question texts for reporting
QUESTION_TEXTS = {
    1: "Version Control System",
    2: "Branching Strategy",
    3: "Code Review Process",
    4: "Automated Code Quality",
    5: "Test Coverage",
    6: "Build Speed",
    7: "Developer Feedback Loop",
    8: "Security Scanning",
    9: "Vulnerability Management",
    10: "Secrets Management",
    11: "Supply Chain Security",
    12: "Access Control",
    13: "Compliance Automation",
    14: "Continuous Integration",
    15: "Deployment Frequency",
    16: "Deployment Automation",
    17: "Infrastructure as Code",
    18: "Zero-Downtime Deployments",
    19: "Rollback Capability",
    20: "Feature Management",
}

DOMAIN_NAMES = {
    "domain1": "Source Control & Development Practices",
    "domain2": "Security & Compliance",
    "domain3": "CI/CD & Deployment",
}


def calculate_domain_scores(responses: List[Response]) -> Dict[str, float]:
    """
    Calculate scores for each domain.

    Formula: (total_score / max_possible) * 100
    """
    domain_scores = {}

    for domain in ["domain1", "domain2", "domain3"]:
        domain_responses = [r for r in responses if r.domain == domain]

        if not domain_responses:
            domain_scores[domain] = 0.0
            continue

        total_score = sum(r.score for r in domain_responses)
        max_possible = len(domain_responses) * 5  # Max score per question is 5

        score = (total_score / max_possible) * 100 if max_possible > 0 else 0.0
        domain_scores[domain] = round(score, 2)

    return domain_scores


def calculate_overall_score(domain_scores: Dict[str, float]) -> float:
    """
    Calculate weighted average of domain scores.

    Formula: sum(domain_score * weight)
    """
    overall = sum(domain_scores.get(domain, 0) * weight for domain, weight in DOMAIN_WEIGHTS.items())
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


def generate_report(assessment: Assessment, responses: List[Response]) -> schemas.AssessmentReport:
    """Generate complete assessment report"""

    # Get maturity level info
    level, level_name = get_maturity_level(assessment.overall_score)

    maturity_level = schemas.MaturityLevel(
        level=level, name=level_name, description=get_maturity_level_description(level)
    )

    # Domain breakdown
    domain_breakdown = []
    for domain in ["domain1", "domain2", "domain3"]:
        domain_responses = [r for r in responses if r.domain == domain]
        score = getattr(assessment, f"{domain}_score", 0.0)

        domain_breakdown.append(
            schemas.DomainBreakdown(
                domain=DOMAIN_NAMES[domain], score=score, questions_count=len(domain_responses)
            )
        )

    # Sort responses by score
    sorted_responses = sorted(responses, key=lambda r: r.score, reverse=True)

    # Top 5 strengths (highest scores)
    strengths = []
    for response in sorted_responses[:5]:
        strengths.append(
            schemas.StrengthGap(
                question_number=response.question_number,
                question_text=QUESTION_TEXTS.get(response.question_number, "Unknown"),
                score=response.score,
                domain=DOMAIN_NAMES[response.domain],
            )
        )

    # Top 5 gaps (lowest scores)
    gaps = []
    for response in sorted_responses[-5:][::-1]:  # Reverse to get lowest first
        gaps.append(
            schemas.StrengthGap(
                question_number=response.question_number,
                question_text=QUESTION_TEXTS.get(response.question_number, "Unknown"),
                score=response.score,
                domain=DOMAIN_NAMES[response.domain],
            )
        )

    return schemas.AssessmentReport(
        assessment=assessment,
        maturity_level=maturity_level,
        domain_breakdown=domain_breakdown,
        strengths=strengths,
        gaps=gaps,
    )
