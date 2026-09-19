import type { Collection, Db, Filter } from "mongodb";
import {
  getWgerCatalogMetadata,
  getWgerExercises,
  type WgerCatalogMetadata,
  type WgerExercise,
  type WgerExerciseComment,
  type WgerExerciseImageRecord,
  type WgerExerciseAlias,
  type WgerTrophy,
  getWgerTrophies,
  type WgerExerciseTranslation,
  type WgerVideoRecord,
} from "@/lib/wger";

type SyncSummary = {
  exercises: number;
  videos: number;
  comments: number;
  translations: number;
  images: number;
  aliases: number;
  muscles: number;
  equipment: number;
  categories: number;
  trophies: number;
};

async function replaceByKey<T extends object>(
  collection: Collection<T>,
  documents: T[],
  key: keyof T,
): Promise<void> {
  if (documents.length === 0) return;

  await collection.bulkWrite(
    documents.map(document => ({
      replaceOne: {
        filter: { [key]: document[key] } as Filter<T>,
        replacement: document,
        upsert: true,
      },
    })),
    { ordered: false },
  );
}

export async function syncWgerCatalog(db: Db): Promise<SyncSummary> {
  const [metadata, exercises, trophies] = await Promise.all([
    getWgerCatalogMetadata(),
    getWgerExercises(),
    getWgerTrophies(),
  ]);

  const videos = uniqueBy(exercises.flatMap(exercise => exercise.videoRecords), "uuid");
  const comments = uniqueBy(exercises.flatMap(exercise => exercise.commentRecords), "uuid");
  const translations = uniqueBy(exercises.flatMap(exercise => exercise.translationRecords), "uuid");
  const images = uniqueBy(exercises.flatMap(exercise => exercise.imageRecords), "uuid");
  const aliases = uniqueBy(exercises.flatMap(exercise => exercise.wgerAliasRecords), "uuid");

  await Promise.all([
    db.collection<WgerExercise>("wgerExercises").createIndex({ sourceId: 1 }, { unique: true }),
    db.collection<WgerVideoRecord>("wgerVideos").createIndex({ uuid: 1 }, { unique: true }),
    db.collection<WgerExerciseComment>("wgerExerciseComments").createIndex({ uuid: 1 }, { unique: true }),
    db.collection<WgerExerciseTranslation>("wgerExerciseTranslations").createIndex({ uuid: 1 }, { unique: true }),
    db.collection<WgerExerciseImageRecord>("wgerExerciseImages").createIndex({ uuid: 1 }, { unique: true }),
    db.collection<WgerExerciseAlias>("wgerExerciseAliases").createIndex({ uuid: 1 }, { unique: true }),
    db.collection<WgerTrophy>("wgerTrophies").createIndex({ id: 1 }, { unique: true }),
    db.collection("wgerMuscles").createIndex({ id: 1 }, { unique: true }),
    db.collection("wgerEquipment").createIndex({ id: 1 }, { unique: true }),
    db.collection("wgerCategories").createIndex({ id: 1 }, { unique: true }),
  ]);

  await replaceByKey(db.collection<WgerExercise>("wgerExercises"), exercises, "sourceId");
  await replaceByKey(db.collection<WgerVideoRecord>("wgerVideos"), videos, "uuid");
  await replaceByKey(db.collection<WgerExerciseComment>("wgerExerciseComments"), comments, "uuid");
  await replaceByKey(db.collection<WgerExerciseTranslation>("wgerExerciseTranslations"), translations, "uuid");
  await replaceByKey(db.collection<WgerExerciseImageRecord>("wgerExerciseImages"), images, "uuid");
  await replaceByKey(db.collection<WgerExerciseAlias>("wgerExerciseAliases"), aliases, "uuid");
  await replaceByKey(db.collection<WgerTrophy>("wgerTrophies"), trophies, "id");
  await replaceByKey(db.collection<WgerCatalogMetadata["muscles"][number]>("wgerMuscles"), metadata.muscles, "id");
  await replaceByKey(db.collection<WgerCatalogMetadata["equipment"][number]>("wgerEquipment"), metadata.equipment, "id");
  await replaceByKey(db.collection<WgerCatalogMetadata["categories"][number]>("wgerCategories"), metadata.categories, "id");

  await db.collection("wgerCatalogMetadata").replaceOne(
    { key: "catalog" },
    { key: "catalog", ...metadata, syncedAt: new Date() },
    { upsert: true },
  );

  return {
    exercises: exercises.length,
    videos: videos.length,
    comments: comments.length,
    translations: translations.length,
    images: images.length,
    aliases: aliases.length,
    muscles: metadata.muscles.length,
    equipment: metadata.equipment.length,
    categories: metadata.categories.length,
    trophies: trophies.length,
  };
}

function uniqueBy<T extends object, K extends keyof T>(items: T[], key: K): T[] {
  return [...new Map(items.map(item => [item[key], item])).values()];
}
