"""Database initialization script - Safe seeding for fresh installs only

This script handles first-time database initialization:
1. Creates the admin user if not exists
2. Seeds all 3 frameworks if no frameworks exist

SAFETY: This script will NOT seed frameworks if:
- Any completed assessments exist (to protect user data on upgrades)

This ensures upgrades don't accidentally overwrite or corrupt existing data.
"""

import sys
import os

# Add parent directories to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import text
from app.database import SessionLocal, engine
from app.models import User, UserRole, Framework, Assessment, AssessmentStatus
from app.core.security import get_password_hash


def check_database_state():
    """
    Check current database state and return status dict.

    Returns:
        dict with keys:
            - tables_exist: bool
            - user_count: int
            - framework_count: int
            - assessment_count: int
            - has_completed_assessments: bool
    """
    db = SessionLocal()
    try:
        # Check if tables exist by trying to query them
        try:
            user_count = db.query(User).count()
            framework_count = db.query(Framework).count()
            assessment_count = db.query(Assessment).count()

            # Check for completed assessments
            completed_count = db.query(Assessment).filter(
                Assessment.status == AssessmentStatus.COMPLETED
            ).count()

            return {
                "tables_exist": True,
                "user_count": user_count,
                "framework_count": framework_count,
                "assessment_count": assessment_count,
                "has_completed_assessments": completed_count > 0,
            }
        except Exception as e:
            print(f"[init_database] Tables may not exist yet: {e}")
            return {
                "tables_exist": False,
                "user_count": 0,
                "framework_count": 0,
                "assessment_count": 0,
                "has_completed_assessments": False,
            }
    finally:
        db.close()


def create_admin_user():
    """Create the default admin user if not exists."""
    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == "admin@example.com").first()
        if existing_user:
            print("[init_database] Admin user already exists, skipping...")
            return False

        hashed_password = get_password_hash("admin123")
        admin_user = User(
            email="admin@example.com",
            full_name="Admin User",
            hashed_password=hashed_password,
            role=UserRole.ADMIN,
            is_active=True,
        )

        db.add(admin_user)
        db.commit()
        print("[init_database] Created admin user (admin@example.com / admin123)")
        return True

    except Exception as e:
        print(f"[init_database] Error creating admin user: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def seed_frameworks():
    """Seed all 3 frameworks if none exist."""
    db = SessionLocal()
    try:
        existing_count = db.query(Framework).count()
        if existing_count > 0:
            print(f"[init_database] {existing_count} framework(s) already exist, skipping seeding...")
            return False

        db.close()

        # Import and run each seeding script
        print("[init_database] Seeding DevOps Maturity MVP framework...")
        from app.scripts.seed_frameworks import seed_frameworks as seed_mvp
        seed_mvp()

        print("[init_database] Seeding DORA Metrics framework...")
        from app.scripts.seed_dora_framework import seed_dora_framework
        seed_dora_framework()

        print("[init_database] Seeding CALMS DevOps framework...")
        from app.scripts.seed_calms_framework import seed_calms_framework
        seed_calms_framework()

        print("[init_database] All 3 frameworks seeded successfully!")
        return True

    except Exception as e:
        print(f"[init_database] Error seeding frameworks: {e}")
        return False


def init_database(force_seed=False):
    """
    Main initialization function.

    Args:
        force_seed: If True, seed frameworks even if assessments exist (use with caution!)

    Returns:
        dict with initialization results
    """
    print("=" * 60)
    print("[init_database] Starting database initialization check...")
    print("=" * 60)

    # Check current state
    state = check_database_state()

    print(f"[init_database] Current state:")
    print(f"  - Tables exist: {state['tables_exist']}")
    print(f"  - Users: {state['user_count']}")
    print(f"  - Frameworks: {state['framework_count']}")
    print(f"  - Assessments: {state['assessment_count']}")
    print(f"  - Has completed assessments: {state['has_completed_assessments']}")

    results = {
        "initial_state": state,
        "admin_created": False,
        "frameworks_seeded": False,
        "skipped_reason": None,
    }

    if not state["tables_exist"]:
        print("[init_database] Tables don't exist yet. Run migrations first!")
        results["skipped_reason"] = "tables_not_exist"
        return results

    # Safety check: Don't seed if there are completed assessments
    if state["has_completed_assessments"] and not force_seed:
        print("[init_database] SAFETY: Completed assessments found!")
        print("[init_database] Skipping all seeding to protect existing data.")
        print("[init_database] Use --force if you really want to seed (not recommended).")
        results["skipped_reason"] = "has_completed_assessments"
        return results

    # Create admin user if needed
    if state["user_count"] == 0:
        results["admin_created"] = create_admin_user()
    else:
        print(f"[init_database] {state['user_count']} user(s) exist, checking for admin...")
        # Still try to create admin if it doesn't exist
        results["admin_created"] = create_admin_user()

    # Seed frameworks if needed
    if state["framework_count"] == 0:
        results["frameworks_seeded"] = seed_frameworks()
    else:
        print(f"[init_database] {state['framework_count']} framework(s) already exist, skipping...")

    # Final state check
    final_state = check_database_state()
    results["final_state"] = final_state

    print("=" * 60)
    print("[init_database] Initialization complete!")
    print(f"  - Admin created: {results['admin_created']}")
    print(f"  - Frameworks seeded: {results['frameworks_seeded']}")
    print(f"  - Final framework count: {final_state['framework_count']}")
    print("=" * 60)

    return results


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Initialize database with admin user and frameworks")
    parser.add_argument("--force", action="store_true",
                       help="Force seeding even if assessments exist (DANGEROUS)")
    parser.add_argument("--check-only", action="store_true",
                       help="Only check database state, don't modify anything")

    args = parser.parse_args()

    if args.check_only:
        state = check_database_state()
        print("[init_database] Database state check:")
        for key, value in state.items():
            print(f"  {key}: {value}")
    else:
        init_database(force_seed=args.force)
