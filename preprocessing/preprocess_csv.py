import os, sys, dotenv, pathlib, glob
import pandas as pd

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import dotenv
import logging, json
from setup.loging import logging_setup


dotenv.load_dotenv()
# setup logging

logging_setup()
# logging
logger = logging.getLogger(__name__)
logger.info("Starting CSV preprocessing...")

RAW_DIR = pathlib.Path("datadb/raw/musculature_exercise/All_seperate")
EXERCISE_FILE = pathlib.Path("datadb/raw/musculature_exercise/exercise_dataset.csv")
PROCESS_DIR = pathlib.Path('datadb/processed')


def load_csv_and_merge()-> pd.DataFrame:

    """
    Fusionner tous les 19 fichiers csv en un seul fichier et 
    Exercise dataset csv
    """
    df_global = pd.read_csv(EXERCISE_FILE)
    logger.info(f"Fichier {EXERCISE_FILE} chargé avec succès.")

    """
     Ici nous avons 19 fichiers csv à fusionner, nous allons les parcourir et les fusionner avec le dataframe global
     en utilisant la colonne "exercise_name" comme clé de fusion.
     Nous allons utiliser une boucle pour parcourir les fichiers csv et les fusionner un par un avec le dataframe global.
     Nous allons utiliser la fonction pd.merge() pour fusionner les dataframes
    """

    df_separate = []
    
    for csv_file in sorted(RAW_DIR.glob("exercises_*.csv")):
        df_temp = pd.read_csv(csv_file)
        logger.info(f"Fichier {csv_file} chargé avec succès.")
        df_temp["source_file"]=csv_file.stem
        df_separate.append(df_temp)

        logger.debug(f"Dataframe temporaire pour {csv_file} ")

    """concatener les fichiers csv temporaires"""
    df_concat = pd.concat(df_separate, ignore_index=True)
    logger.info("Tous les fichiers csv ont été fusionnés avec succès.")

    df_global["source_file"] = "exercise_dataset"

    df_merged = pd.concat([df_global, df_concat], ignore_index=True)

    # Supprimer les doublons sur le nom (garder la première occurrence)
    before = len(df_merged)
    df_merged = df_merged.drop_duplicates(subset=["name"], keep="first")
    after = len(df_merged)
    logger.info(f"Doublons supprimés : {before - after} | Total final : {after}")

    return df_merged


"""Nettoyer les csv"""

def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:

    # Normalisation des colonnes texte
    df["name"]      = df["name"].str.strip().str.title()
    df["target"]    = df["target"].str.strip().str.lower()
    df["bodyPart"]  = df["bodyPart"].str.strip().str.lower()
    df["equipment"] = df["equipment"].str.strip().str.lower()

    # Supprimer lignes avec valeurs manquantes critiques
    before = len(df)
    df = df.dropna(subset=["name", "target", "bodyPart", "equipment"])
    logger.info(f" Lignes invalides supprimées : {before - len(df)} | Restant : {len(df)}")

    return df.reset_index(drop=True)


def build_full_text(row: pd.Series) -> str:
    return f"""Exercice : {row['name']}
Partie du corps : {row['bodyPart']}
Muscle ciblé : {row['target']}
Équipement : {row['equipment']}""".strip()


def enrich_with_json(df: pd.DataFrame) -> pd.DataFrame:
    """
    croiser les CSV avec exercises_processed.json
    pour ajouter instructions, muscles secondaires et full_text riche.
    """
    json_path = PROCESS_DIR / "exercises_processed.json"

    if not json_path.exists():
        logger.warning(" exercises_processed.json non trouvé — enrichissement ignoré")
        df["full_text"] = df.apply(build_full_text, axis=1)
        return df

    with open(json_path, "r", encoding="utf-8") as f:
        json_data = json.load(f)

    # Index par nom normalisé pour le matching
    json_index = {ex["name"].lower(): ex for ex in json_data}

    instructions_list  = []
    secondary_list     = []
    full_text_list     = []
    gif_list           = []
    enriched_count     = 0

    for _, row in df.iterrows():
        name_key = row["name"].lower()
        match    = json_index.get(name_key)

        if match:
            instructions_list.append(match.get("instructions_clean", ""))
            secondary_list.append(", ".join(match.get("secondary_muscles", [])))
            full_text_list.append(match.get("full_text", build_full_text(row)))
            gif_list.append(match.get("gif_url", ""))
            enriched_count += 1
        else:
            instructions_list.append("")
            secondary_list.append("")
            full_text_list.append(build_full_text(row))
            gif_list.append("")

    df["instructions"]       = instructions_list
    df["secondary_muscles"]  = secondary_list
    df["full_text"]          = full_text_list
    df["gif_url"]            = gif_list

    logger.info(f"Exercices enrichis avec JSON : {enriched_count}/{len(df)}")
    return df

# Sauvegarde 
def save_results(df: pd.DataFrame):
    # CSV final
    csv_path = PROCESS_DIR / "musculature_processed.csv"
    df.to_csv(csv_path, index=False, encoding="utf-8")
    logger.info(f"CSV sauvegardé : {csv_path} ({len(df)} lignes)")

    # JSON final
    json_path = PROCESS_DIR / "musculature_processed.json"
    df.to_json(json_path, orient="records", force_ascii=False, indent=2)
    logger.info(f"JSON sauvegardé : {json_path} ({len(df)} entrées)")

    # Stats par muscle
    logger.info("\n Distribution par muscle cible :")
    for muscle, count in df["target"].value_counts().items():
        logger.info(f"   {muscle:<30} : {count} exercices")

if __name__ == "__main__":
    df = load_csv_and_merge()
    df = clean_dataframe(df)
    df = enrich_with_json(df)
    save_results(df)

    logger.info("\n Preprocessing CSV terminé !")
    print(f"\n Aperçu :\n{df[['name','target','bodyPart','equipment']].head(5).to_string()}")
