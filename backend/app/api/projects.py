"""Project API endpoints - CRUD for grouping assessments"""

import logging
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import schemas
from app.api.auth import get_current_user
from app.database import get_db
from app.models import Assessment, Project, User

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=List[schemas.ProjectResponse])
async def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all projects, optionally filtered by user's organization"""
    query = db.query(Project)
    if current_user.organization_id:
        query = query.filter(
            (Project.organization_id == current_user.organization_id)
            | (Project.organization_id.is_(None))
        )

    projects = query.order_by(Project.created_at.desc()).all()

    # Enrich with assessment counts
    result = []
    for p in projects:
        count = db.query(func.count(Assessment.id)).filter(Assessment.project_id == p.id).scalar()
        resp = schemas.ProjectResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            organization_id=p.organization_id,
            created_at=p.created_at,
            updated_at=p.updated_at,
            assessment_count=count or 0,
        )
        result.append(resp)

    return result


@router.post("/", response_model=schemas.ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new project"""
    db_project = Project(
        name=project_in.name,
        description=project_in.description,
        organization_id=project_in.organization_id or current_user.organization_id,
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    return schemas.ProjectResponse(
        id=db_project.id,
        name=db_project.name,
        description=db_project.description,
        organization_id=db_project.organization_id,
        created_at=db_project.created_at,
        updated_at=db_project.updated_at,
        assessment_count=0,
    )


@router.get("/{project_id}", response_model=schemas.ProjectResponse)
async def get_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    count = db.query(func.count(Assessment.id)).filter(Assessment.project_id == project.id).scalar()

    return schemas.ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        organization_id=project.organization_id,
        created_at=project.created_at,
        updated_at=project.updated_at,
        assessment_count=count or 0,
    )


@router.put("/{project_id}", response_model=schemas.ProjectResponse)
async def update_project(
    project_id: UUID,
    project_update: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if project_update.name is not None:
        project.name = project_update.name
    if project_update.description is not None:
        project.description = project_update.description

    project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(project)

    count = db.query(func.count(Assessment.id)).filter(Assessment.project_id == project.id).scalar()

    return schemas.ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        organization_id=project.organization_id,
        created_at=project.created_at,
        updated_at=project.updated_at,
        assessment_count=count or 0,
    )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a project (assessments keep their data, project_id set to NULL)"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    db.delete(project)
    db.commit()


@router.get("/{project_id}/assessments", response_model=List[schemas.AssessmentResponse])
async def list_project_assessments(
    project_id: UUID,
    tags: Optional[List[str]] = Query(None),
    campaign_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List assessments in a project, optionally filtered by tags or campaign"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    query = db.query(Assessment).filter(Assessment.project_id == project_id)
    if campaign_id:
        query = query.filter(Assessment.campaign_id == campaign_id)
    if tags:
        query = query.filter(Assessment.tags.overlap(tags))

    return query.order_by(Assessment.created_at.desc()).all()
