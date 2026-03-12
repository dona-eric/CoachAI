# backend/routers/calendar.py
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from Backend.models.schemas import CalendarRequest, CalendarResponse
from Backend.services.calendar_services import (
    get_auth_url,
    exchange_code_for_token,
    build_events,
    push_events_to_calendar,
)

router  = APIRouter(prefix="/calendar", tags=["Calendar"])
_tokens = {}  # stockage temporaire tokens { session_id: token_info }

@router.get("/auth")
async def google_auth():
    """Redirige vers la page d'autorisation Google OAuth2."""
    auth_url = get_auth_url()
    return RedirectResponse(url=auth_url)

@router.get("/callback")
async def google_callback(code: str = Query(...), state: str = Query(None)):
    """Callback OAuth2 — échange le code contre un token."""
    try:
        token_info          = exchange_code_for_token(code)
        session_id          = state or "default"
        _tokens[session_id] = token_info
        return {"message": "✅ Authentification réussie !", "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/create", response_model=CalendarResponse)
async def create_calendar_events(
    request: CalendarRequest,
    session_id: str = Query(default="default"),
):
    """Crée les événements d'entraînement sur Google Calendar."""
    try:
        if session_id not in _tokens:
            raise HTTPException(
                status_code=401,
                detail="Non authentifié. Appelez /calendar/auth d'abord."
            )
        events  = build_events(request)
        created = push_events_to_calendar(_tokens[session_id], events)

        return CalendarResponse(
            total_events=created,
            duration_weeks=request.estimated_weeks,
            events=events[:5],
            message=f"✅ {created} séances planifiées sur Google Calendar !",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/preview")
async def preview_calendar_events(request: CalendarRequest):
    """Prévisualise les événements sans les créer sur Calendar."""
    try:
        events = build_events(request)
        return {
            "total":  len(events),
            "events": [e.dict() for e in events[:10]],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))