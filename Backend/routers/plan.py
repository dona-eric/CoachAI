# Backend/routers/plan.py
from fastapi import APIRouter, HTTPException
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from Backend.models.schemas import PlanRequest
from Backend.services.agent_services import generate_full_plan
import uuid

router = APIRouter(prefix="/plan", tags=["Plan"])

@router.post("/generate")
async def generate_plan(request: PlanRequest):
    """Génère un plan d'entraînement personnalisé via l'agent IA."""
    try:
        session_id   = str(uuid.uuid4())
        profile_dict = request.profile.dict()
        profile_dict["start_date"] = str(request.start_date)
        result = generate_full_plan(session_id, profile_dict)
        return {
            "session_id": session_id,
            "plan":       result["output"],
            "tools_used": result["tools_used"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))