'use server';

import { createClient } from '@/lib/supabase/server';

type CreateNotificationParams = {
  userId: string;
  type: string;
  title: string;
  body?: string;
  href?: string;
};

export async function createNotification(params: CreateNotificationParams) {
  const supabase = await createClient();
  await supabase.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    href: params.href ?? null,
  });
}
