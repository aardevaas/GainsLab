import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ClientsClient } from './ClientsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Clients' };

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: creator } = await supabase
    .from('creator_profiles').select('id').eq('user_id', user.id).maybeSingle();
  if (!creator) redirect('/apply');

  const [rosterRes, programsRes] = await Promise.all([
    supabase
      .from('client_roster')
      .select('id, member_user_id, status, current_week, start_date, program_id')
      .eq('creator_id', creator.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('programs')
      .select('id, title, type')
      .eq('creator_id', creator.id)
      .order('created_at', { ascending: false }),
  ]);

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <ClientsClient
        clients={rosterRes.data ?? []}
        programs={programsRes.data ?? []}
      />
    </div>
  );
}
