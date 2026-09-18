export interface Food {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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
