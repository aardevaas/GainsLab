import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProgramViewClient } from './ProgramViewClient';
import type { Metadata } from 'next';

function isCheckinDue(frequency: string, lastAt: string | null): boolean {
  if (!lastAt) return true;
  const diffDays = Math.floor((Date.now() - new Date(lastAt).getTime()) / 86_400_000);
  switch (frequency) {
    case 'daily':    return diffDays >= 1;
    case 'weekly':   return diffDays >= 7;
    case 'biweekly': return diffDays >= 14;
    case 'monthly':  return diffDays >= 30;
    default:         return false;
  }
}

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

  // Resolve any due check-ins for this member
  const { data: activeCheckins } = await supabase
    .from('automated_checkins')
    .select('id, title, frequency')
    .eq('creator_id', creatorId)
    .eq('is_active', true);

  const dueCheckins: { id: string; title: string }[] = [];
  for (const c of activeCheckins ?? []) {
    const { data: last } = await supabase
      .from('checkin_responses')
      .select('submitted_at')
      .eq('checkin_id', c.id)
      .eq('member_user_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (isCheckinDue(c.frequency, last?.submitted_at ?? null)) {
      dueCheckins.push({ id: c.id, title: c.title });
    }
  }

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
      {/* Pending check-in banner */}
      {dueCheckins.length > 0 && (
        <div style={{ padding: '12px 20px', background: 'rgba(96,165,250,0.06)', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>
          {dueCheckins.map(c => (
            <Link key={c.id} href={`/my-program/checkin/${c.id}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '8px 14px', borderRadius: 10, textDecoration: 'none',
              background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)',
            }}>
              <Bell size={13} style={{ color: '#60a5fa' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa' }}>
                Check-in due: {c.title}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.06em', padding: '1px 6px', borderRadius: 4,
                background: 'rgba(96,165,250,0.15)', color: '#60a5fa',
                fontFamily: 'var(--font-mono)',
              }}>
                Fill out →
              </span>
            </Link>
          ))}
        </div>
      )}

      <ProgramViewClient
        roster={{ id: roster.id, startDate: roster.start_date }}
        program={programRes.data}
        creator={creatorRes.data ?? null}
        weeks={tree}
      />
    </div>
  );
}
