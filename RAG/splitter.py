# RAG/splitter.py
import os
import sys
import logging
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
    SentenceTransformersTokenTextSplitter,
)

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from setup.loging import logging_setup

load_dotenv()
logging_setup()
logger = logging.getLogger(__name__)

# Exercices : textes courts et denses → chunks petits
CHUNK_SIZE=512
CHUNK_OVERLAP=64


def get_character_splitter() -> RecursiveCharacterTextSplitter:
    """
    Splitter principal basé sur les caractères.
    Idéal pour les textes d'exercices (instructions, descriptions).
    """
    return RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " | ", " "],
        length_function=len,
        add_start_index=True,   # ajoute position du chunk dans metadata
    )

def get_token_splitter() -> SentenceTransformersTokenTextSplitter:
    """
    Splitter basé sur les tokens du modèle BAAI/bge-m3.
    Plus précis pour l'embedding — évite la troncature silencieuse.
    """
    return SentenceTransformersTokenTextSplitter(
        model_name="BAAI/bge-m3",
        chunk_size=CHUNK_SIZE,
        chunk_overlap=32,
    )


def split_documents(documents:list[Document],
                    use_token_splitter: bool = False
                    ) -> list[Document]:
    """
    Stratégie de split adaptative :
    - Documents courts (< CHUNK_SIZE) → pas de split, conservés entiers
    - Documents longs (>= CHUNK_SIZE) → split en chunks
    Préserve toutes les métadonnées dans chaque chunk.
    """
    short_docs = []
    long_docs  = []

    for doc in documents:
        if len(doc.page_content) < CHUNK_SIZE:
            short_docs.append(doc)
        else:
            long_docs.append(doc)

    logger.info(f"Documents courts (intact)  : {len(short_docs)}")
    logger.info(f"Documents longs (à splitter): {len(long_docs)}")

    # Split des documents longs
    if long_docs:
        splitter = get_token_splitter() if use_token_splitter else get_character_splitter()
        chunked_long = splitter.split_documents(long_docs)

        # Propager les métadonnées du document parent vers chaque chunk
        for chunk in chunked_long:
            chunk.metadata["chunk_type"] = "split"

        logger.info(f"{len(long_docs)} docs → {len(chunked_long)} chunks")
    else:
        chunked_long = []

    # Marquer les docs courts comme non splittés
    for doc in short_docs:
        doc.metadata["chunk_type"] = "full"

    all_chunks = short_docs + chunked_long

    logger.info(f"Total chunks finaux : {len(all_chunks)}")
    return all_chunks