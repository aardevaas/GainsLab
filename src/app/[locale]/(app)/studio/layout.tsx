import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { StudioNav } from './StudioNav';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: { default: 'Creator Studio', template: '%s · Creator Studio' } };

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: creator } = await supabase
    .from('creator_profiles').select('id, display_name, slug, specialty, avatar_url, is_verified')
    .eq('user_id', user.id).maybeSingle();

  if (!creator) redirect('/apply');

  return (
    <div className="flex flex-col min-h-full">
      <StudioNav
        displayName={creator.display_name}
        slug={creator.slug}
        avatarUrl={creator.avatar_url ?? null}
        isVerified={creator.is_verified}
      />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
