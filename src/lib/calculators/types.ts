export type Gender = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active'
  | 'extra_active';

export type BMRFormula = 'mifflin_st_jeor' | 'harris_benedict' | 'katch_mcardle';

export type OneRepMaxFormula =
  | 'epley'
  | 'brzycki'
  | 'lombardi'
  | 'mayhew'
  | 'oconner'
  | 'wathan'
  | 'lander';

export type BodyFatMethod = 'us_navy' | 'bmi_derived';

export type BMICategory =
  | 'underweight_severe'
  | 'underweight_moderate'
  | 'underweight_mild'
  | 'normal'
  | 'overweight'
  | 'obese_class_1'
  | 'obese_class_2'
  | 'obese_class_3';

export type HeartRateZoneModel = 'standard' | 'karvonen';

export type MaxHRFormula = 'tanaka' | 'fox';

export type DistanceUnit = 'km' | 'mi';

export type MacroPreset = 'balanced' | 'low_carb' | 'high_carb' | 'high_protein' | 'keto' | 'zone';

export interface MacroRatio {
  protein: number;
  carbs: number;
  fat: number;
}

// ── Results ────────────────────────────────────────────────────────────────

export interface BMIResult {
  bmi: number;
  category: BMICategory;
  categoryLabel: string;
  healthyWeightRange: { min: number; max: number };
}

export interface BMRResult {
  bmr: number;
  formula: BMRFormula;
}

export interface TDEEResult {
  tdee: number;
  bmr: number;
  activityLevel: ActivityLevel;
  activityMultiplier: number;
}

export interface MacroNutrients {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface MacroGoals {
  maintenance: MacroNutrients;
  cutting: MacroNutrients;
  bulking: MacroNutrients;
  ratio: MacroRatio;
}

export interface OneRepMaxResult {
  oneRepMax: number;
  formula: OneRepMaxFormula;
  percentageTable: Record<number, number>;
}

export interface BodyFatResult {
  bodyFatPercentage: number;
  fatMassKg: number;
  leanMassKg: number;
  category: string;
  method: BodyFatMethod;
}

export interface USNavyMeasurements {
  waistCm: number;
  neckCm: number;
  heightCm: number;
  hipCm?: number;
}

export interface HeartRateZone {
  zone: number;
  name: string;
  minBpm: number;
  maxBpm: number;
  description: string;
  color: string;
}

export interface HeartRateZonesResult {
  maxHeartRate: number;
  restingHeartRate?: number;
  zones: HeartRateZone[];
}

export interface PaceResult {
  pacePerKm: string;
  pacePerMile: string;
  speedKmh: number;
  speedMph: number;
}

export interface RaceTimeResult {
  estimatedMinutes: number;
  formatted: string;
}

export interface IdealWeightResult {
  robinson: number;
  miller: number;
  devine: number;
  hamwi: number;
  average: number;
}

export interface WaterIntakeResult {
  liters: number;
  ounces: number;
  cups: number;
}

export interface CalorieBurnResult {
  totalCalories: number;
  caloriesPerMinute: number;
  durationMinutes: number;
  activity: string;
}
