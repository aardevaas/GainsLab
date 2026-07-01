'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { safeHttpUrl } from '@/lib/utils';

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
  isAcceptingClients: boolean;
};

export async function updateProfile(data: ProfileUpdateData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  if (!data.displayName.trim()) return { error: 'Display name is required.' };

  // Social/website links render as raw <a href> on the public creator page —
  // reject anything that isn't http(s) so a javascript: URL can't be stored.
  const urlFields: [string, string][] = [
    ['Instagram', data.instagramUrl],
    ['YouTube', data.youtubeUrl],
    ['TikTok', data.tiktokUrl],
    ['Website', data.websiteUrl],
  ];
  for (const [label, value] of urlFields) {
    if (value.trim() && !safeHttpUrl(value.trim())) {
      return { error: `${label} link must be a valid http(s) URL.` };
    }
  }

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
      is_accepting_clients: data.isAcceptingClients,
    })
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/studio/settings');
  if (current?.slug) revalidatePath(`/creator/${current.slug}`);
  return { ok: true };
}

const AVATAR_BUCKET = 'creator-avatars';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadCreatorAvatar(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const file = formData.get('avatar') as File | null;
  if (!file || file.size === 0) return { error: 'No file selected.' };
  if (file.size > 5 * 1024 * 1024) return { error: 'Image must be under 5 MB.' };
  if (!ALLOWED_TYPES.includes(file.type)) return { error: 'Upload a JPG, PNG, or WEBP image.' };

  const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg';
  // Use a timestamp so the new file busts any cached public URL
  const storagePath = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadErr) return { error: 'Upload failed. Please try again.' };

  const { data: { publicUrl } } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(storagePath);

  const { error: dbErr } = await supabase
    .from('creator_profiles')
    .update({ avatar_url: publicUrl })
    .eq('user_id', user.id);

  if (dbErr) return { error: dbErr.message };

  const { data: cp } = await supabase
    .from('creator_profiles')
    .select('slug')
    .eq('user_id', user.id)
    .single();

  revalidatePath('/studio/settings');
  if (cp?.slug) revalidatePath(`/creator/${cp.slug}`);

  return { url: publicUrl };
}
