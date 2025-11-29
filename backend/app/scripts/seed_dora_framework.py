"""Seed DORA Framework - Technical Delivery Performance Assessment

DORA Framework: 25 questions across 5 domains
- Deployment Frequency: 5 questions (25%)
- Lead Time for Changes: 5 questions (25%)
- Change Failure Rate: 4 questions (20%)
- Mean Time to Restore: 5 questions (20%)
- Enabling Practices: 6 questions (10%)

Completion time: ~75 minutes

Based on research by Dr. Nicole Forsgren, Jez Humble, and Gene Kim
from "Accelerate: The Science of Lean Software and DevOps"
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Framework, FrameworkDomain, FrameworkGate, FrameworkQuestion


def seed_dora_framework():
    """
    Seed DORA Metrics Framework - Technical delivery performance assessment

    Structure:
    - 5 Domains with weighted importance
    - 1 Gate per domain (to satisfy system requirements)
    - 25 Questions total
    - 75-minute completion time

    Measures the 4 key DORA metrics plus enabling practices
    """
    db = SessionLocal()
    try:
        # Check if DORA Framework already exists
        existing = db.query(Framework).filter(Framework.name == "DORA Metrics Framework").first()
        if existing:
            print("DORA Framework already exists. Delete it first to recreate.")
            return

        # Create Framework
        framework = Framework(
            name="DORA Metrics Framework",
            description="Industry-standard technical delivery performance assessment measuring the four key DORA metrics: Deployment Frequency, Lead Time for Changes, Change Failure Rate, and Mean Time to Restore. Based on DevOps Research and Assessment (DORA) by Dr. Nicole Forsgren, Jez Humble, and Gene Kim.",
            version="1.0"
        )
        db.add(framework)
        db.flush()
        print(f"Created framework: {framework.name}")

        # ============================================================
        # DOMAIN 1: DEPLOYMENT FREQUENCY (25% weight, 5 questions)
        # ============================================================
        deployment_freq_domain = FrameworkDomain(
            framework_id=framework.id,
            name="Deployment Frequency",
            description="How often your organization successfully releases to production - a key velocity metric",
            weight=0.25,
            order=1
        )
        db.add(deployment_freq_domain)
        db.flush()

        deployment_freq_gate = FrameworkGate(
            domain_id=deployment_freq_domain.id,
            name="Deployment Frequency Assessment",
            description="Assess deployment cadence and deployment practices",
            order=1
        )
        db.add(deployment_freq_gate)
        db.flush()

        deployment_freq_questions = [
            {
                "text": "How often does your team deploy code to production?",
                "guidance": "Score 0 = Unknown or no regular deployment schedule | Score 1 = Less than once per month (Low performer) - quarterly releases, annual releases | Score 2 = Once per week to once per month (Medium performer) - monthly release cycles, bi-weekly deployments | Score 3 = Multiple times per week (High performer trending) - 2-3 deployments per week with some automation | Score 4 = Once per day to multiple times per week (High performer) - daily deployments with CI/CD pipeline | Score 5 = On-demand, multiple times per day (Elite performer) - continuous deployment, 10+ deploys daily",
                "order": 1
            },
            {
                "text": "How much manual effort is required to deploy to production?",
                "guidance": "Score 0 = Deployment process is undefined or completely manual with no documentation | Score 1 = Extensive manual steps, requires dedicated deployment team, 4+ hours of manual work | Score 2 = Documented manual process with scripts, 1-2 hours of manual coordination | Score 3 = Semi-automated with some manual approvals and verification, 15-30 minutes | Score 4 = Mostly automated, single-click deployment with minimal verification needed | Score 5 = Fully automated pipeline, zero manual steps from merge to production",
                "order": 2
            },
            {
                "text": "Can you deploy to production at any time, or only during maintenance windows?",
                "guidance": "Score 0 = No defined deployment process or unknown | Score 1 = Only during quarterly/annual planned maintenance windows requiring customer notification | Score 2 = Monthly or bi-weekly maintenance windows, deployments only at night/weekends | Score 3 = Can deploy during business hours but requires coordination and approvals | Score 4 = Can deploy anytime with automated rollback capability, minimal coordination | Score 5 = Deploy on-demand at any time including business hours, zero-downtime deployments",
                "order": 3
            },
            {
                "text": "How many approval gates are required before deploying to production?",
                "guidance": "Score 0 = Unknown or undefined approval process | Score 1 = 5+ approval levels (dev lead, architect, QA, ops, CAB, executive) | Score 2 = 3-4 approval levels with formal change advisory board (CAB) meetings | Score 3 = 2 approvals (peer review + ops/manager approval) | Score 4 = 1 approval (automated tests + peer code review) | Score 5 = Zero manual approvals - automated quality gates only (tests, scans, canary metrics)",
                "order": 4
            },
            {
                "text": "What is the deployment frequency for your non-production environments (dev, staging)?",
                "guidance": "Score 0 = No separate environments or unknown deployment frequency | Score 1 = Infrequent deployments to lower environments, manual promotion process | Score 2 = Weekly deployments to dev/staging, manual coordination required | Score 3 = Daily automated deployments to dev, weekly to staging | Score 4 = Continuous deployment to dev on every merge, daily to staging | Score 5 = Continuous deployment to all lower environments, automated promotion based on test results",
                "order": 5
            }
        ]

        for q_data in deployment_freq_questions:
            question = FrameworkQuestion(
                gate_id=deployment_freq_gate.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # ============================================================
        # DOMAIN 2: LEAD TIME FOR CHANGES (25% weight, 5 questions)
        # ============================================================
        lead_time_domain = FrameworkDomain(
            framework_id=framework.id,
            name="Lead Time for Changes",
            description="Time from code committed to code successfully running in production - measuring delivery speed",
            weight=0.25,
            order=2
        )
        db.add(lead_time_domain)
        db.flush()

        lead_time_gate = FrameworkGate(
            domain_id=lead_time_domain.id,
            name="Lead Time Assessment",
            description="Assess speed from commit to production deployment",
            order=1
        )
        db.add(lead_time_gate)
        db.flush()

        lead_time_questions = [
            {
                "text": "How long does it take from code commit to running in production?",
                "guidance": "Score 0 = Unknown or no tracking | Score 1 = More than 1 month (Low performer) - 1-6 months typical | Score 2 = 1 week to 1 month (Medium performer) - 2-4 weeks from commit to production | Score 3 = 2-7 days (High performer trending) - code reaches production within a week | Score 4 = 1 day to 2 days (High performer) - next-day deployment common | Score 5 = Less than 1 day (Elite performer) - same-day deployment, often within hours",
                "order": 1
            },
            {
                "text": "How long does your CI/CD pipeline take from commit to deployment-ready artifact?",
                "guidance": "Score 0 = No CI/CD pipeline or unknown | Score 1 = More than 4 hours - overnight builds common | Score 2 = 1-4 hours - half-day build and test cycle | Score 3 = 30-60 minutes - moderate pipeline efficiency | Score 4 = 10-30 minutes - good automation and parallelization | Score 5 = Less than 10 minutes - highly optimized pipeline with fast feedback",
                "order": 2
            },
            {
                "text": "What is the typical time spent waiting for code review and approval?",
                "guidance": "Score 0 = No code review process or unknown wait times | Score 1 = 1-2 weeks for code review - significant bottleneck | Score 2 = 3-5 days for code review - reviews happen weekly | Score 3 = 1-2 days for code review - daily review cadence | Score 4 = Same day code review - reviews within hours | Score 5 = Immediate code review (<1 hour) - pair programming or mob programming, or very responsive async reviews",
                "order": 3
            },
            {
                "text": "How long does it take to run your full automated test suite?",
                "guidance": "Score 0 = No automated tests or unknown | Score 1 = More than 2 hours - testing is a major bottleneck | Score 2 = 30-120 minutes - long test cycles slow down delivery | Score 3 = 10-30 minutes - moderate test execution time | Score 4 = 5-10 minutes - good test optimization and parallelization | Score 5 = Less than 5 minutes - highly optimized, parallelized tests with fast feedback",
                "order": 4
            },
            {
                "text": "How much time is spent between 'code ready to deploy' and 'code running in production'?",
                "guidance": "Score 0 = Unknown or no defined process | Score 1 = 1-4 weeks waiting for deployment window | Score 2 = 3-7 days waiting for scheduled deployment | Score 3 = 1-2 days for deployment scheduling and approvals | Score 4 = Same day - deploy within hours of ready | Score 5 = Minutes - automated deployment on merge to main branch",
                "order": 5
            }
        ]

        for q_data in lead_time_questions:
            question = FrameworkQuestion(
                gate_id=lead_time_gate.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # ============================================================
        # DOMAIN 3: CHANGE FAILURE RATE (20% weight, 4 questions)
        # ============================================================
        change_failure_domain = FrameworkDomain(
            framework_id=framework.id,
            name="Change Failure Rate",
            description="Percentage of changes that result in degraded service or require remediation - measuring quality",
            weight=0.20,
            order=3
        )
        db.add(change_failure_domain)
        db.flush()

        change_failure_gate = FrameworkGate(
            domain_id=change_failure_domain.id,
            name="Change Failure Rate Assessment",
            description="Assess deployment quality and failure rates",
            order=1
        )
        db.add(change_failure_gate)
        db.flush()

        change_failure_questions = [
            {
                "text": "What percentage of production deployments require a rollback or hotfix?",
                "guidance": "Score 0 = Unknown or not tracked | Score 1 = More than 30% require fixes (Low performer) - frequent deployment failures | Score 2 = 15-30% require fixes (Medium performer) - significant quality issues | Score 3 = 10-15% require fixes (High performer trending) - some stability issues remain | Score 4 = 5-10% require fixes (High performer) - good quality but room for improvement | Score 5 = 0-5% require fixes (Elite performer) - excellent deployment quality and testing",
                "order": 1
            },
            {
                "text": "What is your automated test coverage across unit, integration, and E2E tests?",
                "guidance": "Score 0 = No automated tests or unknown coverage | Score 1 = Less than 20% coverage - mostly manual testing | Score 2 = 20-50% coverage - some automated tests but gaps remain | Score 3 = 50-70% coverage - decent automation across test types | Score 4 = 70-90% coverage - comprehensive test automation | Score 5 = 90%+ coverage - extensive automated testing across all levels with mutation testing",
                "order": 2
            },
            {
                "text": "How often do production incidents occur within 24 hours of a deployment?",
                "guidance": "Score 0 = Unknown or not tracked | Score 1 = More than 30% of deployments cause incidents - very unstable | Score 2 = 15-30% of deployments cause incidents - significant reliability issues | Score 3 = 10-15% of deployments cause incidents - moderate stability concerns | Score 4 = 5-10% of deployments cause incidents - good stability with minor issues | Score 5 = Less than 5% of deployments cause incidents - excellent stability and quality gates",
                "order": 3
            },
            {
                "text": "What quality gates are in place before production deployment?",
                "guidance": "Score 0 = No quality gates or manual-only checks | Score 1 = Manual testing only, no automated validation | Score 2 = Some automated tests but no comprehensive quality gates | Score 3 = Automated unit/integration tests + manual verification | Score 4 = Comprehensive automated testing + security scans + performance tests | Score 5 = Elite quality gates: automated tests + security/compliance scans + canary deployments + automated rollback on metrics degradation",
                "order": 4
            }
        ]

        for q_data in change_failure_questions:
            question = FrameworkQuestion(
                gate_id=change_failure_gate.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # ============================================================
        # DOMAIN 4: MEAN TIME TO RESTORE (20% weight, 5 questions)
        # ============================================================
        mttr_domain = FrameworkDomain(
            framework_id=framework.id,
            name="Mean Time to Restore",
            description="How long it takes to restore service when an incident occurs - measuring recovery capability",
            weight=0.20,
            order=4
        )
        db.add(mttr_domain)
        db.flush()

        mttr_gate = FrameworkGate(
            domain_id=mttr_domain.id,
            name="MTTR Assessment",
            description="Assess incident detection and recovery speed",
            order=1
        )
        db.add(mttr_gate)
        db.flush()

        mttr_questions = [
            {
                "text": "How long does it typically take to restore service after a production incident?",
                "guidance": "Score 0 = Unknown or no incident tracking | Score 1 = More than 1 week (Low performer) - extended outages common | Score 2 = 1 day to 1 week (Medium performer) - recovery takes days | Score 3 = 1 hour to 1 day (High performer trending) - same-day resolution typical | Score 4 = 15 minutes to 1 hour (High performer) - fast recovery capability | Score 5 = Less than 15 minutes (Elite performer) - immediate rollback or auto-recovery",
                "order": 1
            },
            {
                "text": "How quickly can your team detect that a production issue has occurred?",
                "guidance": "Score 0 = No monitoring, learn from customer complaints only | Score 1 = More than 1 hour - customers report issues before we detect them | Score 2 = 15-60 minutes - basic monitoring with delayed alerting | Score 3 = 5-15 minutes - good monitoring with timely alerts | Score 4 = 1-5 minutes - comprehensive monitoring and alerting | Score 5 = Less than 1 minute - real-time monitoring with immediate alerts and anomaly detection",
                "order": 2
            },
            {
                "text": "How long does it take to diagnose the root cause of a production incident?",
                "guidance": "Score 0 = No structured diagnosis process or unknown | Score 1 = More than 4 hours - significant investigation time required | Score 2 = 1-4 hours - lengthy troubleshooting with limited visibility | Score 3 = 30-60 minutes - moderate observability and debugging capability | Score 4 = 10-30 minutes - good logs, metrics, and tracing for diagnosis | Score 5 = Less than 10 minutes - comprehensive observability, distributed tracing, and clear error messages",
                "order": 3
            },
            {
                "text": "How easy is it to rollback a problematic deployment?",
                "guidance": "Score 0 = No rollback capability or unknown | Score 1 = Very difficult - requires re-deployment of old version, manual data fixes, 4+ hours | Score 2 = Manual rollback process documented, 1-2 hours to execute | Score 3 = Semi-automated rollback, 15-30 minutes with some manual steps | Score 4 = One-click rollback, 5-10 minutes to previous version | Score 5 = Automatic rollback on failure detection, or instant blue/green switch, <5 minutes",
                "order": 4
            },
            {
                "text": "Do you have runbooks and on-call processes for incident response?",
                "guidance": "Score 0 = No runbooks or on-call process | Score 1 = No documentation, tribal knowledge only, no formal on-call | Score 2 = Some runbooks exist but outdated, informal on-call rotation | Score 3 = Basic runbooks for common issues, formal on-call with escalation | Score 4 = Comprehensive runbooks, well-defined on-call with SLAs | Score 5 = Automated runbooks, ChatOps integration, follow the sun on-call, blameless post-mortems",
                "order": 5
            }
        ]

        for q_data in mttr_questions:
            question = FrameworkQuestion(
                gate_id=mttr_gate.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # ============================================================
        # DOMAIN 5: ENABLING PRACTICES (10% weight, 6 questions)
        # ============================================================
        enabling_domain = FrameworkDomain(
            framework_id=framework.id,
            name="Enabling Practices",
            description="Technical and cultural practices that enable high DORA performance",
            weight=0.10,
            order=5
        )
        db.add(enabling_domain)
        db.flush()

        enabling_gate = FrameworkGate(
            domain_id=enabling_domain.id,
            name="Enabling Practices Assessment",
            description="Assess practices that support high delivery performance",
            order=1
        )
        db.add(enabling_gate)
        db.flush()

        enabling_questions = [
            {
                "text": "What is your branching strategy?",
                "guidance": "Score 0 = No version control or undefined strategy | Score 1 = Long-lived feature branches (weeks/months), infrequent integration | Score 2 = Feature branches merged weekly, some integration pain | Score 3 = Short-lived feature branches (1-3 days), regular integration | Score 4 = Trunk-based development with feature flags, daily integration | Score 5 = True trunk-based development, all commits to main, feature flags for incomplete work",
                "order": 1
            },
            {
                "text": "How comprehensive is your continuous integration practice?",
                "guidance": "Score 0 = No CI or unknown | Score 1 = Manual builds, no automated testing on commit | Score 2 = Automated builds but limited test automation | Score 3 = CI runs unit tests on every commit to branches | Score 4 = CI runs comprehensive tests on every commit, blocks merge on failure | Score 5 = CI runs full test suite + security scans + code quality checks on every commit with fast feedback",
                "order": 2
            },
            {
                "text": "How much investment is made in test automation?",
                "guidance": "Score 0 = No investment in test automation | Score 1 = Test automation is ad-hoc, no dedicated time | Score 2 = Some time allocated but not prioritized | Score 3 = Test automation included in sprint planning | Score 4 = Test automation is a priority, 20-30% of development time | Score 5 = Test automation is core to development, TDD/BDD practices, developers write tests first",
                "order": 3
            },
            {
                "text": "How is your application architecture designed?",
                "guidance": "Score 0 = Unknown or undefined architecture | Score 1 = Monolithic architecture with tight coupling, hard to change | Score 2 = Monolith with some modularization, difficult to test in isolation | Score 3 = Modular architecture or early microservices, some independent deployment | Score 4 = Microservices or modular architecture with loose coupling, mostly independent deployment | Score 5 = Fully decoupled architecture, services deploy independently, clear API contracts, isolated failures",
                "order": 4
            },
            {
                "text": "What level of monitoring and observability do you have?",
                "guidance": "Score 0 = No monitoring or observability | Score 1 = Basic uptime monitoring only | Score 2 = Application logs and basic metrics (CPU, memory) | Score 3 = Structured logging, metrics dashboards, basic alerting | Score 4 = Comprehensive observability: logs, metrics, traces, custom dashboards | Score 5 = Full observability: distributed tracing, service mesh, APM, custom business metrics, anomaly detection",
                "order": 5
            },
            {
                "text": "Does your team have autonomy to make technology decisions?",
                "guidance": "Score 0 = No autonomy, all decisions made by central architecture team | Score 1 = Very limited autonomy, must get approval for all technology choices | Score 2 = Some autonomy within strict guidelines and approved technology list | Score 3 = Moderate autonomy, can choose within established patterns | Score 4 = High autonomy, team can propose and adopt new technologies with lightweight approval | Score 5 = Full autonomy, team makes technology decisions aligned to org guidelines, 'you build it you run it'",
                "order": 6
            }
        ]

        for q_data in enabling_questions:
            question = FrameworkQuestion(
                gate_id=enabling_gate.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        db.commit()
        print("✅ Successfully seeded DORA Metrics Framework")
        print(f"   - Framework: {framework.name}")
        print(f"   - Domains: 5 (Deployment Frequency 25%, Lead Time 25%, Change Failure Rate 20%, MTTR 20%, Enabling Practices 10%)")
        print(f"   - Questions: 25 total (5+5+4+5+6)")
        print(f"   - Estimated completion time: 75 minutes")
        print()
        print("✨ DORA technical delivery performance assessment ready for testing!")
        print()
        print("DORA Performance Levels:")
        print("  - Elite:  80-100% (Elite DORA performer)")
        print("  - High:   60-79%  (High DORA performer)")
        print("  - Medium: 40-59%  (Medium DORA performer)")
        print("  - Low:    20-39%  (Low DORA performer)")
        print("  - Initial: 0-19%  (Beginning DevOps journey)")

    except Exception as e:
        print(f"❌ Error seeding DORA framework: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_dora_framework()
