import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getWgerExercises, type WgerExercise } from "@/lib/wger";

export async function GET() {
  const db = await getDb();
  await db.collection("wgerExercises").createIndex({ sourceId: 1 }, { unique: true });
  const cached = await db.collection<WgerExercise>("wgerExercises").find({}).toArray();
  if (cached.length > 0) {
    return NextResponse.json({ source: "wger-cache", exercises: cached });
  }

  try {
    const exercises = await getWgerExercises();
    if (exercises.length > 0) {
      await db.collection<WgerExercise>("wgerExercises").bulkWrite(
        exercises.map(exercise => ({
          replaceOne: {
            filter: { sourceId: exercise.sourceId },
            replacement: exercise,
            upsert: true,
          },
        })),
      );
    }
    return NextResponse.json({ source: "wger", exercises });
  } catch (error) {
    console.error("[EXERCISES] Wger request failed:", error);
    return NextResponse.json({ source: "wger", exercises: [], error: "Le catalogue Wger est temporairement indisponible." }, { status: 503 });
  }
}
