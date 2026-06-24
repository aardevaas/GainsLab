import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  ArrowLeft, MapPin, Globe, ExternalLink,
  Star, Shield, Users, TrendingUp, Trophy, Clock,
  ChevronRight, Lock, Zap,
} from 'lucide-react';
import type { Metadata } from 'next';

const SPECIALTY_LABELS: Record<string, string> = {
  fat_loss: 'Fat Loss', muscle_gain: 'Muscle Gain', powerlifting: 'Powerlifting',
  bodybuilding: 'Bodybuilding', calisthenics: 'Calisthenics', nutrition: 'Nutrition',
  mindset: 'Mindset', rehabilitation: 'Rehab', cardio: 'Cardio', yoga: 'Yoga',
  crossfit: 'CrossFit', general_fitness: 'General Fitness', sports_performance: 'Sports',
};

function slugGradient(slug: string): string {
  const h = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return `linear-gradient(${120 + (h % 60)}deg, oklch(${12 + (h % 7)}% 0.03 ${180 + (h % 120)}) 0%, oklch(9% 0.01 ${220 + (h % 60)}) 100%)`;
}

function typeColor(t: string) {
  return t === 'challenge' ? '#fbbf24' : t === 'one_on_one' ? '#60a5fa' : '#4ade80';
}

function typeLabel(t: string) {
  return t === 'one_on_one' ? '1-ON-1' : t.toUpperCase();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('creator_profiles').select('display_name, bio').eq('slug', slug).single();
  if (!data) return { title: 'Creator Not Found' };
  return { title: data.display_name, description: data.bio ?? `${data.display_name} on GainsLab` };
}

