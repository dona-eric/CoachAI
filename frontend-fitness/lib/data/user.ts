// Données mock — Utilisateur et historique de séances

export const mockUser = {
  id: 'u1',
  name: 'Éric Donateur',
  email: 'eric@KINETIC.fr',
  avatar: null,
  age: 27,
  height: 178, // cm
  weight: 75,  // kg
  level: 'intermediaire' as const,
  goal: 'perte-de-poids' as const,
  equipment: ['bodyweight', 'maison'] as string[],
  activePlanId: 'p2',
  streak: 7,
  joinDate: '2026-06-01',
  totalSessions: 42,
  totalCalories: 18400,
  badges: ['first_session', 'week_streak', 'month_member', 'bodyweight_master'],
};

export interface SessionLog {
  id: string;
  date: string;
  planId: string;
  planName: string;
  duration: number; // minutes
  calories: number;
  exercisesDone: number;
  totalSets: number;
  mood: 1 | 2 | 3 | 4 | 5;
}

// 8 semaines d'historique
export const sessionHistory: SessionLog[] = [
  { id: 's1', date: '2026-09-04', planId: 'p2', planName: 'Home Warrior', duration: 45, calories: 280, exercisesDone: 4, totalSets: 12, mood: 4 },
  { id: 's2', date: '2026-09-02', planId: 'p2', planName: 'Home Warrior', duration: 50, calories: 310, exercisesDone: 4, totalSets: 13, mood: 5 },
  { id: 's3', date: '2026-08-30', planId: 'p2', planName: 'Home Warrior', duration: 40, calories: 240, exercisesDone: 3, totalSets: 10, mood: 3 },
  { id: 's4', date: '2026-08-28', planId: 'p2', planName: 'Home Warrior', duration: 55, calories: 340, exercisesDone: 4, totalSets: 13, mood: 4 },
  { id: 's5', date: '2026-08-26', planId: 'p2', planName: 'Home Warrior', duration: 42, calories: 265, exercisesDone: 4, totalSets: 12, mood: 4 },
  { id: 's6', date: '2026-08-23', planId: 'p1', planName: 'Starter Bodyweight', duration: 38, calories: 220, exercisesDone: 4, totalSets: 11, mood: 3 },
  { id: 's7', date: '2026-08-21', planId: 'p1', planName: 'Starter Bodyweight', duration: 35, calories: 210, exercisesDone: 3, totalSets: 9, mood: 4 },
  { id: 's8', date: '2026-08-19', planId: 'p1', planName: 'Starter Bodyweight', duration: 32, calories: 195, exercisesDone: 4, totalSets: 10, mood: 5 },
  { id: 's9', date: '2026-08-16', planId: 'p1', planName: 'Starter Bodyweight', duration: 40, calories: 230, exercisesDone: 4, totalSets: 11, mood: 3 },
  { id: 's10', date: '2026-08-14', planId: 'p1', planName: 'Starter Bodyweight', duration: 28, calories: 175, exercisesDone: 3, totalSets: 8, mood: 4 },
  { id: 's11', date: '2026-08-12', planId: 'p1', planName: 'Starter Bodyweight', duration: 30, calories: 185, exercisesDone: 3, totalSets: 9, mood: 4 },
  { id: 's12', date: '2026-08-09', planId: 'p1', planName: 'Starter Bodyweight', duration: 25, calories: 150, exercisesDone: 3, totalSets: 8, mood: 3 },
];

export const weightHistory = [
  { date: '2026-06-01', value: 82 },
  { date: '2026-06-15', value: 81 },
  { date: '2026-07-01', value: 80 },
  { date: '2026-07-15', value: 79 },
  { date: '2026-08-01', value: 78 },
  { date: '2026-08-15', value: 77 },
  { date: '2026-09-01', value: 75.5 },
  { date: '2026-09-04', value: 75 },
];

export const personalRecords = [
  { exercise: 'Pompes', emoji: '💪', value: '32 reps', date: '2026-08-28' },
  { exercise: 'Planche', emoji: '🧘', value: '90 sec', date: '2026-09-02' },
  { exercise: 'Burpees', emoji: '⚡', value: '15 reps', date: '2026-08-30' },
  { exercise: 'Squats', emoji: '🦵', value: '50 reps', date: '2026-09-04' },
];

export const badges = [
  { id: 'first_session', emoji: '🏅', name: 'Première séance', description: 'Bienvenue dans l\'aventure !', unlocked: true },
  { id: 'week_streak', emoji: '🔥', name: '7 jours d\'affilée', description: 'Une semaine sans relâche', unlocked: true },
  { id: 'month_member', emoji: '⭐', name: 'Membre 1 mois', description: 'Fidèle à l\'entraînement depuis un mois', unlocked: true },
  { id: 'bodyweight_master', emoji: '💪', name: 'Maître Bodyweight', description: '20 séances sans équipement', unlocked: true },
  { id: 'calorie_crusher', emoji: '🔥', name: 'Calorie Crusher', description: 'Brûler 5000 kcal en un mois', unlocked: false },
  { id: 'iron_will', emoji: '🥊', name: 'Volonté de fer', description: '30 jours consécutifs', unlocked: false },
];
