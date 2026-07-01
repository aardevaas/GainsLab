import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileSettingsClient } from './ProfileSettingsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Profile Settings — Studio' };

export default async function StudioSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('creator_profiles')
    .select(
      'display_name, bio, avatar_url, specialty, instagram_url, youtube_url, tiktok_url, website_url, experience_years, country, city, community_price_bob, slug, is_accepting_clients'
    )
    .eq('user_id', user.id)
    .single();

  if (!profile) redirect('/studio');

  return (
    <div style={{ padding: '32px 28px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 20, fontWeight: 800, color: 'var(--color-text)',
          margin: '0 0 4px', letterSpacing: '-0.03em',
        }}>
          Profile Settings
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
          Changes update your public creator page immediately.
        </p>
      </div>

      <ProfileSettingsClient profile={profile} />
    </div>
  );
}
