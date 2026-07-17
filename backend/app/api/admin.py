"""Admin API endpoints for user management."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import schemas
from app.api.auth import get_current_user
from app.core import security
from app.core.logging_config import get_logger
from app.database import get_db
from app.models import User, UserRole

router = APIRouter()
logger = get_logger("admin")


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency that requires admin role."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    return current_user


@router.get("/users", response_model=schemas.UserListResponse)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """List all users with pagination and optional search."""
    query = db.query(User)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (User.email.ilike(search_filter)) | (User.full_name.ilike(search_filter))
        )

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    logger.info("list_users", admin=current_user.email, total=total, search=search)
    return {"users": users, "total": total}


@router.get("/users/{user_id}", response_model=schemas.UserResponse)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get a single user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/users", response_model=schemas.UserResponse, status_code=201)
async def create_user(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create a new user."""
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = security.get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_password,
        role=user_in.role,
        functional_role=user_in.functional_role,
        organization_id=user_in.organization_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    logger.info("create_user", admin=current_user.email, new_user=user_in.email, role=str(user_in.role))
    return db_user


@router.put("/users/{user_id}", response_model=schemas.UserResponse)
async def update_user(
    user_id: str,
    user_update: schemas.UserAdminUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update a user's details."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)

    logger.info("update_user", admin=current_user.email, target_user=str(user_id), fields=list(update_data.keys()))
    return user


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Soft-delete a user by deactivating them."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if str(user.id) == str(current_user.id):
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")

    user.is_active = False
    db.commit()

    logger.info("deactivate_user", admin=current_user.email, target_user=user.email)


@router.post("/users/{user_id}/reset-password", response_model=schemas.UserResponse)
async def reset_password(
    user_id: str,
    password_data: schemas.PasswordReset,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Reset a user's password."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = security.get_password_hash(password_data.new_password)
    db.commit()
    db.refresh(user)

    logger.info("reset_password", admin=current_user.email, target_user=user.email)
    return user
