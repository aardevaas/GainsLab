'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const AVATAR_BUCKET = 'user-avatars';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60, 'Name is too long'),
  username: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_]{3,30}$/, 'Username must be 3–30 letters, numbers, or underscores')
    .or(z.literal('')),
  sex: z.enum(['male', 'female']),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  height_cm: z.number().min(50, 'Height looks too low').max(280, 'Height looks too high'),
  weight_kg: z.number().min(20, 'Weight looks too low').max(400, 'Weight looks too high'),
  goal: z.enum(['lose_weight', 'maintain', 'gain_muscle', 'improve_endurance', 'general_fitness']),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active', 'extra_active']),
  units: z.enum(['metric', 'imperial']),
  avatar_url: z.string().url('Must be a valid URL').or(z.literal('')),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;

export type ProfileActionResult = { ok: boolean; error?: string };

export async function updateProfile(input: ProfileInput): Promise<ProfileActionResult> {
  const parsed = ProfileSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in' };

  const v = parsed.data;
  // Upsert (not update): an account created before the profiles table existed
  // — or any edge case where the signup trigger didn't run — has no row yet.
  // Upsert creates-or-updates so the save always persists.
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: user.id,
        name: v.name,
        username: v.username || null,
        sex: v.sex,
        date_of_birth: v.date_of_birth,
        height_cm: v.height_cm,
        weight_kg: v.weight_kg,
        goal: v.goal,
        activity_level: v.activity_level,
        units: v.units,
        avatar_url: v.avatar_url || null,
        onboarding_completed: true,
      },
      { onConflict: 'user_id' },
    );

  if (error) {
    console.error('[updateProfile] save failed', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    if (error.code === '23505') {
      return { ok: false, error: 'That username is already taken' };
    }
    return { ok: false, error: 'Could not save changes. Please try again.' };
  }

  revalidatePath('/profile');
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function uploadMemberAvatar(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const file = formData.get('avatar') as File | null;
  if (!file || file.size === 0) return { error: 'No file selected.' };
  if (file.size > 5 * 1024 * 1024) return { error: 'Image must be under 5 MB.' };
  if (!ALLOWED_TYPES.includes(file.type)) return { error: 'Upload a JPG, PNG, or WEBP image.' };

  const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg';
  const storagePath = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadErr) return { error: 'Upload failed. Please try again.' };

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(storagePath);

  const { error: dbErr } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('user_id', user.id);

  if (dbErr) return { error: dbErr.message };

  revalidatePath('/profile');
  revalidatePath('/dashboard');

  return { url: publicUrl };
}
