'use server';

import { createClient } from '@/lib/supabase/server';

export type PlanForPicker = {
  id: string;
  name: string;
  days: { id: string; name: string }[];
};

/** The current user's plans with their days, for the "add to plan" picker. */
export async function getMyPlansForPicker(): Promise<PlanForPicker[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: plans } = await supabase
    .from('workout_plans')
    .select('id,name')
    .eq('user_id', user.id)
    .order('created_at');

  if (!plans || plans.length === 0) return [];

  const { data: days } = await supabase
    .from('workout_days')
    .select('id,name,plan_id')
    .in(
      'plan_id',
      plans.map((p) => p.id),
    )
    .order('order');

  return plans.map((p) => ({
    id: p.id,
    name: p.name,
    days: (days ?? []).filter((d) => d.plan_id === p.id).map((d) => ({ id: d.id, name: d.name })),
  }));
}
