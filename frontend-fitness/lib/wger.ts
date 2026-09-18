import type { Exercise } from "@/lib/data/exercises";

const WGER_API_URL = "https://wger.de/api/v2";
const WGER_PAGE_SIZE = 100;

interface WgerReference {
  id: number;
  name: string;
  name_en?: string;
}

interface WgerTranslation {
  name: string;
  language: number;
  description?: string;
}

interface WgerVideo {
  video?: string;
  url?: string;
}

interface WgerExerciseInfo {
  id: number;
  uuid: string;
  category: WgerReference;
  muscles: WgerReference[];
  muscles_secondary: WgerReference[];
  equipment: WgerReference[];
  translations: WgerTranslation[];
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
  equipment: WgerReference[];
  categories: WgerReference[];
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
  imageUrl?: string;
  equipmentNames: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  videoUrls: string[];
  aliases: string[];
  comments: string[];
  created?: string;
  lastUpdate?: string;
  variationGroup?: string | null;
  licenseAuthor?: string;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getTranslation(translations: WgerTranslation[]): WgerTranslation | undefined {
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

function normalizeExercise(exercise: WgerExerciseInfo, source?: WgerExerciseSummary): WgerExercise | null {
  const translation = getTranslation(exercise.translations);
  if (!translation?.name) return null;

  const primaryMuscles = exercise.muscles.map(muscle => muscle.name_en ?? muscle.name);
  const secondaryMuscles = exercise.muscles_secondary.map(muscle => muscle.name_en ?? muscle.name);
  const equipmentNames = exercise.equipment.map(item => item.name);
  const name = translation.name.trim();

  return {
    id: `wger-${exercise.id}`,
    slug: `${slugify(name)}-${exercise.id}`,
    name,
    emoji: "🏋️",
    category: mapCategory(exercise.category.name),
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
    imageUrl: exercise.images.find(image => image.is_main)?.image ?? exercise.images[0]?.image,
    videoUrls: (exercise.videos ?? [])
      .map(video => video.video ?? video.url)
      .filter((video): video is string => Boolean(video)),
    aliases: (exercise.aliases ?? []).map(alias => alias.alias),
    comments: (exercise.comments ?? []).map(comment => comment.comment),
    created: source?.created,
    lastUpdate: source?.last_update,
    variationGroup: source?.variation_group,
    licenseAuthor: source?.license_author,
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
    fetchWger<WgerListResponse<WgerReference>>("/equipment/?limit=100"),
    fetchWger<WgerListResponse<WgerReference>>("/exercisecategory/?limit=100"),
  ]);

  return {
    muscles: muscles.results,
    equipment: equipment.results,
    categories: categories.results,
  };
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
  const detailedExercises: { summary: WgerExerciseSummary; detail: WgerExerciseInfo }[] = [];
  for (let offset = 0; offset < summaries.length; offset += 25) {
    const batch = summaries.slice(offset, offset + 25);
    detailedExercises.push(...await Promise.all(
      batch.map(async summary => ({
        summary,
        detail: await fetchWger<WgerExerciseInfo>(`/exerciseinfo/${summary.id}/`),
      })),
    ));
  }

  return detailedExercises
    .map(({ summary, detail }) => normalizeExercise(detail, summary))
    .filter((exercise): exercise is WgerExercise => exercise !== null);
}

export async function getWgerFeaturedExercise(): Promise<WgerExercise | null> {
  const page = await fetchWger<WgerListResponse<WgerExerciseInfo>>(
    `/exerciseinfo/?limit=20&offset=0`,
  );
  const exercises = page.results
    .map(exercise => normalizeExercise(exercise))
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
  return normalizeExercise(exercise);
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
