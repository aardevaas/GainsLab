'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { recomputeDailyMetrics } from '@/lib/gains/engine';

export type LogFoodInput = {
  foodId?: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  brand?: string;
  quantity: number;
  unit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sodiumMg?: number;
  sugarG?: number;
};

export async function logFood(input: LogFoodInput): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('food_logs').insert({
    user_id: user.id,
    food_id: input.foodId ?? null,
    date: input.date,
    meal_type: input.mealType,
    food_name: input.foodName,
    brand: input.brand ?? null,
    quantity: input.quantity,
    unit: input.unit,
    calories: Math.round(input.calories),
    protein_g: input.proteinG,
    carbs_g: input.carbsG,
    fat_g: input.fatG,
    fiber_g: input.fiberG ?? null,
    sugar_g: input.sugarG ?? null,
    sodium_mg: input.sodiumMg ?? null,
  });

  if (error) throw new Error(error.message);
  await recomputeDailyMetrics(user.id, input.date).catch(() => {});
  revalidatePath('/nutrition');
  revalidatePath('/nutrition/log');
  revalidatePath('/dashboard');
}

export async function deleteLogEntry(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('food_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/nutrition');
  revalidatePath('/nutrition/log');
}
