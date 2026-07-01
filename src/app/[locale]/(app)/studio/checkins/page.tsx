import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { CheckinsListClient } from './CheckinsListClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Check-ins — Studio' };

export default async function StudioCheckinsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) redirect('/studio');

  const { data: checkins } = await supabase
    .from('automated_checkins')
    .select('id, title, frequency, send_day_of_week, program_id, is_active, questions, created_at')
    .eq('creator_id', profile.id)
    .order('created_at', { ascending: false });

  // Response counts per check-in
  const checkinIds = (checkins ?? []).map(c => c.id);
  const countMap: Record<string, number> = {};

  if (checkinIds.length > 0) {
    const { data: respRows } = await supabase
      .from('checkin_responses')
      .select('checkin_id')
      .in('checkin_id', checkinIds);

    for (const row of respRows ?? []) {
      countMap[row.checkin_id] = (countMap[row.checkin_id] ?? 0) + 1;
    }
  }

  // Program name map
  const programIds = [...new Set((checkins ?? []).filter(c => c.program_id).map(c => c.program_id as string))];
  const programMap: Record<string, string> = {};
  if (programIds.length > 0) {
    const { data: programs } = await supabase
      .from('programs')
      .select('id, title')
      .in('id', programIds);
    for (const p of programs ?? []) programMap[p.id] = p.title;
  }

  const enriched = (checkins ?? []).map(c => ({
    ...c,
    responseCount: countMap[c.id] ?? 0,
    programTitle: c.program_id ? (programMap[c.program_id] ?? null) : null,
    questionCount: Array.isArray(c.questions) ? c.questions.length : 0,
  }));

  return (
    <div style={{ padding: '32px 28px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28,
      }}>
        <div>
          <h1 style={{
            fontSize: 20, fontWeight: 800, color: 'var(--color-text)',
            margin: '0 0 4px', letterSpacing: '-0.03em',
          }}>
            Check-ins
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
            {enriched.length} template{enriched.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/studio/checkins/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '9px 18px', borderRadius: 10, textDecoration: 'none',
          background: 'rgba(96,165,250,0.12)', color: '#60a5fa',
          fontSize: 13, fontWeight: 700,
        }}>
          <Plus size={14} />
          New Check-in
        </Link>
      </div>

      <CheckinsListClient checkins={enriched} />
    </div>
  );
}
