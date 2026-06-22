// Ideal Body Weight Formulas
//
// All formulas are based on height above 5 feet (60 inches)
//
// Robinson (1983): Robinson JD et al. Am J Hosp Pharm. 40(6):1016-9.
//   Male:   52.0 + 1.9 × inches over 5ft
//   Female: 49.0 + 1.7 × inches over 5ft
//
// Miller (1983): Miller DR et al. Am J Clin Nutr. 38(6):925-33.
//   Male:   56.2 + 1.41 × inches over 5ft
//   Female: 53.1 + 1.36 × inches over 5ft
//
// Devine (1974): Devine BJ. Drug Intell Clin Pharm. 8:650-5.
//   Male:   50.0 + 2.3 × inches over 5ft
//   Female: 45.5 + 2.3 × inches over 5ft
//
// Hamwi (1964): Hamwi GJ. Therapy: Changing dietary concepts.
//   Male:   48.0 + 2.7 × inches over 5ft
//   Female: 45.5 + 2.2 × inches over 5ft

import type { Gender, IdealWeightResult } from './types';

export function calculateIdealWeight(heightCm: number, gender: Gender): IdealWeightResult {
  if (heightCm <= 0) throw new RangeError('Height must be positive');

  const inchesOver5Ft = Math.max(0, heightCm / 2.54 - 60);

  let robinson: number;
  let miller: number;
  let devine: number;
  let hamwi: number;

  if (gender === 'male') {
    robinson = 52.0 + 1.9  * inchesOver5Ft;
    miller   = 56.2 + 1.41 * inchesOver5Ft;
    devine   = 50.0 + 2.3  * inchesOver5Ft;
    hamwi    = 48.0 + 2.7  * inchesOver5Ft;
  } else {
    robinson = 49.0 + 1.7  * inchesOver5Ft;
    miller   = 53.1 + 1.36 * inchesOver5Ft;
    devine   = 45.5 + 2.3  * inchesOver5Ft;
    hamwi    = 45.5 + 2.2  * inchesOver5Ft;
  }

  const average = (robinson + miller + devine + hamwi) / 4;

  return {
    robinson: Math.round(robinson * 10) / 10,
    miller:   Math.round(miller   * 10) / 10,
    devine:   Math.round(devine   * 10) / 10,
    hamwi:    Math.round(hamwi    * 10) / 10,
    average:  Math.round(average  * 10) / 10,
  };
}
