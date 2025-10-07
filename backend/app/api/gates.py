"""Gates API endpoints - Provide gate definitions to frontend"""

from fastapi import APIRouter

from app.core import gates

router = APIRouter()


@router.get("/")
async def get_all_gates():
    """Get all gate definitions with questions"""
    return {
        "gates": gates.get_all_gates(),
        "total_gates": len(gates.GATES_DEFINITION),
        "total_questions": gates.get_total_question_count(),
    }


@router.get("/{gate_id}")
async def get_gate(gate_id: str):
    """Get a specific gate definition"""
    gate = gates.get_gate(gate_id)
    if not gate:
        return {"error": "Gate not found"}
    return gate


@router.get("/domain/{domain}")
async def get_gates_by_domain(domain: str):
    """Get all gates for a specific domain"""
    from app.models import DomainType

    try:
        domain_enum = DomainType(domain)
        return gates.get_gates_for_domain(domain_enum)
    except ValueError:
        return {"error": "Invalid domain"}
