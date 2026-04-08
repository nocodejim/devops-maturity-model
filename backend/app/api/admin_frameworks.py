"""Admin API endpoints for framework management (CRUD + import/export)."""

import json
import uuid
from typing import Optional

import yaml
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload

from app import schemas
from app.api.admin import require_admin
from app.core.logging_config import get_logger
from app.database import get_db
from app.models import (
    Assessment,
    Framework,
    FrameworkDomain,
    FrameworkGate,
    FrameworkQuestion,
    User,
)

router = APIRouter()
logger = get_logger("admin.frameworks")


# ---------- Framework CRUD ----------

@router.get("/", response_model=list[schemas.FrameworkAdminResponse])
async def list_frameworks(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """List all frameworks with domain/question counts."""
    frameworks = db.query(Framework).order_by(Framework.name).all()
    result = []
    for fw in frameworks:
        domains = db.query(FrameworkDomain).filter(FrameworkDomain.framework_id == fw.id).all()
        question_count = 0
        for d in domains:
            gates = db.query(FrameworkGate).filter(FrameworkGate.domain_id == d.id).all()
            for g in gates:
                question_count += db.query(FrameworkQuestion).filter(
                    FrameworkQuestion.gate_id == g.id
                ).count()
        assessment_count = db.query(Assessment).filter(Assessment.framework_id == fw.id).count()
        result.append({
            "id": fw.id,
            "name": fw.name,
            "description": fw.description,
            "version": fw.version,
            "created_at": fw.created_at,
            "updated_at": fw.updated_at,
            "domain_count": len(domains),
            "question_count": question_count,
            "assessment_count": assessment_count,
        })
    return result


@router.post("/", response_model=schemas.FrameworkResponse, status_code=201)
async def create_framework(
    data: schemas.FrameworkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create a new empty framework."""
    fw = Framework(name=data.name, description=data.description, version=data.version)
    db.add(fw)
    db.commit()
    db.refresh(fw)
    logger.info("create_framework", admin=current_user.email, framework=fw.name)
    return fw


@router.put("/{framework_id}", response_model=schemas.FrameworkResponse)
async def update_framework(
    framework_id: str,
    data: schemas.FrameworkUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update framework metadata."""
    fw = db.query(Framework).filter(Framework.id == framework_id).first()
    if not fw:
        raise HTTPException(status_code=404, detail="Framework not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(fw, field, value)
    db.commit()
    db.refresh(fw)
    logger.info("update_framework", admin=current_user.email, framework=str(framework_id))
    return fw


@router.delete("/{framework_id}", status_code=204)
async def delete_framework(
    framework_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Delete a framework. Blocked if assessments reference it."""
    fw = db.query(Framework).filter(Framework.id == framework_id).first()
    if not fw:
        raise HTTPException(status_code=404, detail="Framework not found")
    assessment_count = db.query(Assessment).filter(Assessment.framework_id == fw.id).count()
    if assessment_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete: {assessment_count} assessment(s) reference this framework",
        )
    db.delete(fw)
    db.commit()
    logger.info("delete_framework", admin=current_user.email, framework=fw.name)


# ---------- Domain CRUD ----------

@router.post("/{framework_id}/domains", response_model=schemas.FrameworkDomainResponse, status_code=201)
async def create_domain(
    framework_id: str,
    data: schemas.FrameworkDomainCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    fw = db.query(Framework).filter(Framework.id == framework_id).first()
    if not fw:
        raise HTTPException(status_code=404, detail="Framework not found")
    domain = FrameworkDomain(
        framework_id=fw.id,
        name=data.name,
        description=data.description,
        weight=data.weight,
        order=data.order,
    )
    db.add(domain)
    db.commit()
    db.refresh(domain)
    # Return with empty gates list for schema compatibility
    domain.gates = []
    logger.info("create_domain", admin=current_user.email, domain=data.name)
    return domain


@router.put("/{framework_id}/domains/{domain_id}", response_model=schemas.FrameworkDomainResponse)
async def update_domain(
    framework_id: str,
    domain_id: str,
    data: schemas.FrameworkDomainUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    domain = (
        db.query(FrameworkDomain)
        .filter(FrameworkDomain.id == domain_id, FrameworkDomain.framework_id == framework_id)
        .first()
    )
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(domain, field, value)
    db.commit()
    db.refresh(domain)
    return domain


@router.delete("/{framework_id}/domains/{domain_id}", status_code=204)
async def delete_domain(
    framework_id: str,
    domain_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    domain = (
        db.query(FrameworkDomain)
        .filter(FrameworkDomain.id == domain_id, FrameworkDomain.framework_id == framework_id)
        .first()
    )
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    db.delete(domain)
    db.commit()
    logger.info("delete_domain", admin=current_user.email, domain=domain.name)


# ---------- Gate CRUD ----------

@router.post("/{framework_id}/domains/{domain_id}/gates", response_model=schemas.FrameworkGateResponse, status_code=201)
async def create_gate(
    framework_id: str,
    domain_id: str,
    data: schemas.FrameworkGateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    domain = (
        db.query(FrameworkDomain)
        .filter(FrameworkDomain.id == domain_id, FrameworkDomain.framework_id == framework_id)
        .first()
    )
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    gate = FrameworkGate(
        domain_id=domain.id,
        name=data.name,
        description=data.description,
        order=data.order,
    )
    db.add(gate)
    db.commit()
    db.refresh(gate)
    gate.questions = []
    return gate


@router.put("/{framework_id}/domains/{domain_id}/gates/{gate_id}", response_model=schemas.FrameworkGateResponse)
async def update_gate(
    framework_id: str,
    domain_id: str,
    gate_id: str,
    data: schemas.FrameworkGateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    gate = db.query(FrameworkGate).filter(FrameworkGate.id == gate_id, FrameworkGate.domain_id == domain_id).first()
    if not gate:
        raise HTTPException(status_code=404, detail="Gate not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(gate, field, value)
    db.commit()
    db.refresh(gate)
    return gate


@router.delete("/{framework_id}/domains/{domain_id}/gates/{gate_id}", status_code=204)
async def delete_gate(
    framework_id: str,
    domain_id: str,
    gate_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    gate = db.query(FrameworkGate).filter(FrameworkGate.id == gate_id, FrameworkGate.domain_id == domain_id).first()
    if not gate:
        raise HTTPException(status_code=404, detail="Gate not found")
    db.delete(gate)
    db.commit()
    logger.info("delete_gate", admin=current_user.email, gate=gate.name)


# ---------- Question CRUD ----------

@router.post(
    "/{framework_id}/domains/{domain_id}/gates/{gate_id}/questions",
    response_model=schemas.FrameworkQuestionResponse,
    status_code=201,
)
async def create_question(
    framework_id: str,
    domain_id: str,
    gate_id: str,
    data: schemas.FrameworkQuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    gate = db.query(FrameworkGate).filter(FrameworkGate.id == gate_id, FrameworkGate.domain_id == domain_id).first()
    if not gate:
        raise HTTPException(status_code=404, detail="Gate not found")
    question = FrameworkQuestion(
        gate_id=gate.id,
        text=data.text,
        guidance=data.guidance,
        order=data.order,
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.put(
    "/{framework_id}/domains/{domain_id}/gates/{gate_id}/questions/{question_id}",
    response_model=schemas.FrameworkQuestionResponse,
)
async def update_question(
    framework_id: str,
    domain_id: str,
    gate_id: str,
    question_id: str,
    data: schemas.FrameworkQuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    question = (
        db.query(FrameworkQuestion)
        .filter(FrameworkQuestion.id == question_id, FrameworkQuestion.gate_id == gate_id)
        .first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(question, field, value)
    db.commit()
    db.refresh(question)
    return question


@router.delete(
    "/{framework_id}/domains/{domain_id}/gates/{gate_id}/questions/{question_id}",
    status_code=204,
)
async def delete_question(
    framework_id: str,
    domain_id: str,
    gate_id: str,
    question_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    question = (
        db.query(FrameworkQuestion)
        .filter(FrameworkQuestion.id == question_id, FrameworkQuestion.gate_id == gate_id)
        .first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(question)
    db.commit()


# ---------- Export / Import ----------

@router.get("/{framework_id}/export")
async def export_framework(
    framework_id: str,
    format: str = Query("json", regex="^(json|yaml)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Export a complete framework as JSON or YAML."""
    fw = db.query(Framework).filter(Framework.id == framework_id).first()
    if not fw:
        raise HTTPException(status_code=404, detail="Framework not found")

    domains = (
        db.query(FrameworkDomain)
        .filter(FrameworkDomain.framework_id == fw.id)
        .order_by(FrameworkDomain.order)
        .options(joinedload(FrameworkDomain.gates).joinedload(FrameworkGate.questions))
        .all()
    )

    export_data = {
        "name": fw.name,
        "description": fw.description,
        "version": fw.version,
        "domains": [],
    }

    for domain in sorted(domains, key=lambda d: d.order):
        domain_data = {
            "name": domain.name,
            "description": domain.description,
            "weight": domain.weight,
            "order": domain.order,
            "gates": [],
        }
        for gate in sorted(domain.gates, key=lambda g: g.order):
            gate_data = {
                "name": gate.name,
                "description": gate.description,
                "order": gate.order,
                "questions": [],
            }
            for q in sorted(gate.questions, key=lambda q: q.order):
                gate_data["questions"].append({
                    "text": q.text,
                    "guidance": q.guidance,
                    "order": q.order,
                })
            domain_data["gates"].append(gate_data)
        export_data["domains"].append(domain_data)

    logger.info("export_framework", admin=current_user.email, framework=fw.name, format=format)

    if format == "yaml":
        yaml_content = yaml.dump(export_data, default_flow_style=False, allow_unicode=True)
        return JSONResponse(
            content={"content": yaml_content, "filename": f"{fw.name.lower().replace(' ', '-')}.yaml"},
            media_type="application/json",
        )

    return JSONResponse(
        content={"content": export_data, "filename": f"{fw.name.lower().replace(' ', '-')}.json"},
        media_type="application/json",
    )


@router.post("/import", response_model=schemas.FrameworkResponse, status_code=201)
async def import_framework(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Import a framework from a JSON or YAML file. Creates a new framework with new UUIDs."""
    content = await file.read()
    content_str = content.decode("utf-8")

    try:
        if file.filename and (file.filename.endswith(".yaml") or file.filename.endswith(".yml")):
            data = yaml.safe_load(content_str)
        else:
            data = json.loads(content_str)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid file format: {str(e)}")

    if "name" not in data:
        raise HTTPException(status_code=400, detail="Missing required field: name")

    # Create framework
    fw = Framework(
        name=data["name"],
        description=data.get("description"),
        version=data.get("version", "1.0"),
    )
    db.add(fw)
    db.flush()

    # Create nested structure
    for domain_data in data.get("domains", []):
        domain = FrameworkDomain(
            framework_id=fw.id,
            name=domain_data["name"],
            description=domain_data.get("description"),
            weight=domain_data.get("weight", 1.0),
            order=domain_data.get("order", 0),
        )
        db.add(domain)
        db.flush()

        for gate_data in domain_data.get("gates", []):
            gate = FrameworkGate(
                domain_id=domain.id,
                name=gate_data["name"],
                description=gate_data.get("description"),
                order=gate_data.get("order", 0),
            )
            db.add(gate)
            db.flush()

            for q_data in gate_data.get("questions", []):
                question = FrameworkQuestion(
                    gate_id=gate.id,
                    text=q_data["text"],
                    guidance=q_data.get("guidance"),
                    order=q_data.get("order", 0),
                )
                db.add(question)

    db.commit()
    db.refresh(fw)

    logger.info(
        "import_framework",
        admin=current_user.email,
        framework=fw.name,
        domains=len(data.get("domains", [])),
    )
    return fw
