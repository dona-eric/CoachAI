import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";
import clientPromise from "@/lib/mongodb";
import { WorkoutSession } from "@/lib/types";

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

  const dateIsValid = /^\d{4}-\d{2}-\d{2}$/.test(body.date ?? "")
    && !Number.isNaN(new Date(`${body.date}T00:00:00Z`).getTime());
  if (!dateIsValid || body.date > new Date().toISOString().split("T")[0]
    || !Number.isFinite(body.duration) || body.duration <= 0 || body.duration > 600
    || !Number.isFinite(body.calories) || body.calories < 0
    || !Number.isFinite(body.exercisesDone) || body.exercisesDone < 0
    || !Number.isFinite(body.totalSets) || body.totalSets < 0) {
    return NextResponse.json({ error: "Données de séance incomplètes." }, { status: 400 });
  }

  const db = await getDb();
  const now = new Date();
  const client = await clientPromise;
  const mongoSession = client.startSession();
  let insertedId = "";
  let newStreak = 1;

  try {
    await mongoSession.withTransaction(async () => {
      const result = await db.collection("workoutSessions").insertOne({
        userId, date: body.date, planId: body.planId ?? null, planName: body.planName ?? null,
        duration: body.duration, calories: body.calories, exercisesDone: body.exercisesDone ?? 0,
        totalSets: body.totalSets ?? 0, mood: body.mood ?? 3, notes: body.notes ?? "",
        exerciseResults: body.exerciseResults ?? [], createdAt: now,
      }, { session: mongoSession });
      insertedId = result.insertedId.toString();

      for (const exercise of body.exerciseResults ?? []) {
        if (!exercise.exerciseId || !exercise.exerciseName || exercise.setsCompleted <= 0) continue;
        const numericValue = exercise.weightUsed ?? exercise.repsCompleted ?? exercise.setsCompleted;
        const unit = exercise.weightUsed !== undefined ? "kg" : exercise.repsCompleted !== undefined ? "répétitions" : "séries";
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
      await db.collection("userProfiles").updateOne(
        { userId },
        { $set: { streak: newStreak, lastSessionDate: today, updatedAt: now } },
        { session: mongoSession },
      );
    });
  } finally {
    await mongoSession.endSession();
  }

  return NextResponse.json({ id: insertedId, streak: newStreak }, { status: 201 });
}
