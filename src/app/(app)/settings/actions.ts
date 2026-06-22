'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type UserOwnedTable = keyof Database['public']['Tables'];

// Children/leaf tables first, profiles last, to avoid FK ordering issues.
const USER_TABLES: UserOwnedTable[] = [
  'competition_entries',
  'leaderboard_scores',
  'body_age_assessments',
  'body_measurements',
  'progress_photos',
  'sleep_logs',
  'food_logs',
  'saved_recipes',
  'liked_dishes',
  'grocery_lists',
  'workout_sessions',
  'workout_plans',
  'dietary_profiles',
  'subscriptions',
  'profiles',
];

export type DeleteResult = { ok: boolean; error?: string };

/**
 * Permanently wipes every row this user owns across the app, then signs them
 * out. The auth identity itself can only be removed with a service-role key
 * (not configured here), so we delete all associated data and end the session.
 */
export async function deleteAccountData(): Promise<DeleteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in' };

  for (const table of USER_TABLES) {
    // Each table in USER_TABLES has a `user_id` column, but iterating a union of
    // table names collapses `.eq()` to only the shared `id` column. Cast the name
    // to a known user-owned table for typing only — the runtime value is the real
    // table name, so the correct table is still targeted.
    const { error } = await supabase
      .from(table as 'food_logs')
      .delete()
      .eq('user_id', user.id);
    if (error) {
      return { ok: false, error: `Failed while clearing ${table}. Please try again.` };
    }
  }

  await supabase.auth.signOut();
  redirect('/');
}
