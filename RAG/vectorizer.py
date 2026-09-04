# RAG/vectorizer.py
import os
import sys
import logging

sys_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if sys_root not in sys.path:
    sys.path.insert(0, sys_root)

from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_qdrant import QdrantVectorStore
from RAG.utils.loader import load_exercises_json, load_musculature_json
from RAG.splitter import split_documents
from setup.loging import logging_setup
from RAG.embedder import get_embedding_model
from RAG.utils.connection_cloud import get_qdrant_client, init_collections,COLLECTION_EXERCISES,COLLECTION_MUSCULATURE,get_collection_stats

load_dotenv()
logging_setup()
logger = logging.getLogger(__name__)

def get_vectorstore(collection_name: str) -> QdrantVectorStore:
    """Retourne un QdrantVectorStore existant sans réindexer."""
    return QdrantVectorStore(
        client=get_qdrant_client(),
        collection_name=collection_name,
        embedding=get_embedding_model(),
    )
def index_documents(documents: list[Document],
                    collection_name: str,
                    batch_size: int = 32,
                    force_recreate: bool = False) -> QdrantVectorStore:
    """
    Indexe une liste de Documents LangChain dans Qdrant.
    - Batch size 32 : optimal pour BAAI/bge-m3 sur CPU
    - force_recreate : vide la collection avant réindexation
    """
    if not documents:
        logger.warning(f"Aucun document à indexer dans '{collection_name}'")
        return get_vectorstore(collection_name)

    logger.info(
        f"Indexation '{collection_name}' : "
        f"{len(documents)} documents | batch={batch_size}"
    )

    vectorstore = None
    total       = 0

    for i in range(0, len(documents), batch_size):
        batch = documents[i : i + batch_size]

        if i == 0:
            # Premier batch → crée ou recrée la collection
            vectorstore = QdrantVectorStore.from_documents(
                documents=batch,
                embedding=get_embedding_model(),
                url=os.getenv('QDRANT_CLOUD_URL'),
                api_key=os.getenv('QDRANT_API_KEY'),
                collection_name=collection_name,
                force_recreate=force_recreate,
            )
        else:
            # Batches suivants --> ajoute aux documents existants
            vectorstore.add_documents(batch)

        total += len(batch)
        logger.info(
            f"  Batch {i // batch_size + 1} "
            f"— {total}/{len(documents)} indexés"
        )

    # Stats finales
    count = get_qdrant_client().count(collection_name).count
    logger.info(f" '{collection_name}' — {count} vecteurs dans Qdrant")
    return vectorstore


def run_indexation_pipeline(force_recreate: bool = False):
    """
    Pipeline complet :
    load → split → index (exercises + musculature)
    """


    # Init collections Qdrant
    init_collections()

    logger.info("\n Collection 1 : coachia_exercises")
    ex_docs    = load_exercises_json()
    ex_chunks  = split_documents(ex_docs)
    index_documents(
        documents=ex_chunks,
        collection_name=COLLECTION_EXERCISES,
        force_recreate=force_recreate,
    )

    logger.info("\n Collection 2 : coachia_musculature")
    mu_docs    = load_musculature_json()
    mu_chunks  = split_documents(mu_docs)
    index_documents(
        documents=mu_chunks,
        collection_name=COLLECTION_MUSCULATURE,
        force_recreate=force_recreate,
    )

    # Stats finales
    logger.info("\n Résumé indexation :")
    get_collection_stats()
    logger.info(" Pipeline indexation terminé !")

if __name__ == "__main__":
    run_indexation_pipeline(force_recreate=False)















    """
rag/vectorizer.py — Chunking et indexation vers Qdrant Cloud

Ce script est lancé UNE SEULE FOIS pour peupler la base vectorielle.
Il prend les Documents LangChain, les découpe en chunks si nécessaire,
les embed via bge-m3, et les upsert dans Qdrant Cloud.

Usage :
    python -m backend.rag.vectorizer --reset
    (--reset supprime et recrée la collection)
"""

import logging
import argparse
from typing import List, Optional
from uuid import uuid4

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PayloadSchemaType,
)

from backend.config import settings
from backend.rag.embedder import get_embedder
from backend.rag.loader import load_all_documents

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Client Qdrant
# ─────────────────────────────────────────────────────────────────────────────

def get_qdrant_client() -> QdrantClient:
    """Crée et retourne un client Qdrant Cloud."""
    return QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Chunking des documents
# ─────────────────────────────────────────────────────────────────────────────

