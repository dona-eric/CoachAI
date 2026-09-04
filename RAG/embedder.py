"""
rag/embedder.py — Modèle d'embedding HuggingFace

Utilise BAAI/bge-m3 : modèle multilingue puissant,
1024 dimensions, excellent pour la recherche sémantique
en anglais et français.

Pattern singleton : le modèle est chargé une seule fois
en mémoire et réutilisé pour tous les appels.
"""

import os
import dotenv
import sys
import sys
import logging
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from functools import lru_cache
from typing import List
from langchain_openai import OpenAIEmbeddings
from setup.config import get_config
logger = logging.getLogger(__name__)

dotenv.load_dotenv()
config = get_config()

@lru_cache(maxsize=1)
def get_embedding_model() -> OpenAIEmbeddings:
    """
    Retourne l'instance du modèle d'embedding (singleton via lru_cache).

    Le modèle est téléchargé depuis HuggingFace Hub au premier appel
    (~1.8 Go pour bge-m3), puis mis en cache en mémoire.

    normalize_embeddings=True est essentiel pour bge-m3 :
    cela garantit que la similarité cosinus donne des scores entre 0 et 1.
    """
    logger.info(f"Chargement du modèle d'embedding : {config.EMBEDDING_MODEL}")

    embedder = OpenAIEmbeddings(
        model_name=config.EMBEDDING_MODEL,
        model_kwargs={
            "device": config.EMBEDDING_DEVICE,
        },
        encode_kwargs={
            "normalize_embeddings": True, 
            "batch_size": 32,
        },
    )

    logger.info(f"Modèle chargé sur {config.EMBEDDING_DEVICE}")
    return embedder


def embed_texts(texts: List[str]) -> List[List[float]]:
    """
    Embed une liste de textes.
    Retourne une liste de vecteurs de dimensions EMBEDDING_DIMENSION.
    """
    embedder = get_embedding_model()
    return embedder.embed_documents(texts)


def embed_query(query: str) -> List[float]:
    """
    Embed une query utilisateur pour la recherche.

    Note bge-m3 : pour les queries de recherche, il est recommandé
    de préfixer avec "Represent this sentence for searching relevant passages: "
    mais en pratique normalize_embeddings=True suffit.
    """
    embedder = get_embedding_model()
    return embedder.embed_query(query)


def get_embedding_dimensions() -> int:
    """Retourne les dimensions du modèle configuré."""
    return config.EMBEDDING_DIMENSION