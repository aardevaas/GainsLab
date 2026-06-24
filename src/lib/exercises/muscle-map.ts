import type { Slug } from '@mjcdev/react-body-highlighter';

/**
 * Maps Free Exercise DB muscle names onto the body-highlighter's anatomical
 * slugs. A few are approximations the highlighter has no exact region for
 * (e.g. `abductors` → `gluteal`, `lats`/`middle back` → `upper-back`).
 */
const MUSCLE_TO_SLUG: Record<string, Slug> = {
  abdominals: 'abs',
  abductors: 'gluteal',
  adductors: 'adductors',
  biceps: 'biceps',
  calves: 'calves',
  chest: 'chest',
  forearms: 'forearm',
  glutes: 'gluteal',
  hamstrings: 'hamstring',
  lats: 'upper-back',
  'lower back': 'lower-back',
  'middle back': 'upper-back',
  neck: 'neck',
  quadriceps: 'quadriceps',
  shoulders: 'deltoids',
  traps: 'trapezius',
  triceps: 'triceps',
};

/** Slugs that are only visible on the posterior (back) body view. */
const BACK_ONLY = new Set<Slug>([
  'upper-back',
  'lower-back',
  'hamstring',
  'gluteal',
  'trapezius',
]);

/** Map a list of Free Exercise DB muscles to de-duplicated highlighter slugs. */
export function toSlugs(muscles: string[]): Slug[] {
  const out = new Set<Slug>();
  for (const m of muscles) {
    const slug = MUSCLE_TO_SLUG[m.toLowerCase().trim()];
    if (slug) out.add(slug);
  }
  return [...out];
}

/**
 * Pick the body view that actually shows the given muscles, so a back-focused
 * exercise doesn't open on an empty front view.
 */
export function preferredSide(slugs: Slug[]): 'front' | 'back' {
  const back = slugs.filter((s) => BACK_ONLY.has(s)).length;
  const front = slugs.length - back;
  return back > front ? 'back' : 'front';
}
