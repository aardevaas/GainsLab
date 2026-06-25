import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProgramViewClient } from './ProgramViewClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Program' };

export default async function MyProgramPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: roster } = await supabase
    .from('client_roster')
    .select('id, program_id, start_date, creator_id, status')
    .eq('member_user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!roster) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh',
        gap: 20, padding: '40px 24px', textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'rgba(74,222,128,0.08)',
          border: '1px solid rgba(74,222,128,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BookOpen size={24} style={{ color: 'var(--color-accent)' }} />
        </div>
        <div>
          <h1 style={{
            fontSize: 22, fontWeight: 800, color: 'var(--color-text)',
            margin: '0 0 8px', letterSpacing: '-0.02em',
          }}>
            No active program yet
          </h1>
          <p style={{
            fontSize: 13, color: 'var(--color-text-muted)', margin: 0,
            maxWidth: 340, lineHeight: 1.7,
          }}>
            Your trainer will assign a program here once they&apos;ve set you up as a client.
            Check back soon or browse a creator to get started.
          </p>
        </div>
        <Link href="/community" style={{
          padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
          background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
          textDecoration: 'none',
        }}>
          Browse Community
        </Link>
      </div>
    );
  }

  const programId = roster.program_id as string;
  const creatorId = roster.creator_id as string;

  const [programRes, creatorRes, weeksRes] = await Promise.all([
    supabase
      .from('programs')
      .select('id, title, type, goal, duration_weeks')
      .eq('id', programId)
      .single(),
    supabase
      .from('creator_profiles')
      .select('display_name, slug')
      .eq('id', creatorId)
      .single(),
    supabase
      .from('program_weeks')
      .select('id, week_number, title')
      .eq('program_id', programId)
      .order('week_number'),
  ]);

  if (!programRes.data) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', gap: 12,
        padding: '40px 24px', textAlign: 'center',
        color: 'var(--color-text-muted)', fontSize: 14,
      }}>
        <p>Program not found. Your trainer may have removed it.</p>
      </div>
    );
  }

  const weekIds = weeksRes.data?.map(w => w.id) ?? [];
  const { data: days } = weekIds.length > 0
    ? await supabase
        .from('program_days')
        .select('id, week_id, day_number, title, rest_day')
        .in('week_id', weekIds)
        .order('day_number')
    : { data: [] };

  const tree = (weeksRes.data ?? []).map(w => ({
    ...w,
    days: (days ?? []).filter(d => d.week_id === w.id),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ProgramViewClient
        roster={{ id: roster.id, startDate: roster.start_date }}
        program={programRes.data}
        creator={creatorRes.data ?? null}
        weeks={tree}
      />
    </div>
  );
}
