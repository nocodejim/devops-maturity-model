"""Seed CALMS Framework - Organizational DevOps Readiness Assessment"""

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Framework, FrameworkDomain, FrameworkGate, FrameworkQuestion


def seed_calms_framework():
    """
    Seed CALMS DevOps Framework

    CALMS = Culture, Automation, Lean, Measurement, Sharing
    Created by Jez Humble for assessing organizational DevOps readiness

    Structure:
    - 5 Domains (equal weight: 20% each)
    - 4 Gates per domain (20 gates total)
    - 5 Questions per gate (100 questions total)
    """
    db = SessionLocal()
    try:
        # Check if CALMS Framework already exists
        existing = db.query(Framework).filter(Framework.name == "CALMS DevOps Framework").first()
        if existing:
            print("CALMS Framework already exists. Use --force to recreate.")
            return

        # Create Framework
        framework = Framework(
            name="CALMS DevOps Framework",
            description="Organizational readiness assessment for DevOps transformation based on Jez Humble's CALMS model (Culture, Automation, Lean, Measurement, Sharing)",
            version="1.0"
        )
        db.add(framework)
        db.flush()
        print(f"Created framework: {framework.name}")

        # ============================================================
        # DOMAIN 1: CULTURE (20%)
        # ============================================================
        culture_domain = FrameworkDomain(
            framework_id=framework.id,
            name="Culture",
            description="Collaboration, blameless culture, and organizational mindset for DevOps adoption",
            weight=0.20,
            order=1
        )
        db.add(culture_domain)
        db.flush()

        # --- Gate 1.1: Cross-Functional Collaboration ---
        gate_1_1 = FrameworkGate(
            domain_id=culture_domain.id,
            name="Cross-Functional Collaboration",
            description="Assesses how well development and operations teams work together",
            order=1
        )
        db.add(gate_1_1)
        db.flush()

        questions_1_1 = [
            {
                "text": "How are your teams organized?",
                "guidance": "Score 0 = Strict functional silos (Dev, QA, Ops are completely separate teams) | Score 2 = Teams exist in silos but occasionally collaborate | Score 3 = Teams have representatives from different functions but report separately | Score 4 = Mostly cross-functional with some silo remnants | Score 5 = Fully cross-functional product teams with end-to-end ownership",
                "order": 1
            },
            {
                "text": "When a production issue occurs, how is it handled?",
                "guidance": "Score 0 = Operations fixes it alone, development is uninvolved or notified later | Score 2 = Dev is notified but Ops handles the fix | Score 3 = Dev and Ops communicate via tickets and handoffs | Score 4 = Dev and Ops coordinate in real-time but don't work together | Score 5 = Cross-functional team swarms on the problem together until resolved",
                "order": 2
            },
            {
                "text": "Do developers attend operations team meetings (and vice versa)?",
                "guidance": "Score 0 = Never, teams don't attend each other's meetings | Score 2 = Very rarely, only for major incidents | Score 3 = Occasionally for critical incidents or projects | Score 4 = Regularly for specific topics (releases, incidents) | Score 5 = Routine participation in standups, sprint planning, and retrospectives",
                "order": 3
            },
            {
                "text": "Who is accountable for production uptime and customer satisfaction?",
                "guidance": "Score 0 = Operations only - development has 'not our problem' attitude | Score 2 = Accountability defined as Ops but Dev helps sometimes | Score 3 = Shared accountability is stated but not practiced consistently | Score 4 = Shared accountability with clear escalation paths | Score 5 = 'You build it, you run it' - full shared ownership and on-call rotation",
                "order": 4
            },
            {
                "text": "How are incident post-mortems conducted?",
                "guidance": "Score 0 = Blame is assigned, individuals are held responsible for failures | Score 2 = Attempt to be blameless but finger-pointing still occurs | Score 3 = Process-focused but defensiveness present | Score 4 = Mostly blameless, focused on systemic issues with minor blame | Score 5 = Completely blameless, focuses on systemic improvements and learning",
                "order": 5
            }
        ]

        for q_data in questions_1_1:
            question = FrameworkQuestion(
                gate_id=gate_1_1.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # --- Gate 1.2: Blameless Culture ---
        gate_1_2 = FrameworkGate(
            domain_id=culture_domain.id,
            name="Blameless Culture",
            description="Evaluates how failures are handled and whether teams feel safe to experiment",
            order=2
        )
        db.add(gate_1_2)
        db.flush()

        questions_1_2 = [
            {
                "text": "How does your organization respond when someone makes a mistake that causes an outage?",
                "guidance": "Score 0 = Public blame, formal disciplinary action, fear-based culture | Score 2 = Private criticism, person feels shamed | Score 3 = Acknowledged as mistake, some defensiveness | Score 4 = Treated as learning opportunity with minor discomfort | Score 5 = Celebrated as learning opportunity, focus on preventing recurrence",
                "order": 1
            },
            {
                "text": "Are team members comfortable admitting when they don't know something?",
                "guidance": "Score 0 = No, fear of looking incompetent prevents admission | Score 2 = Rarely, only with close colleagues | Score 3 = Sometimes, depends on the situation | Score 4 = Usually comfortable in team settings | Score 5 = Yes, 'I don't know' is welcomed as learning opportunity",
                "order": 2
            },
            {
                "text": "How are near-misses (close calls that didn't cause outage) treated?",
                "guidance": "Score 0 = Ignored or swept under the rug | Score 2 = Noted but no action taken | Score 3 = Discussed informally but not documented | Score 4 = Documented and reviewed, some action taken | Score 5 = Treated with same rigor as actual incidents, proactively investigated",
                "order": 3
            },
            {
                "text": "Is it acceptable to fail when trying new approaches or experiments?",
                "guidance": "Score 0 = No, failure is punished or career-limiting | Score 2 = Tolerated reluctantly, viewed negatively | Score 3 = Accepted intellectually but not in practice | Score 4 = Encouraged in controlled environments (sandboxes) | Score 5 = Actively encouraged, 'if you're not failing, you're not trying hard enough'",
                "order": 4
            },
            {
                "text": "Do post-mortem documents focus on people or processes?",
                "guidance": "Score 0 = Focus on who was responsible and individual mistakes | Score 2 = Mix of individual and process blame | Score 3 = Attempt to focus on process but people mentioned | Score 4 = Mostly process-focused with systemic view | Score 5 = Entirely process/system focused, names only for context not blame",
                "order": 5
            }
        ]

        for q_data in questions_1_2:
            question = FrameworkQuestion(
                gate_id=gate_1_2.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # --- Gate 1.3: Communication & Transparency ---
        gate_1_3 = FrameworkGate(
            domain_id=culture_domain.id,
            name="Communication & Transparency",
            description="Measures openness of information sharing and decision-making processes",
            order=3
        )
        db.add(gate_1_3)
        db.flush()

        questions_1_3 = [
            {
                "text": "How easily can team members access information they need to do their jobs?",
                "guidance": "Score 0 = Information is siloed, requires multiple approvals to access | Score 2 = Available but hard to find, knowledge is tribal | Score 3 = Documented but spread across many systems | Score 4 = Centralized with search capabilities | Score 5 = Transparent by default, all information easily discoverable",
                "order": 1
            },
            {
                "text": "Are roadmaps and strategic decisions shared across the organization?",
                "guidance": "Score 0 = Kept confidential, shared only with leadership | Score 2 = Shared selectively with some teams | Score 3 = Shared after decisions are made | Score 4 = Shared during planning with limited input opportunity | Score 5 = Transparent planning process with stakeholder input invited",
                "order": 2
            },
            {
                "text": "When incidents occur, how is communication handled?",
                "guidance": "Score 0 = Information tightly controlled, customers left in dark | Score 2 = Internal only, external comms delayed | Score 3 = Status pages updated but minimal detail | Score 4 = Proactive internal and external communication | Score 5 = Real-time transparent communication internally and externally",
                "order": 3
            },
            {
                "text": "Can anyone see what other teams are working on?",
                "guidance": "Score 0 = No, work is hidden until complete | Score 2 = Only through formal status reports | Score 3 = Visible if you know where to look | Score 4 = Work is visible in shared tools (Jira, boards) | Score 5 = Radical transparency - all work visible and progress tracked openly",
                "order": 4
            },
            {
                "text": "How are decisions made and communicated?",
                "guidance": "Score 0 = Opaque, decisions appear without explanation | Score 2 = Announced after the fact with brief rationale | Score 3 = Communicated with rationale but no input sought | Score 4 = Input sought from stakeholders before decision | Score 5 = Transparent process, data shared, consensus built collaboratively",
                "order": 5
            }
        ]

        for q_data in questions_1_3:
            question = FrameworkQuestion(
                gate_id=gate_1_3.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # --- Gate 1.4: Organizational Support ---
        gate_1_4 = FrameworkGate(
            domain_id=culture_domain.id,
            name="Organizational Support",
            description="Evaluates leadership support and resource allocation for DevOps initiatives",
            order=4
        )
        db.add(gate_1_4)
        db.flush()

        questions_1_4 = [
            {
                "text": "Does executive leadership actively support DevOps transformation?",
                "guidance": "Score 0 = No support, seen as engineering fad | Score 2 = Passive support, no active involvement | Score 3 = Verbal support but limited resources | Score 4 = Active support with resources allocated | Score 5 = Champions transformation, removes obstacles, models behaviors",
                "order": 1
            },
            {
                "text": "Are teams given time and budget for improvement work (not just features)?",
                "guidance": "Score 0 = No, all time must go to features | Score 2 = Improvement work done in spare time | Score 3 = Occasional improvement sprints allowed | Score 4 = Regular time allocated (e.g., 20% time) | Score 5 = Improvement work prioritized equally with features",
                "order": 2
            },
            {
                "text": "Can teams make technical decisions without excessive approval processes?",
                "guidance": "Score 0 = All decisions require multi-level approval | Score 2 = Significant delays in approval process | Score 3 = Approval needed but reasonably quick | Score 4 = Teams empowered within guidelines | Score 5 = Teams fully empowered with trust-based governance",
                "order": 3
            },
            {
                "text": "How are teams incentivized or rewarded?",
                "guidance": "Score 0 = Individual metrics, competition between teams | Score 2 = Team metrics but siloed by function | Score 3 = Shared metrics but not acted upon | Score 4 = Cross-functional metrics with some rewards | Score 5 = Incentives aligned with DevOps outcomes (flow, quality, MTTR)",
                "order": 4
            },
            {
                "text": "Is there dedicated support for DevOps tooling and practices?",
                "guidance": "Score 0 = No support, teams figure it out themselves | Score 2 = Ad-hoc help from volunteers | Score 3 = Part-time platform/tools team | Score 4 = Dedicated team with limited capacity | Score 5 = Well-staffed platform engineering team enabling others",
                "order": 5
            }
        ]

        for q_data in questions_1_4:
            question = FrameworkQuestion(
                gate_id=gate_1_4.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # ============================================================
        # DOMAIN 2: AUTOMATION (20%)
        # ============================================================
        automation_domain = FrameworkDomain(
            framework_id=framework.id,
            name="Automation",
            description="Build, test, deploy, and infrastructure automation maturity",
            weight=0.20,
            order=2
        )
        db.add(automation_domain)
        db.flush()

        # --- Gate 2.1: Build & Integration Automation ---
        gate_2_1 = FrameworkGate(
            domain_id=automation_domain.id,
            name="Build & Integration Automation",
            description="Automated build and continuous integration practices",
            order=1
        )
        db.add(gate_2_1)
        db.flush()

        questions_2_1 = [
            {
                "text": "How are application builds created?",
                "guidance": "Score 0 = Manual build process requiring human intervention and tribal knowledge | Score 2 = Scripted builds but must be triggered manually | Score 3 = Automated on commit but inconsistent across projects | Score 4 = Fully automated CI with most projects using it | Score 5 = Automated CI for all projects, builds are consistent and repeatable",
                "order": 1
            },
            {
                "text": "How quickly do developers get build feedback?",
                "guidance": "Score 0 = No automated feedback, developers must manually check | Score 2 = Build results available but must be checked manually (>30 minutes) | Score 3 = Automated notification but slow builds (10-30 minutes) | Score 4 = Fast builds with automated notification (5-10 minutes) | Score 5 = Near-instant feedback (<5 minutes) with clear failure messages",
                "order": 2
            },
            {
                "text": "What happens when code is committed to version control?",
                "guidance": "Score 0 = Nothing automated happens | Score 2 = Manual trigger required to start build/test | Score 3 = Build triggered but tests not always run | Score 4 = Build and unit tests run automatically | Score 5 = Build, test, security scans, and quality checks run automatically",
                "order": 3
            },
            {
                "text": "Are build environments consistent across the team?",
                "guidance": "Score 0 = 'Works on my machine' - each developer has different setup | Score 2 = Documented setup but manual configuration required | Score 3 = Partially containerized or scripted setup | Score 4 = Fully containerized or VM-based consistent environments | Score 5 = Identical containerized environments used locally and in CI",
                "order": 4
            },
            {
                "text": "How are build artifacts managed and versioned?",
                "guidance": "Score 0 = No artifact management, files passed around manually | Score 2 = Artifacts stored but not versioned or tracked | Score 3 = Artifacts versioned but manual upload process | Score 4 = Automated artifact storage with versioning | Score 5 = Fully automated artifact repository with immutable versioning and retention policies",
                "order": 5
            }
        ]

        for q_data in questions_2_1:
            question = FrameworkQuestion(
                gate_id=gate_2_1.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # --- Gate 2.2: Test Automation ---
        gate_2_2 = FrameworkGate(
            domain_id=automation_domain.id,
            name="Test Automation",
            description="Automated testing coverage and practices",
            order=2
        )
        db.add(gate_2_2)
        db.flush()

        questions_2_2 = [
            {
                "text": "What percentage of your tests are automated?",
                "guidance": "Score 0 = 0-10% - Almost all testing is manual | Score 2 = 20-40% - Some unit tests automated | Score 3 = 50-70% - Good unit test coverage, some integration tests | Score 4 = 80-90% - Comprehensive automation including integration and E2E tests | Score 5 = 90%+ - Nearly complete automation across all test types",
                "order": 1
            },
            {
                "text": "When are automated tests executed?",
                "guidance": "Score 0 = Rarely or never - manual testing only | Score 2 = On-demand when someone remembers to run them | Score 3 = Daily or before major releases | Score 4 = On every commit in CI pipeline | Score 5 = Continuously - on commit, merge, deploy with fast feedback loops",
                "order": 2
            },
            {
                "text": "What types of testing are automated?",
                "guidance": "Score 0 = No automated tests | Score 2 = Only unit tests | Score 3 = Unit and some integration tests | Score 4 = Unit, integration, and some E2E/API tests | Score 5 = Full test pyramid: unit, integration, E2E, performance, security tests all automated",
                "order": 3
            },
            {
                "text": "How reliable are your automated tests?",
                "guidance": "Score 0 = No automated tests exist | Score 2 = Tests exist but are flaky, often ignored | Score 3 = Tests mostly reliable but occasional false failures | Score 4 = Tests are reliable, failures indicate real issues | Score 5 = Highly reliable tests, zero tolerance for flakiness, failures block deployment",
                "order": 4
            },
            {
                "text": "Can you run the full test suite quickly?",
                "guidance": "Score 0 = No automated test suite | Score 2 = Test suite exists but takes hours to run | Score 3 = Test suite runs in 30-60 minutes | Score 4 = Test suite runs in 10-30 minutes with parallelization | Score 5 = Fast feedback (<10 minutes) with intelligent test selection and parallelization",
                "order": 5
            }
        ]

        for q_data in questions_2_2:
            question = FrameworkQuestion(
                gate_id=gate_2_2.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # --- Gate 2.3: Deployment Automation ---
        gate_2_3 = FrameworkGate(
            domain_id=automation_domain.id,
            name="Deployment Automation",
            description="Automated deployment capabilities and frequency",
            order=3
        )
        db.add(gate_2_3)
        db.flush()

        questions_2_3 = [
            {
                "text": "How often do you deploy to production?",
                "guidance": "Score 0 = Rarely (quarterly or less) with high ceremony | Score 2 = Monthly or every few weeks with planned maintenance windows | Score 3 = Weekly deployments with some coordination needed | Score 4 = Daily deployments with minimal coordination | Score 5 = On-demand multiple times per day, fully automated",
                "order": 1
            },
            {
                "text": "What is required to deploy a change to production?",
                "guidance": "Score 0 = Manual steps, extensive documentation, multiple approvals, maintenance window | Score 2 = Mostly manual with some scripts, requires approvals | Score 3 = Semi-automated with some manual verification steps | Score 4 = Mostly automated, single-click deployment | Score 5 = Fully automated pipeline from commit to production (with appropriate gates)",
                "order": 2
            },
            {
                "text": "How consistent are deployments across environments?",
                "guidance": "Score 0 = Each environment deployed differently, manual process | Score 2 = Documented process but varies by environment | Score 3 = Scripted deployments but some manual differences | Score 4 = Same automated process for all environments | Score 5 = Identical automated pipeline promotes through all environments",
                "order": 3
            },
            {
                "text": "What happens if a deployment fails or causes issues?",
                "guidance": "Score 0 = Must fix forward, no rollback capability, extended outage | Score 2 = Manual rollback possible but complex and time-consuming | Score 3 = Semi-automated rollback but requires intervention | Score 4 = Automated rollback with some manual triggering | Score 5 = Automated detection and rollback, self-healing deployments",
                "order": 4
            },
            {
                "text": "How confident is the team when deploying?",
                "guidance": "Score 0 = High anxiety, deployments often fail, all-hands-on-deck events | Score 2 = Nervous, deploy only during business hours with full team present | Score 3 = Moderate confidence, occasional issues but manageable | Score 4 = Confident, deployments are routine with rare issues | Score 5 = Deployments are boring and routine, can deploy anytime without fear",
                "order": 5
            }
        ]

        for q_data in questions_2_3:
            question = FrameworkQuestion(
                gate_id=gate_2_3.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # --- Gate 2.4: Infrastructure Automation ---
        gate_2_4 = FrameworkGate(
            domain_id=automation_domain.id,
            name="Infrastructure Automation",
            description="Infrastructure as Code and provisioning automation",
            order=4
        )
        db.add(gate_2_4)
        db.flush()

        questions_2_4 = [
            {
                "text": "How is infrastructure provisioned?",
                "guidance": "Score 0 = Manual point-and-click through cloud console or manual server setup | Score 2 = Documented manual steps or basic scripts | Score 3 = Infrastructure as Code for some resources, mixed approach | Score 4 = Most infrastructure defined as code (Terraform, CloudFormation, etc.) | Score 5 = All infrastructure defined as code, version controlled, peer reviewed",
                "order": 1
            },
            {
                "text": "Can you recreate your infrastructure from scratch?",
                "guidance": "Score 0 = No, infrastructure is unique and irreplaceable ('pet' servers) | Score 2 = Possible but requires significant manual effort and tribal knowledge | Score 3 = Mostly possible with documentation and some automation | Score 4 = Can recreate with automated scripts, minor manual steps | Score 5 = Fully automated recreation, infrastructure is cattle not pets",
                "order": 2
            },
            {
                "text": "How are infrastructure changes managed?",
                "guidance": "Score 0 = Direct changes in production, no tracking or review | Score 2 = Changes documented after the fact | Score 3 = Change requests submitted but not consistently followed | Score 4 = Infrastructure changes go through code review like application code | Score 5 = Infrastructure changes automated, reviewed, tested in lower environments first",
                "order": 3
            },
            {
                "text": "How consistent are your environments (dev, test, staging, production)?",
                "guidance": "Score 0 = Completely different, production is snowflake | Score 2 = Documented as similar but many manual differences | Score 3 = Mostly similar with known differences | Score 4 = Provisioned from same IaC with environment-specific variables | Score 5 = Identical infrastructure code, only data/config differs between environments",
                "order": 4
            },
            {
                "text": "How is configuration management handled?",
                "guidance": "Score 0 = Manual configuration, tribal knowledge, no version control | Score 2 = Configuration documented but applied manually | Score 3 = Some automation (Ansible, Chef, Puppet) but inconsistent | Score 4 = Automated configuration management for most systems | Score 5 = Immutable infrastructure, configuration baked into images, no manual changes",
                "order": 5
            }
        ]

        for q_data in questions_2_4:
            question = FrameworkQuestion(
                gate_id=gate_2_4.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # ============================================================
        # DOMAIN 3: LEAN (20%)
        # ============================================================
        lean_domain = FrameworkDomain(
            framework_id=framework.id,
            name="Lean",
            description="Continuous improvement, experimentation, and waste reduction practices",
            weight=0.20,
            order=3
        )
        db.add(lean_domain)
        db.flush()

        # --- Gate 3.1: Continuous Improvement ---
        gate_3_1 = FrameworkGate(
            domain_id=lean_domain.id,
            name="Continuous Improvement",
            description="Regular retrospectives and kaizen practices",
            order=1
        )
        db.add(gate_3_1)
        db.flush()

        questions_3_1 = [
            {
                "text": "How often does your team hold retrospectives or improvement meetings?",
                "guidance": "Score 0 = Never, no time allocated for reflection | Score 2 = Rarely, only after major incidents or project completion | Score 3 = Quarterly or monthly, but often cancelled | Score 4 = Regularly scheduled (bi-weekly or after each sprint), mostly followed | Score 5 = Frequent retrospectives are ingrained in team culture, never skipped",
                "order": 1
            },
            {
                "text": "What happens to improvement ideas identified in retrospectives?",
                "guidance": "Score 0 = Nothing, ideas are forgotten after the meeting | Score 2 = Documented but rarely acted upon | Score 3 = Some actions taken but not tracked | Score 4 = Actions assigned, tracked, and most are completed | Score 5 = All improvement actions tracked, prioritized, and systematically implemented",
                "order": 2
            },
            {
                "text": "Is there dedicated time for improvement work?",
                "guidance": "Score 0 = No, all time goes to features and firefighting | Score 2 = Improvement happens in spare time or after hours | Score 3 = Occasional improvement sprints when time permits | Score 4 = Regular time allocated (e.g., 10-20% of sprint capacity) | Score 5 = Improvement work is prioritized equally with features, tracked as regular work",
                "order": 3
            },
            {
                "text": "How are process improvements shared across teams?",
                "guidance": "Score 0 = Not shared, each team operates independently | Score 2 = Ad-hoc sharing through informal conversations | Score 3 = Occasional presentations or brown bags | Score 4 = Regular forums for sharing improvements across teams | Score 5 = Systematic knowledge sharing, improvements documented and adopted org-wide",
                "order": 4
            },
            {
                "text": "Are small incremental improvements (kaizen) encouraged?",
                "guidance": "Score 0 = No, focus only on big initiatives | Score 2 = Small improvements tolerated but not prioritized | Score 3 = Encouraged verbally but not supported with time/resources | Score 4 = Actively encouraged and teams empowered to make small changes | Score 5 = Small continuous improvements are celebrated and core to team culture",
                "order": 5
            }
        ]

        for q_data in questions_3_1:
            question = FrameworkQuestion(
                gate_id=gate_3_1.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # --- Gate 3.2: Experimentation & Learning ---
        gate_3_2 = FrameworkGate(
            domain_id=lean_domain.id,
            name="Experimentation & Learning",
            description="Culture of experimentation and learning from failure",
            order=2
        )
        db.add(gate_3_2)
        db.flush()

        questions_3_2 = [
            {
                "text": "How does your organization approach new ideas and innovations?",
                "guidance": "Score 0 = New ideas discouraged, 'we've always done it this way' culture | Score 2 = Ideas welcomed but rarely tested or implemented | Score 3 = Some experimentation allowed but requires extensive approval | Score 4 = Teams encouraged to experiment within guardrails | Score 5 = Experimentation is actively encouraged, fast fail-forward culture",
                "order": 1
            },
            {
                "text": "Are teams given permission to run experiments?",
                "guidance": "Score 0 = No, all work must be approved and deliver business value | Score 2 = Experiments allowed only during hackathons or special events | Score 3 = Limited experimentation time (e.g., 10% time) but rarely used | Score 4 = Regular experimentation time allocated and actually used | Score 5 = Experiments are core to workflow, hypothesis-driven development is standard",
                "order": 2
            },
            {
                "text": "How are failed experiments treated?",
                "guidance": "Score 0 = Failure is punished, kills career advancement | Score 2 = Tolerated reluctantly, seen as wasted time | Score 3 = Accepted if lessons are learned, but some stigma remains | Score 4 = Viewed as valuable learning, failures are shared | Score 5 = Celebrated as learning opportunities, 'fail fast' is rewarded",
                "order": 3
            },
            {
                "text": "Are A/B testing or proof-of-concept approaches used?",
                "guidance": "Score 0 = Never, all features built and deployed fully | Score 2 = Occasionally for major features only | Score 3 = Sometimes used but not systematically | Score 4 = Regularly used for new features and changes | Score 5 = Standard practice, data-driven experimentation is the default approach",
                "order": 4
            },
            {
                "text": "How much do teams learn from external sources (competitors, industry, research)?",
                "guidance": "Score 0 = No external learning, team works in isolation | Score 2 = Occasional conference attendance but learnings not shared | Score 3 = Some external learning but not systematically applied | Score 4 = Regular external learning, teams attend conferences and share insights | Score 5 = Continuous learning culture, teams actively seek and apply external knowledge",
                "order": 5
            }
        ]

        for q_data in questions_3_2:
            question = FrameworkQuestion(
                gate_id=gate_3_2.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # --- Gate 3.3: Waste Reduction ---
        gate_3_3 = FrameworkGate(
            domain_id=lean_domain.id,
            name="Waste Reduction",
            description="Identification and elimination of process waste",
            order=3
        )
        db.add(gate_3_3)
        db.flush()

        questions_3_3 = [
            {
                "text": "Are bottlenecks in your workflow identified and addressed?",
                "guidance": "Score 0 = Bottlenecks not identified or ignored | Score 2 = Bottlenecks known but not prioritized for resolution | Score 3 = Some bottlenecks addressed reactively | Score 4 = Bottlenecks actively identified and mostly addressed | Score 5 = Continuous bottleneck identification and elimination, theory of constraints applied",
                "order": 1
            },
            {
                "text": "How much work-in-progress (WIP) does your team carry?",
                "guidance": "Score 0 = Unlimited WIP, everyone multitasks across many items | Score 2 = High WIP, work often sits waiting for long periods | Score 3 = Some awareness of WIP but no limits enforced | Score 4 = WIP limits set and mostly followed | Score 5 = Strict WIP limits enforced, focus on finishing over starting",
                "order": 2
            },
            {
                "text": "How many handoffs occur between starting and completing work?",
                "guidance": "Score 0 = Many handoffs across multiple teams and functions | Score 2 = Several handoffs but documented | Score 3 = Some handoffs, working to reduce | Score 4 = Minimal handoffs, teams mostly autonomous | Score 5 = Nearly zero handoffs, full end-to-end ownership by team",
                "order": 3
            },
            {
                "text": "How much time is wasted waiting for approvals, resources, or other teams?",
                "guidance": "Score 0 = Significant waiting time, weeks or months of delay | Score 2 = Frequent waiting, days to weeks | Score 3 = Some waiting time, working to reduce | Score 4 = Minimal waiting, most dependencies resolved quickly | Score 5 = Almost no waiting, teams are empowered and self-sufficient",
                "order": 4
            },
            {
                "text": "Is there visibility into waste and inefficiency in your processes?",
                "guidance": "Score 0 = No measurement or awareness of waste | Score 2 = Anecdotal awareness but not measured | Score 3 = Some metrics on waste (waiting time, rework) collected | Score 4 = Waste is measured and visible to the team | Score 5 = Comprehensive waste tracking, visible to all, drives continuous improvement",
                "order": 5
            }
        ]

        for q_data in questions_3_3:
            question = FrameworkQuestion(
                gate_id=gate_3_3.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # --- Gate 3.4: Value Stream Optimization ---
        gate_3_4 = FrameworkGate(
            domain_id=lean_domain.id,
            name="Value Stream Optimization",
            description="Work visualization and flow optimization",
            order=4
        )
        db.add(gate_3_4)
        db.flush()

        questions_3_4 = [
            {
                "text": "Is work visualized (e.g., on Kanban boards or similar tools)?",
                "guidance": "Score 0 = No work visualization, status is tribal knowledge | Score 2 = Work tracked in tools but not visually displayed | Score 3 = Some visualization but incomplete or out of date | Score 4 = All work visualized and kept current | Score 5 = Real-time visualization of all work, visible to entire team and stakeholders",
                "order": 1
            },
            {
                "text": "Are lead times (concept to delivery) measured?",
                "guidance": "Score 0 = Lead time not measured or understood | Score 2 = Rough estimates but not systematically tracked | Score 3 = Lead time tracked for some work items | Score 4 = Lead time consistently measured for all work | Score 5 = Lead time measured, trended, and actively optimized",
                "order": 2
            },
            {
                "text": "How well does work flow through your delivery pipeline?",
                "guidance": "Score 0 = Work constantly blocked, starts and stops frequently | Score 2 = Flow is choppy, work often waits | Score 3 = Moderate flow with some interruptions | Score 4 = Good flow, work moves steadily with few blocks | Score 5 = Smooth continuous flow, work moves from start to done with minimal delay",
                "order": 3
            },
            {
                "text": "Is customer value prioritized over activity or output?",
                "guidance": "Score 0 = Focus on keeping busy, output over outcomes | Score 2 = Mix of busy work and value delivery | Score 3 = Value discussed but activity still prioritized | Score 4 = Value mostly prioritized, clear focus on outcomes | Score 5 = Strict value focus, no work done that doesn't serve customer value",
                "order": 4
            },
            {
                "text": "Has value stream mapping been done for your key workflows?",
                "guidance": "Score 0 = No, workflows not mapped or understood end-to-end | Score 2 = Informal understanding but not documented | Score 3 = Some value streams mapped but not maintained | Score 4 = Key value streams mapped and occasionally reviewed | Score 5 = All value streams mapped, regularly reviewed and optimized",
                "order": 5
            }
        ]

        for q_data in questions_3_4:
            question = FrameworkQuestion(
                gate_id=gate_3_4.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # ============================================================
        # DOMAIN 4: MEASUREMENT (20%)
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

        # --- Gate 4.1: Deployment Metrics ---
        gate_4_1 = FrameworkGate(
            domain_id=measurement_domain.id,
            name="Deployment Metrics",
            description="DORA metrics: deployment frequency, lead time, MTTR, change failure rate",
            order=1
        )
        db.add(gate_4_1)
        db.flush()

        questions_4_1 = [
            {
                "text": "Do you track deployment frequency (how often you deploy to production)?",
                "guidance": "Score 0 = Not tracked or unknown | Score 2 = Rough estimates, not systematically tracked | Score 3 = Tracked manually for some projects | Score 4 = Automated tracking across most projects | Score 5 = Comprehensive automated tracking with trending and benchmarking",
                "order": 1
            },
            {
                "text": "Do you measure lead time for changes (commit to production)?",
                "guidance": "Score 0 = Not measured or unknown | Score 2 = Anecdotal estimates only | Score 3 = Measured for some changes or projects | Score 4 = Systematically measured for all changes | Score 5 = Real-time measurement with dashboards and continuous optimization",
                "order": 2
            },
            {
                "text": "Is Mean Time to Recovery (MTTR) tracked when incidents occur?",
                "guidance": "Score 0 = Not tracked, downtime duration unknown | Score 2 = Estimated after the fact, not precise | Score 3 = Tracked for major incidents only | Score 4 = Tracked for all incidents with consistent methodology | Score 5 = Automated MTTR tracking with alerts when trending negatively",
                "order": 3
            },
            {
                "text": "Do you measure change failure rate (% of deployments causing issues)?",
                "guidance": "Score 0 = Not measured, unknown how often deployments fail | Score 2 = Rough estimates based on memory | Score 3 = Tracked informally or for major releases only | Score 4 = Systematically tracked for all deployments | Score 5 = Automated tracking with root cause analysis and trending",
                "order": 4
            },
            {
                "text": "Are DORA metrics reviewed and used to improve?",
                "guidance": "Score 0 = Metrics not collected or reviewed | Score 2 = Collected but rarely reviewed | Score 3 = Reviewed quarterly or after incidents | Score 4 = Reviewed regularly (monthly) with improvement actions | Score 5 = Real-time monitoring, continuous improvement based on metrics",
                "order": 5
            }
        ]

        for q_data in questions_4_1:
            question = FrameworkQuestion(
                gate_id=gate_4_1.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # --- Gate 4.2: System Health Metrics ---
        gate_4_2 = FrameworkGate(
            domain_id=measurement_domain.id,
            name="System Health Metrics",
            description="Uptime, performance, error rates, resource utilization",
            order=2
        )
        db.add(gate_4_2)
        db.flush()

        questions_4_2 = [
            {
                "text": "Is system uptime/availability measured?",
                "guidance": "Score 0 = Not measured, only know when users complain | Score 2 = Basic uptime monitoring but not comprehensive | Score 3 = Uptime tracked for critical services | Score 4 = Comprehensive uptime tracking with SLA reporting | Score 5 = Real-time availability monitoring with automated alerting and SLO tracking",
                "order": 1
            },
            {
                "text": "Are application performance metrics collected (response time, latency, throughput)?",
                "guidance": "Score 0 = No performance monitoring | Score 2 = Basic monitoring (server CPU/memory only) | Score 3 = Application-level metrics for some services | Score 4 = Comprehensive APM (Application Performance Monitoring) for most services | Score 5 = Full observability stack with distributed tracing and real user monitoring",
                "order": 2
            },
            {
                "text": "Are error rates and exceptions tracked?",
                "guidance": "Score 0 = No error tracking, rely on user reports | Score 2 = Logs exist but not actively monitored | Score 3 = Error tracking for some applications | Score 4 = Centralized error tracking with alerts | Score 5 = Comprehensive error tracking with context, grouping, and automated assignment",
                "order": 3
            },
            {
                "text": "Is resource utilization (CPU, memory, disk, network) monitored?",
                "guidance": "Score 0 = No monitoring, issues discovered when systems crash | Score 2 = Basic monitoring on some servers | Score 3 = Monitoring on most systems but not proactive | Score 4 = Comprehensive monitoring with alerting | Score 5 = Advanced monitoring with predictive analytics and auto-scaling",
                "order": 4
            },
            {
                "text": "Can you quickly identify the root cause of performance issues?",
                "guidance": "Score 0 = No, troubleshooting is guesswork and takes days | Score 2 = Possible but requires extensive log digging | Score 3 = Usually possible with some investigation (hours) | Score 4 = Quickly identified with monitoring tools (minutes) | Score 5 = Instantly visible with observability tools, automated root cause analysis",
                "order": 5
            }
        ]

        for q_data in questions_4_2:
            question = FrameworkQuestion(
                gate_id=gate_4_2.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # --- Gate 4.3: Business Metrics ---
        gate_4_3 = FrameworkGate(
            domain_id=measurement_domain.id,
            name="Business Metrics",
            description="User engagement, feature adoption, customer satisfaction",
            order=3
        )
        db.add(gate_4_3)
        db.flush()

        questions_4_3 = [
            {
                "text": "Are user engagement metrics tracked (active users, session duration, etc.)?",
                "guidance": "Score 0 = No user analytics or tracking | Score 2 = Basic analytics (page views) but limited insight | Score 3 = User engagement tracked for some features | Score 4 = Comprehensive user analytics across application | Score 5 = Advanced analytics with cohort analysis, user journeys, and retention metrics",
                "order": 1
            },
            {
                "text": "Is feature adoption measured (which features are used, by whom, how often)?",
                "guidance": "Score 0 = Unknown which features are used | Score 2 = Anecdotal feedback only | Score 3 = Some feature usage tracking | Score 4 = Systematic feature usage tracking | Score 5 = Detailed feature analytics with A/B testing and impact measurement",
                "order": 2
            },
            {
                "text": "Is customer satisfaction measured (NPS, CSAT, customer feedback)?",
                "guidance": "Score 0 = No customer satisfaction measurement | Score 2 = Occasional surveys, results not widely shared | Score 3 = Regular surveys but limited action on results | Score 4 = Systematic measurement with improvement actions | Score 5 = Continuous feedback loops, satisfaction tied to team objectives",
                "order": 3
            },
            {
                "text": "Can you quantify the business value or ROI of features and improvements?",
                "guidance": "Score 0 = No, business value is not measured | Score 2 = Estimated before work but not validated | Score 3 = Some post-deployment measurement | Score 4 = Systematic measurement of business impact | Score 5 = Rigorous measurement with A/B testing, clear ROI tracking",
                "order": 4
            },
            {
                "text": "Are business metrics visible to engineering teams?",
                "guidance": "Score 0 = No, engineering is disconnected from business outcomes | Score 2 = Shared occasionally in executive updates | Score 3 = Some visibility but not integrated into workflow | Score 4 = Business metrics visible on dashboards teams monitor | Score 5 = Full visibility, engineering teams own business metrics and optimize for them",
                "order": 5
            }
        ]

        for q_data in questions_4_3:
            question = FrameworkQuestion(
                gate_id=gate_4_3.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # --- Gate 4.4: Data-Driven Decisions ---
        gate_4_4 = FrameworkGate(
            domain_id=measurement_domain.id,
            name="Data-Driven Decisions",
            description="Visibility and use of metrics in decision-making",
            order=4
        )
        db.add(gate_4_4)
        db.flush()

        questions_4_4 = [
            {
                "text": "Are metrics visible and accessible to teams?",
                "guidance": "Score 0 = No metrics or dashboards available | Score 2 = Metrics exist but hard to access, require special tools | Score 3 = Some dashboards but not comprehensive | Score 4 = Comprehensive dashboards easily accessible | Score 5 = Real-time metrics on TVs/monitors, embedded in team workflow",
                "order": 1
            },
            {
                "text": "How often are metrics reviewed by teams?",
                "guidance": "Score 0 = Never or rarely | Score 2 = Quarterly or when problems arise | Score 3 = Monthly in retrospectives or reviews | Score 4 = Weekly in team meetings | Score 5 = Daily as part of standups and continuous monitoring",
                "order": 2
            },
            {
                "text": "Are decisions based on data or gut feeling/intuition?",
                "guidance": "Score 0 = All decisions based on intuition or authority | Score 2 = Some data considered but mostly gut feel | Score 3 = Mix of data and intuition | Score 4 = Most decisions backed by data | Score 5 = Strong data-driven culture, decisions require data support",
                "order": 3
            },
            {
                "text": "Is there a feedback loop from metrics to action?",
                "guidance": "Score 0 = No, metrics are passive, not acted upon | Score 2 = Metrics reviewed but actions rarely taken | Score 3 = Some action taken when metrics are concerning | Score 4 = Clear process for acting on metric trends | Score 5 = Automated actions based on metrics (alerts, auto-scaling, circuit breakers)",
                "order": 4
            },
            {
                "text": "Are teams trained to interpret and use metrics effectively?",
                "guidance": "Score 0 = No training, metrics misunderstood or ignored | Score 2 = Basic understanding but limited analytical skills | Score 3 = Some team members skilled in data analysis | Score 4 = Most team members comfortable with metrics | Score 5 = Strong data literacy across teams, everyone uses metrics confidently",
                "order": 5
            }
        ]

        for q_data in questions_4_4:
            question = FrameworkQuestion(
                gate_id=gate_4_4.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # ============================================================
        # DOMAIN 5: SHARING (20%)
        # ============================================================
        sharing_domain = FrameworkDomain(
            framework_id=framework.id,
            name="Sharing",
            description="Knowledge sharing, collaboration, and organizational learning",
            weight=0.20,
            order=5
        )
        db.add(sharing_domain)
        db.flush()

        # --- Gate 5.1: Knowledge Management ---
        gate_5_1 = FrameworkGate(
            domain_id=sharing_domain.id,
            name="Knowledge Management",
            description="Documentation, runbooks, and reducing tribal knowledge",
            order=1
        )
        db.add(gate_5_1)
        db.flush()

        questions_5_1 = [
            {
                "text": "How well is your system and process knowledge documented?",
                "guidance": "Score 0 = No documentation, all knowledge is tribal | Score 2 = Minimal documentation, mostly outdated | Score 3 = Some documentation but incomplete or hard to find | Score 4 = Good documentation for most systems and processes | Score 5 = Comprehensive, up-to-date documentation that's easy to discover and use",
                "order": 1
            },
            {
                "text": "Are runbooks and playbooks available for common operations?",
                "guidance": "Score 0 = No runbooks, operations require expert knowledge | Score 2 = Some runbooks exist but rarely used or maintained | Score 3 = Runbooks for critical processes but not comprehensive | Score 4 = Runbooks for most operations, regularly updated | Score 5 = Complete runbooks for all operations, automated where possible, regularly tested",
                "order": 2
            },
            {
                "text": "How much critical knowledge exists only in people's heads (tribal knowledge)?",
                "guidance": "Score 0 = Most knowledge is tribal, massive key person risk | Score 2 = Significant tribal knowledge, difficult when people are absent | Score 3 = Some tribal knowledge being documented | Score 4 = Most knowledge is documented, minimal tribal knowledge | Score 5 = Nearly zero tribal knowledge, all critical information documented and shared",
                "order": 3
            },
            {
                "text": "Is documentation treated as part of the work (not an afterthought)?",
                "guidance": "Score 0 = Documentation never prioritized, always skipped | Score 2 = Documentation happens after the fact if there's time | Score 3 = Documentation requested but often skipped | Score 4 = Documentation is part of definition of done | Score 5 = Documentation is integral to work, automated where possible, kept current",
                "order": 4
            },
            {
                "text": "Can new team members onboard using available documentation?",
                "guidance": "Score 0 = No, onboarding requires weeks of shadowing experts | Score 2 = Some help but heavy reliance on mentoring | Score 3 = Documentation helps but still needs significant hand-holding | Score 4 = New members can onboard with minimal help | Score 5 = Self-service onboarding, documentation so good new members are productive quickly",
                "order": 5
            }
        ]

        for q_data in questions_5_1:
            question = FrameworkQuestion(
                gate_id=gate_5_1.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # --- Gate 5.2: Cross-Team Collaboration ---
        gate_5_2 = FrameworkGate(
            domain_id=sharing_domain.id,
            name="Cross-Team Collaboration",
            description="Sharing tools, practices, and inner-source",
            order=2
        )
        db.add(gate_5_2)
        db.flush()

        questions_5_2 = [
            {
                "text": "Do teams share tools, libraries, and code across the organization?",
                "guidance": "Score 0 = No sharing, every team builds everything from scratch | Score 2 = Limited sharing, mostly duplicated efforts | Score 3 = Some shared libraries but not systematically promoted | Score 4 = Active sharing culture, reusable components common | Score 5 = Inner-source model, shared platforms and libraries are the norm",
                "order": 1
            },
            {
                "text": "Are best practices shared across teams?",
                "guidance": "Score 0 = No, teams operate independently with no knowledge sharing | Score 2 = Informal sharing through personal networks | Score 3 = Occasional sharing via email or presentations | Score 4 = Regular forums for sharing practices (guilds, CoPs) | Score 5 = Systematic knowledge sharing, best practices documented and promoted org-wide",
                "order": 2
            },
            {
                "text": "Is there cross-team code review or contribution?",
                "guidance": "Score 0 = No, teams never look at other teams' code | Score 2 = Rare, only for critical shared components | Score 3 = Occasional cross-team review for integration points | Score 4 = Regular cross-team reviews encouraged | Score 5 = Inner-source model, teams regularly contribute to each other's codebases",
                "order": 3
            },
            {
                "text": "Are communities of practice (CoPs) or guilds active?",
                "guidance": "Score 0 = None exist | Score 2 = Some CoPs exist but inactive or poorly attended | Score 3 = A few active CoPs but limited impact | Score 4 = Multiple active CoPs with regular meetings and sharing | Score 5 = Thriving CoP culture, significant impact on org practices and standards",
                "order": 4
            },
            {
                "text": "How easily can you find expertise in other teams?",
                "guidance": "Score 0 = Impossible, no visibility into other teams' skills | Score 2 = Requires asking around through personal networks | Score 3 = Some directories or wikis but often outdated | Score 4 = Easy to find experts through maintained directories or tools | Score 5 = Expert discovery is seamless, skills and contributions are visible org-wide",
                "order": 5
            }
        ]

        for q_data in questions_5_2:
            question = FrameworkQuestion(
                gate_id=gate_5_2.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # --- Gate 5.3: Transparency & Visibility ---
        gate_5_3 = FrameworkGate(
            domain_id=sharing_domain.id,
            name="Transparency & Visibility",
            description="Shared roadmaps, visible progress, open communication",
            order=3
        )
        db.add(gate_5_3)
        db.flush()

        questions_5_3 = [
            {
                "text": "Are team roadmaps and plans shared across the organization?",
                "guidance": "Score 0 = No, roadmaps are kept within teams or leadership | Score 2 = Shared on request but not proactively | Score 3 = Shared in quarterly reviews but not maintained | Score 4 = Roadmaps publicly accessible and regularly updated | Score 5 = Full transparency, all roadmaps visible and collaboratively maintained",
                "order": 1
            },
            {
                "text": "Is work progress visible to other teams and stakeholders?",
                "guidance": "Score 0 = No visibility, work is black box until complete | Score 2 = Status reports sent out but infrequent | Score 3 = Work visible in tools but requires access/knowledge | Score 4 = Progress dashboards easily accessible | Score 5 = Real-time visibility of all work across the organization",
                "order": 2
            },
            {
                "text": "How are incidents and outages communicated?",
                "guidance": "Score 0 = Not communicated or only after resolution | Score 2 = Internal notification after incident | Score 3 = Status page with basic updates | Score 4 = Proactive communication internally and externally during incidents | Score 5 = Transparent real-time incident communication with detailed postmortems shared publicly",
                "order": 3
            },
            {
                "text": "Can anyone see what's being worked on and why?",
                "guidance": "Score 0 = No, work and priorities are opaque | Score 2 = Visible only within immediate team | Score 3 = Some visibility through project management tools | Score 4 = Work and context visible to anyone in the org | Score 5 = Radical transparency, all work visible with clear business context and rationale",
                "order": 4
            },
            {
                "text": "Are successes and failures shared openly?",
                "guidance": "Score 0 = No sharing, teams keep both private | Score 2 = Successes celebrated, failures hidden | Score 3 = Some sharing in team meetings | Score 4 = Regular sharing of both successes and failures | Score 5 = Open culture of sharing wins and losses, learning celebrated publicly",
                "order": 5
            }
        ]

        for q_data in questions_5_3:
            question = FrameworkQuestion(
                gate_id=gate_5_3.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        # --- Gate 5.4: Learning & Development ---
        gate_5_4 = FrameworkGate(
            domain_id=sharing_domain.id,
            name="Learning & Development",
            description="Training, conferences, communities of practice",
            order=4
        )
        db.add(gate_5_4)
        db.flush()

        questions_5_4 = [
            {
                "text": "Is dedicated time allocated for learning and development?",
                "guidance": "Score 0 = No learning time, must be done outside work hours | Score 2 = Learning happens only when convenient | Score 3 = Some learning time allocated but often sacrificed | Score 4 = Regular learning time (e.g., 10% time) protected | Score 5 = Learning is core to culture, dedicated time protected and encouraged",
                "order": 1
            },
            {
                "text": "Are team members supported to attend conferences and training?",
                "guidance": "Score 0 = Never, no budget or approval for external learning | Score 2 = Rarely approved, limited budget | Score 3 = Available but competitive, not everyone gets opportunities | Score 4 = Regular conference/training attendance supported | Score 5 = Generous learning budget, attendance encouraged and learnings shared org-wide",
                "order": 2
            },
            {
                "text": "Are learnings from conferences and training shared with others?",
                "guidance": "Score 0 = No, individuals keep learnings to themselves | Score 2 = Occasionally shared informally | Score 3 = Some sharing in team meetings | Score 4 = Regular knowledge sharing sessions after external learning | Score 5 = Mandatory sharing, learnings documented and disseminated org-wide",
                "order": 3
            },
            {
                "text": "Are internal training sessions or brown bags held?",
                "guidance": "Score 0 = Never, no internal knowledge sharing sessions | Score 2 = Rare, only for critical topics | Score 3 = Occasional brown bags or lunch-and-learns | Score 4 = Regular internal training sessions well-attended | Score 5 = Thriving internal learning culture, frequent sessions with high participation",
                "order": 4
            },
            {
                "text": "Is continuous learning valued and rewarded?",
                "guidance": "Score 0 = No, learning seen as waste of time | Score 2 = Tolerated but not valued in performance reviews | Score 3 = Mentioned as important but not reflected in practice | Score 4 = Learning considered in performance reviews and advancement | Score 5 = Learning is core value, celebrated and directly tied to career growth",
                "order": 5
            }
        ]

        for q_data in questions_5_4:
            question = FrameworkQuestion(
                gate_id=gate_5_4.id,
                text=q_data["text"],
                guidance=q_data["guidance"],
                order=q_data["order"]
            )
            db.add(question)

        db.commit()
        print("✅ Successfully seeded CALMS DevOps Framework")
        print(f"   - Framework: {framework.name}")
        print(f"   - Domains: 5 (Culture, Automation, Lean, Measurement, Sharing)")
        print(f"   - Gates: 20 (4 per domain)")
        print(f"   - Questions: 100 (5 per gate)")
        print()
        print("✨ All domains have fully detailed questions with comprehensive guidance!")
        print("   Ready for organizational DevOps readiness assessment.")

    except Exception as e:
        print(f"❌ Error seeding CALMS framework: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_calms_framework()
