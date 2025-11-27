"""Framework API endpoints"""

from typing import List, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app import schemas
from app.api.auth import get_current_user
from app.database import get_db
from app.models import Framework, FrameworkDomain, FrameworkGate, FrameworkQuestion, User

router = APIRouter()

@router.get("/", response_model=List[schemas.FrameworkResponse])
async def list_frameworks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all available frameworks"""
    frameworks = db.query(Framework).offset(skip).limit(limit).all()
    return frameworks

@router.get("/{framework_id}", response_model=schemas.FrameworkResponse)
async def get_framework(
    framework_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get specific framework details"""
    framework = db.query(Framework).filter(Framework.id == framework_id).first()
    if not framework:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Framework not found")
    return framework

@router.get("/{framework_id}/structure", response_model=schemas.FrameworkStructure)
async def get_framework_structure(
    framework_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get complete framework structure (domains, gates, questions)"""
    framework = db.query(Framework).filter(Framework.id == framework_id).first()
    if not framework:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Framework not found")

    # Fetch domains with nested gates and questions
    domains = (
        db.query(FrameworkDomain)
        .filter(FrameworkDomain.framework_id == framework_id)
        .order_by(FrameworkDomain.order)
        .options(
            joinedload(FrameworkDomain.gates)
            .joinedload(FrameworkGate.questions)
        )
        .all()
    )

    # Sort gates and questions manually if order_by in query isn't sufficient for nested rels
    for domain in domains:
        domain.gates.sort(key=lambda x: x.order)
        for gate in domain.gates:
            gate.questions.sort(key=lambda x: x.order)

    return schemas.FrameworkStructure(
        framework=framework,
        domains=domains
    )
