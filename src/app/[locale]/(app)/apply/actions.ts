'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export type ApplyState = {
  success?: boolean;
  error?: string;
};

export async function submitCreatorApplication(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const specialty = formData.getAll('specialty') as string[];
  const motivation = String(formData.get('motivation') ?? '').trim();
  const full_name = String(formData.get('full_name') ?? '').trim();

  if (!full_name) return { error: 'Full name is required.' };
  if (specialty.length === 0) return { error: 'Select at least one specialty.' };
  if (motivation.length < 50) return { error: 'Tell us a bit more about why you want to join (min 50 chars).' };

  const experienceRaw = formData.get('experience_years');
  const experience_years = experienceRaw ? Number(experienceRaw) : null;

  const { error } = await supabase.from('creator_applications').insert({
    user_id: user.id,
    full_name,
    bio: String(formData.get('bio') ?? '').trim() || null,
    specialty,
    instagram_url: String(formData.get('instagram_url') ?? '').trim() || null,
    youtube_url: String(formData.get('youtube_url') ?? '').trim() || null,
    tiktok_url: String(formData.get('tiktok_url') ?? '').trim() || null,
    experience_years,
    certifications: String(formData.get('certifications') ?? '').trim() || null,
    motivation,
  });

  if (error) {
    if (error.code === '23505') return { error: 'You already submitted an application.' };
    return { error: 'Something went wrong. Please try again.' };
  }

  return { success: true };
}
