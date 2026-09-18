import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  getWgerExercises,
  type WgerExercise,
  type WgerExerciseComment,
  type WgerExerciseTranslation,
} from "@/lib/wger";

export async function GET() {
  const db = await getDb();
  await db.collection("wgerExercises").createIndex({ sourceId: 1 }, { unique: true });
  await db.collection("wgerVideos").createIndex({ uuid: 1 }, { unique: true });
  await db.collection("wgerExerciseComments").createIndex({ uuid: 1 }, { unique: true });
  await db.collection("wgerExerciseTranslations").createIndex({ uuid: 1 }, { unique: true });
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
      const videos = [...new Map(
        exercises.flatMap(exercise => exercise.videoRecords).map(video => [video.uuid, video]),
      ).values()];
      if (videos.length > 0) {
        await db.collection("wgerVideos").bulkWrite(
          videos.map(video => ({
            replaceOne: {
              filter: { uuid: video.uuid },
              replacement: { ...video, syncedAt: new Date() },
              upsert: true,
            },
          })),
        );
      }
      const comments = [...new Map(
        exercises.flatMap(exercise => exercise.commentRecords)
          .map(comment => [comment.uuid, comment]),
      ).values()];
      if (comments.length > 0) {
        await db.collection<WgerExerciseComment>("wgerExerciseComments").bulkWrite(
          comments.map(comment => ({
            replaceOne: {
              filter: { uuid: comment.uuid },
              replacement: { ...comment, syncedAt: new Date() },
              upsert: true,
            },
          })),
        );
      }
      const translations = [...new Map(
        exercises.flatMap(exercise => exercise.translationRecords)
          .map(translation => [translation.uuid, translation]),
      ).values()];
      if (translations.length > 0) {
        await db.collection<WgerExerciseTranslation>("wgerExerciseTranslations").bulkWrite(
          translations.map(translation => ({
            replaceOne: {
              filter: { uuid: translation.uuid },
              replacement: { ...translation, syncedAt: new Date() },
              upsert: true,
            },
          })),
        );
      }
    }
    return NextResponse.json({ source: "wger", exercises });
  } catch (error) {
    console.error("[EXERCISES] Wger request failed:", error);
    return NextResponse.json({ source: "wger", exercises: [], error: "Le catalogue Wger est temporairement indisponible." }, { status: 503 });
  }
}
