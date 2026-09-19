import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";
import type { ProgressStat, UserTrainingPlan } from "@/lib/types";

// GET — statistiques agrégées de l'utilisateur
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = session.user.id;
  const db = await getDb();

  const sessions = await db
    .collection("workoutSessions")
    .find({ userId })
    .sort({ date: -1 })
    .toArray();

  const profile = await db.collection("userProfiles").findOne({ userId });

  // Calculs agrégés
  const totalSessions  = sessions.length;
  const totalCalories  = sessions.reduce((a, s) => a + (s.calories as number ?? 0), 0);
  const totalDuration  = sessions.reduce((a, s) => a + (s.duration as number ?? 0), 0);
  const avgDuration    = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

  // Cette semaine
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  monday.setHours(0, 0, 0, 0);
  const weekSessions   = sessions.filter(s => new Date(s.date as string) >= monday);
  const weekCalories   = weekSessions.reduce((a, s) => a + (s.calories as number ?? 0), 0);

  // Poids — historique
  const weights = await db
    .collection("weightLogs")
    .find({ userId })
    .sort({ date: 1 })
    .toArray();

  const profileWeight = typeof profile?.weight === "number" ? profile.weight : null;
  const weightValues = weights
    .map(weight => typeof weight.weight === "number" ? weight.weight : null)
    .filter((weight): weight is number => weight !== null);
  const initialWeight = weightValues[0] ?? profileWeight;
  const currentWeight = weightValues.at(-1) ?? profileWeight;

  const exerciseMap = new Map<string, ProgressStat>();
  for (const workout of sessions) {
    for (const result of workout.exerciseResults ?? []) {
      const current = exerciseMap.get(result.exerciseId) ?? {
        id: result.exerciseId,
        name: result.exerciseName,
        sessions: 0,
        totalSets: 0,
        latestSets: 0,
        deltaSets: 0,
        muscles: [],
      };
      current.sessions += 1;
      const completedSets = result.sets?.length
        ? result.sets.filter((set: { completed?: boolean; skipped?: boolean }) => set.completed && !set.skipped).length
        : result.setsCompleted ?? 0;
      current.totalSets += completedSets;
      current.latestSets = completedSets;
      current.deltaSets = current.sessions > 1
        ? current.latestSets - (current.totalSets - current.latestSets) / (current.sessions - 1)
        : 0;
      exerciseMap.set(result.exerciseId, current);
    }
  }

  const muscleMap = new Map<string, number>();
  const plans = await db.collection<UserTrainingPlan>("trainingPlans")
    .find({ userId, status: "active" })
    .limit(1)
    .toArray();
  for (const day of plans[0]?.weeklyPlan ?? []) {
    for (const exercise of day.exercises) {
      for (const muscle of exercise.muscles) {
        muscleMap.set(muscle, (muscleMap.get(muscle) ?? 0) + 1);
      }
    }
  }

  const todayIndex = (new Date().getDay() + 6) % 7;
  const nextSession = plans[0]?.weeklyPlan[todayIndex]?.isRest
    ? plans[0]?.weeklyPlan.find(day => !day.isRest)
    : plans[0]?.weeklyPlan[todayIndex];
  const waterLog = await db.collection("waterLogs").findOne({ userId, date: today.toISOString().split("T")[0] });

  return NextResponse.json({
    totalSessions,
    totalCalories,
    avgDuration,
    weekCalories,
    weekSessions:    weekSessions.length,
    streak:          profile?.streak ?? 0,
    weeklyStreak:    profile?.weeklyStreak ?? 0,
    recentSessions:  sessions.slice(0, 12),
    weightHistory:   weights,
    weightDelta: initialWeight !== null && currentWeight !== null ? currentWeight - initialWeight : 0,
    muscleProgress: Array.from(muscleMap, ([name, plannedExercises]) => ({ name, plannedExercises }))
      .sort((a, b) => b.plannedExercises - a.plannedExercises)
      .slice(0, 8),
    exerciseProgress: Array.from(exerciseMap.values()).slice(0, 12),
    nextSession: nextSession ?? null,
    waterToday: waterLog?.amount ?? 0,
  });
}
