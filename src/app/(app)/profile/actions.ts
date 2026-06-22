'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

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
  const { error } = await supabase
    .from('profiles')
    .update({
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
    })
    .eq('user_id', user.id);

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'That username is already taken' };
    }
    return { ok: false, error: 'Could not save changes. Please try again.' };
  }

  revalidatePath('/profile');
  revalidatePath('/dashboard');
  return { ok: true };
}
