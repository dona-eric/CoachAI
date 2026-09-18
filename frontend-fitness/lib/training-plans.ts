import { randomUUID } from "node:crypto";
import type { WgerExercise } from "@/lib/wger";
import type { UserProfile, UserTrainingPlan } from "@/lib/types";

const dayLabels = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function matchesEquipment(exercise: WgerExercise, equipment: string[]): boolean {
  if (equipment.length === 0) return exercise.equipment === "bodyweight";
  if (equipment.includes("salle") && exercise.equipment === "salle") return true;
  if (exercise.equipment === "bodyweight") return true;
  return equipment.includes(exercise.equipment);
}

function exerciseScore(exercise: WgerExercise, goal: UserProfile["goal"]): number {
  const categoryScore = goal === "endurance" || goal === "perte-de-poids"
    ? exercise.category === "cardio" ? 4 : exercise.category === "core" ? 2 : 0
    : goal === "prise-de-masse"
      ? exercise.category === "force" ? 4 : 0
      : exercise.category === "mobilite" ? 3 : 1;
  return categoryScore + (exercise.imageUrl ? 1 : 0) + (exercise.videoUrls.length > 0 ? 2 : 0);
}

function focusForGoal(goal: UserProfile["goal"]): string[] {
  if (goal === "endurance" || goal === "perte-de-poids") return ["Cardio", "Full body", "Core"];
  if (goal === "prise-de-masse") return ["Force haut du corps", "Force bas du corps", "Full body"];
  return ["Full body", "Mobilité", "Core"];
}

export function generateTrainingPlan(userId: string, profile: UserProfile, exercises: WgerExercise[]): UserTrainingPlan {
  const available = exercises
    .filter(exercise => matchesEquipment(exercise, profile.equipment))
    .sort((a, b) => exerciseScore(b, profile.goal) - exerciseScore(a, profile.goal));
  if (available.length < 6) {
    throw new Error("Pas assez d'exercices Wger disponibles pour ce profil.");
  }

  const sessionsPerWeek = profile.goal === "endurance" || profile.goal === "perte-de-poids" ? 4 : 3;
  const focuses = focusForGoal(profile.goal);
  const selected = available.filter((exercise, index, all) =>
    exercise.muscles.some(muscle => all.slice(0, index).every(previous => !previous.muscles.includes(muscle))),
  );
  const fallbackSelected = [...selected, ...available.filter(exercise => !selected.includes(exercise))];
  const trainingDays = sessionsPerWeek === 4 ? [0, 1, 3, 5] : [0, 2, 4];
  const weeklyPlan = dayLabels.map((label, index) => {
    const sessionIndex = trainingDays.indexOf(index);
    const isRest = sessionIndex === -1;
    const sessionExercises = isRest
      ? []
      : fallbackSelected.slice(sessionIndex * 4, sessionIndex * 4 + 4).map(exercise => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        emoji: exercise.emoji,
        sets: profile.level === "debutant" ? 2 : 3,
        reps: profile.goal === "endurance" ? "30 sec" : "10 reps",
        rest: profile.goal === "endurance" ? 30 : 60,
        muscles: exercise.muscles,
        equipment: exercise.equipmentNames,
        imageUrl: exercise.imageUrl,
        videoUrls: exercise.videoUrls,
        sourceId: exercise.sourceId,
        sourceUuid: exercise.uuid,
        videoIds: (exercise.videos ?? [])
          .map(video => video.id)
          .filter((id): id is number => id !== undefined),
      }));

    return {
      day: index + 1,
      label,
      isRest,
      focus: isRest ? undefined : focuses[sessionIndex % focuses.length],
      exercises: sessionExercises,
    };
  });

  const now = new Date();
  return {
    id: randomUUID(),
    userId,
    name: `Plan ${profile.goal.replaceAll("-", " ")} Wger`,
    description: "Plan personnalisé construit à partir des exercices réels Wger et de votre profil.",
    level: profile.level,
    equipment: profile.equipment,
    goal: profile.goal,
    duration: 8,
    sessionsPerWeek,
    weeklyPlan,
    source: "wger",
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
}
