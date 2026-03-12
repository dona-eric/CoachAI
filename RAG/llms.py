# RAG/llms.py
import os
import sys
import logging
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.callbacks import StreamingStdOutCallbackHandler

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from setup.loging import logging_setup

load_dotenv()
logging_setup()
logger = logging.getLogger(__name__)

# ─── Modèles Groq disponibles ─────────────────────────
GROQ_MODELS = {
    "default":  "gemma2-9b-it",           
    "powerful": "llama-3.3-70b-versatile",
    "fast":     "llama-3.1-8b-instant",
    "mixed":    "mixtral-8x7b-32768",
    }


_llm_instances = {}

def get_llm(model_key: str = "default",
            temperature: float = 0.3,
            streaming: bool = False,
            max_tokens: int = 2048,
            ) -> ChatGroq:
    """
    model_key   : clé du modèle dans GROQ_MODELS
    temperature : 0.0 = déterministe | 1.0 = créatif
    streaming   : affichage token par token
    max_tokens  : limite de tokens en sortie
    """

    global _llm_instances
    cache_key = f"{model_key}_{temperature}_{streaming}"

    if cache_key not in _llm_instances:
        model_name = GROQ_MODELS.get(model_key, GROQ_MODELS["default"])

        callbacks = [StreamingStdOutCallbackHandler()] if streaming else []

        _llm_instances[cache_key] = ChatGroq(
            model=model_name,
            api_key=os.getenv("GROQ_API_KEY"),
            temperature=temperature,
            max_tokens=max_tokens,
            streaming=streaming,
            callbacks=callbacks,
        )
        logger.info(
            f" LLM chargé : {model_name} "
            f"(temp={temperature} | stream={streaming})"
        )

    return _llm_instances[cache_key]

# ─── LLMs spécialisés par tâche ───────────────────────
def get_coach_llm() -> ChatGroq:
    """
    LLM principal pour le coaching.
    Température basse → réponses précises et cohérentes.
    """
    return get_llm(
        model_key="default",
        temperature=0.3,
        streaming=True,
        max_tokens=2048,
    )

def get_plan_llm() -> ChatGroq:
    """
    LLM pour la génération de plans d'entraînement.
    Température modérée → plans variés mais structurés.
    """
    return get_llm(
        model_key="powerful",
        temperature=0.5,
        streaming=True,
        max_tokens=4096,
    )

def get_analysis_llm() -> ChatGroq:
    """
    LLM pour l'analyse du profil utilisateur.
    Température zéro → analyse déterministe et fiable.
    """
    return get_llm(
        model_key="default",
        temperature=0.0,
        streaming=False,
        max_tokens=1024,
    )

def get_calendar_llm() -> ChatGroq:
    """
    LLM pour structurer les événements Google Calendar.
    Température zéro → output JSON strict et reproductible.
    """
    return get_llm(
        model_key="fast",
        temperature=0.0,
        streaming=False,
        max_tokens=2048,
    )