# RAG/tools.py
import os
import sys
import json
import logging
from datetime import datetime, date
from typing import Optional
from dotenv import load_dotenv
from langchain.tools import tool

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from setup.loging import logging_setup
from RAG.retriever import retrieve

load_dotenv()
logging_setup()
logger = logging.getLogger(__name__)


# TOOL 1 : Recherche exercices

@tool
def search_exercises(query: str) -> str:
    """
    Recherche des exercices de fitness dans la base de données RAG.
    Utilise cet outil quand l'utilisateur demande des exercices
    pour un muscle, une partie du corps ou un équipement spécifique.
    Entrée : requête en langage naturel (ex: 'exercices pour les biceps')
    """
    docs = retrieve(query, k=6)
    if not docs:
        return "Aucun exercice trouvé pour cette recherche."

    results = []
    for doc in docs:
        name        = doc.metadata.get("name", "Inconnu")
        muscles     = (
            doc.metadata.get("target_muscles") or
            doc.metadata.get("target", "Non spécifié")
        )
        equipment   = (
            doc.metadata.get("equipments") or
            doc.metadata.get("equipment", "Non spécifié")
        )
        body_part   = (
            doc.metadata.get("body_parts") or
            doc.metadata.get("body_part", "")
        )
        instructions = doc.metadata.get("instructions", "")
        gif_360      = doc.metadata.get("gif_360", "")

        entry  = f"**{name}**\n"
        entry += f"  - Muscles    : {muscles}\n"
        entry += f"  - Corps      : {body_part}\n"
        entry += f"  - Équipement : {equipment}\n"
        if instructions:
            entry += f"  - Instructions : {instructions[:200]}...\n"
        if gif_360:
            entry += f"  - GIF : {gif_360}\n"
        results.append(entry)

    return "\n---\n".join(results)

# TOOL 2 : Recherche par muscle
@tool
def search_by_muscle(muscle: str) -> str:
    """
    Recherche des exercices ciblant un muscle spécifique.
    Utilise cet outil quand l'utilisateur mentionne un muscle précis.
    Muscles disponibles : biceps, triceps, pectorals, lats, glutes,
    quads, hamstrings, calves, abs, delts, traps, forearms, spine,
    upper back, adductors, abductors, serratus anterior, levator scapulae,
    cardiovascular system.
    Entrée : nom du muscle en anglais ou français
    """
    query = f"exercises targeting {muscle} muscle"
    return search_exercises(query)


# TOOL 3 : Recherche par équipement

@tool
def search_by_equipment(equipment: str) -> str:
    """
    Recherche des exercices selon l'équipement disponible.
    Utilise cet outil quand l'utilisateur précise son matériel.
    Équipements : barbell, dumbbell, body weight, resistance band,
    cable, machine, kettlebell, sled machine, leverage machine.
    Entrée : nom de l'équipement
    """
    query = f"exercises using {equipment} equipment"
    return search_exercises(query)


# TOOL 4 : Analyse profil utilisateur

@tool
def analyze_user_profile(profile_json: str) -> str:
    """
    Analyse le profil utilisateur et calcule les métriques clés.
    Utilise cet outil en PREMIER quand l'utilisateur donne ses infos
    (poids, objectif, niveau, taille, âge).
    Entrée : JSON string avec les champs :
    {
        "name": str,
        "gender": str,
        "age": int,
        "height": float,
        "current_weight": float,
        "target_weight": float,
        "level": str,
        "available_days": int,
        "equipment": str,
        "restrictions": str
    }
    """
    try:
        profile = json.loads(profile_json)

        current_weight = float(profile.get("current_weight", 70))
        target_weight  = float(profile.get("target_weight",  60))
        height         = float(profile.get("height",        170)) / 100
        age            = int(profile.get("age",              25))
        gender         = profile.get("gender", "masculin")
        available_days = int(profile.get("available_days",    3))

        # Calculs
        weight_to_lose  = round(current_weight - target_weight, 1)
        bmi             = round(current_weight / (height ** 2), 1)
        # 1 kg de graisse ≈ 7700 kcal
        # Déficit moyen 500 kcal/jour → 0.5 kg/semaine
        estimated_weeks = max(8, round(weight_to_lose / 0.5))

        # Catégorie IMC
        if bmi < 18.5:
            bmi_category = "Insuffisance pondérale"
        elif bmi < 25:
            bmi_category = "Poids normal"
        elif bmi < 30:
            bmi_category = "Surpoids"
        else:
            bmi_category = "Obésité"

        # Intensité selon niveau
        intensity_map = {
            "débutant":       "faible à modérée",
            "intermédiaire":  "modérée à élevée",
            "avancé":         "élevée",
        }
        level     = profile.get("level", "débutant").lower()
        intensity = intensity_map.get(level, "modérée")

        # Durée séance selon disponibilité
        session_duration = 45 if available_days >= 4 else 60

        # Groupes musculaires prioritaires selon objectif
        priority_muscles = (
            ["cardiovascular system", "quads", "glutes", "abs"]
            if weight_to_lose > 5
            else ["pectorals", "lats", "delts", "biceps", "triceps"]
        )

        analysis = {
            "bmi":                          bmi,
            "bmi_category":                 bmi_category,
            "weight_to_lose_kg":            weight_to_lose,
            "estimated_weeks":              estimated_weeks,
            "recommended_sessions_per_week": available_days,
            "session_duration_minutes":     session_duration,
            "intensity_level":              intensity,
            "priority_muscle_groups":       priority_muscles,
            "weekly_calorie_deficit":       500 * 7,
        }

        # Formatage lisible
        output  = f"📊 **Analyse du profil de {profile.get('name', 'l\'utilisateur')}**\n\n"
        output += f"- IMC               : {bmi} ({bmi_category})\n"
        output += f"- Poids à perdre    : {weight_to_lose} kg\n"
        output += f"- Durée estimée     : {estimated_weeks} semaines\n"
        output += f"- Séances/semaine   : {available_days}\n"
        output += f"- Durée séance      : {session_duration} min\n"
        output += f"- Intensité         : {intensity}\n"
        output += f"- Muscles prioritaires : {', '.join(priority_muscles)}\n"
        output += f"- Déficit calorique : ~{analysis['weekly_calorie_deficit']} kcal/semaine\n"

        logger.info(f"✅ Profil analysé : {profile.get('name')} | {weight_to_lose}kg à perdre | {estimated_weeks} semaines")
        return output

    except (json.JSONDecodeError, ValueError, KeyError) as e:
        logger.error(f"❌ Erreur analyse profil : {e}")
        return f"Erreur lors de l'analyse du profil : {e}"



