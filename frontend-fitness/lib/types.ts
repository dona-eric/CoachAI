// Types TypeScript pour les documents MongoDB de KINETIC

export interface KineticUser {
  _id?: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  emailVerified?: Date | null;
  image?: string | null;
}

export interface UserProfile {
  _id?: string;
  userId: string;           // référence à KineticUser._id
  age?: number;
  height?: number;          // cm
  weight?: number;          // kg
  level: 'debutant' | 'intermediaire' | 'avance';
  goal: 'perte-de-poids' | 'prise-de-masse' | 'endurance' | 'sante';
  equipment: string[];      // ['bodyweight', 'maison', 'salle']
  activePlanId?: string;
  streak: number;
  lastSessionDate?: string; // ISO date string
  onboardingDone: boolean;
  updatedAt: Date;
}

export interface TrainingPlanExercise {
  exerciseId: string;
  exerciseName: string;
  emoji: string;
  sets: number;
  reps: string;
  rest: number;
  muscles: string[];
  equipment: string[];
  imageUrl?: string;
  videoUrls?: string[];
  sourceId?: number;
  sourceUuid?: string;
  videoIds?: number[];
}

export interface TrainingPlanDay {
  day: number;
  label: string;
  isRest: boolean;
  focus?: string;
  exercises: TrainingPlanExercise[];
}

export interface UserTrainingPlan {
  _id?: string;
  id: string;
  userId: string;
  name: string;
  description: string;
  level: UserProfile["level"];
  equipment: string[];
  goal: UserProfile["goal"];
  duration: number;
  sessionsPerWeek: number;
  weeklyPlan: TrainingPlanDay[];
  source: "wger";
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutSession {
  _id?: string;
  userId: string;
  date: string;             // ISO date string 'YYYY-MM-DD'
  planId?: string;
  planName?: string;
  duration: number;         // minutes
  calories: number;
  exercisesDone: number;
  totalSets: number;
  mood: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  exerciseResults?: ExerciseResult[];
  createdAt: Date;
}

export interface ExerciseResult {
  exerciseId: string;
  exerciseName: string;
  setsCompleted: number;
  repsCompleted?: number;
  durationSeconds?: number;
  weightUsed?: number;
}

export interface PersonalRecord {
  _id?: string;
  userId: string;
  exerciseSlug: string;
  exerciseName: string;
  emoji: string;
  value: string;            // ex: "32 reps", "90 sec"
  numericValue: number;     // pour comparaison
  date: string;
  createdAt: Date;
}

export interface MealEntry {
  _id?: string;
  userId: string;
  date: string;             // 'YYYY-MM-DD'
  meal: 'matin' | 'midi' | 'soir' | 'collation';
  foodName: string;
  emoji: string;
  quantity: number;         // grammes
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: Date;
}

export interface WaterLog {
  _id?: string;
  userId: string;
  date: string;
  amount: number;           // ml total du jour
  updatedAt: Date;
}

export interface WeightLog {
  _id?: string;
  userId: string;
  date: string;
  weight: number;           // kg
  createdAt: Date;
}

export interface ProgressStat {
  id: string;
  name: string;
  sessions: number;
  totalSets: number;
  latestSets: number;
  deltaSets: number;
  muscles: string[];
}
