import json, csv, os, sys
import pandas as pd
import dotenv, pathlib, logging

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from setup.loging import logging_setup

logging_setup()
dotenv.load_dotenv()

raw_dir = pathlib.Path('datadb/raw/exercisedb')
process_dir = pathlib.Path('datadb/processed')
process_dir.mkdir(parents=True, exist_ok=True)

logger = logging.getLogger(__name__)
logger.info('Starting JSON preprocessing...')


def clean_instructions(instructions: list)-> str:

    """ Nettoyer les instructions en supprimant 
    les caractères spéciaux et les espaces inutiles.
    Args:
        instructions (list): Liste d'instructions à nettoyer.
    Returns:
        str: Instructions nettoyées.
    """
    try:
        cleaned = []

        for step in instructions:
            # Supprime le préfixe "Step:1 ", "Step:2 ", etc.
            text = step.strip()
            if text.lower().startswith("step:"):
                parts = text.split(" ", 1)
                text = parts[1].strip() if len(parts) > 1 else text
            cleaned.append(text)
        return " | ".join(cleaned)

    except Exception as e:
        logger.error(f"Erreur lors du nettoyage des instructions : {e}")
        return " | ".join(instructions)  # Retourne les instructions originales en cas d'erreur

def clean_list_field(items: list) -> str:
    """Convertit une liste en string séparée par virgules."""
    return ", ".join([str(i).strip() for i in items]) if items else ""


def build_full_text(exercise: dict) -> str:
    """
    Construit un texte unifié et riche pour l'embedding RAG.
    Ce texte sera ce que Qdrant indexe et recherche.
    """
    instructions_text = clean_instructions(exercise.get("instructions", []))

    full_text = f"""
    Exercice : {exercise.get('name', '').title()}
    Parties du corps : {clean_list_field(exercise.get('bodyParts', []))}
    Muscles ciblés : {clean_list_field(exercise.get('targetMuscles', []))}
    Muscles secondaires : {clean_list_field(exercise.get('secondaryMuscles', []))}
    Équipement : {clean_list_field(exercise.get('equipments', []))}
    Instructions : {instructions_text}
    """.strip()

    return full_text


def preprocess_exercises_json(
    input_path: pathlib.Path = raw_dir / "exercises.json") -> list:

    logger.info(f"Chargement de {input_path}...")

    with open(input_path, "r", encoding="utf-8") as f:
        exercises = json.load(f)

    logger.info(f"{len(exercises)} exercices trouvés")

    processed = []
    skipped   = 0

    for ex in exercises:
        if not ex.get("name") or not ex.get("instructions"):
            skipped += 1
            logger.warning(f" Exercice ignoré (données manquantes) : {ex.get('exerciseId')}")
            continue

        processed_ex = {
            "exercise_id":         ex.get("exerciseId", ""),
            "name":                ex.get("name", "").strip().title(),
            "gif_url":             ex.get("gifUrl", ""),
            "body_parts":          ex.get("bodyParts", []),
            "target_muscles":      ex.get("targetMuscles", []),
            "secondary_muscles":   ex.get("secondaryMuscles", []),
            "equipments":          ex.get("equipments", []),
            "instructions_clean":  clean_instructions(ex.get("instructions", [])),
            "full_text":           build_full_text(ex),
            "nb_steps":            len(ex.get("instructions", [])),
            "has_gif":             bool(ex.get("gifUrl")),
        }

        processed.append(processed_ex)

    logger.info(f"{len(processed)} exercices traités | {skipped} ignorés")
    return processed

# Sauvegarde JSON
def save_to_json(data: list, output_path: pathlib.Path = process_dir / "exercises_processed.json"):
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    logger.info(f"JSON sauvegardé : {output_path} ({len(data)} entrées)")

# Sauvegarde CSV
def save_to_csv(data: list, output_path: pathlib.Path = process_dir / "exercises_processed.csv"):
    if not data:
        return

    # Aplatir les listes pour le CSV
    flat_data = []
    for ex in data:
        flat_data.append({
            **ex,
            "body_parts":        ", ".join(ex["body_parts"]),
            "target_muscles":    ", ".join(ex["target_muscles"]),
            "secondary_muscles": ", ".join(ex["secondary_muscles"]),
            "equipments":        ", ".join(ex["equipments"]),
        })

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=flat_data[0].keys())
        writer.writeheader()
        writer.writerows(flat_data)

    logger.info(f"CSV sauvegardé : {output_path} ({len(flat_data)} lignes)")


if __name__ == "__main__":
    processed = preprocess_exercises_json()

    if processed:
        save_to_json(processed)
        save_to_csv(processed)

        # Aperçu du premier exercice traité
        logger.info("\n Aperçu du premier exercice :")
        ex = processed[0]
        print(f"\nNom        : {ex['name']}")
        print(f"Muscles    : {ex['target_muscles']}")
        print(f"Équipement : {ex['equipments']}")
        print(f"\nFull text RAG :\n{ex['full_text']}")
