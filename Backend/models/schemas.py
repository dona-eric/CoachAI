# backend/models/schemas.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date


### PROFILE USER

class UserProfile(BaseModel):
    name:             str   = Field(..., description="Prénom utilisateur")
    gender:           str   = Field(..., description="masculin | féminin")
    age:              int   = Field(..., ge=10, le=100)
    height:           float = Field(..., ge=100, le=250, description="Taille en cm")
    current_weight:   float = Field(..., ge=30,  le=300, description="Poids actuel en kg")
    target_weight:    float = Field(..., ge=30,  le=300, description="Poids objectif en kg")
    level:            str   = Field(..., description="débutant | intermédiaire | avancé")
    equipment:        str   = Field(..., description="Équipement disponible")
    available_days:   int   = Field(..., ge=1, le=7,  description="Jours dispo/semaine")
    restrictions:     Optional[str] = Field(None, description="Restrictions médicales")
    preferred_time:   Optional[str] = Field("07:00", description="Heure préférée HH:MM")

    @validator("gender")
    def validate_gender(cls, v):
        if v.lower() not in ["masculin", "féminin"]:
            raise ValueError("gender doit être 'masculin' ou 'féminin'")
        return v.lower()

    @validator("level")
    def validate_level(cls, v):
        if v.lower() not in ["débutant", "intermédiaire", "avancé"]:
            raise ValueError("level doit être débutant | intermédiaire | avancé")
        return v.lower()

    @validator("target_weight")
    def validate_target_weight(cls, v, values):
        if "current_weight" in values and v >= values["current_weight"]:
            raise ValueError("target_weight doit être inférieur à current_weight")
        return v

class UserProfileResponse(BaseModel):
    profile:              UserProfile
    bmi:                  float
    bmi_category:         str
    weight_to_lose:       float
    estimated_weeks:      int
    session_duration_min: int
    intensity_level:      str
    priority_muscles:     List[str]
    motivational_message: str

# ─────────────────────────────────────────────────────
# PLAN D'ENTRAÎNEMENT
# ─────────────────────────────────────────────────────
class PlanRequest(BaseModel):
    profile:        UserProfile
    start_date:     Optional[date] = Field(
        default_factory=date.today,
        description="Date de début du plan"
    )

class ExerciseItem(BaseModel):
    name:        str
    sets:        str
    reps:        str
    muscles:     str
    equipment:   str
    gif_url:     Optional[str] = None
    instructions: Optional[str] = None

class TrainingDay(BaseModel):
    day_name:    str
    focus:       str
    exercises:   List[ExerciseItem]
    duration_min: int

class TrainingPlanResponse(BaseModel):
    profile_summary:  str
    estimated_weeks:  int
    sessions_per_week: int
    training_days:    List[TrainingDay]
    general_advice:   List[str]
    raw_plan:         str

# ───────────────────────────────────────────────────── 
class ExerciseSearchRequest(BaseModel):
    query:      Optional[str]  = None
    muscle:     Optional[str]  = None
    equipment:  Optional[str]  = None
    k:          int            = Field(default=6, ge=1, le=20)

class ExerciseResult(BaseModel):
    name:        str
    muscles:     str
    body_part:   str
    equipment:   str
    instructions: Optional[str] = None
    gif_small:   Optional[str]  = None
    gif_medium:  Optional[str]  = None
    gif_large:   Optional[str]  = None
    source:      str

class ExerciseSearchResponse(BaseModel):
    query:    str
    total:    int
    results:  List[ExerciseResult]


class CalendarRequest(BaseModel):
    profile:        UserProfile
    plan_summary:   str
    start_date:     date
    available_days: List[str] = Field(
        description="Ex: ['Lundi', 'Mercredi', 'Vendredi']"
    )
    estimated_weeks:      int
    session_duration_min: int = 60
    preferred_time:       str = "07:00"

class CalendarEvent(BaseModel):
    title:            str
    description:      str
    date:             str
    start_time:       str
    end_time:         str
    reminder_minutes: int = 30

class CalendarResponse(BaseModel):
    total_events:    int
    duration_weeks:  int
    events:          List[CalendarEvent]
    calendar_link:   Optional[str] = None
    message:         str


class ChatMessage(BaseModel):
    message:    str  = Field(..., description="Message de l'utilisateur")
    session_id: str  = Field(default="default")
    profile:    Optional[UserProfile] = None

class ChatResponse(BaseModel):
    response:    str
    tools_used:  List[str]
    session_id:  str