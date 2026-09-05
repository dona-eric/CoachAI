// Données mock — Plans d'entraînement
export interface WorkoutSet {
  exerciseId: string;
  exerciseName: string;
  emoji: string;
  sets: number;
  reps: string; // "12" ou "30 sec"
  rest: number; // secondes
}

export interface WorkoutDay {
  day: number; // 1-7
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
  duration: number; // weeks
  sessionsPerWeek: number;
  weeklyPlan: WorkoutDay[];
  tags: string[];
}

export const trainingPlans: TrainingPlan[] = [
  {
    id: 'p1',
    name: 'Starter Bodyweight',
    description: 'Programme idéal pour les débutants sans équipement. 3 séances/sem pour bâtir les bases.',
    level: 'debutant', equipment: 'bodyweight', goal: 'sante',
    duration: 8, sessionsPerWeek: 3,
    tags: ['Sans équipement', 'Débutant', '8 semaines'],
    weeklyPlan: [
      { day: 1, label: 'Lundi', isRest: false, focus: 'Haut du corps',
        exercises: [
          { exerciseId: 'e11', exerciseName: 'Jumping Jacks', emoji: '🌠', sets: 2, reps: '30 sec', rest: 30 },
          { exerciseId: 'e1', exerciseName: 'Pompes', emoji: '💪', sets: 3, reps: '10', rest: 60 },
          { exerciseId: 'e3', exerciseName: 'Planche', emoji: '🧘', sets: 3, reps: '20 sec', rest: 45 },
          { exerciseId: 'e10', exerciseName: 'Gainage latéral', emoji: '🌟', sets: 2, reps: '20 sec', rest: 30 },
        ]
      },
      { day: 2, label: 'Mardi', isRest: true, exercises: [] },
      { day: 3, label: 'Mercredi', isRest: false, focus: 'Bas du corps',
        exercises: [
          { exerciseId: 'e2', exerciseName: 'Squats', emoji: '🦵', sets: 3, reps: '15', rest: 60 },
          { exerciseId: 'e4', exerciseName: 'Fentes', emoji: '🏃', sets: 3, reps: '10/jambe', rest: 60 },
          { exerciseId: 'e7', exerciseName: 'Élévation mollets', emoji: '🦶', sets: 3, reps: '20', rest: 30 },
          { exerciseId: 'e12', exerciseName: 'Crunchs', emoji: '🔥', sets: 3, reps: '15', rest: 30 },
        ]
      },
      { day: 4, label: 'Jeudi', isRest: true, exercises: [] },
      { day: 5, label: 'Vendredi', isRest: false, focus: 'Full body',
        exercises: [
          { exerciseId: 'e5', exerciseName: 'Burpees', emoji: '⚡', sets: 3, reps: '8', rest: 90 },
          { exerciseId: 'e8', exerciseName: 'Mountain Climbers', emoji: '🧗', sets: 3, reps: '30 sec', rest: 45 },
          { exerciseId: 'e1', exerciseName: 'Pompes', emoji: '💪', sets: 2, reps: '10', rest: 60 },
          { exerciseId: 'e2', exerciseName: 'Squats', emoji: '🦵', sets: 2, reps: '15', rest: 60 },
        ]
      },
      { day: 6, label: 'Samedi', isRest: true, exercises: [] },
      { day: 7, label: 'Dimanche', isRest: true, exercises: [] },
    ]
  },
  {
    id: 'p2',
    name: 'Home Warrior',
    description: 'Programme maison intermédiaire avec chaise et mur. Idéal pour travailler depuis chez soi.',
    level: 'intermediaire', equipment: 'maison', goal: 'prise-de-masse',
    duration: 8, sessionsPerWeek: 4,
    tags: ['Maison', 'Intermédiaire', 'Chaise + Mur'],
    weeklyPlan: [
      { day: 1, label: 'Lundi', isRest: false, focus: 'Poussée haute',
        exercises: [
          { exerciseId: 'e1', exerciseName: 'Pompes', emoji: '💪', sets: 4, reps: '15', rest: 60 },
          { exerciseId: 'e6', exerciseName: 'Dips sur chaise', emoji: '🪑', sets: 3, reps: '12', rest: 60 },
          { exerciseId: 'e3', exerciseName: 'Planche', emoji: '🧘', sets: 3, reps: '40 sec', rest: 30 },
        ]
      },
      { day: 2, label: 'Mardi', isRest: false, focus: 'Jambes',
        exercises: [
          { exerciseId: 'e2', exerciseName: 'Squats', emoji: '🦵', sets: 4, reps: '20', rest: 60 },
          { exerciseId: 'e4', exerciseName: 'Fentes', emoji: '🏃', sets: 3, reps: '12/jambe', rest: 60 },
          { exerciseId: 'e7', exerciseName: 'Élévation mollets', emoji: '🦶', sets: 4, reps: '25', rest: 30 },
        ]
      },
      { day: 3, label: 'Mercredi', isRest: true, exercises: [] },
      { day: 4, label: 'Jeudi', isRest: false, focus: 'Cardio + Core',
        exercises: [
          { exerciseId: 'e5', exerciseName: 'Burpees', emoji: '⚡', sets: 4, reps: '10', rest: 60 },
          { exerciseId: 'e8', exerciseName: 'Mountain Climbers', emoji: '🧗', sets: 3, reps: '45 sec', rest: 30 },
          { exerciseId: 'e12', exerciseName: 'Crunchs', emoji: '🔥', sets: 3, reps: '20', rest: 30 },
        ]
      },
      { day: 5, label: 'Vendredi', isRest: false, focus: 'Full body',
        exercises: [
          { exerciseId: 'e1', exerciseName: 'Pompes', emoji: '💪', sets: 3, reps: '12', rest: 60 },
          { exerciseId: 'e2', exerciseName: 'Squats', emoji: '🦵', sets: 3, reps: '15', rest: 60 },
          { exerciseId: 'e10', exerciseName: 'Gainage latéral', emoji: '🌟', sets: 3, reps: '30 sec', rest: 30 },
        ]
      },
      { day: 6, label: 'Samedi', isRest: true, exercises: [] },
      { day: 7, label: 'Dimanche', isRest: true, exercises: [] },
    ]
  },
  {
    id: 'p3',
    name: 'Perte de poids Express',
    description: 'HIIT intensif 5j/sem pour brûler les graisses au maximum sans équipement.',
    level: 'intermediaire', equipment: 'bodyweight', goal: 'perte-de-poids',
    duration: 12, sessionsPerWeek: 5,
    tags: ['HIIT', 'Perte de poids', 'Cardio', '12 semaines'],
    weeklyPlan: [
      { day: 1, label: 'Lundi', isRest: false, focus: 'HIIT Upper',
        exercises: [
          { exerciseId: 'e11', exerciseName: 'Jumping Jacks', emoji: '🌠', sets: 3, reps: '45 sec', rest: 15 },
          { exerciseId: 'e5', exerciseName: 'Burpees', emoji: '⚡', sets: 4, reps: '12', rest: 30 },
          { exerciseId: 'e1', exerciseName: 'Pompes', emoji: '💪', sets: 4, reps: '15', rest: 30 },
          { exerciseId: 'e8', exerciseName: 'Mountain Climbers', emoji: '🧗', sets: 3, reps: '45 sec', rest: 15 },
        ]
      },
      { day: 2, label: 'Mardi', isRest: false, focus: 'HIIT Lower',
        exercises: [
          { exerciseId: 'e2', exerciseName: 'Squats', emoji: '🦵', sets: 4, reps: '20', rest: 30 },
          { exerciseId: 'e4', exerciseName: 'Fentes', emoji: '🏃', sets: 3, reps: '15/jambe', rest: 30 },
          { exerciseId: 'e7', exerciseName: 'Élévation mollets', emoji: '🦶', sets: 3, reps: '25', rest: 20 },
        ]
      },
      { day: 3, label: 'Mercredi', isRest: false, focus: 'Cardio + Core',
        exercises: [
          { exerciseId: 'e11', exerciseName: 'Jumping Jacks', emoji: '🌠', sets: 3, reps: '1 min', rest: 20 },
          { exerciseId: 'e12', exerciseName: 'Crunchs', emoji: '🔥', sets: 4, reps: '20', rest: 20 },
          { exerciseId: 'e3', exerciseName: 'Planche', emoji: '🧘', sets: 3, reps: '45 sec', rest: 20 },
        ]
      },
      { day: 4, label: 'Jeudi', isRest: true, exercises: [] },
      { day: 5, label: 'Vendredi', isRest: false, focus: 'Full HIIT',
        exercises: [
          { exerciseId: 'e5', exerciseName: 'Burpees', emoji: '⚡', sets: 5, reps: '10', rest: 30 },
          { exerciseId: 'e8', exerciseName: 'Mountain Climbers', emoji: '🧗', sets: 4, reps: '30 sec', rest: 15 },
          { exerciseId: 'e11', exerciseName: 'Jumping Jacks', emoji: '🌠', sets: 3, reps: '1 min', rest: 20 },
        ]
      },
      { day: 6, label: 'Samedi', isRest: false, focus: 'Récupération active',
        exercises: [
          { exerciseId: 'e3', exerciseName: 'Planche', emoji: '🧘', sets: 3, reps: '30 sec', rest: 30 },
          { exerciseId: 'e10', exerciseName: 'Gainage latéral', emoji: '🌟', sets: 2, reps: '30 sec', rest: 20 },
        ]
      },
      { day: 7, label: 'Dimanche', isRest: true, exercises: [] },
    ]
  },
  {
    id: 'p4',
    name: 'Force Avancée',
    description: 'Programme avancé bodyweight visant la force maximale et les skills gymnastics.',
    level: 'avance', equipment: 'bodyweight', goal: 'prise-de-masse',
    duration: 12, sessionsPerWeek: 5,
    tags: ['Avancé', 'Force', 'Skills', '12 semaines'],
    weeklyPlan: [
      { day: 1, label: 'Lundi', isRest: false, focus: 'Force poussée',
        exercises: [
          { exerciseId: 'e1', exerciseName: 'Pompes', emoji: '💪', sets: 5, reps: '20', rest: 90 },
          { exerciseId: 'e9', exerciseName: 'Pistol Squat', emoji: '🎯', sets: 4, reps: '6/jambe', rest: 90 },
          { exerciseId: 'e3', exerciseName: 'Planche', emoji: '🧘', sets: 4, reps: '60 sec', rest: 60 },
        ]
      },
      { day: 2, label: 'Mardi', isRest: false, focus: 'Jambes avancé',
        exercises: [
          { exerciseId: 'e9', exerciseName: 'Pistol Squat', emoji: '🎯', sets: 4, reps: '8/jambe', rest: 90 },
          { exerciseId: 'e5', exerciseName: 'Burpees', emoji: '⚡', sets: 4, reps: '15', rest: 60 },
          { exerciseId: 'e4', exerciseName: 'Fentes', emoji: '🏃', sets: 3, reps: '15/jambe', rest: 60 },
        ]
      },
      { day: 3, label: 'Mercredi', isRest: true, exercises: [] },
      { day: 4, label: 'Jeudi', isRest: false, focus: 'Core intensif',
        exercises: [
          { exerciseId: 'e3', exerciseName: 'Planche', emoji: '🧘', sets: 4, reps: '60 sec', rest: 30 },
          { exerciseId: 'e10', exerciseName: 'Gainage latéral', emoji: '🌟', sets: 4, reps: '45 sec', rest: 30 },
          { exerciseId: 'e12', exerciseName: 'Crunchs', emoji: '🔥', sets: 4, reps: '25', rest: 30 },
          { exerciseId: 'e8', exerciseName: 'Mountain Climbers', emoji: '🧗', sets: 3, reps: '1 min', rest: 30 },
        ]
      },
      { day: 5, label: 'Vendredi', isRest: false, focus: 'Explosivité',
        exercises: [
          { exerciseId: 'e5', exerciseName: 'Burpees', emoji: '⚡', sets: 5, reps: '12', rest: 60 },
          { exerciseId: 'e1', exerciseName: 'Pompes', emoji: '💪', sets: 4, reps: '20', rest: 60 },
          { exerciseId: 'e11', exerciseName: 'Jumping Jacks', emoji: '🌠', sets: 3, reps: '1 min', rest: 30 },
        ]
      },
      { day: 6, label: 'Samedi', isRest: true, exercises: [] },
      { day: 7, label: 'Dimanche', isRest: true, exercises: [] },
    ]
  },
];

export const getPlanById = (id: string) => trainingPlans.find(p => p.id === id);
