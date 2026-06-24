import { createClient } from '@/lib/supabase/server';
import { exerciseToCacheRow } from './db';
import type { Exercise } from './types';

/**
 * Write provider results into the `exercises` cache (build our proprietary
 * exercise DB over time). Best-effort: a cache failure never breaks search or
 * render. Server-only — never import from a client component.
 */
export async function cacheExercises(items: Exercise[]): Promise<void> {
  if (items.length === 0) return;
  try {
    const supabase = await createClient();
    await supabase
      .from('exercises')
      .upsert(items.map(exerciseToCacheRow), { onConflict: 'source,source_id' });
  } catch {
    // ignore — caching is an optimization, not a requirement
  }
}
