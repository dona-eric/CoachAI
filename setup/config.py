"""
config.py :Configuration centrale de CoachIA
Toutes les variables d'environnement et constantes globales.
Chargé une seule fois au démarrage, importé partout.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional
import dotenv
import os
import sys
from pathlib import Path
from pydantic import ConfigDict
# Charge les variables d'environnement depuis le fichier .env
dotenv.load_dotenv()  

class Config(BaseSettings):

    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    GROQ_API_URL: str = os.getenv("GROQ_URL_API", "https://api.groq.com/openai/v1")
    GROQ_MODEL: str = os.getenv('MODEL_MAIN')      # modèle principal
    GROQ_MODEL_FAST: str = os.getenv('MODEL_FAST')    # pour les tâches simples
    GROQ_AUDIO_MODEL: str = os.getenv('MODEL_WHISPER')    # pour la transcription audio

    # Qdrant (vector DB)
    QDRANT_URL: str = os.getenv("QDRANT_CLOUD_URL")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY")
    QDRANT_COLLECTION: str = "coachai_exercises"      # nom de la collection

    EMBEDDING_MODEL: str = os.getenv('EMBEDDING_MODEL_NAME')              # modèle multilingue puissant
    EMBEDDING_DEVICE: str = "cpu"                     # "cuda" si GPU dispo
    EMBEDDING_DIMENSION: int = int(os.getenv('MODEL_EMBEDDING_DIMENSION', 1024))                  # dimensions b

    # Google Calendar OAuth2 
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("client_id")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("client_secret")
    GOOGLE_REDIRECT_URI: str =os.getenv("redirect_uris", "http://localhost:8000/auth/google/callback")
    # Fichier token généré après le premier login OAuth
    GOOGLE_TOKEN_FILE: str = "google_token.json"

    # GIFs GitHub 
    # Base URL pour accéder aux GIFs depuis GitHub raw
    GITHUB_GIFS_BASE_URL: str = (
        "https://raw.githubusercontent.com/dona-eric/CoachAI/rag-coach/datadb/raw/exercisedb/gifs"
    )
    GIF_RESOLUTION: str = "gifs_1080x1080"

    #  FastAPI
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    APP_ENV: str = "development"                      # "production" en prod
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # RAG Configuration 
    # Données locales (pour l'indexation initiale seulement)
    DATA_DIR: Path = Path("datadb/raw")
    EXERCISES_DIR: Path = Path("datadb/raw/musculature_exercise/All_separate")       
    JSON_DIR: Path = Path("datadb/raw/exercisedb")

    # Chunking
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 64
    VECTOR_SIZE: int = 1024
    CHUNK_SIZE: int = 256

    # Retrieval
    RAG_TOP_K: int = 3                              # nb de docs retournés par recherche
    RAG_SCORE_THRESHOLD: float = 0.6                  # score minimum de similarité

    # Agent 
    MAX_RETRIES: int = 3                              # retries sur les nodes LangGraph
    MAX_ITERATIONS: int = 10                          # protection contre boucles infinies

    # Pinecone

    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY")
    
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache()
def get_config() -> Config:
    """
    Retourne l'instance Settings en cache (singleton).
    Utilise lru_cache pour ne charger le .env qu'une seule fois.
    """
    return Config()



if __name__=="__main__":
    config = get_config()