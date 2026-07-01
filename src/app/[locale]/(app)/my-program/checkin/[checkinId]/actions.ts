'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createNotification } from '@/lib/notifications';

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

  // Notify the creator
  const [memberProfile, checkin] = await Promise.all([
    supabase.from('profiles').select('username, name').eq('user_id', user.id).maybeSingle(),
    supabase.from('automated_checkins').select('creator_id, title').eq('id', checkinId).maybeSingle(),
  ]);

  if (checkin.data?.creator_id) {
    const creatorProfile = await supabase
      .from('creator_profiles')
      .select('user_id')
      .eq('id', checkin.data.creator_id)
      .maybeSingle();

    if (creatorProfile.data?.user_id) {
      const memberName = memberProfile.data?.username ?? memberProfile.data?.name ?? 'A member';
      await createNotification({
        userId: creatorProfile.data.user_id,
        type: 'checkin_submitted',
        title: 'Check-in submitted',
        body: `${memberName} completed "${checkin.data.title}".`,
        href: '/studio/checkins',
      });
    }
  }

  revalidatePath('/my-program');
  return { ok: true };
}
