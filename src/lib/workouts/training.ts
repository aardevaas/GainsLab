// Pure training math — estimated 1RM, volume, and barbell plate breakdown.
// Shared by the session logger and (later) the progression engine.

/** Epley estimated 1-rep max: weight × (1 + reps/30). Reps=1 → the weight. */
export function estimateOneRepMax(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

/** Set volume = weight × reps. */
export function setVolume(weightKg: number, reps: number): number {
  return Math.max(0, weightKg) * Math.max(0, reps);
}

/** Standard kg barbell + plate set (per side, heaviest first). */
export const DEFAULT_BAR_KG = 20;
const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25] as const;

export type PlateLayout = {
  perSide: number[];
  /** Weight left over that no plate combination covers (e.g. odd bar/total). */
  remainderKg: number;
  barKg: number;
};

/**
 * Greedy per-side plate breakdown for a target total weight on a barbell.
 * Returns the plates for ONE side. Anything below the bar weight (or an
 * unloadable remainder) is reported so the UI can flag it.
 */
export function platesPerSide(totalKg: number, barKg = DEFAULT_BAR_KG): PlateLayout {
  if (totalKg <= barKg) {
    return { perSide: [], remainderKg: Math.max(0, totalKg - barKg), barKg };
  }
  let perSideKg = (totalKg - barKg) / 2;
  const perSide: number[] = [];
  for (const plate of PLATES_KG) {
    while (perSideKg >= plate - 1e-9) {
      perSide.push(plate);
      perSideKg -= plate;
    }
  }
  return { perSide, remainderKg: Math.round(perSideKg * 100) / 100, barKg };
}