# TOOL 5 : Génération plan d'entraînement


@tool
def generate_training_plan(plan_request_json: str) -> str:
    """
    Génère un plan d'entraînement personnalisé structuré.
    Utilise cet outil après analyze_user_profile.
    Entrée : JSON string avec les champs :
    {
        "current_weight": float,
        "target_weight": float,
        "level": str,
        "available_days": int,
        "equipment": str,
        "estimated_weeks": int,
        "priority_muscles": [str],
        "restrictions": str
    }
    """
    try:
        params = json.loads(plan_request_json)

        level           = params.get("level", "débutant")
        available_days  = int(params.get("available_days", 3))
        equipment       = params.get("equipment", "body weight")
        estimated_weeks = int(params.get("estimated_weeks", 12))
        priority_muscles= params.get("priority_muscles", [])
        restrictions    = params.get("restrictions", "aucune")

        # Rechercher des exercices pour chaque muscle prioritaire
        exercises_by_muscle = {}
        for muscle in priority_muscles[:4]:
            docs = retrieve(
                f"exercises for {muscle} with {equipment}",
                k=4
            )
            exercises_by_muscle[muscle] = [
                {
                    "name":      d.metadata.get("name", ""),
                    "equipment": d.metadata.get("equipments") or d.metadata.get("equipment", ""),
                    "gif":       d.metadata.get("gif_360", ""),
                }
                for d in docs
            ]

        # Construction du plan
        plan  = f"## 🏋️ Plan d'entraînement — {level.title()} | {estimated_weeks} semaines\n\n"
        plan += f"**Équipement** : {equipment}\n"
        plan += f"**Séances/semaine** : {available_days}\n"
        plan += f"**Restrictions** : {restrictions}\n\n"

        # Répartition des jours
        day_names = ["Lundi", "Mercredi", "Vendredi", "Samedi", "Dimanche"]
        muscles   = list(exercises_by_muscle.keys())

        for day_idx in range(min(available_days, 5)):
            day_name    = day_names[day_idx]
            muscle_focus= muscles[day_idx % len(muscles)] if muscles else "full body"
            exercises   = exercises_by_muscle.get(muscle_focus, [])

            plan += f"### 📅 {day_name} — {muscle_focus.title()}\n"
            if exercises:
                for ex in exercises[:4]:
                    sets_reps = (
                        "3x15" if level == "débutant"
                        else "4x12" if level == "intermédiaire"
                        else "5x8"
                    )
                    plan += f"- **{ex['name']}** | {sets_reps}"
                    if ex.get("gif"):
                        plan += f" | [GIF]({ex['gif']})"
                    plan += "\n"
            else:
                plan += "- Exercices cardio léger 30 min\n"
            plan += "\n"

        plan += "### 💡 Conseils\n"
        plan += "- Échauffement 5-10 min avant chaque séance\n"
        plan += "- Récupération active entre les séries\n"
        plan += "- Hydratation : 2L d'eau minimum par jour\n"
        plan += "- Sommeil : 7-8h par nuit pour la récupération\n"

        logger.info(f"✅ Plan généré : {available_days} jours/sem | {estimated_weeks} semaines")
        return plan

    except (json.JSONDecodeError, ValueError, KeyError) as e:
        logger.error(f"❌ Erreur génération plan : {e}")
        return f"Erreur lors de la génération du plan : {e}"

