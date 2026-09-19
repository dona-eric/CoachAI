export interface Food {
  id: string;
  uuid?: string;
  name: string;
  commonName?: string;
  brand?: string;
  sourceName?: string;
  sourceUrl?: string;
  code?: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number;
  saturatedFat?: number;
  fiber?: number;
  sodium?: number;
  isVegan?: boolean | null;
  isVegetarian?: boolean | null;
  nutriscore?: string | null;
  weightUnits?: { id: number; uuid: string; gram: number; name: string }[];
  source?: 'wger';
}

export interface MealEntry {
  id: string;
  foodId: string;
  foodName: string;
  emoji: string;
  quantity: number;
  meal: 'matin' | 'midi' | 'soir' | 'collation';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function calculateTDEE(weight: number, height: number, age: number, male: boolean, activityLevel: number): number {
  const bmr = male
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  return Math.round(bmr * activityLevel);
}
