import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  Plus, Users, Dumbbell, Star, TrendingUp, ArrowRight, Activity,
  UserCheck, UserX, ClipboardList,
} from 'lucide-react';
import { approveJoinRequest, declineJoinRequest } from './clients/actions';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

const STAT_CARD = {
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 14, padding: '20px 22px',
  background: 'var(--color-surface)',
};

function StatCard({ label, value, sub, color = '#60a5fa', icon }: {
  label: string; value: string | number; sub?: string; color?: string; icon: React.ReactNode;
}) {
  return (
    <div style={STAT_CARD}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', margin: 0 }}>
          {label}
        </p>
        <div style={{ color, opacity: 0.7 }}>{icon}</div>
      </div>
      <p style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.04em', margin: '0 0 4px', lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>{sub}</p>}
    </div>
  );
}

export default async function StudioDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: creator } = await supabase
    .from('creator_profiles')
    .select('id, display_name, slug, total_clients, total_transformations, avg_client_rating, specialty')
    .eq('user_id', user.id).maybeSingle();
  if (!creator) redirect('/apply');

  const [programsRes, rosterRes, communityRes, checkinsRes] = await Promise.all([
    supabase.from('programs').select('id, title, type, is_published, enrollment_count, created_at').eq('creator_id', creator.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('client_roster').select('id, member_user_id, status, current_week, start_date, program_id, notes').eq('creator_id', creator.id).order('created_at', { ascending: false }),
    supabase.from('creator_communities').select('member_count, post_count').eq('creator_id', creator.id).maybeSingle(),
    supabase.from('automated_checkins').select('id, title').eq('creator_id', creator.id).eq('is_active', true),
  ]);

  const programs = programsRes.data ?? [];
  const allRoster = rosterRes.data ?? [];
  const community = communityRes.data;
  const checkins = checkinsRes.data ?? [];

  // Split roster
  const joinRequests = allRoster.filter(r => r.notes === '__join_request__' && r.status === 'paused');
  const roster = allRoster.filter(r => !(r.notes === '__join_request__' && r.status === 'paused'));
  const activeClients = roster.filter(r => r.status === 'active').length;
  const publishedPrograms = programs.filter(p => p.is_published).length;

  // Resolve member names for all roster entries
  const memberIds = [...new Set(allRoster.map(r => r.member_user_id))];
  const profileMap: Record<string, string> = {};
  if (memberIds.length > 0) {
    const { data: memberProfiles } = await supabase
      .from('profiles')
      .select('user_id, username, name')
      .in('user_id', memberIds);
    for (const p of memberProfiles ?? []) {
      profileMap[p.user_id] = p.username ?? p.name ?? p.user_id.slice(0, 8);
    }
  }

  // Recent check-in responses (last 5, across all check-ins)
  const checkinIds = checkins.map(c => c.id);
  let recentResponses: { id: string; checkinId: string; checkinTitle: string; memberUserId: string; submittedAt: string }[] = [];
  if (checkinIds.length > 0) {
    const checkinTitleMap: Record<string, string> = {};
    for (const c of checkins) checkinTitleMap[c.id] = c.title;

    const { data: respRows } = await supabase
      .from('checkin_responses')
      .select('id, checkin_id, member_user_id, submitted_at')
      .in('checkin_id', checkinIds)
      .order('submitted_at', { ascending: false })
      .limit(5);

    recentResponses = (respRows ?? []).map(r => ({
      id: r.id,
      checkinId: r.checkin_id,
      checkinTitle: checkinTitleMap[r.checkin_id] ?? 'Check-in',
      memberUserId: r.member_user_id,
      submittedAt: r.submitted_at,
    }));

    // Ensure response member names are in the map
    const respMemberIds = recentResponses.map(r => r.memberUserId).filter(id => !profileMap[id]);
    if (respMemberIds.length > 0) {
      const { data: extraProfiles } = await supabase
        .from('profiles')
        .select('user_id, username, name')
        .in('user_id', respMemberIds);
      for (const p of extraProfiles ?? []) {
        profileMap[p.user_id] = p.username ?? p.name ?? p.user_id.slice(0, 8);
      }
    }
  }

  const hasPending = joinRequests.length > 0 || recentResponses.length > 0;

  const typeColor = (t: string) =>
    t === 'challenge' ? '#fbbf24' : t === 'one_on_one' ? '#60a5fa' : '#4ade80';

  const typeLabel = (t: string) =>
    t === 'one_on_one' ? '1-on-1' : t === 'challenge' ? 'Challenge' : 'Program';

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', margin: '0 0 2px' }}>
            Welcome back, {creator.display_name.split(' ')[0]}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
            Here's what's happening with your coaching business
          </p>
        </div>
        <Link href="/studio/programs/new" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
          background: '#60a5fa', color: '#0a0c0f', textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(96,165,250,0.25)',
        }}>
          <Plus size={14} />
          New Program
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard label="Active Clients" value={activeClients} sub={`${roster.length} total on roster`} icon={<Users size={16} />} />
        <StatCard label="Programs" value={publishedPrograms} sub={`${programs.length} total created`} color="#4ade80" icon={<Dumbbell size={16} />} />
        <StatCard label="Community" value={community?.member_count ?? 0} sub={`${community?.post_count ?? 0} posts`} color="#fbbf24" icon={<Activity size={16} />} />
        <StatCard label="Avg Rating" value={creator.avg_client_rating ? creator.avg_client_rating.toFixed(1) : '–'} sub="from client reviews" color="#f472b6" icon={<Star size={16} />} />
      </div>

      {/* ── NEEDS ATTENTION ── */}
      {hasPending && (
        <div style={{ marginBottom: 24, border: '1px solid var(--color-border-subtle)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Needs Attention</p>
            {joinRequests.length > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 5,
                background: 'rgba(251,191,36,0.12)', color: '#fbbf24',
                fontFamily: 'var(--font-mono)',
              }}>
                {joinRequests.length} join request{joinRequests.length !== 1 ? 's' : ''}
              </span>
            )}
            {recentResponses.length > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 5,
                background: 'rgba(96,165,250,0.1)', color: '#60a5fa',
                fontFamily: 'var(--font-mono)',
              }}>
                {recentResponses.length} new check-in{recentResponses.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Join requests */}
          {joinRequests.map((r, i) => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
              borderBottom: (i < joinRequests.length - 1 || recentResponses.length > 0) ? '1px solid var(--color-border-subtle)' : 'none',
              background: 'rgba(251,191,36,0.02)',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fbbf24',
              }}>
                {(profileMap[r.member_user_id] ?? '??').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 1px' }}>
                  @{profileMap[r.member_user_id] ?? r.member_user_id.slice(0, 8)}
                </p>
                <p style={{ fontSize: 11, color: '#fbbf24', margin: 0 }}>Requested to join</p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <form action={approveJoinRequest.bind(null, r.id)}>
                  <button type="submit" style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700,
                    background: 'rgba(74,222,128,0.12)', color: '#4ade80',
                    border: '1px solid rgba(74,222,128,0.3)', cursor: 'pointer',
                  }}>
                    <UserCheck size={11} /> Approve
                  </button>
                </form>
                <form action={declineJoinRequest.bind(null, r.id)}>
                  <button type="submit" style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700,
                    background: 'rgba(248,113,113,0.08)', color: '#f87171',
                    border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer',
                  }}>
                    <UserX size={11} /> Decline
                  </button>
                </form>
              </div>
            </div>
          ))}

          {/* Recent check-in responses */}
          {recentResponses.map((r, i) => (
            <Link key={r.id} href={`/studio/checkins/${r.checkinId}`} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
                borderBottom: i < recentResponses.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                background: 'rgba(96,165,250,0.02)',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(96,165,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#60a5fa',
                }}>
                  {(profileMap[r.memberUserId] ?? '??').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 1px' }}>
                    @{profileMap[r.memberUserId] ?? r.memberUserId.slice(0, 8)}
                  </p>
                  <p style={{ fontSize: 11, color: '#60a5fa', margin: 0 }}>
                    Submitted: {r.checkinTitle} · {new Date(r.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <ClipboardList size={12} style={{ color: '#60a5fa' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa' }}>Review</span>
                  <ArrowRight size={11} style={{ color: '#60a5fa' }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Two-column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'start' }}>

        {/* Programs */}
        <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Your Programs</p>
            <Link href="/studio/programs" style={{ fontSize: 11, color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {programs.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 14px' }}>No programs yet.</p>
              <Link href="/studio/programs/new" style={{
                fontSize: 12, fontWeight: 700, color: '#60a5fa',
                border: '1px solid rgba(96,165,250,0.3)', padding: '7px 14px', borderRadius: 8,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <Plus size={12} /> Create your first program
              </Link>
            </div>
          ) : (
            <div>
              {programs.map((p, i) => (
                <Link key={p.id} href={`/studio/programs/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px',
                    borderBottom: i < programs.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: `${typeColor(p.type)}14`,
                      border: `1px solid ${typeColor(p.type)}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Dumbbell size={14} style={{ color: typeColor(p.type) }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span style={{ fontSize: 10, color: typeColor(p.type), fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
                          {typeLabel(p.type)}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>·</span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{p.enrollment_count} enrolled</span>
                      </div>
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 5,
                      background: p.is_published ? 'rgba(74,222,128,0.1)' : 'var(--color-surface-elevated)',
                      color: p.is_published ? '#4ade80' : 'var(--color-text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)',
                    }}>
                      {p.is_published ? 'Live' : 'Draft'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Clients */}
        <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Recent Clients</p>
            <Link href="/studio/clients" style={{ fontSize: 11, color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              Manage <ArrowRight size={11} />
            </Link>
          </div>
          {roster.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 14px' }}>No clients yet.</p>
              <Link href="/studio/clients" style={{
                fontSize: 12, fontWeight: 700, color: '#60a5fa',
                border: '1px solid rgba(96,165,250,0.3)', padding: '7px 14px', borderRadius: 8,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <Plus size={12} /> Add your first client
              </Link>
            </div>
          ) : (
            <div>
              {roster.slice(0, 6).map((r, i) => {
                const name = profileMap[r.member_user_id] ?? r.member_user_id.slice(0, 8);
                return (
                  <div key={r.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                    borderBottom: i < Math.min(roster.length, 6) - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(96,165,250,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#60a5fa',
                    }}>
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                        @{name} · Week {r.current_week}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
                        Since {new Date(r.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 5, textTransform: 'uppercase',
                      letterSpacing: '0.06em', fontFamily: 'var(--font-mono)',
                      background: r.status === 'active' ? 'rgba(74,222,128,0.1)' : 'var(--color-surface-elevated)',
                      color: r.status === 'active' ? '#4ade80' : 'var(--color-text-muted)',
                    }}>
                      {r.status}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 18 }}>
        {[
          { label: 'Build a New Program', sub: 'Design week-by-week training', href: '/studio/programs/new', color: '#60a5fa' },
          { label: 'Add a Client', sub: 'Expand your roster', href: '/studio/clients', color: '#4ade80' },
          { label: 'View Public Profile', sub: 'See how members find you', href: `/creator/${creator.slug}`, color: '#fbbf24' },
        ].map(({ label, sub, href, color }) => (
          <Link key={label} href={href} style={{
            display: 'block', padding: '16px 18px',
            background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)',
            borderRadius: 12, textDecoration: 'none', transition: 'border-color 200ms ease',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 3px' }}>{label}</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>{sub}</p>
            <div style={{ width: 20, height: 2, borderRadius: 1, background: color, marginTop: 10 }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
