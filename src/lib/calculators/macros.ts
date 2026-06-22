// Macronutrient Calculator
//
// Energy density (Atwater factors):
//   Protein: 4 kcal/g
//   Carbohydrates: 4 kcal/g
//   Fat: 9 kcal/g
//
// Calorie adjustment targets:
//   Cutting:  TDEE × 0.80  (−20% deficit)
//   Bulking:  TDEE × 1.15  (+15% surplus)

import type {
  Gender,
  ActivityLevel,
  BMRFormula,
  MacroRatio,
  MacroPreset,
  MacroNutrients,
  MacroGoals,
} from './types';
import { calculateTDEE } from './tdee';

export const PRESET_RATIOS: Record<MacroPreset, MacroRatio> = {
  balanced:     { protein: 0.30, carbs: 0.40, fat: 0.30 },
  high_protein: { protein: 0.40, carbs: 0.35, fat: 0.25 },
  low_carb:     { protein: 0.40, carbs: 0.20, fat: 0.40 },
  high_carb:    { protein: 0.25, carbs: 0.55, fat: 0.20 },
  keto:         { protein: 0.30, carbs: 0.05, fat: 0.65 },
  zone:         { protein: 0.30, carbs: 0.40, fat: 0.30 },
};

export const PRESET_LABELS: Record<MacroPreset, string> = {
  balanced: 'Balanced',
  high_protein: 'High Protein',
  low_carb: 'Low Carb',
  high_carb: 'High Carb',
  keto: 'Ketogenic',
  zone: 'Zone Diet',
};

function macrosFromCalories(calories: number, ratio: MacroRatio): MacroNutrients {
  return {
    calories: Math.round(calories),
    proteinG: Math.round((calories * ratio.protein) / 4),
    carbsG: Math.round((calories * ratio.carbs) / 4),
    fatG: Math.round((calories * ratio.fat) / 9),
  };
}

export function calculateMacros(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  preset: MacroPreset | MacroRatio = 'balanced',
  formula: BMRFormula = 'mifflin_st_jeor',
  bodyFatPct?: number,
): MacroGoals {
  const ratio: MacroRatio =
    typeof preset === 'string' ? { ...PRESET_RATIOS[preset] } : preset;

  const sum = ratio.protein + ratio.carbs + ratio.fat;
  if (Math.abs(sum - 1) > 0.01) {
    throw new Error(`Macro ratios must sum to 1.0 (got ${sum.toFixed(2)})`);
  }

  const { tdee } = calculateTDEE(weightKg, heightCm, age, gender, activityLevel, formula, bodyFatPct);

  return {
    maintenance: macrosFromCalories(tdee, ratio),
    cutting:     macrosFromCalories(tdee * 0.80, ratio),
    bulking:     macrosFromCalories(tdee * 1.15, ratio),
    ratio,
  };
}

export function calculateMacrosFromTarget(
  targetCalories: number,
  preset: MacroPreset | MacroRatio = 'balanced',
): MacroNutrients {
  if (targetCalories <= 0) throw new RangeError('Target calories must be positive');
  const ratio: MacroRatio =
    typeof preset === 'string' ? { ...PRESET_RATIOS[preset] } : preset;
  return macrosFromCalories(targetCalories, ratio);
}

export function getPresetRatios(): Record<MacroPreset, MacroRatio> {
  return { ...PRESET_RATIOS };
}
