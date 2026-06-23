'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { recomputeDailyMetrics } from '@/lib/gains/engine';

export type MeasurementInput = {
  date: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
  lean_mass_kg: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  hips_cm: number | null;
  left_arm_cm: number | null;
  right_arm_cm: number | null;
  left_thigh_cm: number | null;
  right_thigh_cm: number | null;
  neck_cm: number | null;
  notes: string | null;
};

export async function logMeasurement(input: MeasurementInput): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('body_measurements').upsert(
    { user_id: user.id, ...input },
    { onConflict: 'user_id,date' }
  );
  await recomputeDailyMetrics(user.id, input.date).catch(() => {});
  revalidatePath('/tracker');
  revalidatePath('/tracker/body');
  revalidatePath('/dashboard');
}

export async function deleteMeasurement(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from('body_measurements').delete().eq('id', id);
  revalidatePath('/tracker');
  revalidatePath('/tracker/body');
}
