import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function requirePro(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, expires_at')
    .eq('user_id', user.id)
    .single();

  const isActive =
    sub?.status === 'active' &&
    !!sub.expires_at &&
    new Date(sub.expires_at) > new Date();

  if (!isActive) redirect('/subscribe');
}

export async function getIsProForUser(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, expires_at')
    .eq('user_id', userId)
    .single();

  return (
    sub?.status === 'active' &&
    !!sub.expires_at &&
    new Date(sub.expires_at) > new Date()
  );
}
