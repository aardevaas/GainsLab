import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Scale, Dumbbell, ClipboardList, Image as ImageIcon,
  TrendingUp, TrendingDown, Minus, Calendar, Moon, CheckCircle2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ClientManagerClient } from './ClientManagerClient';
import type { Metadata } from 'next';

type Question = { id: string; question: string; type: string };

export const metadata: Metadata = { title: 'Client Progress' };

const STATUS_COLOR: Record<string, string> = {
  active:    '#4ade80',
  paused:    '#fbbf24',
  completed: '#60a5fa',
  cancelled: '#f87171',
};

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtShort(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default async function ClientDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rosterId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!creator) redirect('/apply');

  const { data: roster } = await supabase
    .from('client_roster')
    .select('id, member_user_id, status, current_week, start_date, program_id, notes')
    .eq('id', rosterId)
    .eq('creator_id', creator.id)
    .maybeSingle();
  if (!roster) notFound();

  const memberId = roster.member_user_id;
  const cutoff90 = new Date(Date.now() - 90 * 86_400_000).toISOString().slice(0, 10);

  const cutoff14 = new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10);

  const [profileRes, programRes, metricsRes, workoutsRes, checkinRes, photosRes, creatorProgramsRes, sleepRes] = await Promise.all([
    supabase.from('profiles').select('username, name').eq('user_id', memberId).maybeSingle(),
    roster.program_id
      ? supabase.from('programs').select('title, type, duration_weeks').eq('id', roster.program_id).single()
      : Promise.resolve({ data: null }),
    supabase
      .from('body_measurements')
      .select('date, weight_kg, body_fat_pct')
      .eq('user_id', memberId)
      .gte('date', cutoff90)
      .order('date', { ascending: true })
      .limit(30),
    supabase
      .from('workout_sessions')
      .select('id, date, duration_minutes, calories_burned, completed, notes')
      .eq('user_id', memberId)
      .order('date', { ascending: false })
      .limit(8),
    supabase
      .from('automated_checkins')
      .select('id, title, questions')
      .eq('creator_id', creator.id)
      .eq('is_active', true),
    supabase
      .from('progress_photos')
      .select('id, url, date, notes')
      .eq('user_id', memberId)
      .eq('is_public', true)
      .order('date', { ascending: false })
      .limit(6),
    supabase
      .from('programs')
      .select('id, title, type, duration_weeks')
      .eq('creator_id', creator.id)
      .eq('is_published', true)
      .order('title'),
    supabase
      .from('sleep_logs')
      .select('date, hours, quality_rating')
      .eq('user_id', memberId)
      .gte('date', cutoff14)
      .order('date', { ascending: false })
      .limit(14),
  ]);

  const profile  = profileRes.data;
  const displayName = profile?.username ?? profile?.name ?? memberId.slice(0, 8);
  const program  = programRes.data;
  const metrics  = metricsRes.data ?? [];
  const workouts = workoutsRes.data ?? [];
  const checkins = checkinRes.data ?? [];
  const photos   = photosRes.data ?? [];
  const creatorPrograms = creatorProgramsRes.data ?? [];
  const sleepLogs = sleepRes.data ?? [];

  // Sleep stats — last 7 nights
  const last7Sleep = sleepLogs.slice(0, 7);
  const avgHours = last7Sleep.length > 0
    ? +(last7Sleep.reduce((s, l) => s + l.hours, 0) / last7Sleep.length).toFixed(1)
    : null;
  const avgQuality = last7Sleep.length > 0
    ? +(last7Sleep.reduce((s, l) => s + (l.quality_rating ?? 0), 0) / last7Sleep.length).toFixed(1)
    : null;

  // Program day completion
  let completedDays = 0;
  let totalProgramDays = 0;
  if (roster.program_id) {
    const { data: progWeeks } = await supabase
      .from('program_weeks').select('id').eq('program_id', roster.program_id);
    const weekIds = (progWeeks ?? []).map(w => w.id);
    if (weekIds.length > 0) {
      const { data: progDays } = await supabase
        .from('program_days').select('id').in('week_id', weekIds);
      const dayIds = (progDays ?? []).map(d => d.id);
      totalProgramDays = dayIds.length;
      if (dayIds.length > 0) {
        const { data: doneRes } = await supabase
          .from('program_day_completions')
          .select('id')
          .eq('user_id', memberId)
          .in('day_id', dayIds);
        completedDays = doneRes?.length ?? 0;
      }
    }
  }

  // Load responses for this creator's check-ins
  const checkinIds = checkins.map(c => c.id);
  const responses = checkinIds.length > 0
    ? (await supabase
        .from('checkin_responses')
        .select('id, checkin_id, responses, submitted_at')
        .eq('member_user_id', memberId)
        .in('checkin_id', checkinIds)
        .order('submitted_at', { ascending: false })
        .limit(30)).data ?? []
    : [];

  // Group: latest 3 responses per check-in
  const responsesByCheckin = new Map<string, typeof responses>();
  for (const r of responses) {
    const arr = responsesByCheckin.get(r.checkin_id) ?? [];
    if (arr.length < 3) arr.push(r);
    responsesByCheckin.set(r.checkin_id, arr);
  }

  const notesForManager = (roster.notes === '__join_request__' ? null : roster.notes) ?? null;

  // Weight chart data
  const withWeight = metrics.filter(m => m.weight_kg != null);
  const weights = withWeight.map(m => m.weight_kg as number);
  const minW = weights.length > 0 ? Math.min(...weights) : 0;
  const maxW = weights.length > 0 ? Math.max(...weights) : 0;
  const wRange = maxW - minW || 1;

  const latestM  = withWeight.length > 0 ? withWeight[withWeight.length - 1] : null;
  const earliestM = withWeight.length > 1 ? withWeight[0] : null;
  const weightChange = latestM?.weight_kg != null && earliestM?.weight_kg != null
    ? +(latestM.weight_kg - earliestM.weight_kg).toFixed(1)
    : null;

  const statusColor = STATUS_COLOR[roster.status] ?? 'var(--color-text-muted)';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div style={{ padding: '28px 28px 60px', maxWidth: 900 }}>

      {/* Back nav */}
      <Link href="/studio/clients" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)',
        textDecoration: 'none', marginBottom: 24,
      }}>
        <ArrowLeft size={13} /> Back to Clients
      </Link>

      {/* ── Client header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28,
        padding: '20px 24px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 16,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(96,165,250,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 800, color: '#60a5fa',
          letterSpacing: '-0.02em',
        }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            @{displayName}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 700, textTransform: 'capitalize',
              letterSpacing: '0.06em', color: statusColor,
              fontFamily: 'var(--font-mono)',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusColor }} />
              {roster.status}
            </span>
            {program && (
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                {program.title}
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {totalProgramDays > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.03em' }}>
                  {Math.round((completedDays / totalProgramDays) * 100)}%
                </p>
                {completedDays / totalProgramDays >= 0.8 && (
                  <CheckCircle2 size={16} style={{ color: '#4ade80' }} />
                )}
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                {completedDays}/{totalProgramDays} days done
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 2px', letterSpacing: '-0.03em' }}>
                Wk {roster.current_week}
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
                since {fmtShort(roster.start_date)}
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Quick stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Program',     value: program?.title ?? '—',                       sub: program ? `${program.duration_weeks} wk ${program.type}` : '' },
          { label: 'Completion',  value: totalProgramDays > 0 ? `${completedDays}/${totalProgramDays}` : '—', sub: totalProgramDays > 0 ? `${Math.round((completedDays / totalProgramDays) * 100)}% of days` : 'No program assigned' },
          { label: 'Client since', value: fmtShort(roster.start_date),                sub: '' },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{
            padding: '16px 18px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 12,
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', margin: '0 0 6px', fontFamily: 'var(--font-mono)' }}>
              {label}
            </p>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
              {value}
            </p>
            {sub && <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0, textTransform: 'capitalize' }}>{sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Body Metrics ── */}
      <Section icon={<Scale size={15} />} title="Body Metrics" subtitle="Last 90 days">
        {withWeight.length === 0 ? (
          <Empty text="No measurements logged yet." />
        ) : (
          <div>
            {/* Latest snapshot */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
              <MetricChip
                label="Current Weight"
                value={latestM?.weight_kg != null ? `${latestM.weight_kg} kg` : '—'}
                change={weightChange}
                period="vs. 90 days ago"
              />
              <MetricChip
                label="Body Fat %"
                value={latestM?.body_fat_pct != null ? `${latestM.body_fat_pct}%` : '—'}
              />
            </div>

            {/* Mini bar chart */}
            {withWeight.length > 1 && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', margin: '0 0 8px', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  Weight trend
                </p>
                <div style={{
                  display: 'flex', alignItems: 'flex-end', gap: 2,
                  height: 72, padding: '0 0 0 0',
                }}>
                  {withWeight.slice(-16).map((m, i) => {
                    const h = Math.max(8, ((m.weight_kg! - minW) / wRange) * 52 + 8);
                    const isLatest = i === Math.min(withWeight.slice(-16).length - 1, 15);
                    return (
                      <div key={i} title={`${fmtShort(m.date)}: ${m.weight_kg} kg`} style={{ flex: 1, position: 'relative' }}>
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          height: h,
                          background: isLatest
                            ? 'var(--color-accent)'
                            : 'rgba(74,222,128,0.22)',
                          borderRadius: '3px 3px 0 0',
                          transition: 'opacity 0.15s',
                        }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                    {fmtShort(withWeight[Math.max(0, withWeight.length - 16)].date)}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                    {fmtShort(withWeight[withWeight.length - 1].date)}
                  </span>
                </div>
              </div>
            )}

            {/* Table of last 8 entries */}
            <div style={{ marginTop: 16 }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 100px',
                padding: '6px 12px',
                background: 'var(--color-surface)',
                borderRadius: '8px 8px 0 0',
                borderBottom: '1px solid var(--color-border-subtle)',
              }}>
                {['Date', 'Weight', 'Body Fat'].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {h}
                  </span>
                ))}
              </div>
              <div style={{ border: '1px solid var(--color-border-subtle)', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                {withWeight.slice(-8).reverse().map((m, i, arr) => (
                  <div key={m.date} style={{
                    display: 'grid', gridTemplateColumns: '1fr 100px 100px',
                    padding: '9px 12px', alignItems: 'center',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                    background: i === 0 ? 'rgba(74,222,128,0.03)' : 'transparent',
                  }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{fmt(m.date)}</span>
                    <span style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 400, color: 'var(--color-text)' }}>
                      {m.weight_kg != null ? `${m.weight_kg} kg` : '—'}
                    </span>
                    <span style={{ fontSize: 12, color: m.body_fat_pct != null ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                      {m.body_fat_pct != null ? `${m.body_fat_pct}%` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ── Recent Workouts ── */}
      <Section icon={<Dumbbell size={15} />} title="Recent Workouts" subtitle="Last 8 sessions">
        {workouts.length === 0 ? (
          <Empty text="No workouts logged yet." />
        ) : (
          <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 10, overflow: 'hidden' }}>
            {workouts.map((w, i) => (
              <div key={w.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '11px 16px',
                borderBottom: i < workouts.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: w.completed ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Dumbbell size={12} style={{ color: w.completed ? '#4ade80' : '#f87171' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 2px' }}>
                    {fmt(w.date)}
                  </p>
                  {w.notes && (
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
                      {w.notes}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 16, flexShrink: 0, textAlign: 'right' }}>
                  {w.duration_minutes != null && (
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{w.duration_minutes} min</span>
                  )}
                  {w.calories_burned != null && (
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{w.calories_burned} kcal</span>
                  )}
                  <span style={{
                    fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)',
                    color: w.completed ? '#4ade80' : '#f87171',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    {w.completed ? 'Done' : 'Skip'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Sleep ── */}
      <Section icon={<Moon size={15} />} title="Sleep" subtitle="Last 14 nights">
        {sleepLogs.length === 0 ? (
          <Empty text="No sleep logs recorded yet." />
        ) : (
          <div>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Avg Duration', value: avgHours != null ? `${avgHours}h` : '—', color: avgHours != null && avgHours >= 7 ? '#4ade80' : avgHours != null && avgHours >= 6 ? '#fbbf24' : '#f87171' },
                { label: 'Avg Quality', value: avgQuality != null ? `${avgQuality}/5` : '—', color: '#60a5fa' },
                { label: 'Nights Logged', value: String(sleepLogs.length), color: 'var(--color-text)' },
              ].map(s => (
                <div key={s.label} style={{
                  flex: 1, padding: '12px 14px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 10,
                }}>
                  <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', margin: '0 0 4px', fontFamily: 'var(--font-mono)' }}>
                    {s.label}
                  </p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: s.color, margin: 0, letterSpacing: '-0.03em' }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
            {/* Bar chart — last 14 nights */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', margin: '0 0 8px', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Sleep duration — oldest → newest
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 52 }}>
                {[...sleepLogs].reverse().map((l, i) => {
                  const h = Math.max(6, Math.min(52, (l.hours / 10) * 52));
                  const color = l.hours >= 7 ? '#4ade80' : l.hours >= 6 ? '#fbbf24' : '#f87171';
                  return (
                    <div key={i} title={`${fmtShort(l.date)}: ${l.hours}h`} style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                      <div style={{ width: '100%', height: h, background: color, borderRadius: '2px 2px 0 0', opacity: 0.8 }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>{sleepLogs.length > 0 ? fmtShort(sleepLogs[sleepLogs.length - 1].date) : ''}</span>
                <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>{sleepLogs.length > 0 ? fmtShort(sleepLogs[0].date) : ''}</span>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ── Check-in History ── */}
      <Section icon={<ClipboardList size={15} />} title="Check-in History" subtitle="Latest 3 responses per check-in">
        {checkins.length === 0 ? (
          <Empty text="No active check-ins set up yet." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {checkins.map(c => {
              const questions = (c.questions as Question[]) ?? [];
              const resps = responsesByCheckin.get(c.id) ?? [];
              return (
                <div key={c.id} style={{
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 12, overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '10px 16px',
                    background: 'var(--color-surface)',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                      {c.title}
                    </p>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      {resps.length} response{resps.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {resps.length === 0 ? (
                    <div style={{ padding: '14px 16px' }}>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                        No responses yet.
                      </p>
                    </div>
                  ) : (
                    resps.map((r, ri) => {
                      const answers = r.responses as Record<string, string | number>;
                      return (
                        <div key={r.id} style={{
                          padding: '14px 16px',
                          borderBottom: ri < resps.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                        }}>
                          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', margin: '0 0 10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            <Calendar size={9} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                            {fmt(r.submitted_at)}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {questions.map(q => (
                              <div key={q.id}>
                                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '0 0 2px' }}>
                                  {q.question}
                                </p>
                                <p style={{ fontSize: 13, color: 'var(--color-text)', margin: 0, fontWeight: 500 }}>
                                  {answers[q.id] != null ? String(answers[q.id]) : '—'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* ── Progress Photos ── */}
      <Section icon={<ImageIcon size={15} />} title="Progress Photos" subtitle="Member's public photos only">
        {photos.length === 0 ? (
          <Empty text="No public progress photos yet." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {photos.map(ph => (
              <div key={ph.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '3/4', background: 'var(--color-surface-elevated)' }}>
                <img
                  src={ph.url}
                  alt={ph.notes ?? `Photo ${fmtShort(ph.date)}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '6px 10px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    {fmtShort(ph.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <ClientManagerClient
        clientId={roster.id}
        currentStatus={roster.status}
        currentProgramId={roster.program_id ?? null}
        currentNotes={notesForManager}
        programs={creatorPrograms}
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  icon, title, subtitle, children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(74,222,128,0.08)',
          border: '1px solid rgba(74,222,128,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-accent)',
        }}>
          {icon}
        </div>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.01em' }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function MetricChip({ label, value, change, period }: {
  label: string; value: string; change?: number | null; period?: string;
}) {
  const TrendIcon = change == null ? null : change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const trendColor = change == null ? undefined : change > 0 ? '#f87171' : change < 0 ? '#4ade80' : 'var(--color-text-muted)';

  return (
    <div style={{
      flex: 1, padding: '14px 16px',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: 10,
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', margin: '0 0 6px', fontFamily: 'var(--font-mono)' }}>
        {label}
      </p>
      <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px', letterSpacing: '-0.04em' }}>
        {value}
      </p>
      {TrendIcon && change != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <TrendIcon size={12} style={{ color: trendColor }} />
          <span style={{ fontSize: 11, color: trendColor, fontWeight: 600 }}>
            {change > 0 ? '+' : ''}{change} kg
          </span>
          {period && <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{period}</span>}
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div style={{
      padding: '28px 20px', textAlign: 'center',
      border: '1px dashed var(--color-border)',
      borderRadius: 10,
    }}>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>{text}</p>
    </div>
  );
}
