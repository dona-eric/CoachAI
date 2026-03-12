# backend/main.py
import os
import sys
import logging
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from setup.loging import logging_setup
from Backend.routers import profile, plan, exercises, calendars
from Backend.services.agent_services import chat
from Backend.models.schemas import ChatMessage, ChatResponse

load_dotenv()
logging_setup()
logger = logging.getLogger(__name__)

# App FastAPI
app = FastAPI(
    title="CoachIA API",
    description="API de coaching sportif IA RAG + Groq + Qdrant",
    version="2.0.0"
    )

#  CORS (Streamlit → FastAPI)
app.add_middleware(CORSMiddleware,
                   allow_origins=["http://localhost:8501"],
                   allow_methods=["*"],
                   allow_headers=["*"]
                   )

# Les Routers
app.include_router(profile.router)
app.include_router(plan.router)
app.include_router(exercises.router)
app.include_router(calendars.router)

# Endpoint Chat

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(message: ChatMessage):
    """Endpoint principal de conversation avec CoachIA."""
    profile_dict = message.profile.dict() if message.profile else None
    result = chat(
        session_id=message.session_id,
        message=message.message,
        user_profile=profile_dict,
    )
    return ChatResponse(
        response=result["output"],
        tools_used=result["tools_used"],
        session_id=message.session_id,
    )

@app.get("/health")
async def health():
    return {"status": "ok", "service": "CoachIA API v2"}

@app.get("/")
async def root():
    return {
        "message": "🏋️ CoachIA API v2",
        "docs":    "/docs",
        "health":  "/health",
    }