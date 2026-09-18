export interface WorkoutSet {
  exerciseId: string;
  exerciseName: string;
  emoji: string;
  sets: number;
  reps: string;
  rest: number;
}

export interface WorkoutDay {
  day: number;
  label: string;
  isRest: boolean;
  focus?: string;
  exercises: WorkoutSet[];
}

export interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  level: 'debutant' | 'intermediaire' | 'avance';
  equipment: 'bodyweight' | 'maison' | 'salle';
  goal: 'perte-de-poids' | 'prise-de-masse' | 'endurance' | 'sante';
  duration: number;
  sessionsPerWeek: number;
  weeklyPlan: WorkoutDay[];
  tags: string[];
}
