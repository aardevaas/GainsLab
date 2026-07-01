export type VerificationTier = 'none' | 'verified' | 'pro' | 'elite';

export const VERIFICATION_TIERS: VerificationTier[] = ['none', 'verified', 'pro', 'elite'];

export const TIER_LABELS: Record<VerificationTier, string> = {
  none: 'Unverified',
  verified: 'Verified',
  pro: 'Pro Creator',
  elite: 'Elite Creator',
};

export const TIER_COLORS: Record<VerificationTier, string> = {
  none: 'var(--color-text-muted)',
  verified: '#4ade80',
  pro: '#60a5fa',
  elite: '#fbbf24',
};

/** Any tier above 'none' counts as verified for discoverability + badges. */
export function isVerifiedTier(tier: VerificationTier): boolean {
  return tier !== 'none';
}
