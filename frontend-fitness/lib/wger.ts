import type { Exercise, ExerciseVideo } from "@/lib/data/exercises";

const WGER_API_URL = "https://wger.de/api/v2";
const WGER_PAGE_SIZE = 100;

export interface WgerExerciseComment {
  id: number;
  uuid: string;
  translation: number;
  comment: string;
}
interface WgerReference {
  id: number;
  name: string;
  name_en?: string;
}

export interface WgerEquipment {
  id: number;
  name: string;
}

export interface WgerExerciseTranslation {
  id: number;
  uuid: string;
  name: string;
  exercise: number;
  description: string;
  description_source: string;
  created: string;
  language: number;
  license_author: string;
}

interface WgerVideo {
  id?: number;
  uuid?: string;
  exercise?: number;
  exercise_uuid?: string;
  video?: string;
  url?: string;
  is_main?: boolean;
  size?: number;
  duration?: string;
  width?: number;
  height?: number;
  codec?: string;
  codec_long?: string;
  license?: number;
  license_title?: string;
  license_object_url?: string;
  license_author?: string;
  license_author_url?: string;
  license_derivative_source_url?: string;
  author_history?: string[];
}

interface WgerExerciseInfo {
  id: number;
  uuid: string;
  category: WgerReference;
  muscles: WgerReference[];
  muscles_secondary: WgerReference[];
  equipment: WgerEquipment[];
  translations: WgerExerciseTranslation[];
  images: { image: string; is_main: boolean }[];
  videos?: WgerVideo[];
  aliases?: { alias: string }[];
  comments?: { comment: string }[];
}

interface WgerExerciseSummary {
  id: number;
  uuid: string;
  created: string;
  last_update: string;
  category: number;
  muscles: number[];
  muscles_secondary: number[];
  equipment: number[];
  variation_group: string | null;
  license_author: string;
}

interface WgerListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface WgerVideoRecord {
  id: number;
  uuid: string;
  exercise: number;
  exercise_uuid: string;
  video: string;
  is_main: boolean;
  size: number;
  duration: string;
  width: number;
  height: number;
  codec: string;
  codec_long: string;
  license: number;
  license_title: string;
  license_object_url: string;
  license_author: string;
  license_author_url: string;
  license_derivative_source_url: string;
  author_history: string[];
}

export interface WgerFood {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: "wger";
}

export interface WgerCatalogMetadata {
  muscles: WgerReference[];
  equipment: WgerEquipment[];
  categories: WgerCategory[];
}

export interface WgerCategory {
  id: number;
  name: string;
}

interface WgerIngredientInfo {
  id: number;
  name: string;
  energy: number | null;
  protein: string | null;
  carbohydrates: string | null;
  fat: string | null;
}

