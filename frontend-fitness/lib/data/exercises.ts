// Données mock — Exercices
export interface Exercise {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  category: 'force' | 'cardio' | 'mobilite' | 'core';
  equipment: 'bodyweight' | 'maison' | 'salle';
  level: 'debutant' | 'intermediaire' | 'avance';
  muscles: string[];
  duration: string; // ex: "3x12 reps"
  description: string;
  steps: string[];
  errors: string[];
  variants: string[];
  kcalPerMin: number;
}

export const exercises: Exercise[] = [
  {
    id: 'e1', slug: 'pompes', name: 'Pompes', emoji: '💪',
    category: 'force', equipment: 'bodyweight', level: 'debutant',
    muscles: ['Pectoraux', 'Triceps', 'Épaules'],
    duration: '3x12 reps', kcalPerMin: 7,
    description: 'Exercice de base pour développer la force du haut du corps sans équipement.',
    steps: ['Position planche, mains à largeur d\'épaules','Descendre la poitrine vers le sol','Garder le dos droit tout au long','Pousser pour revenir à la position initiale'],
    errors: ['Laisser les hanches s\'affaisser','Descendre insuffisamment','Ecarter les coudes à 90°'],
    variants: ['Pompes inclinées (sur chaise)', 'Pompes diamant (triceps)', 'Pompes larges (pectoraux)']
  },
  {
    id: 'e2', slug: 'squats', name: 'Squats', emoji: '🦵',
    category: 'force', equipment: 'bodyweight', level: 'debutant',
    muscles: ['Quadriceps', 'Fessiers', 'Ischio-jambiers'],
    duration: '3x15 reps', kcalPerMin: 8,
    description: 'Le roi des exercices pour les jambes et les fessiers.',
    steps: ['Pieds écartés à largeur d\'épaules','Descendre comme si vous vous asseyez','Genoux dans l\'axe des pieds','Remonter en poussant sur les talons'],
    errors: ['Genoux qui rentrent vers l\'intérieur','Talons décollés du sol','Pencher excessivement le tronc'],
    variants: ['Squat bulgare', 'Squat sauté', 'Squat sumo']
  },
  {
    id: 'e3', slug: 'planche', name: 'Planche (Plank)', emoji: '🧘',
    category: 'core', equipment: 'bodyweight', level: 'debutant',
    muscles: ['Abdominaux', 'Lombaires', 'Épaules'],
    duration: '3x30 sec', kcalPerMin: 5,
    description: 'Exercice isométrique fondamental pour renforcer le gainage.',
    steps: ['Position sur les avant-bras et la pointe des pieds','Corps aligné de la tête aux talons','Contracter les abdos et les fessiers','Respirer normalement'],
    errors: ['Hanches trop hautes ou trop basses','Regarder vers le haut (cervicales)','Retenir sa respiration'],
    variants: ['Planche latérale', 'Planche avec levée de bras', 'Planche dynamique']
  },
  {
    id: 'e4', slug: 'fentes', name: 'Fentes', emoji: '🏃',
    category: 'force', equipment: 'bodyweight', level: 'debutant',
    muscles: ['Quadriceps', 'Fessiers', 'Mollets'],
    duration: '3x10 reps/jambe', kcalPerMin: 7,
    description: 'Exercice unilatéral pour équilibrer la force des deux jambes.',
    steps: ['Debout, pieds joints','Grand pas en avant','Descendre le genou arrière vers le sol','Remonter et alterner les jambes'],
    errors: ['Genou avant dépasse la pointe du pied','Se pencher trop en avant','Pas assez d\'amplitude'],
    variants: ['Fentes latérales', 'Fentes marchées', 'Fentes bulgares']
  },
  {
    id: 'e5', slug: 'burpees', name: 'Burpees', emoji: '⚡',
    category: 'cardio', equipment: 'bodyweight', level: 'intermediaire',
    muscles: ['Corps entier', 'Cardio-vasculaire'],
    duration: '3x10 reps', kcalPerMin: 12,
    description: 'Exercice full body explosif — meilleur brûleur de calories bodyweight.',
    steps: ['Debout, puis accroupi','Poser les mains au sol','Sauter les pieds en arrière (pompe optionnelle)','Ramener les pieds, sauter vers le haut les bras levés'],
    errors: ['Creuser le dos en position pompe','Sauter sans lever les bras','Enchainer trop vite sans respirer'],
    variants: ['Burpee sans saut (débutant)', 'Burpee avec pompe', 'Burpee box jump']
  },
  {
    id: 'e6', slug: 'dips-chaise', name: 'Dips sur chaise', emoji: '🪑',
    category: 'force', equipment: 'maison', level: 'debutant',
    muscles: ['Triceps', 'Pectoraux', 'Épaules'],
    duration: '3x12 reps', kcalPerMin: 6,
    description: 'Exercice triceps efficace avec une simple chaise.',
    steps: ['Mains sur le bord de la chaise, dos à la chaise','Pieds tendus devant','Descendre en pliant les coudes à 90°','Remonter en poussant avec les triceps'],
    errors: ['Coudes trop écartés vers l\'extérieur','Descendre insuffisamment','Épaules remontées vers les oreilles'],
    variants: ['Dips pieds fléchis (plus facile)', 'Dips avec poids sur les genoux']
  },
  {
    id: 'e7', slug: 'elevation-mollets', name: 'Élévation des mollets', emoji: '🦶',
    category: 'force', equipment: 'maison', level: 'debutant',
    muscles: ['Mollets', 'Chevilles'],
    duration: '4x20 reps', kcalPerMin: 4,
    description: 'Renforcement des mollets contre un mur ou sur une marche.',
    steps: ['Debout sur une marche ou à plat','Monter sur la pointe des pieds','Maintenir 1 seconde en haut','Redescendre lentement'],
    errors: ['Descendre trop vite', 'Ne pas aller jusqu\'en haut', 'Pieds vers l\'extérieur'],
    variants: ['Unipodal (une jambe)', 'Avec sac à dos leste']
  },
  {
    id: 'e8', slug: 'mountain-climbers', name: 'Mountain Climbers', emoji: '🧗',
    category: 'cardio', equipment: 'bodyweight', level: 'intermediaire',
    muscles: ['Abdominaux', 'Cardio', 'Épaules'],
    duration: '3x30 sec', kcalPerMin: 10,
    description: 'Cardio intense en position planche qui cible les abdos.',
    steps: ['Position planche bras tendus','Ramener un genou vers la poitrine','Alterner rapidement les jambes','Garder les hanches basses'],
    errors: ['Hanches qui montent','Regarder vers le haut','Trop lent (perd l\'effet cardio)'],
    variants: ['Slow mountain climbers (gainage)', 'Twist mountain climbers (obliques)']
  },
  {
    id: 'e9', slug: 'pistol-squat', name: 'Pistol Squat', emoji: '🎯',
    category: 'force', equipment: 'bodyweight', level: 'avance',
    muscles: ['Quadriceps', 'Fessiers', 'Équilibre'],
    duration: '3x5 reps/jambe', kcalPerMin: 9,
    description: 'Squat unipodal — sommet de la force jambe au poids du corps.',
    steps: ['Debout sur une jambe, l\'autre tendue devant','Descendre lentement en squat','Garder l\'équilibre, dos droit','Remonter avec force'],
    errors: ['Genou qui s\'effondre vers l\'intérieur','Se tenir pour compenser','Pas assez d\'amplitude'],
    variants: ['Avec soutien (barre, mur)', 'Pistol squat sur boîte']
  },
  {
    id: 'e10', slug: 'gainage-lateral', name: 'Gainage latéral', emoji: '🌟',
    category: 'core', equipment: 'bodyweight', level: 'debutant',
    muscles: ['Obliques', 'Abdominaux', 'Fessiers'],
    duration: '3x20 sec/côté', kcalPerMin: 4,
    description: 'Renforcement des obliques et de la stabilité latérale.',
    steps: ['Sur un avant-bras, corps de côté','Corps aligné de la tête aux pieds','Hanches levées du sol','Tenir sans bouger'],
    errors: ['Hanches qui tombent','Épaule qui s\'effondre','Rotation du bassin'],
    variants: ['Avec levée de jambe', 'Planche latérale étoile']
  },
  {
    id: 'e11', slug: 'jumping-jacks', name: 'Jumping Jacks', emoji: '🌠',
    category: 'cardio', equipment: 'bodyweight', level: 'debutant',
    muscles: ['Corps entier', 'Cardio'],
    duration: '3x45 sec', kcalPerMin: 9,
    description: 'Échauffement cardio classique pour élever le rythme cardiaque.',
    steps: ['Debout, pieds joints, bras le long du corps','Sauter en écartant pieds et bras','Sauter pour revenir à la position initiale','Rythme régulier et contrôlé'],
    errors: ['Atterrir sur la pointe des pieds seulement','Bras pas assez haut','Rythme irrégulier'],
    variants: ['Sans saut (low impact)', 'Double jumping jacks']
  },
  {
    id: 'e12', slug: 'gainage-abdo', name: 'Crunchs / Abdo', emoji: '🔥',
    category: 'core', equipment: 'bodyweight', level: 'debutant',
    muscles: ['Grand droit', 'Abdominaux'],
    duration: '3x20 reps', kcalPerMin: 5,
    description: 'Exercice classique pour cibler les abdominaux.',
    steps: ['Allongé sur le dos, genoux fléchis','Mains derrière la tête (ne pas tirer)','Enrouler le buste vers les genoux','Descendre lentement'],
    errors: ['Tirer sur la nuque','Bloquer la respiration','Monter trop haut (lombaires)'],
    variants: ['Crunch avec rotation (obliques)', 'Crunch inversé (bas du ventre)']
  },
];

export const getExerciseBySlug = (slug: string) => exercises.find(e => e.slug === slug);
export const filterExercises = (equipment?: string, category?: string, level?: string) =>
  exercises.filter(e =>
    (!equipment || equipment === 'all' || e.equipment === equipment) &&
    (!category || category === 'all' || e.category === category) &&
    (!level || level === 'all' || e.level === level)
  );
