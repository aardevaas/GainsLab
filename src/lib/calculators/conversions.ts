// Unit Conversion Utilities

const round2 = (n: number) => Math.round(n * 100) / 100;
const round1 = (n: number) => Math.round(n * 10) / 10;

// ── Weight ─────────────────────────────────────────────────────────────────
export const lbsToKg   = (lbs: number): number => round2(lbs * 0.453592);
export const kgToLbs   = (kg: number):  number => round2(kg  * 2.20462);

// ── Height ─────────────────────────────────────────────────────────────────
export const inchesToCm  = (in_: number): number => round2(in_ * 2.54);
export const cmToInches  = (cm: number):  number => round2(cm  / 2.54);

export function feetInchesToCm(feet: number, inches: number): number {
  return round2((feet * 12 + inches) * 2.54);
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  return {
    feet:   Math.floor(totalInches / 12),
    inches: round1(totalInches % 12),
  };
}

// ── Distance ───────────────────────────────────────────────────────────────
export const kmToMiles  = (km: number):    number => round2(km    * 0.621371);
export const milesToKm  = (miles: number): number => round2(miles * 1.60934);

// ── Temperature ────────────────────────────────────────────────────────────
export const celsiusToFahrenheit = (c: number): number => round1(c * 9 / 5 + 32);
export const fahrenheitToCelsius = (f: number): number => round1((f - 32) * 5 / 9);

// ── Volume ─────────────────────────────────────────────────────────────────
export const litersToOz = (l: number): number => round1(l * 33.814);
export const ozToLiters = (oz: number): number => round2(oz / 33.814);
