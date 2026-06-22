// Body Mass Index — WHO Classification (2000)
// Formula: BMI = weight(kg) / height(m)²

import type { BMICategory, BMIResult } from './types';

const CATEGORY_LABELS: Record<BMICategory, string> = {
  underweight_severe: 'Severely Underweight',
  underweight_moderate: 'Moderately Underweight',
  underweight_mild: 'Mildly Underweight',
  normal: 'Normal Weight',
  overweight: 'Overweight',
  obese_class_1: 'Obese Class I',
  obese_class_2: 'Obese Class II',
  obese_class_3: 'Obese Class III',
};

function classify(bmi: number): BMICategory {
  if (bmi < 16) return 'underweight_severe';
  if (bmi < 17) return 'underweight_moderate';
  if (bmi < 18.5) return 'underweight_mild';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  if (bmi < 35) return 'obese_class_1';
  if (bmi < 40) return 'obese_class_2';
  return 'obese_class_3';
}

export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  if (weightKg <= 0) throw new RangeError('Weight must be positive');
  if (heightCm <= 0) throw new RangeError('Height must be positive');

  const hM = heightCm / 100;
  const bmi = weightKg / (hM * hM);
  const category = classify(bmi);

  return {
    bmi: Math.round(bmi * 10) / 10,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    healthyWeightRange: {
      min: Math.round(18.5 * hM * hM * 10) / 10,
      max: Math.round(24.9 * hM * hM * 10) / 10,
    },
  };
}

export function calculateBMIImperial(weightLbs: number, heightInches: number): BMIResult {
  if (weightLbs <= 0) throw new RangeError('Weight must be positive');
  if (heightInches <= 0) throw new RangeError('Height must be positive');
  return calculateBMI(weightLbs * 0.453592, heightInches * 2.54);
}
