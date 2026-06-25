'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type ProfileUpdateData = {
  displayName: string;
  bio: string;
  avatarUrl: string;
  specialty: string[];
  instagramUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  websiteUrl: string;
  experienceYears: number | null;
  country: string;
  city: string;
  communityPrice: number | null;
};

export async function updateProfile(data: ProfileUpdateData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  if (!data.displayName.trim()) return { error: 'Display name is required.' };

  const { data: current } = await supabase
    .from('creator_profiles')
    .select('slug')
    .eq('user_id', user.id)
    .single();

  const { error } = await supabase
    .from('creator_profiles')
    .update({
      display_name: data.displayName.trim(),
      bio: data.bio.trim() || null,
      avatar_url: data.avatarUrl.trim() || null,
      specialty: data.specialty,
      instagram_url: data.instagramUrl.trim() || null,
      youtube_url: data.youtubeUrl.trim() || null,
      tiktok_url: data.tiktokUrl.trim() || null,
      website_url: data.websiteUrl.trim() || null,
      experience_years: data.experienceYears,
      country: data.country.trim() || null,
      city: data.city.trim() || null,
      community_price_bob: data.communityPrice,
    })
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/studio/settings');
  if (current?.slug) revalidatePath(`/creator/${current.slug}`);
  return { ok: true };
}
