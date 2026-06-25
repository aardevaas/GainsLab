'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function submitCheckinResponse(
  checkinId: string,
  answers: Record<string, string | number>
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('checkin_responses')
    .insert({
      checkin_id: checkinId,
      member_user_id: user.id,
      responses: answers,
    });

  if (error) return { error: error.message };

  revalidatePath('/my-program');
  return { ok: true };
}
