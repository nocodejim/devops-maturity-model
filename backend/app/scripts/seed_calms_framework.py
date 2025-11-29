"""Seed CALMS Framework - Organizational DevOps Readiness Assessment

CALMS Framework: 28 questions across 5 domains (no gates)
- Culture: 6 questions (25%)
- Automation: 6 questions (25%)
- Lean: 5 questions (15%)
- Measurement: 6 questions (20%)
- Sharing: 5 questions (15%)

Completion time: ~90 minutes
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Framework, FrameworkDomain, FrameworkGate, FrameworkQuestion


def seed_calms_framework():
    """
    Seed CALMS DevOps Framework - Lightweight organizational readiness assessment

    Structure:
    - 5 Domains with weighted importance
    - 1 Gate per domain (to satisfy system requirements)
    - 28 Questions total (5-6 per domain)
    - 90-minute completion time
    """
    db = SessionLocal()
    try:
        # Check if CALMS Framework already exists
        existing = db.query(Framework).filter(Framework.name == "CALMS DevOps Framework").first()
        if existing:
            print("CALMS Framework already exists. Delete it first to recreate.")
            return

        # Create Framework
        framework = Framework(
            name="CALMS DevOps Framework",
            description="Lightweight organizational readiness assessment for DevOps transformation based on Jez Humble's CALMS model (Culture, Automation, Lean, Measurement, Sharing)",
            version="1.0"
        )
        db.add(framework)
        db.flush()
        print(f"Created framework: {framework.name}")

        # ============================================================
        # DOMAIN 1: CULTURE (25% weight, 6 questions)
        # ============================================================
        culture_domain = FrameworkDomain(
            framework_id=framework.id,
            name="Culture",
            description="Collaboration, blameless culture, and organizational mindset for DevOps adoption",
            weight=0.25,
            order=1
        )
        db.add(culture_domain)
        db.flush()

        # Single gate for Culture (system requires gates)
        culture_gate = FrameworkGate(
            domain_id=culture_domain.id,
            name="Culture Assessment",
            description="Organizational culture and collaboration maturity",
            order=1
        )
        db.add(culture_gate)
        db.flush()

        culture_questions = [
            {
                "text": "When a production issue occurs, how is it handled?",
                "guidance": "Score 0 = Operations fixes it alone, development is uninvolved or notified later | Score 1 = Dev notified after incident is resolved, no real-time involvement | Score 2 = Dev is notified during incident but Ops handles the fix | Score 3 = Dev and Ops communicate via tickets and handoffs | Score 4 = Dev and Ops coordinate in real-time but don't work together | Score 5 = Cross-functional team swarms on the problem together until resolved",
                "order": 1
            },
            {
                "text": "How does your organization respond when someone makes a mistake that causes an outage?",
                "guidance": "Score 0 = Public blame, formal disciplinary action, fear-based culture | Score 1 = Informal blame, reputation damage, people defensive | Score 2 = Private criticism, person feels shamed | Score 3 = Acknowledged as mistake, some defensiveness | Score 4 = Treated as learning opportunity with minor discomfort | Score 5 = Celebrated as learning opportunity, focus on preventing recurrence",
                "order": 2
            },
            {
                "text": "Who is accountable for production uptime and customer satisfaction?",
                "guidance": "Score 0 = Operations only - development has 'not our problem' attitude | Score 1 = Primarily Ops, Dev occasionally pulled in for major issues | Score 2 = Accountability defined as Ops but Dev helps sometimes | Score 3 = Shared accountability is stated but not practiced consistently | Score 4 = Shared accountability with clear escalation paths | Score 5 = 'You build it, you run it' - full shared ownership and on-call rotation",
                "order": 3
            },
            {
                "text": "How easily can team members access information they need to do their jobs?",
                "guidance": "Score 0 = Information is siloed, requires multiple approvals to access | Score 1 = Some information available but requires knowing who to ask | Score 2 = Available but hard to find, knowledge is tribal | Score 3 = Documented but spread across many systems | Score 4 = Centralized with search capabilities | Score 5 = Transparent by default, all information easily discoverable",
                "order": 4
            },
            {
                "text": "Does executive leadership actively support DevOps transformation?",
                "guidance": "Score 0 = No support, seen as engineering fad | Score 1 = Aware of DevOps but skeptical or indifferent | Score 2 = Passive support, no active involvement | Score 3 = Verbal support but limited resources | Score 4 = Active support with resources allocated | Score 5 = Champions transformation, removes obstacles, models behaviors",
                "order": 5
            },
            {
                "text": "Are teams given time and budget for improvement work (not just features)?",
                "guidance": "Score 0 = No, all time must go to features | Score 1 = Acknowledged as important but no dedicated time | Score 2 = Improvement work done in spare time | Score 3 = Occasional improvement sprints allowed | Score 4 = Regular time allocated (e.g., 20% time) | Score 5 = Improvement work prioritized equally with features",
                "order": 6
            }
        ]

        for q_data in culture_questions:
            question = FrameworkQuestion(
                gate_id=culture_gate.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # ============================================================
        # DOMAIN 2: AUTOMATION (25% weight, 6 questions)
        # ============================================================
        automation_domain = FrameworkDomain(
            framework_id=framework.id,
            name="Automation",
            description="Build, test, deploy, and infrastructure automation maturity",
            weight=0.25,
            order=2
        )
        db.add(automation_domain)
        db.flush()

        automation_gate = FrameworkGate(
            domain_id=automation_domain.id,
            name="Automation Assessment",
            description="Automation capabilities across the delivery pipeline",
            order=1
        )
        db.add(automation_gate)
        db.flush()

        automation_questions = [
            {
                "text": "How are application builds created?",
                "guidance": "Score 0 = Manual build process requiring human intervention and tribal knowledge | Score 1 = Basic shell scripts exist but require manual execution | Score 2 = Scripted builds but must be triggered manually | Score 3 = Automated on commit but inconsistent across projects | Score 4 = Fully automated CI with most projects using it | Score 5 = Automated CI for all projects, builds are consistent and repeatable",
                "order": 1
            },
            {
                "text": "What percentage of your tests are automated?",
                "guidance": "Score 0 = 0-10% - Almost all testing is manual | Score 1 = 10-20% - Minimal unit tests only | Score 2 = 20-40% - Some unit tests automated | Score 3 = 50-70% - Good unit test coverage, some integration tests | Score 4 = 80-90% - Comprehensive automation including integration and E2E tests | Score 5 = 90%+ - Nearly complete automation across all test types",
                "order": 2
            },
            {
                "text": "How often do you deploy to production?",
                "guidance": "Score 0 = Rarely (quarterly or less) with high ceremony | Score 1 = Every 2-3 months with significant planning | Score 2 = Monthly or every few weeks with planned maintenance windows | Score 3 = Weekly deployments with some coordination needed | Score 4 = Daily deployments with minimal coordination | Score 5 = On-demand multiple times per day, fully automated",
                "order": 3
            },
            {
                "text": "What is required to deploy a change to production?",
                "guidance": "Score 0 = Manual steps, extensive documentation, multiple approvals, maintenance window | Score 1 = Documented manual process with many approval gates | Score 2 = Mostly manual with some scripts, requires approvals | Score 3 = Semi-automated with some manual verification steps | Score 4 = Mostly automated, single-click deployment | Score 5 = Fully automated pipeline from commit to production (with appropriate gates)",
                "order": 4
            },
            {
                "text": "How is infrastructure provisioned?",
                "guidance": "Score 0 = Manual point-and-click through cloud console or manual server setup | Score 1 = Some documentation exists but mostly manual provisioning | Score 2 = Documented manual steps or basic scripts | Score 3 = Infrastructure as Code for some resources, mixed approach | Score 4 = Most infrastructure defined as code (Terraform, CloudFormation, etc.) | Score 5 = All infrastructure defined as code, version controlled, peer reviewed",
                "order": 5
            },
            {
                "text": "Can you recreate your infrastructure from scratch?",
                "guidance": "Score 0 = No, infrastructure is unique and irreplaceable ('pet' servers) | Score 1 = Theoretically possible but would take weeks/months of effort | Score 2 = Possible but requires significant manual effort and tribal knowledge | Score 3 = Mostly possible with documentation and some automation | Score 4 = Can recreate with automated scripts, minor manual steps | Score 5 = Fully automated recreation, infrastructure is cattle not pets",
                "order": 6
            }
        ]

        for q_data in automation_questions:
            question = FrameworkQuestion(
                gate_id=automation_gate.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # ============================================================
        # DOMAIN 3: LEAN (15% weight, 5 questions)
        # ============================================================
        lean_domain = FrameworkDomain(
            framework_id=framework.id,
            name="Lean",
            description="Continuous improvement, experimentation, and waste reduction practices",
            weight=0.15,
            order=3
        )
        db.add(lean_domain)
        db.flush()

        lean_gate = FrameworkGate(
            domain_id=lean_domain.id,
            name="Lean Assessment",
            description="Lean principles and continuous improvement practices",
            order=1
        )
        db.add(lean_gate)
        db.flush()

        lean_questions = [
            {
                "text": "How often does your team hold retrospectives or improvement meetings?",
                "guidance": "Score 0 = Never, no time allocated for reflection | Score 1 = Occasionally discussed but no formal meetings | Score 2 = Rarely, only after major incidents or project completion | Score 3 = Quarterly or monthly, but often cancelled | Score 4 = Regularly scheduled (bi-weekly or after each sprint), mostly followed | Score 5 = Frequent retrospectives are ingrained in team culture, never skipped",
                "order": 1
            },
            {
                "text": "How does your organization approach new ideas and innovations?",
                "guidance": "Score 0 = New ideas discouraged, 'we've always done it this way' culture | Score 1 = New ideas tolerated but no support for implementation | Score 2 = Ideas welcomed but rarely tested or implemented | Score 3 = Some experimentation allowed but requires extensive approval | Score 4 = Teams encouraged to experiment within guardrails | Score 5 = Experimentation is actively encouraged, fast fail-forward culture",
                "order": 2
            },
            {
                "text": "Are bottlenecks in your workflow identified and addressed?",
                "guidance": "Score 0 = Bottlenecks not identified or ignored | Score 1 = Team aware of bottlenecks but no systematic approach to addressing | Score 2 = Bottlenecks known but not prioritized for resolution | Score 3 = Some bottlenecks addressed reactively | Score 4 = Bottlenecks actively identified and mostly addressed | Score 5 = Continuous bottleneck identification and elimination, theory of constraints applied",
                "order": 3
            },
            {
                "text": "How much work-in-progress (WIP) does your team carry?",
                "guidance": "Score 0 = Unlimited WIP, everyone multitasks across many items | Score 1 = Very high WIP, no visibility into total amount | Score 2 = High WIP, work often sits waiting for long periods | Score 3 = Some awareness of WIP but no limits enforced | Score 4 = WIP limits set and mostly followed | Score 5 = Strict WIP limits enforced, focus on finishing over starting",
                "order": 4
            },
            {
                "text": "Is work visualized (e.g., on Kanban boards or similar tools)?",
                "guidance": "Score 0 = No work visualization, status is tribal knowledge | Score 1 = Work tracked in spreadsheets or email, hard to get full picture | Score 2 = Work tracked in tools but not visually displayed | Score 3 = Some visualization but incomplete or out of date | Score 4 = All work visualized and kept current | Score 5 = Real-time visualization of all work, visible to entire team and stakeholders",
                "order": 5
            }
        ]

        for q_data in lean_questions:
            question = FrameworkQuestion(
                gate_id=lean_gate.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # ============================================================
        # DOMAIN 4: MEASUREMENT (20% weight, 6 questions)
        # ============================================================
        measurement_domain = FrameworkDomain(
            framework_id=framework.id,
            name="Measurement",
            description="Metrics collection, monitoring, and data-driven decision making",
            weight=0.20,
            order=4
        )
        db.add(measurement_domain)
        db.flush()

        measurement_gate = FrameworkGate(
            domain_id=measurement_domain.id,
            name="Measurement Assessment",
            description="Metrics, monitoring, and data-driven practices",
            order=1
        )
        db.add(measurement_gate)
        db.flush()

        measurement_questions = [
            {
                "text": "Do you track deployment frequency (how often you deploy to production)?",
                "guidance": "Score 0 = Not tracked or unknown | Score 1 = Vague awareness (monthly? quarterly?) but not documented | Score 2 = Rough estimates, not systematically tracked | Score 3 = Tracked manually for some projects | Score 4 = Automated tracking across most projects | Score 5 = Comprehensive automated tracking with trending and benchmarking",
                "order": 1
            },
            {
                "text": "Is Mean Time to Recovery (MTTR) tracked when incidents occur?",
                "guidance": "Score 0 = Not tracked, downtime duration unknown | Score 1 = Anecdotal estimates only (hours? days?) | Score 2 = Estimated after the fact, not precise | Score 3 = Tracked for major incidents only | Score 4 = Tracked for all incidents with consistent methodology | Score 5 = Automated MTTR tracking with alerts when trending negatively",
                "order": 2
            },
            {
                "text": "Is system uptime/availability measured?",
                "guidance": "Score 0 = Not measured, only know when users complain | Score 1 = Rough estimates based on incident frequency | Score 2 = Basic uptime monitoring but not comprehensive | Score 3 = Uptime tracked for critical services | Score 4 = Comprehensive uptime tracking with SLA reporting | Score 5 = Real-time availability monitoring with automated alerting and SLO tracking",
                "order": 3
            },
            {
                "text": "Are user engagement metrics tracked (active users, session duration, etc.)?",
                "guidance": "Score 0 = No user analytics or tracking | Score 1 = Anecdotal feedback only, no measurement | Score 2 = Basic analytics (page views) but limited insight | Score 3 = User engagement tracked for some features | Score 4 = Comprehensive user analytics across application | Score 5 = Advanced analytics with cohort analysis, user journeys, and retention metrics",
                "order": 4
            },
            {
                "text": "Are metrics visible and accessible to teams?",
                "guidance": "Score 0 = No metrics or dashboards available | Score 1 = Metrics exist but only accessible to select individuals | Score 2 = Metrics exist but hard to access, require special tools | Score 3 = Some dashboards but not comprehensive | Score 4 = Comprehensive dashboards easily accessible | Score 5 = Real-time metrics on TVs/monitors, embedded in team workflow",
                "order": 5
            },
            {
                "text": "Are decisions based on data or gut feeling/intuition?",
                "guidance": "Score 0 = All decisions based on intuition or authority | Score 1 = Data requested occasionally but decisions made before it arrives | Score 2 = Some data considered but mostly gut feel | Score 3 = Mix of data and intuition | Score 4 = Most decisions backed by data | Score 5 = Strong data-driven culture, decisions require data support",
                "order": 6
            }
        ]

        for q_data in measurement_questions:
            question = FrameworkQuestion(
                gate_id=measurement_gate.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # ============================================================
        # DOMAIN 5: SHARING (15% weight, 5 questions)
        # ============================================================
        sharing_domain = FrameworkDomain(
            framework_id=framework.id,
            name="Sharing",
            description="Knowledge sharing, collaboration, and organizational learning",
            weight=0.15,
            order=5
        )
        db.add(sharing_domain)
        db.flush()

        sharing_gate = FrameworkGate(
            domain_id=sharing_domain.id,
            name="Sharing Assessment",
            description="Knowledge management and cross-team collaboration",
            order=1
        )
        db.add(sharing_gate)
        db.flush()

        sharing_questions = [
            {
                "text": "How well is your system and process knowledge documented?",
                "guidance": "Score 0 = No documentation, all knowledge is tribal | Score 1 = Scattered documentation in emails and personal notes | Score 2 = Minimal documentation, mostly outdated | Score 3 = Some documentation but incomplete or hard to find | Score 4 = Good documentation for most systems and processes | Score 5 = Comprehensive, up-to-date documentation that's easy to discover and use",
                "order": 1
            },
            {
                "text": "Do teams share tools, libraries, and code across the organization?",
                "guidance": "Score 0 = No sharing, every team builds everything from scratch | Score 1 = Teams aware of others' work but no formal sharing mechanism | Score 2 = Limited sharing, mostly duplicated efforts | Score 3 = Some shared libraries but not systematically promoted | Score 4 = Active sharing culture, reusable components common | Score 5 = Inner-source model, shared platforms and libraries are the norm",
                "order": 2
            },
            {
                "text": "Are team roadmaps and plans shared across the organization?",
                "guidance": "Score 0 = No, roadmaps are kept within teams or leadership | Score 1 = Roadmaps exist but difficult to find or access | Score 2 = Shared on request but not proactively | Score 3 = Shared in quarterly reviews but not maintained | Score 4 = Roadmaps publicly accessible and regularly updated | Score 5 = Full transparency, all roadmaps visible and collaboratively maintained",
                "order": 3
            },
            {
                "text": "Is dedicated time allocated for learning and development?",
                "guidance": "Score 0 = No learning time, must be done outside work hours | Score 1 = Learning acknowledged as valuable but no protected time | Score 2 = Learning happens only when convenient | Score 3 = Some learning time allocated but often sacrificed | Score 4 = Regular learning time (e.g., 10% time) protected | Score 5 = Learning is core to culture, dedicated time protected and encouraged",
                "order": 4
            },
            {
                "text": "Are learnings from conferences and training shared with others?",
                "guidance": "Score 0 = No, individuals keep learnings to themselves | Score 1 = Informal hallway conversations only | Score 2 = Occasionally shared informally | Score 3 = Some sharing in team meetings | Score 4 = Regular knowledge sharing sessions after external learning | Score 5 = Mandatory sharing, learnings documented and disseminated org-wide",
                "order": 5
            }
        ]

        for q_data in sharing_questions:
            question = FrameworkQuestion(
                gate_id=sharing_gate.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        db.commit()
        print("✅ Successfully seeded CALMS DevOps Framework")
        print(f"   - Framework: {framework.name}")
        print(f"   - Domains: 5 (Culture 25%, Automation 25%, Lean 15%, Measurement 20%, Sharing 15%)")
        print(f"   - Questions: 28 total (6+6+5+6+5)")
        print(f"   - Estimated completion time: 90 minutes")
        print()
        print("✨ Lightweight organizational readiness assessment ready for testing!")

    except Exception as e:
        print(f"❌ Error seeding CALMS framework: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_calms_framework()
