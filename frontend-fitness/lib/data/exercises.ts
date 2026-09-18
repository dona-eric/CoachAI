export interface Exercise {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  category: 'force' | 'cardio' | 'mobilite' | 'core';
  equipment: 'bodyweight' | 'maison' | 'salle';
  level: 'debutant' | 'intermediaire' | 'avance';
  muscles: string[];
  duration: string;
  description: string;
  steps: string[];
  errors: string[];
  variants: string[];
  kcalPerMin: number;
  source?: 'local' | 'wger';
  sourceId?: number;
  imageUrl?: string;
  videoUrls?: string[];
  videos?: ExerciseVideo[];
  aliases?: string[];
  comments?: string[];
  exerciseComments?: ExerciseComment[];
  translations?: ExerciseTranslation[];
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  equipmentNames?: string[];
}

export interface ExerciseComment {
  id: number;
  uuid: string;
  translationId: number;
  comment: string;
}

export interface ExerciseTranslation {
  id: number;
  uuid: string;
  exerciseId: number;
  name: string;
  description: string;
  descriptionSource: string;
  created: string;
  language: number;
  licenseAuthor: string;
}

export interface ExerciseVideo {
  id?: number;
  uuid?: string;
  exerciseId: number;
  exerciseUuid?: string;
  url: string;
  isMain?: boolean;
  durationSeconds?: number;
  width?: number;
  height?: number;
}
