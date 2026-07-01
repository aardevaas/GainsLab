import Link from 'next/link';
import { Activity, LineChart, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from './ProfileForm';
import type { ProfileInput } from './actions';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The (app) layout redirects unauthenticated users; guard here so the page
  // never throws if it renders before that redirect resolves.
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const displayName = profile?.name ?? user?.email?.split('@')[0] ?? 'Athlete';
  const initials = displayName.slice(0, 2).toUpperCase();

  const initial = {
    name: profile?.name ?? '',
    username: profile?.username ?? '',
    sex: (profile?.sex ?? '') as ProfileInput['sex'] | '',
    date_of_birth: profile?.date_of_birth ?? '',
    height_cm: profile?.height_cm ?? null,
    weight_kg: profile?.weight_kg ?? null,
    goal: (profile?.goal ?? '') as ProfileInput['goal'] | '',
    activity_level: (profile?.activity_level ?? '') as ProfileInput['activity_level'] | '',
    units: (profile?.units ?? 'metric') as 'metric' | 'imperial',
    avatar_url: profile?.avatar_url ?? '',
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="size-14 rounded-full object-cover"
              style={{ border: '2px solid var(--color-border)' }}
            />
          ) : (
            <div
              className="size-14 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
            >
              {initials}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
              {displayName}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Sub-feature shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-w-2xl">
          <Link
            href="/profile/macros"
            className="card-interactive group flex items-center gap-3 rounded-2xl p-4 border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div
              className="size-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
            >
              <LineChart size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Macro analysis</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>TDEE & macro targets</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
          </Link>

          <Link
            href="/profile/body-age"
            className="card-interactive group flex items-center gap-3 rounded-2xl p-4 border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div
              className="size-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
            >
              <Activity size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Body age score</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>5-test fitness assessment</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
          </Link>
        </div>

        <ProfileForm initial={initial} />
      </div>
    </div>
  );
}
