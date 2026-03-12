# RAG/connection_qdrant.py
import os
import sys
import logging
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance

proj_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(proj_root)

from setup.loging import logging_setup

load_dotenv()
logging_setup()
logger = logging.getLogger(__name__)
logger.info("Starting Create conection and collection in Qdrant Cloud...")

# pour créer des collections et interagir avec Qdrant Cloud
COLLECTION_EXERCISES   = "coachia_exercises"
COLLECTION_MUSCULATURE = "coachia_musculature"

_client = None

def get_qdrant_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(
            url=os.getenv("QDRANT_CLOUD_URL"),
            api_key=os.getenv("QDRANT_API_KEY"),
            timeout=30
        )
        logger.info("Connexion Qdrant successful")
    return _client


"""por creer la collection dans qdrant cloud"""
def create_collection(name: str):
    client   = get_qdrant_client()
    existing = [c.name for c in client.get_collections().collections]

    if name in existing:
        logger.warning(f"'{name}' existe déjà")
        return
    client.create_collection(
        collection_name=name,
        vectors_config=VectorParams(
            size=os.getenv("VECTOR_SIZE"),
            distance=Distance.COSINE
        )
    )
    logger.info(f"Collection '{name}' créée")

def init_collections():
    create_collection(COLLECTION_EXERCISES)
    create_collection(COLLECTION_MUSCULATURE)
    logger.info("Collections initialisées")

def get_collection_stats() -> dict:
    client = get_qdrant_client()
    stats  = {}
    for name in [COLLECTION_EXERCISES, COLLECTION_MUSCULATURE]:
        try:
            count        = client.count(name).count
            stats[name]  = count
            logger.info(f"'{name}' — {count} vecteurs")
        except Exception:
            stats[name] = 0
            logger.warning(f"Collection '{name}' introuvable")
    return stats

if __name__ == "__main__":
    init_collections()
    get_collection_stats()