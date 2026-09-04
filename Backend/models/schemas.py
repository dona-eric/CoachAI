"""
schemas de base pour les modèles de données utilisés dans l'application.
"""

from fastapi import HTTPException
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Any



# classe pour le login et l'inscription des utilisateurs

class UserForm(BaseModel):
    """
    schema de base pour les formulaires d'inscription et de connexion des utilisateurs.
    """
    firstname: str = Field(..., example="John Doe")
    lastname: str = Field(..., example="Doe")
    email: str = Field(..., example="john.doe@example.com")
    password: str = Field(..., example="password123")


class UserLoginForm(BaseModel):
    """
    schema de base pour les formulaires de connexion des utilisateurs.
    """
    email: str = Field(..., example="john.doe@example.com")
    password: str = Field(..., example="password123")


class UserProfile(BaseModel):
    """
    schema de base pour les profils d'utilisateurs.
    """
    age: Optional[int] = Field(description="votre age user", example=30)
    height: Optional[float] = Field(description="La taille en mètres", example=1.75)
    weight: Optional[float] = Field(description="Le poids en kilogrammes", example=70.5)
    activity_level: Optional[str] = Field(description="Le niveau d'activité physique", example="modéré")
    goal: Optional[str] = Field(description="L'objectif de l'utilisateur", example="perdre du poids")
    dietary_preferences: Optional[List[str]] = Field(description="Les préférences alimentaires de l'utilisateur", example=["végétarien", "sans gluten"])


class PlanRequest(BaseModel):
    """
    schema de base pour les requêtes de génération de plans d'entraînement personnalisés.
    """
    profile: UserProfile = Field(..., description="Le profil de l'utilisateur")
    start_date: Optional[str] = Field(description="La date de début du plan d'entraînement", example="2024-01-01")
    period: Optional[int] = Field(description="La durée du plan en semaines", example=4)
    object_availbale: Optional[List[str]] = Field(description="Les équipements disponibles pour l'entraînement", example=["haltères", "tapis de yoga"])
    time_available: Optional[int] = Field(description="Le temps disponible pour l'entraînement en minutes par jour", example=60)


class AgentPlan(BaseModel):
    """
    schema de base pour les plans d'entraînement générés par l'agent IA.
    """
    session_id: str = Field(..., description="L'identifiant de session pour le plan d'entraînement généré")
    request_agent: Any = Field(..., description="Le plan d'entraînement généré par l'agent IA")
