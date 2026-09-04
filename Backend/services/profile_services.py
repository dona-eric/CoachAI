# backend/services/profile_service.py
import logging, sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from Backend.models.schemas import UserProfile, UserProfileResponse

logger = logging.getLogger(__name__)

def analyze_profile(profile: UserProfile) -> UserProfileResponse:
    """Calcule les métriques du profil utilisateur."""

    height_m = profile.height / 100
    bmi            = round(profile.current_weight / (height_m ** 2), 1)
    weight_to_lose = round(profile.current_weight - profile.target_weight, 1)
    estimated_weeks = max(8, round(weight_to_lose / 0.5))

    # IMC
    if bmi < 18.5:
        bmi_category = "Insuffisance pondérale"
    elif bmi < 25:
        bmi_category = "Poids normal"
    elif bmi < 30:
        bmi_category = "Surpoids"
    else:
        bmi_category = "Obésité"

    # Intensité
    intensity_map = {
        "débutant":      "faible à modérée",
        "intermédiaire": "modérée à élevée",
        "avancé":        "élevée",
    }
    intensity = intensity_map.get(profile.level, "modérée")

    # Durée séance
    session_duration = 45 if profile.available_days >= 4 else 60

    # Muscles prioritaires
    priority_muscles = (
        ["cardiovascular system", "quads", "glutes", "abs", "hamstrings"]
        if weight_to_lose > 5
        else ["pectorals", "lats", "delts", "biceps", "triceps"]
    )

    # Message motivant
    motivational_message = (
        f"💪 {profile.name}, tu vas perdre {weight_to_lose} kg en "
        f"environ {estimated_weeks} semaines ! "
        f"Avec {profile.available_days} séances/semaine, "
        f"tu atteindras ton objectif de {profile.target_weight} kg. "
        f"Let's go !"
    )

    logger.info(
        f"✅ Profil analysé : {profile.name} | "
        f"IMC={bmi} | {weight_to_lose}kg | {estimated_weeks} semaines"
    )

    return UserProfileResponse(
        profile=profile,
        bmi=bmi,
        bmi_category=bmi_category,
        weight_to_lose=weight_to_lose,
        estimated_weeks=estimated_weeks,
        session_duration_min=session_duration,
        intensity_level=intensity,
        priority_muscles=priority_muscles,
        motivational_message=motivational_message,
    )