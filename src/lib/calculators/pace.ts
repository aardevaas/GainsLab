// Running Pace & Race Time Calculator
//
// Riegel Race Predictor (1981):
//   T2 = T1 × (D2 / D1)^1.06
//   where T = time, D = distance, exponent = fatigue factor
//   Source: Riegel, P.S. "Athletic Records and Human Endurance". American Scientist. 69(3), 1981.

import type { PaceResult, RaceTimeResult, DistanceUnit } from './types';

const KM_PER_MILE = 1.60934;
const MILES_PER_KM = 0.621371;

function secondsToMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function minutesToFormatted(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.floor(totalMinutes % 60);
  const s = Math.round((totalMinutes % 1) * 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function calculatePace(
  distance: number,
  timeMinutes: number,
  unit: DistanceUnit = 'km',
): PaceResult {
  if (distance <= 0) throw new RangeError('Distance must be positive');
  if (timeMinutes <= 0) throw new RangeError('Time must be positive');

  const distKm   = unit === 'mi' ? distance * KM_PER_MILE : distance;
  const distMi   = unit === 'km' ? distance * MILES_PER_KM : distance;
  const totalSec = timeMinutes * 60;

  return {
    pacePerKm:   secondsToMMSS(totalSec / distKm),
    pacePerMile: secondsToMMSS(totalSec / distMi),
    speedKmh:    Math.round((distKm / timeMinutes) * 60 * 100) / 100,
    speedMph:    Math.round((distMi / timeMinutes) * 60 * 100) / 100,
  };
}

export function paceToSpeed(paceMMSS: string): { kmh: number; mph: number } {
  const parts = paceMMSS.split(':');
  if (parts.length !== 2) throw new Error('Pace must be in "mm:ss" format');
  const totalMin = parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
  if (totalMin <= 0) throw new RangeError('Pace must be positive');
  const kmh = 60 / totalMin;
  return {
    kmh: Math.round(kmh * 100) / 100,
    mph: Math.round(kmh * MILES_PER_KM * 100) / 100,
  };
}

export function speedToPace(speedKmh: number): { perKm: string; perMile: string } {
  if (speedKmh <= 0) throw new RangeError('Speed must be positive');
  return {
    perKm:   secondsToMMSS(3600 / speedKmh),
    perMile: secondsToMMSS(3600 / speedKmh / MILES_PER_KM),
  };
}

export function estimateRaceTime(
  knownDistance: number,
  knownTimeMinutes: number,
  targetDistance: number,
  unit: DistanceUnit = 'km',
): RaceTimeResult {
  if (knownDistance <= 0 || targetDistance <= 0) throw new RangeError('Distances must be positive');
  if (knownTimeMinutes <= 0) throw new RangeError('Time must be positive');

  const RIEGEL_EXPONENT = 1.06;
  const estimatedMinutes =
    knownTimeMinutes * Math.pow(targetDistance / knownDistance, RIEGEL_EXPONENT);

  return {
    estimatedMinutes: Math.round(estimatedMinutes * 100) / 100,
    formatted: minutesToFormatted(estimatedMinutes),
  };
}

// Common race distances in km
export const RACE_DISTANCES: Record<string, number> = {
  '1K': 1,
  '5K': 5,
  '10K': 10,
  'Half Marathon': 21.0975,
  'Marathon': 42.195,
  '50K': 50,
  '100K': 100,
};
