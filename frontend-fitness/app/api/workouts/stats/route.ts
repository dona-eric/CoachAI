import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";

// GET — statistiques agrégées de l'utilisateur
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = (session.user as any).id as string;
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

  return NextResponse.json({
    totalSessions,
    totalCalories,
    avgDuration,
    weekCalories,
    weekSessions:    weekSessions.length,
    streak:          profile?.streak ?? 0,
    recentSessions:  sessions.slice(0, 12),
    weightHistory:   weights,
  });
}