def chunk_documents(documents: List[Document]) -> List[Document]:
    """
    Découpe les documents en chunks pour l'indexation.

    Pour les exercices, les documents sont déjà courts (< 500 tokens),
    donc le splitter ne fait presque rien — mais il normalise
    et gère les rares cas de descriptions longues.

    Les métadonnées sont préservées sur chaque chunk.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
        # Préserver les métadonnées sur chaque chunk
        add_start_index=True,
    )

    chunked = splitter.split_documents(documents)
    logger.info(
        f"Chunking : {len(documents)} docs → {len(chunked)} chunks "
        f"(chunk_size={settings.CHUNK_SIZE}, overlap={settings.CHUNK_OVERLAP})"
    )
    return chunked


# ─────────────────────────────────────────────────────────────────────────────
# Création de la collection Qdrant
# ─────────────────────────────────────────────────────────────────────────────

def create_collection(client: QdrantClient, reset: bool = False) -> None:
    """
    Crée la collection Qdrant si elle n'existe pas.

    Args:
        reset: Si True, supprime et recrée la collection (réindexation complète).
    """
    collection_name = settings.QDRANT_COLLECTION

    if reset:
        try:
            client.delete_collection(collection_name)
            logger.info(f"Collection '{collection_name}' supprimée")
        except Exception:
            pass  # La collection n'existait pas

    # Vérifie si la collection existe déjà
    existing = [c.name for c in client.get_collections().collections]
    if collection_name in existing:
        logger.info(f"Collection '{collection_name}' existe déjà — skip création")
        return

    # Création avec les paramètres adaptés à bge-m3
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(
            size=settings.EMBEDDING_DIMENSIONS,  # 1024 pour bge-m3
            distance=Distance.COSINE,             # cosinus pour bge-m3
        ),
    )

    # Index sur les champs metadata pour filtrage efficace
    # Ex: filtrer par equipment="body weight" avant la recherche vectorielle
    for field in ["body_part", "equipment", "difficulty", "target_muscle", "source"]:
        try:
            client.create_payload_index(
                collection_name=collection_name,
                field_name=f"metadata.{field}",
                field_schema=PayloadSchemaType.KEYWORD,
            )
        except Exception as e:
            logger.warning(f"Index sur '{field}' échoué (non bloquant) : {e}")

    logger.info(
        f"Collection '{collection_name}' créée "
        f"({settings.EMBEDDING_DIMENSIONS}d, COSINE)"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Upsert des documents vers Qdrant
# ─────────────────────────────────────────────────────────────────────────────

def upsert_documents(
    documents: List[Document],
    batch_size: int = 100,
) -> QdrantVectorStore:
    """
    Embed et upsert les documents dans Qdrant par batches.

    Args:
        documents: Liste de chunks à indexer
        batch_size: Nombre de docs traités par batch (évite les timeouts)

    Returns:
        QdrantVectorStore instance pour utilisation immédiate
    """
    client = get_qdrant_client()
    embedder = get_embedder()

    create_collection(client)

    logger.info(f"Indexation de {len(documents)} documents vers Qdrant Cloud...")

    # Utilise QdrantVectorStore de langchain_qdrant pour l'upsert
    # Il gère automatiquement les IDs et le batching
    vector_store = QdrantVectorStore(
        client=client,
        collection_name=settings.QDRANT_COLLECTION,
        embedding=embedder,
    )

    # Upsert par batches pour éviter les timeouts réseau
    total_upserted = 0
    for i in range(0, len(documents), batch_size):
        batch = documents[i : i + batch_size]
        ids = [str(uuid4()) for _ in batch]

        try:
            vector_store.add_documents(documents=batch, ids=ids)
            total_upserted += len(batch)
            logger.info(
                f"  Batch {i//batch_size + 1} : {total_upserted}/{len(documents)} docs indexés"
            )
        except Exception as e:
            logger.error(f"  Erreur batch {i//batch_size + 1} : {e}")
            raise

    logger.info(f"Indexation terminée : {total_upserted} documents dans Qdrant Cloud")
    return vector_store


# ─────────────────────────────────────────────────────────────────────────────
# Récupération du VectorStore existant
# ─────────────────────────────────────────────────────────────────────────────

def get_vector_store() -> QdrantVectorStore:
    """
    Retourne le VectorStore Qdrant existant pour les recherches.
    Utilisé par le retriever — ne crée pas de nouveaux documents.
    """
    client = get_qdrant_client()
    embedder = get_embedder()

    return QdrantVectorStore(
        client=client,
        collection_name=settings.QDRANT_COLLECTION,
        embedding=embedder,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Script d'indexation (lancé en ligne de commande)
# ─────────────────────────────────────────────────────────────────────────────

def run_indexing(reset: bool = False) -> None:
    """
    Pipeline complet d'indexation :
    1. Charge tous les fichiers de données
    2. Chunk les documents
    3. Upsert vers Qdrant Cloud
    """
    logger.info("=" * 60)
    logger.info("Démarrage de l'indexation CoachIA")
    logger.info("=" * 60)

    # 1. Chargement
    documents = load_all_documents(
        exercises_json_path=settings.EXERCISES_JSON,
        exercise_dataset_csv_path=settings.EXERCISES_CSV,
        muscle_csvs_dir=str(
            (
                __import__("pathlib").Path(settings.DATA_DIR)
                / "musculature_exercise"
                / "All_seperate"
            )
        ),
        muscles_json_path=settings.MUSCLES_JSON,
    )

    if not documents:
        logger.error("Aucun document chargé — vérifier les chemins dans .env")
        return

    # 2. Chunking
    chunks = chunk_documents(documents)

    # 3. Upsert Qdrant
    upsert_documents(chunks, batch_size=100)

    logger.info("Indexation terminée avec succès !")


if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)

    parser = argparse.ArgumentParser(description="Indexation CoachIA vers Qdrant")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Supprime et recrée la collection avant l'indexation",
    )
    args = parser.parse_args()
    run_indexing(reset=args.reset)