export default async function CreatorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const [creatorRes, authRes] = await Promise.all([
    supabase.from('creator_profiles').select('*').eq('slug', slug).single(),
    supabase.auth.getUser(),
  ]);

  const creator = creatorRes.data;
  if (!creator) notFound();
  const user = authRes.data.user;

  const [programsRes, communityRes, memberRes] = await Promise.all([
    supabase.from('programs').select('*').eq('creator_id', creator.id).eq('is_published', true).order('created_at'),
    supabase.from('creator_communities').select('*').eq('creator_id', creator.id).maybeSingle(),
    user
      ? supabase.from('client_roster').select('id').eq('creator_id', creator.id).eq('member_user_id', user.id).eq('status', 'active').maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const programs = programsRes.data ?? [];
  const community = communityRes.data;
  const isMember = !!memberRes.data;

  const coverStyle = creator.cover_url
    ? { backgroundImage: `url(${creator.cover_url})`, backgroundSize: 'cover' as const, backgroundPosition: 'center' }
    : { background: slugGradient(slug) };

  const statItems = [
    { label: 'Clients', value: String(creator.total_clients), icon: <Users size={13} /> },
    { label: 'Transformed', value: String(creator.total_transformations), icon: <TrendingUp size={13} /> },
    { label: 'Rating', value: creator.avg_client_rating ? `${creator.avg_client_rating.toFixed(1)}★` : '—', icon: <Star size={13} /> },
    { label: 'Experience', value: creator.experience_years ? `${creator.experience_years}yr` : '—', icon: <Trophy size={13} /> },
  ];

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100dvh' }}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: 300, ...coverStyle, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 42px, rgba(255,255,255,0.018) 42px, rgba(255,255,255,0.018) 43px)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,12,15,0.15) 0%, rgba(10,12,15,0.5) 55%, rgba(10,12,15,1) 100%)',
        }} />
        <nav style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href={user ? '/dashboard' : '/'} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(10,12,15,0.55)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8,
            padding: '7px 13px', color: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500,
          }}>
            <ArrowLeft size={12} />
            GainsLab
          </Link>
          <span style={{
            background: 'rgba(10,12,15,0.55)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8,
            padding: '7px 13px', color: 'var(--color-text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)',
          }}>
            @{slug}
          </span>
        </nav>
      </section>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 24px 100px' }}>

        {/* ── IDENTITY CARD — overlaps hero ── */}
        <div style={{
          marginTop: -96, position: 'relative', zIndex: 10,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 18, padding: '28px 32px',
          boxShadow: '0 24px 60px -12px rgba(0,0,0,0.6)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {creator.avatar_url ? (
                <img src={creator.avatar_url} alt={creator.display_name}
                  style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--color-accent)', boxShadow: '0 0 24px rgba(74,222,128,0.3)' }}
                />
              ) : (
                <div style={{
                  width: 84, height: 84, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(74,222,128,0.15), var(--color-surface-elevated))',
                  border: '2.5px solid var(--color-accent)', boxShadow: '0 0 24px rgba(74,222,128,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 30, fontWeight: 700, color: 'var(--color-accent)',
                }}>
                  {creator.display_name[0].toUpperCase()}
                </div>
              )}
              {creator.is_verified && (
                <div style={{
                  position: 'absolute', bottom: 2, right: 2,
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--color-accent)', border: '2px solid var(--color-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Shield size={11} style={{ color: '#0a0c0f' }} />
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.035em', lineHeight: 1, margin: 0 }}>
                  {creator.display_name}
                </h1>
                {creator.is_featured && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '3px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)',
                    background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)',
                  }}>
                    Featured
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                {(creator.city || creator.country) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    <MapPin size={11} style={{ color: 'var(--color-text-muted)' }} />
                    {[creator.city, creator.country].filter(Boolean).join(', ')}
                  </span>
                )}
                {creator.languages.length > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    <Globe size={11} style={{ color: 'var(--color-text-muted)' }} />
                    {creator.languages.join(' · ')}
                  </span>
                )}
                {creator.experience_years && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    <Clock size={11} style={{ color: 'var(--color-text-muted)' }} />
                    {creator.experience_years} yrs experience
                  </span>
                )}
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
              {isMember ? (
                <Link href="/dashboard" style={{
                  padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: 'var(--color-accent)', color: '#0a0c0f',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  Go to Dashboard <ChevronRight size={14} />
                </Link>
              ) : (
                <>
                  <Link href={user ? '/subscribe' : '/signup'} style={{
                    padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: 'var(--color-accent)', color: '#0a0c0f',
                    display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: '0 4px 16px rgba(74,222,128,0.25)',
                  }}>
                    <Zap size={14} />
                    {creator.community_price_bob ? `Join · Bs. ${creator.community_price_bob}/mo` : 'Join'}
                  </Link>
                  {!user && (
                    <Link href="/login" style={{
                      padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                      border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)',
                    }}>
                      Sign in
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Specialty chips */}
          {creator.specialty.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 20 }}>
              {creator.specialty.map(s => (
                <span key={s} style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '4px 10px', borderRadius: 5, fontFamily: 'var(--font-mono)',
                  background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-accent)', flexShrink: 0 }} />
                  {SPECIALTY_LABELS[s] ?? s}
                </span>
              ))}
            </div>
          )}

          {/* Social links */}
          {(creator.instagram_url || creator.youtube_url || creator.tiktok_url || creator.website_url) && (
            <div style={{ display: 'flex', gap: 6, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border-subtle)', flexWrap: 'wrap' }}>
              {creator.instagram_url && (
                <a href={creator.instagram_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500,
                  color: 'var(--color-text-secondary)', padding: '5px 11px', borderRadius: 6,
                  border: '1px solid var(--color-border-subtle)', background: 'var(--color-surface-elevated)',
                }}>
                  <ExternalLink size={12} /> Instagram
                </a>
              )}
              {creator.youtube_url && (
                <a href={creator.youtube_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500,
                  color: 'var(--color-text-secondary)', padding: '5px 11px', borderRadius: 6,
                  border: '1px solid var(--color-border-subtle)', background: 'var(--color-surface-elevated)',
                }}>
                  <ExternalLink size={12} /> YouTube
                </a>
              )}
              {creator.tiktok_url && (
                <a href={creator.tiktok_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500,
                  color: 'var(--color-text-secondary)', padding: '5px 11px', borderRadius: 6,
                  border: '1px solid var(--color-border-subtle)', background: 'var(--color-surface-elevated)',
                }}>
                  <Globe size={12} /> TikTok
                </a>
              )}
              {creator.website_url && (
                <a href={creator.website_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500,
                  color: 'var(--color-text-secondary)', padding: '5px 11px', borderRadius: 6,
                  border: '1px solid var(--color-border-subtle)', background: 'var(--color-surface-elevated)',
                }}>
                  <Globe size={12} /> Website
                </a>
              )}
            </div>
          )}
        </div>

        {/* ── STATS BAR ─────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 20,
          background: 'var(--color-border-subtle)', borderRadius: 14,
          overflow: 'hidden', border: '1px solid var(--color-border-subtle)', gap: 1,
        }}>
          {statItems.map((s, i) => (
            <div key={i} style={{ background: 'var(--color-surface)', padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                {s.icon}
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
                  {s.label}
                </span>
              </div>
              <span style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-accent)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* ── BIO ───────────────────────────────────────────── */}
        {creator.bio && (
          <div style={{ marginTop: 40 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 14 }}>
              About
            </p>
            <p style={{ fontSize: 16, color: 'var(--color-text-secondary)', lineHeight: 1.8, maxWidth: 680, margin: 0 }}>
              {creator.bio}
            </p>
            {creator.certifications && (
              <p style={{ marginTop: 14, fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                {creator.certifications}
              </p>
            )}
          </div>
        )}

        {/* ── PROGRAMS ──────────────────────────────────────── */}
        {programs.length > 0 && (
          <div style={{ marginTop: 52 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>
              Programs
            </p>
            <div style={{
              display: 'grid', gap: 16,
              gridTemplateColumns: programs.length === 1 ? '1fr' : programs.length === 2 ? '1fr 1fr' : '1.65fr 1fr',
            }}>
              {programs.map((p, i) => {
                const tc = typeColor(p.type);
                const isFeatured = i === 0 && programs.length >= 3;
                return (
                  <div key={p.id} className="card-interactive" style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border-subtle)', borderRadius: 16,
                    overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    gridRow: isFeatured ? 'span 2' : undefined,
                  }}>
                    {/* Cover strip */}
                    <div style={{
                      height: isFeatured ? 180 : 72,
                      background: p.cover_image_url
                        ? `url(${p.cover_image_url}) center/cover`
                        : `linear-gradient(135deg, ${tc}14 0%, transparent 70%)`,
                      borderBottom: `2.5px solid ${tc}`,
                      display: 'flex', alignItems: 'flex-end', padding: '12px 16px',
                    }}>
                      <span style={{
                        fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                        padding: '3px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)',
                        background: 'rgba(10,12,15,0.75)', backdropFilter: 'blur(6px)',
                        color: tc, border: `1px solid ${tc}35`,
                      }}>
                        {typeLabel(p.type)}
                      </span>
                    </div>

                    <div style={{ padding: '20px 20px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.025em', margin: 0 }}>
                        {p.title}
                      </h3>
                      {p.description && (
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: 0 }}>
                          {p.description.slice(0, isFeatured ? 200 : 100)}{p.description.length > (isFeatured ? 200 : 100) ? '…' : ''}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {p.goal && (
                          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                            {SPECIALTY_LABELS[p.goal] ?? p.goal}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {p.duration_weeks}W
                        </span>
                        {p.enrollment_count > 0 && (
                          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {p.enrollment_count} enrolled
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 16 }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-accent)', letterSpacing: '-0.03em' }}>
                          {p.is_free ? 'Free' : `Bs. ${p.price_bob}`}
                        </span>
                        <Link href={user ? '/subscribe' : '/login'} style={{
                          fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
                          background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
                          border: '1px solid rgba(74,222,128,0.25)',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          {p.is_free ? 'Enroll Free' : 'Enroll'} <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── COMMUNITY PREVIEW ─────────────────────────────── */}
        {community && (
          <div style={{ marginTop: 52 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>
              Community
            </p>
            <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--color-border-subtle)', background: 'var(--color-surface)' }}>
              {/* Fake posts — blurred for non-members */}
              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20, filter: isMember ? undefined : 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}>
                {[
                  { init: 'J', name: 'Jorge R.', text: 'Day 14 complete 💪 Down 2.3kg — the nutrition targets are dialed in perfectly', time: '2h', hue: 160 },
                  { init: 'M', name: 'María L.', text: 'Hit a new PR on bench — 90kg×5. The weekly program structure is 🔥 absolute fire', time: '5h', hue: 200 },
                  { init: 'A', name: 'Ana K.', text: 'Weekly check-in: macros on point, sleep improving too. Coach\'s advice on meal timing changed everything', time: '9h', hue: 280 },
                ].map((post, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                      background: `oklch(42% 0.18 ${post.hue})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: 'white',
                    }}>
                      {post.init}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{post.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{post.time} ago</span>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>{post.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lock overlay */}
              {!isMember && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to bottom, rgba(20,24,32,0) 0%, rgba(20,24,32,0.96) 38%, rgba(20,24,32,1) 100%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                  padding: '0 32px 36px', gap: 16,
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Lock size={20} style={{ color: 'var(--color-text-muted)' }} />
                      </div>
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
                      Join to unlock the community
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
                      {community.member_count} members · {community.post_count} posts · Active daily
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link href={user ? '/subscribe' : '/signup'} style={{
                      padding: '12px 28px', borderRadius: 11, fontSize: 14, fontWeight: 700,
                      background: 'var(--color-accent)', color: '#0a0c0f',
                      display: 'flex', alignItems: 'center', gap: 6,
                      boxShadow: '0 6px 24px rgba(74,222,128,0.3)',
                    }}>
                      <Zap size={16} />
                      {creator.community_price_bob ? `Join Community · Bs. ${creator.community_price_bob}/mo` : 'Join Community — Free'}
                    </Link>
                    {!user && (
                      <Link href="/login" style={{
                        padding: '12px 22px', borderRadius: 11, fontSize: 14, fontWeight: 500,
                        border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)',
                      }}>
                        Sign in
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
