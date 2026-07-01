export type EvidenceLevel = 'A' | 'B' | 'C' | 'D';
export type SupplementGoal = 'muscle' | 'fat_loss' | 'strength' | 'endurance' | 'recovery' | 'health';
export type PriceTier = 'budget' | 'moderate' | 'premium';

export type Supplement = {
  id: string;
  slug: string;
  name: string;
  category: string;
  goals: SupplementGoal[];
  evidence: EvidenceLevel;
  summary: string;
  mechanism: string;
  dosage: string;
  timing: string;
  notes: string | null;
  price_tier: PriceTier;
  is_published: boolean;
};

export const SUPPLEMENT_GOALS: { id: SupplementGoal; label: string }[] = [
  { id: 'muscle', label: 'Muscle Gain' },
  { id: 'fat_loss', label: 'Fat Loss' },
  { id: 'strength', label: 'Strength' },
  { id: 'endurance', label: 'Endurance' },
  { id: 'recovery', label: 'Recovery' },
  { id: 'health', label: 'General Health' },
];

export const EVIDENCE_LEVELS: EvidenceLevel[] = ['A', 'B', 'C', 'D'];

export const EVIDENCE_LABELS: Record<EvidenceLevel, string> = {
  A: 'Strong Evidence',
  B: 'Good Evidence',
  C: 'Limited Evidence',
  D: 'Weak / Avoid',
};

export const EVIDENCE_COLORS: Record<EvidenceLevel, string> = {
  A: '#4ade80',
  B: '#60a5fa',
  C: '#fbbf24',
  D: '#f87171',
};

export const PRICE_TIERS: PriceTier[] = ['budget', 'moderate', 'premium'];

export const PRICE_LABELS: Record<PriceTier, string> = {
  budget: 'Budget',
  moderate: 'Moderate',
  premium: 'Premium',
};

export function filterSupplements(
  supplements: Supplement[],
  goal: SupplementGoal | null,
  minEvidence: EvidenceLevel | null,
): Supplement[] {
  const order: EvidenceLevel[] = ['A', 'B', 'C', 'D'];
  return supplements.filter(s => {
    if (goal && !s.goals.includes(goal)) return false;
    if (minEvidence) {
      if (order.indexOf(s.evidence) > order.indexOf(minEvidence)) return false;
    }
    return true;
  });
}
