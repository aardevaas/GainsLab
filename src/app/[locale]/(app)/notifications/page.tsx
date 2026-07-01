import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NotificationsClient } from './NotificationsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Notifications' };

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('notifications')
    .select('id, type, title, body, href, read_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(60);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 24px 80px' }}>
      <NotificationsClient initialNotifications={data ?? []} />
    </div>
  );
}
