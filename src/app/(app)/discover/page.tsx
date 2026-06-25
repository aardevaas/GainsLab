import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { MapPin, Star, Users, TrendingUp, Zap } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Find a Coach — GainsLab' };

const SPECIALTIES = [
  { key: 'fat_loss', label: 'Fat Loss' },
  { key: 'muscle_gain', label: 'Muscle Gain' },
  { key: 'powerlifting', label: 'Powerlifting' },
  { key: 'bodybuilding', label: 'Bodybuilding' },
  { key: 'calisthenics', label: 'Calisthenics' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'mindset', label: 'Mindset' },
  { key: 'rehabilitation', label: 'Rehab' },
  { key: 'cardio', label: 'Cardio' },
  { key: 'yoga', label: 'Yoga' },
  { key: 'crossfit', label: 'CrossFit' },
  { key: 'general_fitness', label: 'General Fitness' },
  { key: 'sports_performance', label: 'Sports' },
];

type Props = {
  searchParams: Promise<{ specialty?: string }>;
};

export default async function DiscoverPage({ searchParams }: Props) {
  const { specialty } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('creator_profiles')
    .select('id, display_name, slug, bio, avatar_url, specialty, city, country, total_clients, avg_client_rating, experience_years, community_price_bob, is_verified, is_featured')
    .order('is_featured', { ascending: false })
    .order('total_clients', { ascending: false });

  if (specialty) {
    query = query.contains('specialty', [specialty]);
  }

  const { data: creators } = await query;
  const list = creators ?? [];

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.03em' }}>
          Find a Coach
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {list.length} verified coach{list.length !== 1 ? 'es' : ''} on GainsLab
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Specialty filter chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
          <Link
            href="/discover"
            style={{
              fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 6,
              letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none',
              background: !specialty ? 'var(--color-accent)' : 'var(--color-surface)',
              color: !specialty ? '#0a0c0f' : 'var(--color-text-secondary)',
              border: `1px solid ${!specialty ? 'var(--color-accent)' : 'var(--color-border)'}`,
            }}
          >
            All
          </Link>
          {SPECIALTIES.map(s => {
            const active = specialty === s.key;
            return (
              <Link
                key={s.key}
                href={active ? '/discover' : `/discover?specialty=${s.key}`}
                style={{
                  fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 6,
                  letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none',
                  background: active ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: active ? '#0a0c0f' : 'var(--color-text-secondary)',
                  border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                }}
              >
                {s.label}
              </Link>
            );
          })}
        </div>

        {/* Creator grid */}
        {list.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '60px 24px', textAlign: 'center', gap: 12,
          }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              No coaches found
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
              {specialty ? 'Try a different specialty or browse all.' : 'Be the first — apply to become a creator.'}
            </p>
            {specialty && (
              <Link href="/discover" style={{
                fontSize: 13, fontWeight: 700, padding: '8px 18px', borderRadius: 8,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)', textDecoration: 'none',
              }}>
                Clear filter
              </Link>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid', gap: 16,
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          }}>
            {list.map(c => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type Creator = {
  id: string;
  display_name: string;
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  specialty: string[];
  city: string | null;
  country: string | null;
  total_clients: number;
  avg_client_rating: number | null;
  experience_years: number | null;
  community_price_bob: number | null;
  is_verified: boolean;
  is_featured: boolean;
};

const SPECIALTY_LABELS: Record<string, string> = {
  fat_loss: 'Fat Loss', muscle_gain: 'Muscle Gain', powerlifting: 'Powerlifting',
  bodybuilding: 'Bodybuilding', calisthenics: 'Calisthenics', nutrition: 'Nutrition',
  mindset: 'Mindset', rehabilitation: 'Rehab', cardio: 'Cardio', yoga: 'Yoga',
  crossfit: 'CrossFit', general_fitness: 'General Fitness', sports_performance: 'Sports',
};

function CreatorCard({ creator: c }: { creator: Creator }) {
  return (
    <Link href={`/creator/${c.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)',
        borderRadius: 16, overflow: 'hidden', transition: 'border-color 200ms ease',
        cursor: 'pointer',
      }}>
        {/* Card header */}
        <div style={{
          padding: '20px 20px 0',
          display: 'flex', alignItems: 'flex-start', gap: 14,
        }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {c.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.avatar_url} alt={c.display_name}
                style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-accent)' }}
              />
            ) : (
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(74,222,128,0.1)', border: '2px solid var(--color-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, color: 'var(--color-accent)',
              }}>
                {c.display_name[0].toUpperCase()}
              </div>
            )}
            {c.is_verified && (
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--color-accent)', border: '2px solid var(--color-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, fontWeight: 900, color: '#0a0c0f',
              }}>✓</div>
            )}
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                {c.display_name}
              </span>
              {c.is_featured && (
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '2px 6px', borderRadius: 3, background: 'rgba(251,191,36,0.12)', color: '#fbbf24',
                }}>
                  Featured
                </span>
              )}
            </div>
            {(c.city || c.country) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <MapPin size={10} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {[c.city, c.country].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {c.bio && (
          <p style={{
            margin: '12px 20px 0', fontSize: 12, color: 'var(--color-text-secondary)',
            lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {c.bio}
          </p>
        )}

        {/* Specialty chips */}
        {c.specialty.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '12px 20px 0' }}>
            {c.specialty.slice(0, 3).map(s => (
              <span key={s} style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '3px 8px', borderRadius: 4,
                background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-muted)',
              }}>
                {SPECIALTY_LABELS[s] ?? s}
              </span>
            ))}
            {c.specialty.length > 3 && (
              <span style={{ fontSize: 9, color: 'var(--color-text-muted)', padding: '3px 0' }}>
                +{c.specialty.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats + price row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', marginTop: 8,
          borderTop: '1px solid var(--color-border-subtle)',
        }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={11} style={{ color: 'var(--color-text-muted)' }} />
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{c.total_clients} clients</span>
            </div>
            {c.avg_client_rating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={11} style={{ color: '#fbbf24' }} />
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{c.avg_client_rating.toFixed(1)}</span>
              </div>
            )}
            {c.experience_years && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <TrendingUp size={11} style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{c.experience_years}yr</span>
              </div>
            )}
          </div>
          {c.community_price_bob ? (
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-accent)', letterSpacing: '-0.02em' }}>
              Bs. {c.community_price_bob}<span style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-muted)' }}>/mo</span>
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#4ade80' }}>
              <Zap size={11} /> Free
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
