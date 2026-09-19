import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";
import clientPromise from "@/lib/mongodb";
import { WorkoutSession, SetResult } from "@/lib/types";

// GET — liste des séances + stats
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const requestedLimit = Number.parseInt(searchParams.get("limit") ?? "20", 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 20;

  const db = await getDb();
  const sessions = await db
    .collection("workoutSessions")
    .find({ userId })
    .sort({ date: -1 })
    .limit(limit)
    .toArray();

  return NextResponse.json(sessions);
}

// POST — enregistrer une nouvelle séance
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = session.user.id;
  const body: Omit<WorkoutSession, "userId" | "createdAt"> = await req.json();
  const exerciseResults = body.exerciseResults ?? [];
  const normalizedResults = exerciseResults.map((exercise) => {
    const sets = Array.isArray(exercise.sets) ? exercise.sets : [];
    const validSets = sets.filter((set): set is SetResult =>
      Boolean(set && Number.isInteger(set.setNumber) && set.setNumber > 0
        && typeof set.completed === "boolean"
        && (set.repsCompleted === undefined || (Number.isFinite(set.repsCompleted) && set.repsCompleted >= 0))
        && (set.durationSeconds === undefined || (Number.isFinite(set.durationSeconds) && set.durationSeconds >= 0))
        && (set.weightUsed === undefined || (Number.isFinite(set.weightUsed) && set.weightUsed >= 0))
        && (set.restSeconds === undefined || (Number.isFinite(set.restSeconds) && set.restSeconds >= 0))),
    );
    return {
      ...exercise,
      sets: validSets,
      setsCompleted: validSets.length > 0
        ? validSets.filter(set => set.completed && !set.skipped).length
        : exercise.setsCompleted,
    };
  });

  const dateIsValid = /^\d{4}-\d{2}-\d{2}$/.test(body.date ?? "")
    && !Number.isNaN(new Date(`${body.date}T00:00:00Z`).getTime());
  if (!dateIsValid || body.date > new Date().toISOString().split("T")[0]
    || !Number.isFinite(body.duration) || body.duration <= 0 || body.duration > 600
    || !Number.isFinite(body.calories) || body.calories < 0
    || !Number.isFinite(body.exercisesDone) || body.exercisesDone < 0
    || !Number.isFinite(body.totalSets) || body.totalSets < 0
    || normalizedResults.some(exercise => Array.isArray(exercise.sets)
      && exercise.sets.length !== (exercise.setsCompleted ?? 0))) {
    return NextResponse.json({ error: "Données de séance incomplètes." }, { status: 400 });
  }

  const db = await getDb();
  const now = new Date();
  const client = await clientPromise;
  const mongoSession = client.startSession();
  let insertedId = "";
  let newStreak = 1;
  let newWeeklyStreak = 0;

  try {
    await mongoSession.withTransaction(async () => {
      const result = await db.collection("workoutSessions").insertOne({
        userId, date: body.date, planId: body.planId ?? null, planName: body.planName ?? null,
        duration: body.duration, calories: body.calories, exercisesDone: body.exercisesDone ?? 0,
        totalSets: body.totalSets ?? 0, mood: body.mood ?? 3, notes: body.notes ?? "",
        exerciseResults: normalizedResults, createdAt: now,
      }, { session: mongoSession });
      insertedId = result.insertedId.toString();

      for (const exercise of normalizedResults) {
        if (!exercise.exerciseId || !exercise.exerciseName || exercise.setsCompleted <= 0) continue;
        const setValues = (exercise.sets ?? []).filter(set => set.completed && !set.skipped);
        const maxWeight = setValues.reduce((max, set) => Math.max(max, set.weightUsed ?? 0), 0);
        const maxReps = setValues.reduce((max, set) => Math.max(max, set.repsCompleted ?? 0), 0);
        const numericValue = maxWeight > 0 ? maxWeight : maxReps || exercise.repsCompleted || exercise.setsCompleted;
        const unit = maxWeight > 0 ? "kg" : maxReps > 0 ? "répétitions" : "séries";
        const existing = await db.collection("personalRecords").findOne({ userId, exerciseSlug: exercise.exerciseId }, { session: mongoSession });
        if (!existing || numericValue > (existing.numericValue as number ?? 0)) {
          await db.collection("personalRecords").updateOne(
            { userId, exerciseSlug: exercise.exerciseId },
            { $set: { userId, exerciseSlug: exercise.exerciseId, exerciseName: exercise.exerciseName, emoji: "🏋️", value: `${numericValue} ${unit}`, numericValue, date: body.date, createdAt: now } },
            { upsert: true, session: mongoSession },
          );
        }
      }

      const today = new Date().toISOString().split("T")[0];
      const profile = await db.collection("userProfiles").findOne({ userId }, { session: mongoSession });
      if (profile?.lastSessionDate) {
        const diff = Math.floor((new Date(today).getTime() - new Date(profile.lastSessionDate as string).getTime()) / 86400000);
        if (diff === 1) newStreak = (profile.streak as number ?? 0) + 1;
        else if (diff === 0) newStreak = profile.streak as number ?? 1;
      }
      const plan = profile?.activePlanId
        ? await db.collection("trainingPlans").findOne({ userId, id: profile.activePlanId }, { session: mongoSession })
        : await db.collection("trainingPlans").findOne({ userId, status: "active" }, { session: mongoSession });
      const targetPerWeek = Math.max(1, Number(plan?.sessionsPerWeek ?? 3));
      const allSessions = await db.collection("workoutSessions")
        .find({ userId }, { session: mongoSession, projection: { date: 1 } })
        .toArray();
      const weekCounts = new Map<string, number>();
      for (const workout of allSessions) {
        const date = new Date(`${String(workout.date)}T00:00:00Z`);
        date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
        const week = date.toISOString().slice(0, 10);
        weekCounts.set(week, (weekCounts.get(week) ?? 0) + 1);
      }
      const currentWeek = new Date(`${today}T00:00:00Z`);
      currentWeek.setUTCDate(currentWeek.getUTCDate() - ((currentWeek.getUTCDay() + 6) % 7));
      let weekCursor = currentWeek;
      while ((weekCounts.get(weekCursor.toISOString().slice(0, 10)) ?? 0) >= targetPerWeek) {
        newWeeklyStreak++;
        weekCursor = new Date(weekCursor);
        weekCursor.setUTCDate(weekCursor.getUTCDate() - 7);
      }
      await db.collection("userProfiles").updateOne(
        { userId },
        { $set: { streak: newStreak, weeklyStreak: newWeeklyStreak, lastSessionDate: today, updatedAt: now } },
        { session: mongoSession },
      );
    });
  } finally {
    await mongoSession.endSession();
  }

  return NextResponse.json({ id: insertedId, streak: newStreak, weeklyStreak: newWeeklyStreak }, { status: 201 });
}
