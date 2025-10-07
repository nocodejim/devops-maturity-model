"""Create a test user for testing the application"""

import asyncio
from app.database import SessionLocal
from app.models import User, UserRole
from app.core.security import get_password_hash


async def create_test_user():
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == "admin@example.com").first()
        if existing_user:
            print("Test user already exists!")
            print(f"Email: admin@example.com")
            print(f"Role: {existing_user.role}")
            return

        # Create test user
        hashed_password = get_password_hash("admin123")
        test_user = User(
            email="admin@example.com",
            full_name="Admin User",
            hashed_password=hashed_password,
            role=UserRole.ADMIN,
            is_active=True,
        )

        db.add(test_user)
        db.commit()
        db.refresh(test_user)

        print("Test user created successfully!")
        print(f"Email: admin@example.com")
        print(f"Password: admin123")
        print(f"Role: {test_user.role}")

    except Exception as e:
        print(f"Error creating test user: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(create_test_user())
