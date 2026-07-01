'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type ProgramState = { error?: string };

export async function createProgram(
  _prev: ProgramState,
  formData: FormData,
): Promise<ProgramState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: creator } = await supabase
    .from('creator_profiles').select('id').eq('user_id', user.id).maybeSingle();
  if (!creator) redirect('/apply');

  const title = String(formData.get('title') ?? '').trim();
  if (!title) return { error: 'Program title is required.' };

  const type = String(formData.get('type') ?? 'standard') as 'standard' | 'one_on_one' | 'challenge';
  const goal = (String(formData.get('goal') ?? '') || null) as 'fat_loss' | 'muscle_gain' | 'maintenance' | 'performance' | 'general' | null;
  const duration_weeks = Math.max(1, Math.min(52, Number(formData.get('duration_weeks') ?? 4)));
  const training_days = Math.max(1, Math.min(7, Number(formData.get('training_days') ?? 5)));
  const isFree = formData.get('is_free') === '1';
  const price_bob = isFree ? 0 : Math.max(0, Number(formData.get('price_bob') ?? 0));
  const description = String(formData.get('description') ?? '').trim() || null;
  const cover_image_url = String(formData.get('cover_image_url') ?? '').trim() || null;

  const { data: program, error: progErr } = await supabase
    .from('programs')
    .insert({ creator_id: creator.id, title, description, type, goal, duration_weeks, price_bob, is_free: isFree, cover_image_url })
    .select('id')
    .single();

  if (progErr || !program) return { error: progErr?.message ?? 'Could not create program.' };

  const weeks = Array.from({ length: duration_weeks }, (_, i) => ({
    program_id: program.id,
    week_number: i + 1,
    title: `Week ${i + 1}`,
    description: null,
  }));

  const { data: weekRows, error: weekErr } = await supabase
    .from('program_weeks').insert(weeks).select('id, week_number');

  if (weekErr || !weekRows) return { error: 'Program created but week structure failed.' };

  const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const days = weekRows.flatMap(w =>
    Array.from({ length: 7 }, (_, d) => ({
      week_id: w.id,
      day_number: d + 1,
      title: DAY_LABELS[d],
      rest_day: d >= training_days,
    })),
  );

  await supabase.from('program_days').insert(days);

  redirect('/studio/programs');
}
