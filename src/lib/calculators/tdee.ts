// Total Daily Energy Expenditure
// TDEE = BMR × Activity Multiplier
//
// Activity multipliers adapted from Harris & Benedict (1919) and
// subsequent research by McArdle, Katch & Katch (2000)

import type { Gender, ActivityLevel, BMRFormula, TDEEResult } from './types';
import { calculateBMR } from './bmr';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,       // desk job, little to no exercise
  light: 1.375,         // light exercise 1–3 days/week
  moderate: 1.55,       // moderate exercise 3–5 days/week
  active: 1.725,        // hard exercise 6–7 days/week
  very_active: 1.9,     // hard exercise + physical job
  extra_active: 2.1,    // athlete-level or twice-daily training
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary',
  light: 'Lightly Active',
  moderate: 'Moderately Active',
  active: 'Active',
  very_active: 'Very Active',
  extra_active: 'Extra Active',
};

export function calculateTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  formula: BMRFormula = 'mifflin_st_jeor',
  bodyFatPct?: number,
): TDEEResult {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  if (!multiplier) throw new Error(`Unknown activity level: ${activityLevel}`);

  const { bmr } = calculateBMR(weightKg, heightCm, age, gender, formula, bodyFatPct);

  return {
    tdee: Math.round(bmr * multiplier),
    bmr,
    activityLevel,
    activityMultiplier: multiplier,
  };
}

export function getActivityMultiplier(level: ActivityLevel): number {
  const m = ACTIVITY_MULTIPLIERS[level];
  if (!m) throw new Error(`Unknown activity level: ${level}`);
  return m;
}
