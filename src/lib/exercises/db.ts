import type { Exercise } from './types';
import { EXERCISE_DB_BASE } from './types';

// ─────────────────────────────────────────────────────────────────────────
// Provider: Free Exercise DB (yuhonas) — 873 exercises, each with a start (0)
// and end (1) range-of-motion frame, open-licensed, no API key, no rate limit.
// Same provider-abstraction + write-through-cache shape as the food layer
// (`src/lib/nutrition/search.ts`). A second provider (ExerciseDB, wger, or our
// own uploads → `gif_url`) can be added behind this interface without touching
// the surfaces that consume `Exercise`.
// ─────────────────────────────────────────────────────────────────────────

const REPO_BASE = EXERCISE_DB_BASE;

/** Raw dataset row — same keys as `Exercise` but image paths are relative. */
type RawExercise = Omit<Exercise, 'images'> & { images?: string[] };

/** Absolutize the relative image paths the dataset ships (`<id>/0.jpg`). */
function toExercise(raw: RawExercise): Exercise {
  return {
    ...raw,
    images: (raw.images ?? []).map((p) =>
      p.startsWith('http') ? p : `${REPO_BASE}/exercises/${p}`,
    ),
  };
}

export async function getAllExercises(): Promise<Exercise[]> {
  const res = await fetch(`${REPO_BASE}/dist/exercises.json`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const raw = (await res.json()) as RawExercise[];
  return raw.map(toExercise);
}

export async function searchExercises(opts: {
  query?: string;
  muscle?: string;
  equipment?: string;
  category?: string;
  level?: string;
  limit?: number;
}): Promise<Exercise[]> {
  const all = await getAllExercises();
  const q = opts.query?.toLowerCase().trim() ?? '';

  return all
    .filter((ex) => {
      if (q) {
        const nameMatch = ex.name.toLowerCase().includes(q);
        const muscleMatch = ex.primaryMuscles.some((m) => m.toLowerCase().includes(q));
        if (!nameMatch && !muscleMatch) return false;
      }
      if (opts.muscle && !ex.primaryMuscles.includes(opts.muscle)) return false;
      if (opts.equipment && ex.equipment !== opts.equipment) return false;
      if (opts.category && ex.category !== opts.category) return false;
      if (opts.level && ex.level !== opts.level) return false;
      return true;
    })
    .slice(0, opts.limit ?? 200);
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  const all = await getAllExercises();
  return all.find((ex) => ex.id === id) ?? null;
}

/**
 * Pure mapper: canonical `Exercise` → an `exercises` cache row. Mirrors
 * `foodItemToCacheRow`. `gif_url` stays null — reserved for a richer ROM clip
 * (manual uploads or a future provider) to be attached per-exercise later.
 */
export function exerciseToCacheRow(ex: Exercise) {
  return {
    source: 'free-exercise-db',
    source_id: ex.id,
    name: ex.name,
    category: ex.category ?? null,
    equipment: ex.equipment ?? null,
    primary_muscles: ex.primaryMuscles ?? null,
    secondary_muscles: ex.secondaryMuscles ?? null,
    instructions: ex.instructions ?? null,
    images: ex.images.length > 0 ? ex.images : null,
    gif_url: null as string | null,
  };
}
