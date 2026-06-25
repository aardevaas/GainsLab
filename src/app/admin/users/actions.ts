'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function setAdminFlag(
  targetUserId: string,
  isAdmin: boolean,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: caller } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();
  if (!caller?.is_admin) return { error: 'Forbidden' };

  // Prevent self-demotion — admin can always be demoted by another admin
  const { error } = await supabase
    .from('profiles')
    .update({ is_admin: isAdmin })
    .eq('user_id', targetUserId);

  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return {};
}
