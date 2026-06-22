// Heart Rate Zone Calculator
//
// Max Heart Rate formulas:
//   Tanaka et al. (2001): MHR = 208 − 0.7 × age  (more accurate, especially 40+)
//   Fox & Haskell (1970): MHR = 220 − age         (classic, widely used)
//
// Zone models:
//   Standard: zones as % of MHR
//   Karvonen: zones as % of Heart Rate Reserve (HRR = MHR − resting HR)
//             Target HR = HRR × intensity% + resting HR

import type { MaxHRFormula, HeartRateZoneModel, HeartRateZone, HeartRateZonesResult } from './types';

interface ZoneDef {
  zone: number;
  name: string;
  minPct: number;
  maxPct: number;
  description: string;
  color: string;
}

const ZONE_DEFINITIONS: ZoneDef[] = [
  { zone: 1, name: 'Recovery',  minPct: 0.50, maxPct: 0.60, description: 'Very light — warm-up, cool-down, active recovery', color: '#6EE7B7' },
  { zone: 2, name: 'Endurance', minPct: 0.60, maxPct: 0.70, description: 'Aerobic base — fat burning, conversational pace',    color: '#93C5FD' },
  { zone: 3, name: 'Aerobic',   minPct: 0.70, maxPct: 0.80, description: 'Cardio — improves VO₂ max and cardiovascular fitness', color: '#FCD34D' },
  { zone: 4, name: 'Threshold', minPct: 0.80, maxPct: 0.90, description: 'Lactate threshold — hard, sustainable for short bursts', color: '#FB923C' },
  { zone: 5, name: 'Maximum',   minPct: 0.90, maxPct: 1.00, description: 'Anaerobic — maximum effort, cannot be sustained',     color: '#F87171' },
];

export function estimateMaxHeartRate(age: number, formula: MaxHRFormula = 'tanaka'): number {
  if (age < 1 || age > 120) throw new RangeError('Age must be between 1 and 120');
  return formula === 'tanaka'
    ? Math.round(208 - 0.7 * age)
    : Math.round(220 - age);
}

export function calculateHeartRateZones(
  age: number,
  restingHR?: number,
  model: HeartRateZoneModel = 'standard',
  maxHR?: number,
  maxHRFormula: MaxHRFormula = 'tanaka',
): HeartRateZonesResult {
  if (model === 'karvonen' && restingHR === undefined) {
    throw new Error('Resting heart rate is required for the Karvonen model');
  }

  const mhr = maxHR ?? estimateMaxHeartRate(age, maxHRFormula);

  const zones: HeartRateZone[] = ZONE_DEFINITIONS.map(def => {
    let minBpm: number;
    let maxBpm: number;

    if (model === 'karvonen') {
      const hrr = mhr - restingHR!;
      minBpm = Math.round(hrr * def.minPct + restingHR!);
      maxBpm = Math.round(hrr * def.maxPct + restingHR!);
    } else {
      minBpm = Math.round(mhr * def.minPct);
      maxBpm = Math.round(mhr * def.maxPct);
    }

    return {
      zone: def.zone,
      name: def.name,
      minBpm,
      maxBpm,
      description: def.description,
      color: def.color,
    };
  });

  return { maxHeartRate: mhr, restingHeartRate: restingHR, zones };
}

export function getTargetHeartRate(
  age: number,
  intensityPct: number,
  restingHR?: number,
  maxHRFormula: MaxHRFormula = 'tanaka',
): number {
  if (intensityPct < 0 || intensityPct > 100) {
    throw new RangeError('Intensity must be between 0 and 100');
  }
  const mhr = estimateMaxHeartRate(age, maxHRFormula);
  const intensity = intensityPct / 100;
  if (restingHR !== undefined) {
    return Math.round((mhr - restingHR) * intensity + restingHR);
  }
  return Math.round(mhr * intensity);
}
