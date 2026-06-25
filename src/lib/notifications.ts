'use server';

import { createAdminClient } from '@/lib/supabase/admin';

type CreateNotificationParams = {
  userId: string;
  type: string;
  title: string;
  body?: string;
  href?: string;
};

export async function createNotification(params: CreateNotificationParams) {
  const supabase = createAdminClient();
  await supabase.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    href: params.href ?? null,
  });
}
