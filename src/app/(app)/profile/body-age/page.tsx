import Link from 'next/link';
import { ArrowLeft, Activity, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { BodyAgeTestClient } from './BodyAgeTestClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Body Age Score' };

function AgeDelta({ bodyAge, chronoAge }: { bodyAge: number; chronoAge: number }) {
  const delta = bodyAge - chronoAge;
  if (delta < -2) return (
    <span className="flex items-center gap-1 text-sm font-bold" style={{ color: '#4ade80' }}>
      <TrendingDown size={14} />
      {Math.abs(delta)} years younger
    </span>
  );
  if (delta > 2) return (
    <span className="flex items-center gap-1 text-sm font-bold" style={{ color: '#f87171' }}>
      <TrendingUp size={14} />
      {delta} years older
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-sm font-bold" style={{ color: 'var(--color-text-secondary)' }}>
      <Minus size={14} />
      At your chronological age
    </span>
  );
}

export default async function BodyAgePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profileRes, assessmentsRes] = await Promise.all([
    user
      ? supabase.from('profiles').select('sex, date_of_birth').eq('user_id', user.id).single()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from('body_age_assessments')
          .select('id, date, body_age_score, chronological_age, pushup_max, situp_max, resting_hr, flexibility_score, mile_time_minutes')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
  ]);

  const profile = profileRes.data;
  const assessments = assessmentsRes.data ?? [];
  const latest = assessments[0] ?? null;
  const hasProfile = profile?.sex && profile?.date_of_birth;

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link href="/profile" className="size-8 rounded-lg flex items-center justify-center border" style={{ borderColor: 'var(--color-border)' }}>
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div className="flex items-center gap-3">
          <Activity size={18} style={{ color: 'var(--color-accent)' }} />
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Body Age Score</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>5 self-tests · results in under 10 minutes</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-2xl">
        {/* Current score card */}
        {latest ? (
          <div
            className="rounded-2xl p-6 mb-6 border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
              Latest result · {new Date(latest.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <div className="flex items-end gap-4 mb-3">
              <div>
                <span
                  className="text-7xl font-black leading-none"
                  style={{ color: 'var(--color-accent)', letterSpacing: '-0.04em' }}
                >
                  {latest.body_age_score}
                </span>
                <span className="text-2xl font-bold ml-2" style={{ color: 'var(--color-text-secondary)' }}>yrs</span>
              </div>
              <div className="pb-2">
                <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Chronological age: {latest.chronological_age}
                </p>
                <AgeDelta bodyAge={latest.body_age_score!} chronoAge={latest.chronological_age!} />
              </div>
            </div>

            {/* Test breakdown */}
            <div className="grid grid-cols-5 gap-2 mt-4">
              {([
                { label: 'Push-ups', val: latest.pushup_max, unit: 'reps' },
                { label: 'Sit-ups', val: latest.situp_max, unit: 'reps' },
                { label: 'Rest HR', val: latest.resting_hr, unit: 'bpm' },
                { label: 'Flex', val: latest.flexibility_score, unit: 'cm' },
                { label: '1-Mile', val: latest.mile_time_minutes, unit: 'min' },
              ] as const).map(({ label, val, unit }) => (
                <div
                  key={label}
                  className="rounded-xl p-2.5 text-center"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                >
                  <div className="text-base font-bold" style={{ color: 'var(--color-text)' }}>{val}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{unit}</div>
                  <div className="text-xs mt-0.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-8 mb-6 border text-center"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <Activity size={32} className="mx-auto mb-3" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              Discover your biological age
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Complete 5 quick fitness tests to see how your body performs relative to your chronological age.
            </p>
          </div>
        )}

        {/* Assessment history */}
        {assessments.length > 1 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
              Assessment History
            </h2>
            <div className="flex flex-col gap-2">
              {assessments.slice(1).map(a => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-xl px-4 py-3 border"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                      {a.body_age_score}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>body age</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About the test */}
        <div
          className="rounded-2xl p-5 mb-6 border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text)' }}>About this assessment</h3>
          <ul className="flex flex-col gap-2">
            {[
              'Push-up max measures upper-body muscular endurance.',
              'Sit-up max (60 sec) measures core endurance.',
              'Resting heart rate reflects cardiovascular efficiency.',
              'Sit-and-reach measures hamstring and lower-back flexibility.',
              '1-mile time measures aerobic fitness.',
            ].map((item, i) => (
              <li key={i} className="flex gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <span style={{ color: 'var(--color-accent)' }}>•</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Scoring uses published fitness norms for adults. Each test is worth 1–5 points. Body age = chronological age ± adjustment based on total score (range ≈ ±12 years).
          </p>
        </div>

        {/* Profile warning */}
        {!hasProfile && (
          <div
            className="rounded-xl p-4 mb-6 border text-sm"
            style={{ background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.3)', color: '#fbbf24' }}
          >
            Add your date of birth and sex in Profile settings for accurate body age calculation.
          </div>
        )}

        {/* Take test CTA */}
        <Link
          href="/profile/body-age/test"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
          style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
        >
          {latest ? 'Retest — Track Progress' : 'Start Assessment'}
        </Link>
      </div>
    </div>
  );
}
