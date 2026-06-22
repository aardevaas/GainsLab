import type { Exercise } from './types';

const REPO_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main';

export async function getAllExercises(): Promise<Exercise[]> {
  const res = await fetch(`${REPO_BASE}/dist/exercises.json`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  return res.json() as Promise<Exercise[]>;
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
    .filter(ex => {
      if (q) {
        const nameMatch = ex.name.toLowerCase().includes(q);
        const muscleMatch = ex.primaryMuscles.some(m => m.toLowerCase().includes(q));
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
  return all.find(ex => ex.id === id) ?? null;
}

export function exerciseImageUrl(exerciseId: string, index = 0): string {
  return `${REPO_BASE}/exercises/${exerciseId}/${index}.jpg`;
}
