// Basal Metabolic Rate — calories burned at complete rest
//
// Mifflin-St Jeor (1990): most accurate for general population
//   Male:   10W + 6.25H - 5A + 5
//   Female: 10W + 6.25H - 5A - 161
//
// Harris-Benedict (Roza & Shizgal revision, 1984):
//   Male:   88.362 + 13.397W + 4.799H - 5.677A
//   Female: 447.593 + 9.247W + 3.098H - 4.330A
//
// Katch-McArdle (1975): based on lean body mass
//   BMR = 370 + 21.6 × lean mass(kg)

import type { Gender, BMRFormula, BMRResult } from './types';

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  formula: BMRFormula = 'mifflin_st_jeor',
  bodyFatPct?: number,
): BMRResult {
  if (weightKg <= 0) throw new RangeError('Weight must be positive');
  if (heightCm <= 0) throw new RangeError('Height must be positive');
  if (age < 1 || age > 120) throw new RangeError('Age must be between 1 and 120');

  let bmr: number;

  if (formula === 'mifflin_st_jeor') {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    bmr = gender === 'male' ? base + 5 : base - 161;
  } else if (formula === 'harris_benedict') {
    bmr =
      gender === 'male'
        ? 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
        : 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
  } else {
    if (bodyFatPct === undefined) {
      throw new Error('Body fat percentage is required for Katch-McArdle formula');
    }
    if (bodyFatPct < 0 || bodyFatPct > 70) {
      throw new RangeError('Body fat percentage must be between 0 and 70');
    }
    const leanMass = weightKg * (1 - bodyFatPct / 100);
    bmr = 370 + 21.6 * leanMass;
  }

  return { bmr: Math.round(bmr), formula };
}
