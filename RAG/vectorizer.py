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