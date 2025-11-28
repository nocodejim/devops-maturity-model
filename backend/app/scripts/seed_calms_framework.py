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

        # Gates 2.1-2.4 (Build, Test, Deploy, Infrastructure automation)
        # Simplified for brevity - would have full questions like Culture domain

        gates_2 = [
            ("Build & Integration Automation", "Automated build and continuous integration practices", 1),
            ("Test Automation", "Automated testing coverage and practices", 2),
            ("Deployment Automation", "Automated deployment capabilities and frequency", 3),
            ("Infrastructure Automation", "Infrastructure as Code and provisioning automation", 4),
        ]

        for gate_name, gate_desc, gate_order in gates_2:
            gate = FrameworkGate(
                domain_id=automation_domain.id,
                name=gate_name,
                description=gate_desc,
                order=gate_order
            )
            db.add(gate)
            db.flush()

            # Add 5 placeholder questions per gate
            for q_num in range(1, 6):
                question = FrameworkQuestion(
                    gate_id=gate.id,
                    text=f"{gate_name} - Question {q_num} (to be defined)",
                    guidance=f"Score 0 = No {gate_name.lower()} | Score 3 = Partial automation | Score 5 = Full automation",
                    order=q_num
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

        gates_3 = [
            ("Continuous Improvement", "Regular retrospectives and kaizen practices", 1),
            ("Experimentation & Learning", "Culture of experimentation and learning from failure", 2),
            ("Waste Reduction", "Identification and elimination of process waste", 3),
            ("Value Stream Optimization", "Work visualization and flow optimization", 4),
        ]

        for gate_name, gate_desc, gate_order in gates_3:
            gate = FrameworkGate(
                domain_id=lean_domain.id,
                name=gate_name,
                description=gate_desc,
                order=gate_order
            )
            db.add(gate)
            db.flush()

            for q_num in range(1, 6):
                question = FrameworkQuestion(
                    gate_id=gate.id,
                    text=f"{gate_name} - Question {q_num} (to be defined)",
                    guidance=f"Score 0 = No {gate_name.lower()} practices | Score 3 = Some practices | Score 5 = Mature practices",
                    order=q_num
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

        gates_4 = [
            ("Deployment Metrics", "DORA metrics: deployment frequency, lead time, MTTR, change failure rate", 1),
            ("System Health Metrics", "Uptime, performance, error rates, resource utilization", 2),
            ("Business Metrics", "User engagement, feature adoption, customer satisfaction", 3),
            ("Data-Driven Decisions", "Visibility and use of metrics in decision-making", 4),
        ]

        for gate_name, gate_desc, gate_order in gates_4:
            gate = FrameworkGate(
                domain_id=measurement_domain.id,
                name=gate_name,
                description=gate_desc,
                order=gate_order
            )
            db.add(gate)
            db.flush()

            for q_num in range(1, 6):
                question = FrameworkQuestion(
                    gate_id=gate.id,
                    text=f"{gate_name} - Question {q_num} (to be defined)",
                    guidance=f"Score 0 = No metrics collected | Score 3 = Metrics collected but not used | Score 5 = Metrics drive decisions",
                    order=q_num
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

        gates_5 = [
            ("Knowledge Management", "Documentation, runbooks, and reducing tribal knowledge", 1),
            ("Cross-Team Collaboration", "Sharing tools, practices, and inner-source", 2),
            ("Transparency & Visibility", "Shared roadmaps, visible progress, open communication", 3),
            ("Learning & Development", "Training, conferences, communities of practice", 4),
        ]

        for gate_name, gate_desc, gate_order in gates_5:
            gate = FrameworkGate(
                domain_id=sharing_domain.id,
                name=gate_name,
                description=gate_desc,
                order=gate_order
            )
            db.add(gate)
            db.flush()

            for q_num in range(1, 6):
                question = FrameworkQuestion(
                    gate_id=gate.id,
                    text=f"{gate_name} - Question {q_num} (to be defined)",
                    guidance=f"Score 0 = No sharing practices | Score 3 = Ad-hoc sharing | Score 5 = Systematic sharing",
                    order=q_num
                )
                db.add(question)

        db.commit()
        print("✅ Successfully seeded CALMS DevOps Framework")
        print(f"   - Framework: {framework.name}")
        print(f"   - Domains: 5 (Culture, Automation, Lean, Measurement, Sharing)")
        print(f"   - Gates: 20 (4 per domain)")
        print(f"   - Questions: 100 (5 per gate)")
        print()
        print("📝 NOTE: Culture domain has fully detailed questions.")
        print("   Other domains have placeholder questions marked '(to be defined)'")
        print("   These should be replaced with proper assessment questions.")

    except Exception as e:
        print(f"❌ Error seeding CALMS framework: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_calms_framework()
