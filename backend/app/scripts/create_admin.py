"""Create the first admin user — the operator path for production.

Usage (inside the backend container):
    python -m app.scripts.create_admin --email you@company.com [--name "Full Name"]

The password is prompted interactively (or read from ADMIN_PASSWORD env for
non-interactive provisioning) and never printed.
"""

import argparse
import getpass
import os
import sys

from app.database import SessionLocal
from app.models import User, UserRole
from app.core.security import get_password_hash

MIN_PASSWORD_LENGTH = 12


def create_admin(email: str, full_name: str, password: str) -> None:
    if len(password) < MIN_PASSWORD_LENGTH:
        sys.exit(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.")

    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == email).first():
            sys.exit(f"A user with email {email} already exists.")

        admin = User(
            email=email,
            full_name=full_name,
            hashed_password=get_password_hash(password),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print(f"Admin user created: {email}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create the first admin user")
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", default="Administrator")
    args = parser.parse_args()

    password = os.environ.get("ADMIN_PASSWORD")
    if not password:
        password = getpass.getpass("Password for the new admin: ")
        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            sys.exit("Passwords do not match.")

    create_admin(args.email, args.name, password)
