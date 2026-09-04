# backend/services/calendar_service.py
import os
import json
import logging
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import os
import dotenv
from Backend.models.schemas import CalendarRequest, CalendarResponse, CalendarEvent

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/calendar"]

# ─── OAuth2 Flow ──────────────────────────────────────
def get_oauth_flow() -> Flow:
    return Flow.from_client_secrets_file(
        CREDENTIALS,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )

def get_auth_url() -> str:
    """Génère l'URL d'autorisation Google OAuth2."""
    flow         = get_oauth_flow()
    auth_url, _  = flow.authorization_url(
        prompt="consent",
        access_type="offline",
    )
    return auth_url

def exchange_code_for_token(code: str) -> dict:
    """Échange le code OAuth contre un token."""
    flow = get_oauth_flow()
    flow.fetch_token(code=code)
    creds = flow.credentials
    return {
        "token":         creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri":     creds.token_uri,
        "client_id":     creds.client_id,
        "client_secret": creds.client_secret,
        "scopes":        creds.scopes,
    }

def get_calendar_service(token_info: dict):
    """Construit le service Google Calendar."""
    creds = Credentials(
        token=token_info["token"],
        refresh_token=token_info["refresh_token"],
        token_uri=token_info["token_uri"],
        client_id=token_info["client_id"],
        client_secret=token_info["client_secret"],
        scopes=token_info["scopes"],
    )
    return build("calendar", "v3", credentials=creds)

# ─── Création événements ──────────────────────────────
def build_events(request: CalendarRequest) -> list[CalendarEvent]:
    """Construit la liste des événements Calendar."""
    day_map = {
        "lundi": 0, "mardi": 1, "mercredi": 2,
        "jeudi": 3, "vendredi": 4, "samedi": 5, "dimanche": 6
    }

    start_h, start_m = map(int, request.preferred_time.split(":"))
    duration          = timedelta(minutes=request.session_duration_min)
    events            = []
    session_count     = 0

    for week in range(request.estimated_weeks):
        for day_name in request.available_days:
            day_offset   = day_map.get(day_name.lower(), 0)
            week_start   = datetime.combine(request.start_date, datetime.min.time())
            week_start  += timedelta(weeks=week)
            # Trouver le bon jour de la semaine
            days_to_day  = (day_offset - week_start.weekday()) % 7
            event_dt     = week_start + timedelta(days=days_to_day)
            event_start  = event_dt.replace(hour=start_h, minute=start_m)
            event_end    = event_start + duration
            session_count += 1

            events.append(CalendarEvent(
                title=f"🏋️ CoachIA — Séance {day_name} (S{week + 1})",
                description=(
                    f"{request.plan_summary}\n\n"
                    f"Séance {session_count} / "
                    f"{request.estimated_weeks * len(request.available_days)}\n"
                    f"Durée : {request.session_duration_min} min\n"
                    f"💪 CoachIA — Bon courage !"
                ),
                date=event_start.strftime("%Y-%m-%d"),
                start_time=event_start.strftime("%H:%M"),
                end_time=event_end.strftime("%H:%M"),
                reminder_minutes=30,
            ))

    return events

def push_events_to_calendar(
    token_info: dict,
    events: list[CalendarEvent],
) -> int:
    """Pousse les événements vers Google Calendar. Retourne le nombre créé."""
    service = get_calendar_service(token_info)
    created = 0

    for event in events:
        start_dt = f"{event.date}T{event.start_time}:00"
        end_dt   = f"{event.date}T{event.end_time}:00"

        body = {
            "summary":     event.title,
            "description": event.description,
            "start": {"dateTime": start_dt, "timeZone": "Africa/Porto-Novo"},
            "end":   {"dateTime": end_dt,   "timeZone": "Africa/Porto-Novo"},
            "reminders": {
                "useDefault": False,
                "overrides": [
                    {"method": "popup", "minutes": event.reminder_minutes},
                    {"method": "email", "minutes": event.reminder_minutes},
                ]
            },
            "colorId": "7",  # Paon (bleu-vert)
        }

        service.events().insert(
            calendarId="primary",
            body=body
        ).execute()
        created += 1

    logger.info(f"✅ {created} événements créés dans Google Calendar")
    return created