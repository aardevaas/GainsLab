// Macros Calculator — Math Engine
// All formulas implemented from primary scientific sources

export type {
  Gender,
  ActivityLevel,
  BMRFormula,
  OneRepMaxFormula,
  BodyFatMethod,
  BMICategory,
  HeartRateZoneModel,
  MaxHRFormula,
  DistanceUnit,
  MacroPreset,
  MacroRatio,
  BMIResult,
  BMRResult,
  TDEEResult,
  MacroNutrients,
  MacroGoals,
  OneRepMaxResult,
  BodyFatResult,
  USNavyMeasurements,
  HeartRateZone,
  HeartRateZonesResult,
  PaceResult,
  RaceTimeResult,
  IdealWeightResult,
  WaterIntakeResult,
  CalorieBurnResult,
} from './types';

export { calculateBMI, calculateBMIImperial } from './bmi';

export { calculateBMR } from './bmr';

export { calculateTDEE, getActivityMultiplier, ACTIVITY_MULTIPLIERS, ACTIVITY_LABELS } from './tdee';

export {
  calculateMacros,
  calculateMacrosFromTarget,
  getPresetRatios,
  PRESET_RATIOS,
  PRESET_LABELS,
} from './macros';

export {
  calculateOneRepMax,
  calculateAllFormulas,
  estimateRepsAtWeight,
  FORMULA_LABELS,
} from './one-rep-max';

export { calculateBodyFat, getBodyFatCategory } from './body-fat';

export {
  estimateMaxHeartRate,
  calculateHeartRateZones,
  getTargetHeartRate,
} from './heart-rate';

export {
  calculateCaloriesBurned,
  getActivities,
  getActivitiesByCategory,
  ACTIVITIES,
} from './calories';

export type { Activity } from './calories';

export {
  calculatePace,
  paceToSpeed,
  speedToPace,
  estimateRaceTime,
  RACE_DISTANCES,
} from './pace';

export { calculateIdealWeight } from './ideal-weight';

export { calculateWaterIntake } from './water-intake';

export {
  lbsToKg,
  kgToLbs,
  inchesToCm,
  cmToInches,
  feetInchesToCm,
  cmToFeetInches,
  kmToMiles,
  milesToKm,
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  litersToOz,
  ozToLiters,
} from './conversions';
