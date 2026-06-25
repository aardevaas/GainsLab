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
      .select('id, member_user_id, status, current_week, start_date, program_id, notes')
      .eq('creator_id', creator.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('programs')
      .select('id, title, type')
      .eq('creator_id', creator.id)
      .order('created_at', { ascending: false }),
  ]);

  const roster = rosterRes.data ?? [];

  const memberIds = [...new Set(roster.map(r => r.member_user_id))];
  const profileMap: Record<string, string> = {};
  if (memberIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username, name')
      .in('user_id', memberIds);
    for (const p of profiles ?? []) {
      profileMap[p.user_id] = p.username ?? p.name ?? p.user_id.slice(0, 8);
    }
  }

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <ClientsClient
        clients={roster}
        programs={programsRes.data ?? []}
        profileMap={profileMap}
      />
    </div>
  );
}
