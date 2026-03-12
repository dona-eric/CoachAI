# RAG/retriever.py
import os
import sys
import logging
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_qdrant import QdrantVectorStore
# `langchain_core` no longer exposes the ensemble/merger retrievers in recent versions.
# Use `langchain_classic`, which provides the legacy retriever implementations.
from langchain_classic.retrievers import EnsembleRetriever, MergerRetriever
from langchain_community.retrievers import BM25Retriever

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from setup.loging import logging_setup
from RAG.embedder import get_embedding_model
from RAG.utils.connection_cloud import (
    get_qdrant_client,
    COLLECTION_EXERCISES,
    COLLECTION_MUSCULATURE,
)

load_dotenv()
logging_setup()
logger = logging.getLogger(__name__)



def get_dense_retriever(
    collection_name: str,
    k: int = 5,
    score_threshold: float = 0.4,
):
    """
    Retriever sémantique dense depuis Qdrant.
    Recherche par similarité cosine sur les vecteurs BAAI/bge-m3.
    """
    vectorstore = QdrantVectorStore(
        client=get_qdrant_client(),
        collection_name=collection_name,
        embedding=get_embedding_model(),
    )
    return vectorstore.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={
            "k": k,
            "score_threshold": score_threshold,
        }
    )

# ─── Retriever sparse (BM25) ──────────────────────────
def get_sparse_retriever(
    documents: list[Document],
    k: int = 5,
) -> BM25Retriever:
    """
    Retriever lexical BM25.
    Utile pour les requêtes précises (noms d'exercices, équipements).
    """
    retriever   = BM25Retriever.from_documents(documents, k=k)
    retriever.k = k
    return retriever

# ─── Retriever hybride (Dense + BM25) ─────────────────
def get_hybrid_retriever(
    documents: list[Document],
    collection_name: str,
    k: int = 5,
    dense_weight: float = 0.6,
    sparse_weight: float = 0.4,
) -> EnsembleRetriever:
    """
    Hybrid retriever : Dense (Qdrant) + Sparse (BM25).
    Fusion via Reciprocal Rank Fusion (RRF).
    dense_weight  : poids recherche sémantique (60%)
    sparse_weight : poids recherche lexicale   (40%)
    """
    dense_retriever  = get_dense_retriever(collection_name, k=k)
    sparse_retriever = get_sparse_retriever(documents, k=k)

    hybrid = EnsembleRetriever(
        retrievers=[dense_retriever, sparse_retriever],
        weights=[dense_weight, sparse_weight],
    )
    logger.info(
        f"✅ Hybrid retriever '{collection_name}' "
        f"(dense={dense_weight} | sparse={sparse_weight})"
    )
    return hybrid

# ─── Retriever multi-collections ──────────────────────
def get_multi_collection_retriever(k: int = 4) -> MergerRetriever:
    """
    Interroge simultanément les 2 collections Qdrant.
    Fusionne et dédoublonne les résultats.
    coachia_exercises   : exercices détaillés avec instructions
    coachia_musculature : dataset large 168 exercices
    """
    r_exercises   = get_dense_retriever(COLLECTION_EXERCISES,   k=k)
    r_musculature = get_dense_retriever(COLLECTION_MUSCULATURE, k=k)

    merger = MergerRetriever(retrievers=[r_exercises, r_musculature])
    logger.info("✅ Multi-collection retriever (exercises + musculature)")
    return merger

# ─── Retriever avec filtre metadata ───────────────────
def get_filtered_retriever(
    collection_name: str,
    filter_field: str,
    filter_value: str,
    k: int = 5,
):
    """
    Retriever avec filtre sur les métadonnées Qdrant.
    Exemple : filtrer par muscle cible, équipement, niveau...
    """
    from qdrant_client.models import Filter, FieldCondition, MatchValue

    vectorstore = QdrantVectorStore(
        client=get_qdrant_client(),
        collection_name=collection_name,
        embedding=get_embedding_model(),
    )
    return vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={
            "k": k,
            "filter": Filter(
                must=[
                    FieldCondition(
                        key=filter_field,
                        match=MatchValue(value=filter_value)
                    )
                ]
            )
        }
    )

# ─── Fonction de recherche principale ─────────────────
def retrieve(
    query: str,
    k: int = 6,
    use_hybrid: bool = False,
    documents: list[Document] = None,
) -> list[Document]:
    """
    Fonction principale de recherche RAG.
    use_hybrid=True  : Dense + BM25 (nécessite documents)
    use_hybrid=False : Multi-collection dense uniquement
    """
    if use_hybrid and documents:
        retriever = get_hybrid_retriever(
            documents=documents,
            collection_name=COLLECTION_EXERCISES,
            k=k,
        )
    else:
        retriever = get_multi_collection_retriever(k=k)

    results = retriever.invoke(query)

    # Dédoublonnage par nom
    seen, unique = set(), []
    for doc in results:
        name = doc.metadata.get("name", "").lower()
        if name not in seen:
            seen.add(name)
            unique.append(doc)

    logger.info(f"🔍 '{query}' → {len(unique)} résultats uniques")
    for i, doc in enumerate(unique):
        name   = doc.metadata.get("name", "?")
        source = doc.metadata.get("source", "?")
        target = (
            doc.metadata.get("target_muscles") or
            doc.metadata.get("target", "?")
        )
        logger.debug(f"  [{i+1}] {name} | {target} | {source}")

    return unique