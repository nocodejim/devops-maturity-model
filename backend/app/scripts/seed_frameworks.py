"""Seed frameworks data"""

import asyncio
import uuid
import enum
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Framework, FrameworkDomain, FrameworkGate, FrameworkQuestion
from app.core.gates import GATES_DEFINITION

# Define local DomainType for mapping purposes (matching what is in gates.py)
class DomainType(str, enum.Enum):
    DOMAIN1 = "domain1"
    DOMAIN2 = "domain2"
    DOMAIN3 = "domain3"
    DOMAIN4 = "domain4"
    DOMAIN5 = "domain5"

# Domain weights and names (moved from scoring.py)
DOMAIN_WEIGHTS = {
    DomainType.DOMAIN1: 0.15,
    DomainType.DOMAIN2: 0.25,
    DomainType.DOMAIN3: 0.25,
    DomainType.DOMAIN4: 0.20,
    DomainType.DOMAIN5: 0.15,
}

DOMAIN_NAMES = {
    DomainType.DOMAIN1: "Source Control & Development Practices",
    DomainType.DOMAIN2: "Security & Compliance",
    DomainType.DOMAIN3: "CI/CD & Deployment",
    DomainType.DOMAIN4: "Infrastructure & Platform Engineering",
    DomainType.DOMAIN5: "Observability & Continuous Improvement",
}

def seed_frameworks():
    db = SessionLocal()
    try:
        # Check if Default Framework exists
        existing = db.query(Framework).filter(Framework.name == "DevOps Maturity MVP").first()
        if existing:
            print("Framework already exists")
            return

        # Create Framework
        framework = Framework(
            name="DevOps Maturity MVP",
            description="Standard 5-domain DevOps maturity assessment",
            version="1.0"
        )
        db.add(framework)
        db.flush()

        # Create Domains
        domain_map = {} # DomainType -> Domain UUID

        # We need to iterate over DOMAIN_WEIGHTS to get all domains
        # Sort by key to ensure order
        sorted_domains = sorted(DOMAIN_WEIGHTS.keys())

        for idx, domain_type in enumerate(sorted_domains):
            weight = DOMAIN_WEIGHTS[domain_type]
            name = DOMAIN_NAMES[domain_type]

            domain = FrameworkDomain(
                framework_id=framework.id,
                name=name,
                description=f"Domain {idx + 1}",
                weight=weight,
                order=idx + 1
            )
            db.add(domain)
            db.flush()
            domain_map[domain_type] = domain.id

        # Create Gates and Questions
        # Group gates by domain first to ensure order? Gates in definition have keys like 'gate_1_1'

        sorted_gate_keys = sorted(GATES_DEFINITION.keys())

        for gate_key in sorted_gate_keys:
            gate_def = GATES_DEFINITION[gate_key]
            # Map string domain from GATES_DEFINITION to our Enum/Key
            domain_type_str = gate_def["domain"]
            # Ensure we match the Enum value
            domain_type = DomainType(domain_type_str)
            domain_id = domain_map[domain_type]

            gate = FrameworkGate(
                domain_id=domain_id,
                name=gate_def["name"],
                description=gate_key,
                order=sorted_gate_keys.index(gate_key) + 1
            )
            db.add(gate)
            db.flush()

            # Create Questions
            for q_idx, q_def in enumerate(gate_def["questions"]):
                question = FrameworkQuestion(
                    gate_id=gate.id,
                    text=q_def["text"],
                    guidance=q_def["guidance"],
                    order=q_idx + 1
                )
                db.add(question)

        db.commit()
        print("Successfully seeded DevOps Maturity MVP framework")

    except Exception as e:
        print(f"Error seeding frameworks: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_frameworks()