export interface WgerExercise extends Exercise {
  source: "wger";
  sourceId: number;
  uuid: string;
  created?: string;
  categoryId?: number;
  categoryName: string;
  muscleIds: number[];
  secondaryMuscleIds: number[];
  equipmentIds: number[];
  wgerEquipment: WgerEquipment[];
  variationGroup?: string | null;
  lastUpdate?: string;
  imageUrl?: string;
  equipmentNames: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  videoUrls: string[];
  videos: NonNullable<Exercise["videos"]>;
  videoRecords: WgerVideoRecord[];
  aliases: string[];
  comments: string[];
  commentRecords: WgerExerciseComment[];
  translationRecords: WgerExerciseTranslation[];
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getTranslation(translations: WgerExerciseTranslation[]): WgerExerciseTranslation | undefined {
  return translations.find(translation => translation.language === 12)
    ?? translations.find(translation => translation.language === 2)
    ?? translations.find(translation => Boolean(translation.name))
}

function mapCategory(categoryName: string): Exercise["category"] {
  const category = categoryName.toLowerCase();
  if (category.includes("cardio")) return "cardio";
  if (category.includes("stretch") || category.includes("mobility")) return "mobilite";
  if (category.includes("abs") || category.includes("core")) return "core";
  return "force";
}

function mapEquipment(equipment: WgerReference[]): Exercise["equipment"] {
  if (equipment.some(item => item.name.toLowerCase().includes("bodyweight"))) {
    return "bodyweight";
  }
  if (equipment.length === 0) return "bodyweight";
  if (equipment.some(item => ["dumbbell", "barbell", "cable", "machine", "kettlebell"].some(
    keyword => item.name.toLowerCase().includes(keyword),
  ))) {
    return "salle";
  }
  return "maison";
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeExercise(
  exercise: WgerExerciseInfo,
  source?: WgerExerciseSummary,
  comments: WgerExerciseComment[] = [],
  translations: WgerExerciseTranslation[] = exercise.translations,
): WgerExercise | null {
  const translation = getTranslation(translations);
  if (!translation?.name) return null;

  const primaryMuscles = exercise.muscles.map(muscle => muscle.name_en ?? muscle.name);
  const secondaryMuscles = exercise.muscles_secondary.map(muscle => muscle.name_en ?? muscle.name);
  const equipmentNames = exercise.equipment.map(item => item.name);
  const name = translation.name.trim();
  const translationIds = new Set(
    translations.map(item => item.id),
  );
  const relatedComments = comments.filter(item => translationIds.has(item.translation));
  const sourceVideos = [...new Map(
    (exercise.videos ?? [])
      .filter(video => video.video ?? video.url)
      .map(video => [video.uuid ?? `${video.exercise ?? exercise.id}:${video.video ?? video.url}`, video]),
  ).values()];

  return {
    id: `wger-${exercise.id}`,
    slug: `${slugify(name)}-${exercise.id}`,
    name,
    emoji: "🏋️",
    category: mapCategory(exercise.category.name),
    categoryName: exercise.category.name,
    equipment: mapEquipment(exercise.equipment),
    level: "intermediaire",
    muscles: [...primaryMuscles, ...secondaryMuscles],
    primaryMuscles,
    secondaryMuscles,
    equipmentNames,
    duration: "3 séries",
    description: stripHtml(translation.description ?? "Exercice issu de la bibliothèque Wger."),
    steps: [],
    errors: [],
    variants: [],
    kcalPerMin: 6,
    source: "wger",
    sourceId: exercise.id,
    uuid: exercise.uuid,
    created: source?.created,
    lastUpdate: source?.last_update,
    categoryId: source?.category ?? exercise.category.id,
    muscleIds: source?.muscles ?? exercise.muscles.map(muscle => muscle.id),
    secondaryMuscleIds: source?.muscles_secondary ?? exercise.muscles_secondary.map(muscle => muscle.id),
    equipmentIds: source?.equipment ?? exercise.equipment.map(item => item.id),
    wgerEquipment: exercise.equipment.map(item => ({ id: item.id, name: item.name })),
    variationGroup: source?.variation_group,
    imageUrl: exercise.images.find(image => image.is_main)?.image ?? exercise.images[0]?.image,
    videos: sourceVideos
      .map((video): ExerciseVideo | null => {
        const url = video.video ?? video.url;
        return url ? {
          id: video.id,
          uuid: video.uuid,
          exerciseId: video.exercise ?? exercise.id,
          exerciseUuid: video.exercise_uuid ?? exercise.uuid,
          url,
          isMain: video.is_main,
          durationSeconds: video.duration ? Number.parseFloat(video.duration) : undefined,
          width: video.width,
          height: video.height,
        } : null;
      })
      .filter((video): video is ExerciseVideo => video !== null),
    videoRecords: sourceVideos.flatMap(video => video.video && video.exercise !== undefined && video.uuid ? [{
      id: video.id ?? 0,
      uuid: video.uuid,
      exercise: video.exercise,
      exercise_uuid: video.exercise_uuid ?? exercise.uuid,
      video: video.video,
      is_main: video.is_main ?? false,
      size: video.size ?? 0,
      duration: video.duration ?? "",
      width: video.width ?? 0,
      height: video.height ?? 0,
      codec: video.codec ?? "",
      codec_long: video.codec_long ?? "",
      license: video.license ?? 0,
      license_title: video.license_title ?? "",
      license_object_url: video.license_object_url ?? "",
      license_author: video.license_author ?? "",
      license_author_url: video.license_author_url ?? "",
      license_derivative_source_url: video.license_derivative_source_url ?? "",
      author_history: video.author_history ?? [],
    }] : []),
    videoUrls: sourceVideos
      .map(video => video.video ?? video.url)
      .filter((video): video is string => Boolean(video)),
    aliases: (exercise.aliases ?? []).map(alias => alias.alias),
    comments: (exercise.comments ?? []).map(comment => comment.comment),
    exerciseComments: relatedComments.map(comment => ({
      id: comment.id,
      uuid: comment.uuid,
      translationId: comment.translation,
      comment: comment.comment,
    })),
    commentRecords: relatedComments,
    translationRecords: translations,
    translations: translations.map(translation => ({
      id: translation.id,
      uuid: translation.uuid,
      exerciseId: translation.exercise,
      name: translation.name,
      description: translation.description,
      descriptionSource: translation.description_source,
      created: translation.created,
      language: translation.language,
      licenseAuthor: translation.license_author,
    })),
  };
}

async function fetchWger<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let response: Response;

  try {
    response = await fetch(`${WGER_API_URL}${path}`, {
      signal: controller.signal,
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Wger API returned ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getWgerCatalogMetadata(): Promise<WgerCatalogMetadata> {
  const [muscles, equipment, categories] = await Promise.all([
    fetchWger<WgerListResponse<WgerReference>>("/muscle/?limit=100"),
    fetchWger<WgerListResponse<WgerEquipment>>("/equipment/?limit=100"),
    fetchWger<WgerListResponse<WgerCategory>>("/exercisecategory/?limit=100"),
  ]);

  return {
    muscles: muscles.results,
    equipment: equipment.results,
    categories: categories.results,
  };
}

export async function getWgerVideoRecords(): Promise<WgerVideoRecord[]> {
  const firstPage = await fetchWger<WgerListResponse<WgerVideoRecord>>("/video/?limit=100&offset=0");
  const pageCount = Math.ceil(firstPage.count / 100);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      fetchWger<WgerListResponse<WgerVideoRecord>>(`/video/?limit=100&offset=${(index + 1) * 100}`),
    ),
  );
  return [firstPage, ...remainingPages].flatMap(page => page.results);
}

export async function getWgerVideosForExercise(exerciseId: number): Promise<WgerVideoRecord[]> {
  const response = await fetchWger<WgerListResponse<WgerVideoRecord>>(
    `/video/?exercise=${exerciseId}&limit=100`,
  );
  return response.results;
}

export async function getWgerExerciseComments(): Promise<WgerExerciseComment[]> {
  const firstPage = await fetchWger<WgerListResponse<WgerExerciseComment>>(
    "/exercisecomment/?limit=100&offset=0",
  );
  const pageCount = Math.ceil(firstPage.count / 100);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      fetchWger<WgerListResponse<WgerExerciseComment>>(
        `/exercisecomment/?limit=100&offset=${(index + 1) * 100}`,
      ),
    ),
  );
  return [firstPage, ...remainingPages].flatMap(page => page.results);
}

export async function getWgerExerciseTranslations(): Promise<WgerExerciseTranslation[]> {
  const firstPage = await fetchWger<WgerListResponse<WgerExerciseTranslation>>(
    "/exercise-translation/?limit=100&offset=0",
  );
  const pageCount = Math.ceil(firstPage.count / 100);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      fetchWger<WgerListResponse<WgerExerciseTranslation>>(
        `/exercise-translation/?limit=100&offset=${(index + 1) * 100}`,
      ),
    ),
  );
  return [firstPage, ...remainingPages].flatMap(page => page.results);
}

