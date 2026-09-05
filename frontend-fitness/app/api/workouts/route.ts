import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";
import { WorkoutSession } from "@/lib/types";

// GET — liste des séances + stats
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "20");

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

  const userId = (session.user as any).id as string;
  const body: Omit<WorkoutSession, "userId" | "createdAt"> = await req.json();

  if (!body.date || !body.duration || body.calories === undefined) {
    return NextResponse.json({ error: "Données de séance incomplètes." }, { status: 400 });
  }

  const db = await getDb();
  const now = new Date();

  const result = await db.collection("workoutSessions").insertOne({
    userId,
    date:           body.date,
    planId:         body.planId ?? null,
    planName:       body.planName ?? null,
    duration:       body.duration,
    calories:       body.calories,
    exercisesDone:  body.exercisesDone ?? 0,
    totalSets:      body.totalSets ?? 0,
    mood:           body.mood ?? 3,
    notes:          body.notes ?? "",
    createdAt:      now,
  });

  // Mettre à jour le streak et lastSessionDate dans le profil
  const today = new Date().toISOString().split("T")[0];
  const profile = await db.collection("userProfiles").findOne({ userId });

  let newStreak = 1;
  if (profile?.lastSessionDate) {
    const last = new Date(profile.lastSessionDate as string);
    const diff = Math.floor((new Date(today).getTime() - last.getTime()) / 86400000);
    if (diff === 1) newStreak = (profile.streak as number ?? 0) + 1; // hier → +1
    else if (diff === 0) newStreak = profile.streak as number ?? 1;  // même jour → inchangé
    // diff > 1 → reset à 1
  }

  await db.collection("userProfiles").updateOne(
    { userId },
    { $set: { streak: newStreak, lastSessionDate: today, updatedAt: now } }
  );

  return NextResponse.json({ id: result.insertedId.toString(), streak: newStreak }, { status: 201 });
}
