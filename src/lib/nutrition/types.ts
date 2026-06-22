export type FoodSource = 'usda' | 'off';

export type FoodItem = {
  id: string;
  name: string;
  brand?: string;
  source: FoodSource;
  per100g: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
  };
  servingSize?: number;
  servingUnit?: string;
};

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export type FoodLogEntry = {
  id: string;
  user_id: string;
  date: string;
  meal_type: MealType;
  food_name: string;
  brand: string | null;
  quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
  created_at: string;
};

export type DayMacros = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export function sumMacros(entries: FoodLogEntry[]): DayMacros {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      proteinG: acc.proteinG + e.protein_g,
      carbsG: acc.carbsG + e.carbs_g,
      fatG: acc.fatG + e.fat_g,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
}

export function calcFoodMacros(
  per100g: FoodItem['per100g'],
  quantity: number,
  unit: 'g' | 'oz' | 'serving',
  servingSizeG?: number,
): { calories: number; proteinG: number; carbsG: number; fatG: number; fiberG: number } {
  let grams = quantity;
  if (unit === 'oz') grams = quantity * 28.35;
  if (unit === 'serving' && servingSizeG) grams = quantity * servingSizeG;
  const factor = grams / 100;
  return {
    calories: Math.round(per100g.calories * factor),
    proteinG: Math.round(per100g.proteinG * factor * 10) / 10,
    carbsG: Math.round(per100g.carbsG * factor * 10) / 10,
    fatG: Math.round(per100g.fatG * factor * 10) / 10,
    fiberG: Math.round(per100g.fiberG * factor * 10) / 10,
  };
}
