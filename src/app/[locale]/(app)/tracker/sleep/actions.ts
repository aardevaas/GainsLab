'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type SleepState = { error?: string; success?: boolean };

export async function logSleep(
  _prev: SleepState,
  formData: FormData,
): Promise<SleepState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const date = String(formData.get('date') ?? '').trim();
  const hoursRaw = parseFloat(String(formData.get('hours') ?? ''));
  const quality = parseInt(String(formData.get('quality') ?? ''), 10);
  const notes = String(formData.get('notes') ?? '').trim() || null;

  if (!date) return { error: 'Date is required.' };
  if (isNaN(hoursRaw) || hoursRaw < 0.5 || hoursRaw > 24) return { error: 'Enter hours between 0.5 and 24.' };
  if (isNaN(quality) || quality < 1 || quality > 5) return { error: 'Select a quality rating.' };

  const hours = Math.round(hoursRaw * 2) / 2; // round to nearest 0.5

  const { error } = await supabase.from('sleep_logs').upsert(
    { user_id: user.id, date, hours, quality_rating: quality, notes },
    { onConflict: 'user_id,date' }
  );

  if (error) return { error: 'Failed to save. Try again.' };

  revalidatePath('/tracker/sleep');
  return { success: true };
}

export async function deleteSleepLog(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('sleep_logs').delete().eq('id', id).eq('user_id', user.id);
  revalidatePath('/tracker/sleep');
}
