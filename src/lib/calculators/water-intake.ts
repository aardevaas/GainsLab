// Daily Water Intake Estimator
//
// Base recommendation: 33 mL per kg of body weight
// Source: National Academies of Sciences, Engineering, and Medicine (2004)
//         "Dietary Reference Intakes for Water, Potassium, Sodium, Chloride, and Sulfate"
//
// Activity multipliers are applied on top of the base to account for sweat losses

import type { ActivityLevel, WaterIntakeResult } from './types';

const ACTIVITY_WATER_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary:    1.00,
  light:        1.12,
  moderate:     1.25,
  active:       1.40,
  very_active:  1.55,
  extra_active: 1.70,
};

const ML_PER_KG = 33;
const ML_PER_OZ = 29.5735;
const ML_PER_CUP = 236.588;

export function calculateWaterIntake(
  weightKg: number,
  activityLevel: ActivityLevel = 'moderate',
): WaterIntakeResult {
  if (weightKg <= 0) throw new RangeError('Weight must be positive');

  const multiplier = ACTIVITY_WATER_MULTIPLIERS[activityLevel];
  if (!multiplier) throw new Error(`Unknown activity level: ${activityLevel}`);

  const totalMl = weightKg * ML_PER_KG * multiplier;

  return {
    liters: Math.round((totalMl / 1000) * 10) / 10,
    ounces: Math.round(totalMl / ML_PER_OZ),
    cups:   Math.round((totalMl / ML_PER_CUP) * 10) / 10,
  };
}
