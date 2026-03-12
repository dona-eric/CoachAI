# backend/routers/profile.py
from fastapi import APIRouter, HTTPException
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from Backend.models.schemas import UserProfile, UserProfileResponse
from Backend.services.profile_services import analyze_profile




router = APIRouter(prefix="/profile", tags=["Profile"])

@router.post("/analyze", response_model=UserProfileResponse)
async def analyze_user_profile(profile: UserProfile):
    """Analyse le profil et retourne les métriques."""
    try:
        return analyze_profile(profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))