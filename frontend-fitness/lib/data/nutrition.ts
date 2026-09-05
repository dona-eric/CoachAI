// Données mock — Nutrition & Hydratation

export interface Food {
  id: string;
  name: string;
  emoji: string;
  calories: number; // kcal / 100g
  protein: number;  // g / 100g
  carbs: number;
  fat: number;
  category: 'proteine' | 'feculent' | 'legume' | 'fruit' | 'produit-laitier' | 'autre';
}

export const foods: Food[] = [
  { id: 'f1',  name: 'Blanc de poulet grillé', emoji: '🍗', calories: 165, protein: 31, carbs: 0, fat: 3.6, category: 'proteine' },
  { id: 'f2',  name: 'Œufs entiers', emoji: '🥚', calories: 155, protein: 13, carbs: 1.1, fat: 11, category: 'proteine' },
  { id: 'f3',  name: 'Thon en boîte', emoji: '🐟', calories: 116, protein: 26, carbs: 0, fat: 1, category: 'proteine' },
  { id: 'f4',  name: 'Riz blanc cuit', emoji: '🍚', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, category: 'feculent' },
  { id: 'f5',  name: 'Igname cuite', emoji: '🍠', calories: 118, protein: 1.5, carbs: 28, fat: 0.1, category: 'feculent' },
  { id: 'f6',  name: 'Plantain mûr', emoji: '🍌', calories: 122, protein: 1.3, carbs: 32, fat: 0.4, category: 'feculent' },
  { id: 'f7',  name: 'Pain de blé complet', emoji: '🍞', calories: 247, protein: 9, carbs: 48, fat: 3, category: 'feculent' },
  { id: 'f8',  name: 'Épinards cuits', emoji: '🥬', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, category: 'legume' },
  { id: 'f9',  name: 'Tomate', emoji: '🍅', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, category: 'legume' },
  { id: 'f10', name: 'Oignon', emoji: '🧅', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, category: 'legume' },
  { id: 'f11', name: 'Banane', emoji: '🍌', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, category: 'fruit' },
  { id: 'f12', name: 'Mangue', emoji: '🥭', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, category: 'fruit' },
  { id: 'f13', name: 'Avocat', emoji: '🥑', calories: 160, protein: 2, carbs: 9, fat: 15, category: 'fruit' },
  { id: 'f14', name: 'Yaourt nature', emoji: '🥛', calories: 59, protein: 3.5, carbs: 3.6, fat: 3.3, category: 'produit-laitier' },
  { id: 'f15', name: 'Lait entier', emoji: '🥛', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, category: 'produit-laitier' },
  { id: 'f16', name: 'Arachides (cacahuètes)', emoji: '🥜', calories: 567, protein: 26, carbs: 16, fat: 49, category: 'autre' },
  { id: 'f17', name: 'Haricots noirs cuits', emoji: '🫘', calories: 132, protein: 8.9, carbs: 24, fat: 0.5, category: 'proteine' },
  { id: 'f18', name: 'Attiéké (couscous manioc)', emoji: '🍛', calories: 170, protein: 1.1, carbs: 39, fat: 0.5, category: 'feculent' },
];

export interface MealEntry {
  id: string;
  foodId: string;
  foodName: string;
  emoji: string;
  quantity: number; // grammes
  meal: 'matin' | 'midi' | 'soir' | 'collation';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Journal du jour
export const todayMeals: MealEntry[] = [
  { id: 'm1', foodId: 'f2', foodName: 'Œufs entiers', emoji: '🥚', quantity: 200, meal: 'matin', calories: 310, protein: 26, carbs: 2.2, fat: 22 },
  { id: 'm2', foodId: 'f11', foodName: 'Banane', emoji: '🍌', quantity: 120, meal: 'matin', calories: 107, protein: 1.3, carbs: 27.6, fat: 0.4 },
  { id: 'm3', foodId: 'f1', foodName: 'Blanc de poulet grillé', emoji: '🍗', quantity: 180, meal: 'midi', calories: 297, protein: 55.8, carbs: 0, fat: 6.5 },
  { id: 'm4', foodId: 'f4', foodName: 'Riz blanc cuit', emoji: '🍚', quantity: 200, meal: 'midi', calories: 260, protein: 5.4, carbs: 56, fat: 0.6 },
  { id: 'm5', foodId: 'f8', foodName: 'Épinards cuits', emoji: '🥬', quantity: 100, meal: 'midi', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { id: 'm6', foodId: 'f16', foodName: 'Arachides', emoji: '🥜', quantity: 30, meal: 'collation', calories: 170, protein: 7.8, carbs: 4.8, fat: 14.7 },
];

export const waterGoal = 2500; // ml
export const waterConsumed = 1800; // ml (today)

// Calcul besoins caloriques (Mifflin-St Jeor)
export function calculateTDEE(weight: number, height: number, age: number, male: boolean, activityLevel: number): number {
  const bmr = male
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  return Math.round(bmr * activityLevel);
}

export const activityLevels = [
  { label: 'Sédentaire (bureau, peu d\'exercice)', value: 1.2 },
  { label: 'Légèrement actif (1-3 séances/sem)', value: 1.375 },
  { label: 'Modérément actif (3-5 séances/sem)', value: 1.55 },
  { label: 'Très actif (6-7 séances/sem)', value: 1.725 },
  { label: 'Extrêmement actif (sport + travail physique)', value: 1.9 },
];
