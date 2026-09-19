import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";
import type { ExerciseResult, SetResult } from "@/lib/types";

type ProgressPoint = {
  date: string;
  volume: number;
  sets: number;
  reps: number;
  bestWeight: number;
};

function pointsForExercise(
  sessions: { date?: string; exerciseResults?: ExerciseResult[] }[],
  exerciseId: string,
): ProgressPoint[] {
  return sessions
    .map(session => {
      const result = session.exerciseResults?.find(item => item.exerciseId === exerciseId);
      if (!result) return null;
      const sets: SetResult[] = result.sets ?? [];
      const completed = sets.length > 0
        ? sets.filter(set => set.completed && !set.skipped)
        : [{
            setNumber: 1,
            completed: true,
            repsCompleted: result.repsCompleted,
            weightUsed: result.weightUsed,
          } satisfies SetResult];
      return {
        date: session.date ?? "",
        volume: completed.reduce((total, set) => total + (set.weightUsed ?? 0) * (set.repsCompleted ?? 0), 0),
        sets: completed.length,
        reps: completed.reduce((total, set) => total + (set.repsCompleted ?? 0), 0),
        bestWeight: completed.reduce((max, set) => Math.max(max, set.weightUsed ?? 0), 0),
      };
    })
    .filter((point): point is ProgressPoint => point !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const exerciseId = new URL(req.url).searchParams.get("exerciseId")?.trim();
  const db = await getDb();
  const sessions = await db.collection("workoutSessions")
    .find({ userId: session.user.id })
    .project({ date: 1, exerciseResults: 1 })
    .sort({ date: 1 })
    .toArray() as unknown as { date?: string; exerciseResults?: ExerciseResult[] }[];

  const ids = exerciseId
    ? [exerciseId]
    : [...new Set(sessions.flatMap(item => (item.exerciseResults ?? []).map(result => result.exerciseId)))];
  const exercises = ids.map(id => {
    const points = pointsForExercise(sessions, id);
    const result = sessions.flatMap(item => item.exerciseResults ?? []).find(item => item.exerciseId === id);
    const latest = points.at(-1);
    const first = points[0];
    return {
      exerciseId: id,
      exerciseName: result?.exerciseName ?? id,
      sessions: points.length,
      totalVolume: points.reduce((total, point) => total + point.volume, 0),
      bestWeight: Math.max(0, ...points.map(point => point.bestWeight)),
      bestReps: Math.max(0, ...points.map(point => point.reps)),
      volumeDelta: latest && first ? latest.volume - first.volume : 0,
      points,
    };
  });

  return NextResponse.json({ exercises });
}
