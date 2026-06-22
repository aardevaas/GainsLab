// Body Fat Percentage Estimators
//
// US Navy Circumference Method (Hodgdon & Beckett, 1984):
//   Male:   %BF = 495 / (1.0324 − 0.19077×log10(waist−neck) + 0.15456×log10(height)) − 450
//   Female: %BF = 495 / (1.29579 − 0.35004×log10(waist+hip−neck) + 0.22100×log10(height)) − 450
//
// BMI-Derived Method (Deurenberg et al., 1991):
//   Male:   %BF = 1.20×BMI + 0.23×age − 16.2
//   Female: %BF = 1.20×BMI + 0.23×age − 5.4

import type { Gender, BodyFatMethod, BodyFatResult, USNavyMeasurements } from './types';

const MALE_CATEGORIES = [
  { label: 'Essential Fat', max: 6 },
  { label: 'Athlete',       max: 14 },
  { label: 'Fitness',       max: 18 },
  { label: 'Average',       max: 25 },
  { label: 'Obese',         max: Infinity },
];

const FEMALE_CATEGORIES = [
  { label: 'Essential Fat', max: 14 },
  { label: 'Athlete',       max: 21 },
  { label: 'Fitness',       max: 25 },
  { label: 'Average',       max: 32 },
  { label: 'Obese',         max: Infinity },
];

function classify(pct: number, gender: Gender): string {
  const cats = gender === 'male' ? MALE_CATEGORIES : FEMALE_CATEGORIES;
  return cats.find(c => pct < c.max)?.label ?? 'Obese';
}

export function calculateBodyFat(
  gender: Gender,
  weightKg: number,
  measurements: USNavyMeasurements,
  method: BodyFatMethod = 'us_navy',
): BodyFatResult {
  if (weightKg <= 0) throw new RangeError('Weight must be positive');

  let pct: number;

  if (method === 'us_navy') {
    const { waistCm, neckCm, heightCm, hipCm } = measurements;
    if (waistCm <= 0 || neckCm <= 0 || heightCm <= 0) {
      throw new RangeError('All measurements must be positive');
    }
    if (gender === 'female' && (!hipCm || hipCm <= 0)) {
      throw new RangeError('Hip measurement is required for females');
    }

    if (gender === 'male') {
      pct =
        495 /
          (1.0324 -
            0.19077 * Math.log10(waistCm - neckCm) +
            0.15456 * Math.log10(heightCm)) -
        450;
    } else {
      pct =
        495 /
          (1.29579 -
            0.35004 * Math.log10(waistCm + hipCm! - neckCm) +
            0.221 * Math.log10(heightCm)) -
        450;
    }
  } else {
    // BMI-derived — requires age, use measurements.heightCm
    const { heightCm } = measurements;
    if (!heightCm || heightCm <= 0) throw new RangeError('Height is required for BMI-derived method');
    const hM = heightCm / 100;
    const bmi = weightKg / (hM * hM);
    // Using a representative age of 30 for the formula since age isn't available here
    // Callers should prefer us_navy for accuracy
    pct = gender === 'male'
      ? 1.20 * bmi + 0.23 * 30 - 16.2
      : 1.20 * bmi + 0.23 * 30 - 5.4;
  }

  pct = Math.max(2, Math.min(pct, 70));

  const fatMass = weightKg * (pct / 100);
  const leanMass = weightKg - fatMass;

  return {
    bodyFatPercentage: Math.round(pct * 10) / 10,
    fatMassKg: Math.round(fatMass * 10) / 10,
    leanMassKg: Math.round(leanMass * 10) / 10,
    category: classify(pct, gender),
    method,
  };
}

export function getBodyFatCategory(pct: number, gender: Gender): string {
  return classify(pct, gender);
}
