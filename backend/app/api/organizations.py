"""Organization API endpoints"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.api.auth import get_current_user
from app.database import get_db
from app.models import Organization, User, UserRole

router = APIRouter()


@router.get("/", response_model=List[schemas.OrganizationResponse])
async def list_organizations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all organizations (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    organizations = db.query(Organization).offset(skip).limit(limit).all()
    return organizations


@router.post("/", response_model=schemas.OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    organization_in: schemas.OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create new organization (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    # Create new organization
    db_organization = Organization(
        name=organization_in.name,
        industry=organization_in.industry,
        size=organization_in.size,
    )

    db.add(db_organization)
    db.commit()
    db.refresh(db_organization)

    return db_organization


@router.get("/{organization_id}", response_model=schemas.OrganizationResponse)
async def get_organization(
    organization_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get specific organization"""
    organization = db.query(Organization).filter(Organization.id == organization_id).first()

    if not organization:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    # Users can only see their own organization unless they're admin
    if current_user.role != UserRole.ADMIN and current_user.organization_id != organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return organization


@router.put("/{organization_id}", response_model=schemas.OrganizationResponse)
async def update_organization(
    organization_id: UUID,
    organization_update: schemas.OrganizationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update organization (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    organization = db.query(Organization).filter(Organization.id == organization_id).first()

    if not organization:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    # Update fields
    if organization_update.name is not None:
        organization.name = organization_update.name
    if organization_update.industry is not None:
        organization.industry = organization_update.industry
    if organization_update.size is not None:
        organization.size = organization_update.size

    db.commit()
    db.refresh(organization)

    return organization


@router.delete("/{organization_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    organization_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete organization (admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    organization = db.query(Organization).filter(Organization.id == organization_id).first()

    if not organization:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    db.delete(organization)
    db.commit()

    return None
