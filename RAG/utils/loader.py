# RAG/loader.py
import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_community.document_loaders import (
    JSONLoader,
    CSVLoader,
    DirectoryLoader,
)

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from setup.loging import logging_setup

load_dotenv()
logging_setup()
logger = logging.getLogger(__name__)

PROCESSED_DIR = Path("datadb/processed")
GIFS_DIR      = Path("datadb/raw/exercisedb/gifs")
RAW_CSV_DIR   = Path("datadb/raw/musculature_exercise/All_seperate")


def load_gifs_index() -> dict:
    """
    Construit un index { exercise_id: { resolution: path } }
    pour tous les GIFs disponibles localement.
    """
    index = {}
    for res_dir in GIFS_DIR.iterdir():
        if not res_dir.is_dir():
            continue
        resolution = res_dir.name.replace("gifs_", "")
        for gif_file in res_dir.glob("*.gif"):
            ex_id = gif_file.stem
            if ex_id not in index:
                index[ex_id] = {}
            index[ex_id][resolution] = str(gif_file)

    logger.info(
        f"GIFs indexés : {len(index)} exercices | "
        f"résolutions : {sorted(set(r for v in index.values() for r in v))}"
    )
    return index


def load_exercises_json() -> list[Document]:
    """
    Charge exercises_processed.json via JSONLoader.
    Extrait le full_text comme page_content.
    """
    gif_index = load_gifs_index()
    path      = str(PROCESSED_DIR / "exercises_processed.json")

    loader = JSONLoader(
        file_path=path,
        jq_schema=".[]\
            | {content: .full_text, \
               exercise_id: .exercise_id, \
               name: .name, \
               body_parts: .body_parts, \
               target_muscles: .target_muscles, \
               secondary_muscles: .secondary_muscles, \
               equipments: .equipments, \
               instructions: .instructions_clean, \
               nb_steps: .nb_steps}",
        content_key="content",
        metadata_func=lambda record, meta: {
            **meta,
            "exercise_id":       record.get("exercise_id", ""),
            "name":              record.get("name", ""),
            "body_parts":        ", ".join(record.get("body_parts", [])),
            "target_muscles":    ", ".join(record.get("target_muscles", [])),
            "secondary_muscles": ", ".join(record.get("secondary_muscles", [])),
            "equipments":        ", ".join(record.get("equipments", [])),
            "instructions":      record.get("instructions", ""),
            "nb_steps":          record.get("nb_steps", 0),
            "source":            "exercisedb_json",
            "type":              "exercise_detailed",
        },
        is_content_key_jq_parsable=False,
    )

    docs = loader.load()

    # Enrichir avec les chemins GIFs
    for doc in docs:
        ex_id = doc.metadata.get("exercise_id", "")
        gifs  = gif_index.get(ex_id, {})
        doc.metadata["gif_180"]  = gifs.get("180x180", "")
        doc.metadata["gif_360"]  = gifs.get("360x360", "")
        doc.metadata["gif_720"]  = gifs.get("720x720", "")
        doc.metadata["gif_1080"] = gifs.get("1080x1080", "")

    logger.info(f" exercises_processed.json → {len(docs)} documents")
    return docs

def load_musculature_json() -> list[Document]:
    """
    Charge musculature_processed.json via JSONLoader.
    168 exercices par groupe musculaire.
    """
    path = str(PROCESSED_DIR / "musculature_processed.json")

    loader = JSONLoader(
        file_path=path,
        jq_schema=".[]\
            | {content: .full_text, \
               name: .name, \
               target: .target, \
               body_part: .bodyPart, \
               equipment: .equipment, \
               instructions: .instructions, \
               secondary_muscles: .secondary_muscles}",
        content_key="content",
        metadata_func=lambda record, meta: {
            **meta,
            "name":              record.get("name", ""),
            "target":            record.get("target", ""),
            "body_part":         record.get("body_part", ""),
            "equipment":         record.get("equipment", ""),
            "instructions":      record.get("instructions", ""),
            "secondary_muscles": record.get("secondary_muscles", ""),
            "source":            "musculature_csv",
            "type":              "exercise_basic",
        },
        is_content_key_jq_parsable=False,
    )

    docs = loader.load()
    logger.info(f" musculature_processed.json → {len(docs)} documents")
    return docs

def load_raw_csvs() -> list[Document]:
    """
    Charge les 19 CSV séparés par muscle via DirectoryLoader + CSVLoader.
    Utilisé comme fallback ou enrichissement supplémentaire.
    """
    loader = DirectoryLoader(
        path=str(RAW_CSV_DIR),
        glob="exercises_*.csv",
        loader_cls=CSVLoader,
        loader_kwargs={"encoding": "utf-8"},
        show_progress=True,
    )

    docs = loader.load()

    # Enrichir les métadonnées avec le muscle depuis le nom de fichier
    for doc in docs:
        source     = doc.metadata.get("source", "")
        filename   = Path(source).stem              # ex: "exercises_biceps"
        muscle     = filename.replace("exercises_", "")
        doc.metadata["muscle_group"] = muscle
        doc.metadata["type"]         = "exercise_raw"

    logger.info(f" CSV bruts (19 fichiers) → {len(docs)} documents")
    return docs


def load_all_documents() -> list[Document]:
    """
    Charge TOUS les documents pour le pipeline RAG.
    Dédoublonnage par nom d'exercice.
    """
    docs = []
    docs.extend(load_exercises_json())
    docs.extend(load_musculature_json())

    # Dédoublonnage par nom
    seen, unique = set(), []
    for doc in docs:
        key = doc.metadata.get("name", "").lower().strip()
        if key and key not in seen:
            seen.add(key)
            unique.append(doc)
        elif not key:
            unique.append(doc)

    logger.info(f"Total documents uniques : {len(unique)}")
    return unique


if __name__ == "__main__":
    load_all_documents()