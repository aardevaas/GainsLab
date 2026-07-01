'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type QuestionType = 'text' | 'number' | 'scale_1_10';

export type CheckinQuestion = {
  id: string;
  question: string;
  type: QuestionType;
};

export async function createCheckin(data: {
  title: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  sendDayOfWeek: number | null;
  programId: string | null;
  questions: CheckinQuestion[];
}) {
  const supabase = await createClient();
  const creatorId = await getCreatorId(supabase);
  if (!creatorId) return { error: 'Creator profile not found' };

  const { error } = await supabase.from('automated_checkins').insert({
    creator_id: creatorId,
    program_id: data.programId ?? null,
    title: data.title.trim(),
    frequency: data.frequency,
    send_day_of_week: data.sendDayOfWeek,
    questions: data.questions,
  });

  if (error) return { error: error.message };

  revalidatePath('/studio/checkins');
  return { ok: true };
}

async function getCreatorId(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('creator_profiles').select('id').eq('user_id', user.id).maybeSingle();
  return profile?.id ?? null;
}

export async function toggleCheckinActive(checkinId: string, currentValue: boolean) {
  const supabase = await createClient();
  const creatorId = await getCreatorId(supabase);
  if (!creatorId) return { error: 'Not authorized' };

  const { error } = await supabase
    .from('automated_checkins')
    .update({ is_active: !currentValue })
    .eq('id', checkinId)
    .eq('creator_id', creatorId);

  if (error) return { error: error.message };

  revalidatePath('/studio/checkins');
  return { ok: true };
}

export async function deleteCheckin(checkinId: string) {
  const supabase = await createClient();
  const creatorId = await getCreatorId(supabase);
  if (!creatorId) return { error: 'Not authorized' };

  const { error } = await supabase
    .from('automated_checkins')
    .delete()
    .eq('id', checkinId)
    .eq('creator_id', creatorId);

  if (error) return { error: error.message };

  revalidatePath('/studio/checkins');
  return { ok: true };
}