export async function getWgerExercises(): Promise<WgerExercise[]> {
  const firstPage = await fetchWger<WgerListResponse<WgerExerciseSummary>>(
    `/exercise/?limit=${WGER_PAGE_SIZE}&offset=0`,
  );
  const pageCount = Math.ceil(firstPage.count / WGER_PAGE_SIZE);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      fetchWger<WgerListResponse<WgerExerciseSummary>>(
        `/exercise/?limit=${WGER_PAGE_SIZE}&offset=${(index + 1) * WGER_PAGE_SIZE}`,
      ),
    ),
  );

  const summaries = [firstPage, ...remainingPages].flatMap(page => page.results);
  const videoRecords = await getWgerVideoRecords();
  const exerciseComments = await getWgerExerciseComments();
  const exerciseTranslations = await getWgerExerciseTranslations();
  const translationsByExercise = new Map<number, WgerExerciseTranslation[]>();
  for (const translation of exerciseTranslations) {
    const current = translationsByExercise.get(translation.exercise) ?? [];
    current.push(translation);
    translationsByExercise.set(translation.exercise, current);
  }
  const videosByExercise = new Map<number, WgerVideoRecord[]>();
  for (const video of videoRecords) {
    const current = videosByExercise.get(video.exercise) ?? [];
    current.push(video);
    videosByExercise.set(video.exercise, current);
  }
  const detailedExercises: { summary: WgerExerciseSummary; detail: WgerExerciseInfo }[] = [];
  for (let offset = 0; offset < summaries.length; offset += 25) {
    const batch = summaries.slice(offset, offset + 25);
    detailedExercises.push(...await Promise.all(
      batch.map(async summary => ({
        summary,
        detail: await fetchWger<WgerExerciseInfo>(`/exerciseinfo/${summary.id}/`).then(detail => ({
          ...detail,
          videos: [
            ...(videosByExercise.get(summary.id) ?? []),
            ...(detail.videos ?? []),
          ],
        })),
      })),
    ));
  }

  return detailedExercises
    .map(({ summary, detail }) => {
      const translations = translationsByExercise.get(summary.id) ?? detail.translations;
      return normalizeExercise(detail, summary, exerciseComments, translations);
    })
    .filter((exercise): exercise is WgerExercise => exercise !== null);
}