# ─────────────────────────────────────────────────────
# TOOL 6 : Structuration événements Google Calendar
# ─────────────────────────────────────────────────────
@tool
def structure_calendar_events(calendar_request_json: str) -> str:
    """
    Structure les séances d'entraînement en événements Google Calendar.
    Utilise cet outil après generate_training_plan quand l'utilisateur
    veut exporter son planning sur Google Calendar.
    Entrée : JSON string avec les champs :
    {
        "plan_summary": str,
        "available_days": [str],
        "start_date": "YYYY-MM-DD",
        "estimated_weeks": int,
        "session_duration_minutes": int,
        "preferred_time": "HH:MM"
    }
    """
    try:
        params = json.loads(calendar_request_json)

        available_days      = params.get("available_days", ["Lundi", "Mercredi", "Vendredi"])
        start_date_str      = params.get("start_date", str(date.today()))
        estimated_weeks     = int(params.get("estimated_weeks", 12))
        session_duration    = int(params.get("session_duration_minutes", 60))
        preferred_time      = params.get("preferred_time", "07:00")
        plan_summary        = params.get("plan_summary", "Séance d'entraînement CoachIA")

        # Calcul heure de fin
        start_hour, start_min = map(int, preferred_time.split(":"))
        end_hour   = start_hour + (session_duration // 60)
        end_min    = start_min  + (session_duration %  60)
        if end_min >= 60:
            end_hour += 1
            end_min  -= 60
        end_time = f"{end_hour:02d}:{end_min:02d}"

        # Mapping jours FR → numéro semaine
        day_map = {
            "lundi": 0, "mardi": 1, "mercredi": 2,
            "jeudi": 3, "vendredi": 4, "samedi": 5, "dimanche": 6
        }

        events      = []
        start_date  = datetime.strptime(start_date_str, "%Y-%m-%d")
        total_sessions = 0

        for week in range(estimated_weeks):
            for day_name in available_days:
                day_offset = day_map.get(day_name.lower(), 0)
                # Décalage depuis le lundi de la semaine courante
                current_date = start_date
                current_weekday = current_date.weekday()
                days_ahead = day_offset - current_weekday + (week * 7)
                event_date = start_date + __import__("datetime").timedelta(days=days_ahead)

                events.append({
                    "title":            f"🏋️ CoachIA — Séance {day_name}",
                    "description":      f"{plan_summary}\n\nSéance {total_sessions + 1}/{estimated_weeks * len(available_days)}",
                    "date":             event_date.strftime("%Y-%m-%d"),
                    "start_time":       preferred_time,
                    "end_time":         end_time,
                    "reminder_minutes": 30,
                })
                total_sessions += 1

        output = {
            "total_events":   total_sessions,
            "duration_weeks": estimated_weeks,
            "events":         events[:10],   # aperçu 10 premiers
            "message":        f"✅ {total_sessions} séances planifiées sur {estimated_weeks} semaines"
        }

        logger.info(f"✅ {total_sessions} événements Calendar structurés")
        return json.dumps(output, ensure_ascii=False, indent=2)

    except (json.JSONDecodeError, ValueError, KeyError) as e:
        logger.error(f"❌ Erreur structuration Calendar : {e}")
        return f"Erreur lors de la structuration des événements : {e}"

# TOOL 7 : Récupération GIF d'un exercice
@tool
def get_exercise_gif(exercise_name: str) -> str:
    """
    Récupère le GIF animé d'un exercice spécifique.
    Utilise cet outil quand l'utilisateur veut VOIR comment
    réaliser un exercice précis.
    Entrée : nom de l'exercice en anglais ou français
    """
    docs = retrieve(exercise_name, k=3)

    for doc in docs:
        name    = doc.metadata.get("name", "").lower()
        gif_720 = doc.metadata.get("gif_720", "")
        gif_1080 = doc.metadata.get("gif_1080", "")

        if exercise_name.lower() in name or name in exercise_name.lower():
            if gif_1080 or gif_720:
                return json.dumps({
                    "exercise":  doc.metadata.get("name"),
                    "gif_medium": gif_720,
                    "gif_large": gif_1080,
                    "muscles":   doc.metadata.get("target_muscles") or doc.metadata.get("target"),
                    "equipment": doc.metadata.get("equipments") or doc.metadata.get("equipment"),
                }, ensure_ascii=False)

    return f"GIF non trouvé pour '{exercise_name}'. Essaie un autre nom."


# Factory : liste de tous les tools

def get_all_tools() -> list:
    """Retourne tous les tools disponibles pour l'agent."""
    return [
        search_exercises,
        search_by_muscle,
        search_by_equipment,
        analyze_user_profile,
        generate_training_plan,
        structure_calendar_events,
        get_exercise_gif,
    ]