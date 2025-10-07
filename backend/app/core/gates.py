"""Gate and question definitions for complete spec - 20 gates across 5 domains"""

from typing import Dict, List
from app.models import DomainType

# Question structure: {question_id, text, guidance}
GATES_DEFINITION = {
    # ============================================================================
    # DOMAIN 1: Source Control & Development Practices (15% weight)
    # ============================================================================
    "gate_1_1": {
        "name": "Version Control & Branching",
        "domain": DomainType.DOMAIN1,
        "questions": [
            {
                "id": "q1",
                "text": "What version control system is used and how widespread is adoption?",
                "guidance": "0=None, 1=Some use, 2=Most teams, 3=All teams basic, 4=All teams advanced, 5=Industry best practices",
            },
            {
                "id": "q2",
                "text": "How mature is your branching strategy?",
                "guidance": "0=No strategy, 1=Ad-hoc, 2=Documented, 3=Trunk-based/GitFlow, 4=Automated, 5=Optimized for flow",
            },
        ],
    },
    "gate_1_2": {
        "name": "Code Review & Quality",
        "domain": DomainType.DOMAIN1,
        "questions": [
            {
                "id": "q1",
                "text": "How consistent and effective are code reviews?",
                "guidance": "0=None, 1=Optional, 2=Required but inconsistent, 3=Consistent, 4=Automated checks, 5=Continuous",
            },
            {
                "id": "q2",
                "text": "What automated code quality tools are in use?",
                "guidance": "0=None, 1=Basic linting, 2=Static analysis, 3=Security scanning, 4=Comprehensive suite, 5=AI-assisted",
            },
        ],
    },
    "gate_1_3": {
        "name": "Testing Practices",
        "domain": DomainType.DOMAIN1,
        "questions": [
            {
                "id": "q1",
                "text": "What is the test coverage and automation level?",
                "guidance": "0=None, 1=Manual only, 2=Some unit tests, 3=Good coverage, 4=Comprehensive, 5=TDD/BDD",
            },
            {
                "id": "q2",
                "text": "Are integration and E2E tests automated?",
                "guidance": "0=None, 1=Manual, 2=Partial automation, 3=Mostly automated, 4=Fully automated, 5=Continuous validation",
            },
        ],
    },
    "gate_1_4": {
        "name": "Build & Integration",
        "domain": DomainType.DOMAIN1,
        "questions": [
            {
                "id": "q1",
                "text": "How fast and reliable are builds?",
                "guidance": "0=Manual, 1=Slow/unreliable, 2=Automated but slow, 3=Fast (<10min), 4=Very fast (<5min), 5=Incremental/cached",
            },
            {
                "id": "q2",
                "text": "How quickly do developers get feedback?",
                "guidance": "0=Hours/days, 1=1-2 hours, 2=30-60min, 3=10-30min, 4=<10min, 5=Real-time",
            },
        ],
    },
    # ============================================================================
    # DOMAIN 2: Security & Compliance (25% weight)
    # ============================================================================
    "gate_2_1": {
        "name": "Security Scanning & Vulnerability Management",
        "domain": DomainType.DOMAIN2,
        "questions": [
            {
                "id": "q1",
                "text": "How comprehensive is automated security scanning?",
                "guidance": "0=None, 1=Basic, 2=SAST, 3=SAST+DAST, 4=Container+dependencies, 5=Continuous+runtime",
            },
            {
                "id": "q2",
                "text": "How are vulnerabilities tracked and remediated?",
                "guidance": "0=None, 1=Manual tracking, 2=Basic ticketing, 3=Automated tracking, 4=SLA-based, 5=Auto-remediation",
            },
        ],
    },
    "gate_2_2": {
        "name": "Secrets & Access Management",
        "domain": DomainType.DOMAIN2,
        "questions": [
            {
                "id": "q1",
                "text": "How are secrets and credentials managed?",
                "guidance": "0=Hardcoded, 1=Config files, 2=Env vars, 3=Secret manager, 4=Rotation, 5=Zero-trust vault",
            },
            {
                "id": "q2",
                "text": "How is access control implemented?",
                "guidance": "0=None, 1=Basic auth, 2=RBAC, 3=SSO/MFA, 4=Policy-based, 5=Zero-trust/just-in-time",
            },
        ],
    },
    "gate_2_3": {
        "name": "Supply Chain Security",
        "domain": DomainType.DOMAIN2,
        "questions": [
            {
                "id": "q1",
                "text": "How are dependencies scanned and managed?",
                "guidance": "0=None, 1=Manual review, 2=Basic scanning, 3=Automated scanning, 4=SCA+SBOM, 5=Comprehensive supply chain",
            },
            {
                "id": "q2",
                "text": "Are build artifacts signed and verified?",
                "guidance": "0=None, 1=Manual, 2=Some signing, 3=Automated signing, 4=Full chain, 5=Sigstore/in-toto",
            },
        ],
    },
    "gate_2_4": {
        "name": "Compliance & Audit",
        "domain": DomainType.DOMAIN2,
        "questions": [
            {
                "id": "q1",
                "text": "How automated is compliance validation?",
                "guidance": "0=None, 1=Manual, 2=Some automation, 3=Policy-as-code, 4=Continuous compliance, 5=Self-healing",
            },
            {
                "id": "q2",
                "text": "How comprehensive is audit logging?",
                "guidance": "0=None, 1=Basic logs, 2=Structured logs, 3=Centralized, 4=Immutable, 5=Real-time analysis",
            },
        ],
    },
    # ============================================================================
    # DOMAIN 3: CI/CD & Deployment (25% weight)
    # ============================================================================
    "gate_3_1": {
        "name": "Continuous Integration",
        "domain": DomainType.DOMAIN3,
        "questions": [
            {
                "id": "q1",
                "text": "How mature is your CI pipeline?",
                "guidance": "0=None, 1=Basic, 2=Automated tests, 3=Parallel execution, 4=Optimized, 5=Self-healing",
            },
            {
                "id": "q2",
                "text": "How often is code integrated?",
                "guidance": "0=Rarely, 1=Weekly, 2=Daily, 3=Multiple/day, 4=Continuous, 5=Real-time",
            },
        ],
    },
    "gate_3_2": {
        "name": "Deployment Automation",
        "domain": DomainType.DOMAIN3,
        "questions": [
            {
                "id": "q1",
                "text": "How automated are deployments?",
                "guidance": "0=Manual, 1=Scripts, 2=Basic automation, 3=Full automation, 4=GitOps, 5=Progressive delivery",
            },
            {
                "id": "q2",
                "text": "What is your deployment frequency?",
                "guidance": "0=Months, 1=Monthly, 2=Weekly, 3=Daily, 4=Multiple/day, 5=On-demand continuous",
            },
        ],
    },
    "gate_3_3": {
        "name": "Release Management",
        "domain": DomainType.DOMAIN3,
        "questions": [
            {
                "id": "q1",
                "text": "How sophisticated is your rollback capability?",
                "guidance": "0=None, 1=Manual, 2=Scripted, 3=One-click, 4=Automated, 5=Instant/automatic",
            },
            {
                "id": "q2",
                "text": "Do you support zero-downtime deployments?",
                "guidance": "0=No, 1=Rarely, 2=Most services, 3=All services, 4=Blue-green/canary, 5=Progressive with automation",
            },
        ],
    },
    "gate_3_4": {
        "name": "Feature Management",
        "domain": DomainType.DOMAIN3,
        "questions": [
            {
                "id": "q1",
                "text": "How are feature flags/toggles used?",
                "guidance": "0=None, 1=Basic flags, 2=Feature flags, 3=Dynamic config, 4=A/B testing, 5=Experimentation platform",
            },
            {
                "id": "q2",
                "text": "Can you do canary releases and gradual rollouts?",
                "guidance": "0=No, 1=Manual, 2=Basic canary, 3=Automated canary, 4=Progressive delivery, 5=ML-driven",
            },
        ],
    },
    # ============================================================================
    # DOMAIN 4: Infrastructure & Platform Engineering (20% weight)
    # ============================================================================
    "gate_4_1": {
        "name": "Infrastructure as Code",
        "domain": DomainType.DOMAIN4,
        "questions": [
            {
                "id": "q1",
                "text": "How much infrastructure is defined as code?",
                "guidance": "0=None, 1=Some scripts, 2=Partial IaC, 3=Most IaC, 4=All IaC, 5=Self-service platform",
            },
            {
                "id": "q2",
                "text": "How is IaC tested and validated?",
                "guidance": "0=None, 1=Manual, 2=Basic validation, 3=Automated tests, 4=Policy validation, 5=Continuous validation",
            },
        ],
    },
    "gate_4_2": {
        "name": "Cloud & Container Orchestration",
        "domain": DomainType.DOMAIN4,
        "questions": [
            {
                "id": "q1",
                "text": "How mature is container/orchestration usage?",
                "guidance": "0=None, 1=Docker, 2=Basic K8s, 3=Production K8s, 4=Advanced features, 5=Service mesh",
            },
            {
                "id": "q2",
                "text": "How optimized is cloud resource usage?",
                "guidance": "0=None, 1=Basic, 2=Tagged, 3=Right-sized, 4=Autoscaling, 5=FinOps/spot instances",
            },
        ],
    },
    "gate_4_3": {
        "name": "Platform Services",
        "domain": DomainType.DOMAIN4,
        "questions": [
            {
                "id": "q1",
                "text": "Is there a self-service developer platform?",
                "guidance": "0=None, 1=Documentation, 2=Templates, 3=Portal, 4=Full platform, 5=Backstage/internal platform",
            },
            {
                "id": "q2",
                "text": "How standardized are development environments?",
                "guidance": "0=None, 1=Documentation, 2=Scripts, 3=Containers, 4=Dev containers, 5=Cloud dev environments",
            },
        ],
    },
    "gate_4_4": {
        "name": "Disaster Recovery & Resilience",
        "domain": DomainType.DOMAIN4,
        "questions": [
            {
                "id": "q1",
                "text": "How comprehensive is your DR/backup strategy?",
                "guidance": "0=None, 1=Manual backups, 2=Automated backups, 3=Tested DR, 4=Multi-region, 5=Active-active",
            },
            {
                "id": "q2",
                "text": "How resilient are services to failures?",
                "guidance": "0=None, 1=Basic HA, 2=Multi-AZ, 3=Circuit breakers, 4=Chaos testing, 5=Self-healing",
            },
        ],
    },
    # ============================================================================
    # DOMAIN 5: Observability & Continuous Improvement (15% weight)
    # ============================================================================
    "gate_5_1": {
        "name": "Monitoring & Alerting",
        "domain": DomainType.DOMAIN5,
        "questions": [
            {
                "id": "q1",
                "text": "How comprehensive is monitoring coverage?",
                "guidance": "0=None, 1=Basic uptime, 2=Metrics, 3=APM, 4=Full stack, 5=Business metrics",
            },
            {
                "id": "q2",
                "text": "How effective is alerting?",
                "guidance": "0=None, 1=Basic alerts, 2=Alert rules, 3=Smart routing, 4=ML anomaly detection, 5=Auto-remediation",
            },
        ],
    },
    "gate_5_2": {
        "name": "Logging & Tracing",
        "domain": DomainType.DOMAIN5,
        "questions": [
            {
                "id": "q1",
                "text": "How mature is centralized logging?",
                "guidance": "0=None, 1=Local logs, 2=Centralized, 3=Structured logs, 4=Searchable/indexed, 5=Real-time analysis",
            },
            {
                "id": "q2",
                "text": "Is distributed tracing implemented?",
                "guidance": "0=None, 1=Basic, 2=Some services, 3=Most services, 4=All services, 5=Full observability",
            },
        ],
    },
    "gate_5_3": {
        "name": "Performance & SLOs",
        "domain": DomainType.DOMAIN5,
        "questions": [
            {
                "id": "q1",
                "text": "Are SLIs/SLOs/SLAs defined and tracked?",
                "guidance": "0=None, 1=Informal, 2=Documented, 3=Tracked, 4=Error budgets, 5=Automated enforcement",
            },
            {
                "id": "q2",
                "text": "How is performance testing integrated?",
                "guidance": "0=None, 1=Manual, 2=Automated, 3=CI/CD, 4=Production-like, 5=Continuous profiling",
            },
        ],
    },
    "gate_5_4": {
        "name": "Continuous Improvement & Feedback",
        "domain": DomainType.DOMAIN5,
        "questions": [
            {
                "id": "q1",
                "text": "How are incidents reviewed and learned from?",
                "guidance": "0=None, 1=Informal, 2=Post-mortems, 3=Blameless reviews, 4=Action tracking, 5=Learning culture",
            },
            {
                "id": "q2",
                "text": "How is DORA metrics tracking implemented?",
                "guidance": "0=None, 1=Manual, 2=Basic tracking, 3=Automated dashboards, 4=Trend analysis, 5=Predictive insights",
            },
        ],
    },
}


def get_all_gates() -> Dict:
    """Return all gate definitions"""
    return GATES_DEFINITION


def get_gates_for_domain(domain: DomainType) -> Dict:
    """Get all gates for a specific domain"""
    return {
        gate_id: gate_data
        for gate_id, gate_data in GATES_DEFINITION.items()
        if gate_data["domain"] == domain
    }


def get_gate(gate_id: str) -> Dict:
    """Get a specific gate definition"""
    return GATES_DEFINITION.get(gate_id)


def validate_gate_response(gate_id: str, question_id: str) -> bool:
    """Validate that a gate and question combination exists"""
    gate = GATES_DEFINITION.get(gate_id)
    if not gate:
        return False
    return any(q["id"] == question_id for q in gate["questions"])


def get_total_question_count() -> int:
    """Get total number of questions across all gates"""
    total = 0
    for gate in GATES_DEFINITION.values():
        total += len(gate["questions"])
    return total