export async function getWgerFeaturedExercise(): Promise<WgerExercise | null> {
  const page = await fetchWger<WgerListResponse<WgerExerciseInfo>>(
    `/exerciseinfo/?limit=20&offset=0`,
  );
  const exercises = (await Promise.all(page.results.map(async exercise => {
    const videos = await getWgerVideosForExercise(exercise.id);
    return normalizeExercise({
      ...exercise,
      videos: [...videos, ...(exercise.videos ?? [])],
    });
  })))
    .filter((exercise): exercise is WgerExercise => exercise !== null);
  const armExercise = exercises.find(exercise => {
    const searchable = `${exercise.name} ${exercise.muscles.join(" ")}`.toLowerCase();
    return /(biceps|triceps|brachial)/.test(searchable)
      && (exercise.videoUrls.length > 0 || Boolean(exercise.imageUrl));
  });

  return armExercise
    ?? exercises.find(exercise => exercise.videoUrls.length > 0 || Boolean(exercise.imageUrl))
    ?? null;
}

export async function getWgerExerciseBySlug(slug: string): Promise<WgerExercise | null> {
  const match = slug.match(/-(\d+)$/);
  if (!match) return null;

  const exercise = await fetchWger<WgerExerciseInfo>(`/exerciseinfo/${match[1]}/`);
  const videos = await getWgerVideosForExercise(exercise.id);
  const comments = await getWgerExerciseComments();
  const translations = await fetchWger<WgerListResponse<WgerExerciseTranslation>>(
    `/exercise-translation/?exercise=${exercise.id}&limit=100`,
  );
  return normalizeExercise({
    ...exercise,
    videos: [...(exercise.videos ?? []), ...videos],
  }, undefined, comments, translations.results);
}

export async function searchWgerFoods(search: string): Promise<WgerFood[]> {
  const query = encodeURIComponent(search.trim());
  const response = await fetchWger<WgerListResponse<WgerIngredientInfo>>(
    `/ingredientinfo/?limit=20&name__icontains=${query}`,
  );

  return response.results.map(food => ({
    id: `wger-food-${food.id}`,
    name: food.name,
    emoji: "🍽️",
    calories: Math.round(food.energy ?? 0),
    protein: Number.parseFloat(food.protein ?? "0") || 0,
    carbs: Number.parseFloat(food.carbohydrates ?? "0") || 0,
    fat: Number.parseFloat(food.fat ?? "0") || 0,
    source: "wger" as const,
  }));
}
