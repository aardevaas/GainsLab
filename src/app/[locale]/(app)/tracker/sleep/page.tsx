import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SleepLogClient } from './SleepLogClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sleep Log' };

export default async function SleepLogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('sleep_logs')
    .select('id, date, hours, quality_rating, notes, created_at')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(60);

  const todayStr = new Date().toISOString().slice(0, 10);

  return <SleepLogClient logs={data ?? []} todayStr={todayStr} />;
}
