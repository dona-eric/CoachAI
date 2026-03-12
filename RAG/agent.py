# RAG/agent.py
import os
import sys
import json
import logging
from dotenv import load_dotenv
from langchain_classic.agents import AgentExecutor, create_react_agent
from langchain_classic.memory import ConversationBufferWindowMemory
from langchain_core.messages import HumanMessage, AIMessage
from langchain_classic import hub

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from setup.loging import logging_setup
from RAG.llms import get_coach_llm, get_plan_llm, get_analysis_llm
from RAG.tools import get_all_tools
from RAG.prompt_builder import get_prompt

load_dotenv()
logging_setup()
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────
# MÉMOIRE CONVERSATIONNELLE
# ─────────────────────────────────────────────────────
def get_memory(session_id: str = "default") -> ConversationBufferWindowMemory:
    """
    Mémoire glissante sur les 10 derniers échanges.
    Evite de dépasser le context window de Groq.
    """
    return ConversationBufferWindowMemory(
        k=10,
        memory_key="chat_history",
        return_messages=True,
        output_key="output",
    )

# ─────────────────────────────────────────────────────
# AGENT PRINCIPAL
# ─────────────────────────────────────────────────────
class CoachIAAgent:
    """
    Agent ReAct principal de CoachIA.
    Orchestre les tools pour :
    - Analyser le profil utilisateur
    - Générer un plan d'entraînement
    - Rechercher des exercices + GIFs
    - Structurer les événements Google Calendar
    """

    def __init__(self, user_profile: dict = None):
        self.user_profile = user_profile or {}
        self.memory       = get_memory()
        self.tools        = get_all_tools()
        self.executor     = self._build_executor()
        logger.info("✅ CoachIAAgent initialisé")

    def _build_executor(self) -> AgentExecutor:
        """Construit l'AgentExecutor ReAct."""
        llm = get_coach_llm()

        # Prompt ReAct depuis LangChain Hub
        react_prompt = hub.pull("hwchase17/react-chat")

        agent = create_react_agent(
            llm=llm,
            tools=self.tools,
            prompt=react_prompt,
        )

        return AgentExecutor(
            agent=agent,
            tools=self.tools,
            memory=self.memory,
            verbose=True,
            max_iterations=8,
            max_execution_time=120,
            handle_parsing_errors=True,
            return_intermediate_steps=True,
        )

    def _build_context(self) -> str:
        """Construit le contexte utilisateur pour injecter dans les prompts."""
        if not self.user_profile:
            return "Aucun profil utilisateur défini."
        return (
            f"Nom     : {self.user_profile.get('name', 'Utilisateur')}\n"
            f"Poids   : {self.user_profile.get('current_weight', '?')} kg "
            f"→ Objectif : {self.user_profile.get('target_weight', '?')} kg\n"
            f"Niveau  : {self.user_profile.get('level', '?')}\n"
            f"Équipement : {self.user_profile.get('equipment', '?')}\n"
            f"Jours dispo: {self.user_profile.get('available_days', '?')}/semaine\n"
            f"Restrictions : {self.user_profile.get('restrictions', 'aucune')}"
        )

    def update_profile(self, profile: dict):
        """Met à jour le profil utilisateur."""
        self.user_profile = profile
        logger.info(f"✅ Profil mis à jour : {profile.get('name')}")

    def run(self, user_message: str) -> dict:
        """
        Exécute l'agent sur un message utilisateur.
        Retourne la réponse + les étapes intermédiaires.
        """
        # Enrichir le message avec le contexte utilisateur
        context   = self._build_context()
        full_input = (
            f"CONTEXTE UTILISATEUR :\n{context}\n\n"
            f"MESSAGE : {user_message}"
        )

        logger.info(f"🤖 Agent invoqué : '{user_message[:80]}...'")

        try:
            result = self.executor.invoke({
                "input":       full_input,
                "chat_history": self.memory.chat_memory.messages,
            })

            response = {
                "output":               result.get("output", ""),
                "intermediate_steps":   result.get("intermediate_steps", []),
                "tools_used":           [
                    step[0].tool
                    for step in result.get("intermediate_steps", [])
                ],
            }

            logger.info(
                f"✅ Réponse générée | "
                f"Tools utilisés : {response['tools_used']}"
            )
            return response

        except Exception as e:
            logger.error(f"❌ Erreur agent : {e}")
            return {
                "output": (
                    "Désolé, une erreur s'est produite. "
                    "Peux-tu reformuler ta question ?"
                ),
                "intermediate_steps": [],
                "tools_used": [],
            }

    def analyze_profile(self, profile: dict) -> dict:
        """
        Analyse complète du profil utilisateur.
        Retourne les métriques + recommandations.
        """
        self.update_profile(profile)
        profile_json = json.dumps(profile, ensure_ascii=False)
        message = (
            f"Analyse mon profil et donne-moi toutes les métriques : "
            f"{profile_json}"
        )
        return self.run(message)

    def generate_plan(self) -> dict:
        """Génère un plan d'entraînement complet basé sur le profil."""
        if not self.user_profile:
            return {
                "output": "Veuillez d'abord définir votre profil.",
                "intermediate_steps": [],
                "tools_used": [],
            }
        message = (
            "Génère mon plan d'entraînement complet et personnalisé "
            "en tenant compte de mon profil, mes objectifs et mon équipement."
        )
        return self.run(message)

    def get_exercise_details(self, exercise_name: str) -> dict:
        """Récupère les détails et le GIF d'un exercice."""
        message = (
            f"Montre-moi comment faire l'exercice '{exercise_name}' "
            f"avec le GIF et les instructions détaillées."
        )
        return self.run(message)

    def plan_calendar(self, start_date: str, preferred_time: str = "07:00") -> dict:
        """Planifie les séances sur Google Calendar."""
        message = (
            f"Planifie mes séances d'entraînement sur Google Calendar "
            f"à partir du {start_date} à {preferred_time}. "
            f"Je veux {self.user_profile.get('available_days', 3)} "
            f"séances par semaine."
        )
        return self.run(message)

    def clear_memory(self):
        """Réinitialise la mémoire conversationnelle."""
        self.memory.clear()
        logger.info("🔄 Mémoire conversationnelle réinitialisée")


# ─────────────────────────────────────────────────────
# Factory
# ─────────────────────────────────────────────────────
def get_agent(user_profile: dict = None) -> CoachIAAgent:
    """Retourne une instance de CoachIAAgent."""
    return CoachIAAgent(user_profile=user_profile)
