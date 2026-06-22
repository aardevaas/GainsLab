// One Rep Max Estimator
//
// Epley (1985):      1RM = W × (1 + R/30)
// Brzycki (1993):    1RM = W × 36/(37 − R)
// Lombardi (1989):   1RM = W × R^0.1
// Mayhew et al (1992): 1RM = 100W / (52.2 + 41.9e^(−0.055R))
// O'Conner et al (1989): 1RM = W × (1 + R/40)
// Wathan (1994):     1RM = 100W / (48.8 + 53.8e^(−0.075R))
// Lander (1985):     1RM = 100W / (101.3 − 2.67123R)

import type { OneRepMaxFormula, OneRepMaxResult } from './types';

type FormulaFn = (weight: number, reps: number) => number;

const FORMULAS: Record<OneRepMaxFormula, FormulaFn> = {
  epley:    (w, r) => w * (1 + r / 30),
  brzycki:  (w, r) => w * (36 / (37 - r)),
  lombardi: (w, r) => w * Math.pow(r, 0.1),
  mayhew:   (w, r) => (100 * w) / (52.2 + 41.9 * Math.exp(-0.055 * r)),
  oconner:  (w, r) => w * (1 + r / 40),
  wathan:   (w, r) => (100 * w) / (48.8 + 53.8 * Math.exp(-0.075 * r)),
  lander:   (w, r) => (100 * w) / (101.3 - 2.67123 * r),
};

export const FORMULA_LABELS: Record<OneRepMaxFormula, string> = {
  epley: 'Epley (1985)',
  brzycki: 'Brzycki (1993)',
  lombardi: 'Lombardi (1989)',
  mayhew: 'Mayhew et al. (1992)',
  oconner: "O'Conner et al. (1989)",
  wathan: 'Wathan (1994)',
  lander: 'Lander (1985)',
};

function buildPercentageTable(oneRM: number): Record<number, number> {
  const table: Record<number, number> = {};
  for (let pct = 100; pct >= 50; pct -= 5) {
    table[pct] = Math.round((oneRM * pct) / 100 * 10) / 10;
  }
  return table;
}

export function calculateOneRepMax(
  weight: number,
  reps: number,
  formula: OneRepMaxFormula = 'epley',
): OneRepMaxResult {
  if (weight <= 0) throw new RangeError('Weight must be positive');
  if (reps < 1 || reps > 30) throw new RangeError('Reps must be between 1 and 30');

  const oneRM = reps === 1 ? weight : FORMULAS[formula](weight, reps);

  return {
    oneRepMax: Math.round(oneRM * 10) / 10,
    formula,
    percentageTable: buildPercentageTable(oneRM),
  };
}

export function calculateAllFormulas(
  weight: number,
  reps: number,
): Record<OneRepMaxFormula, number> {
  if (weight <= 0) throw new RangeError('Weight must be positive');
  if (reps < 1 || reps > 30) throw new RangeError('Reps must be between 1 and 30');

  return Object.fromEntries(
    Object.entries(FORMULAS).map(([name, fn]) => [
      name,
      Math.round((reps === 1 ? weight : fn(weight, reps)) * 10) / 10,
    ]),
  ) as Record<OneRepMaxFormula, number>;
}

export function estimateRepsAtWeight(
  oneRM: number,
  targetWeight: number,
  formula: OneRepMaxFormula = 'epley',
): number {
  if (oneRM <= 0) throw new RangeError('One rep max must be positive');
  if (targetWeight <= 0) throw new RangeError('Target weight must be positive');
  if (targetWeight > oneRM) throw new RangeError('Target weight cannot exceed one rep max');
  if (targetWeight === oneRM) return 1;

  const ratio = targetWeight / oneRM;
  switch (formula) {
    case 'epley':   return Math.max(1, Math.round(30 * (1 / ratio - 1)));
    case 'brzycki': return Math.max(1, Math.round(37 - 36 * ratio));
    case 'oconner': return Math.max(1, Math.round(40 * (1 / ratio - 1)));
    case 'lander':  return Math.max(1, Math.round((101.3 - 100 * ratio) / 2.67123));
    default:        return Math.max(1, Math.round(30 * (1 / ratio - 1)));
  }
}
