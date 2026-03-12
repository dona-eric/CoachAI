# backend/services/agent_service.py
import logging
from typing import Dict
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from RAG.agent import CoachIAAgent, get_agent

logger = logging.getLogger(__name__)

# Sessions actives { session_id: CoachIAAgent }
_sessions: dict[str, CoachIAAgent] = {}

def get_or_create_session(
    session_id: str,
    user_profile: dict = None
) -> CoachIAAgent:
    """Retourne ou crée une session agent."""
    if session_id not in _sessions:
        _sessions[session_id] = get_agent(user_profile)
        logger.info(f"✅ Session créée : {session_id}")
    elif user_profile:
        _sessions[session_id].update_profile(user_profile)
    return _sessions[session_id]

def clear_session(session_id: str):
    """Supprime une session."""
    if session_id in _sessions:
        _sessions[session_id].clear_memory()
        del _sessions[session_id]
        logger.info(f"🗑️ Session supprimée : {session_id}")

def chat(
    session_id: str,
    message: str,
    user_profile: dict = None
) -> dict:
    """Envoie un message à l'agent et retourne la réponse."""
    agent    = get_or_create_session(session_id, user_profile)
    response = agent.run(message)
    return response

def generate_full_plan(
    session_id: str,
    user_profile: dict
) -> dict:
    """Génère un plan complet pour un profil donné."""
    agent = get_or_create_session(session_id, user_profile)
    agent.update_profile(user_profile)
    return agent.generate_plan()