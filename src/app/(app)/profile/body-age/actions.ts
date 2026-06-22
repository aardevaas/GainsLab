'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type TestInput = {
  pushup_max: number;
  situp_max: number;
  resting_hr: number;
  flexibility_score: number;
  mile_time_minutes: number;
};

function scoreTest(
  value: number,
  sex: 'male' | 'female',
  test: keyof TestInput
): number {
  switch (test) {
    case 'pushup_max': {
      const m = [35, 25, 15, 8];
      const f = [25, 15, 8, 4];
      const t = sex === 'male' ? m : f;
      if (value >= t[0]) return 5;
      if (value >= t[1]) return 4;
      if (value >= t[2]) return 3;
      if (value >= t[3]) return 2;
      return 1;
    }
    case 'situp_max': {
      const m = [40, 30, 20, 12];
      const f = [35, 25, 15, 10];
      const t = sex === 'male' ? m : f;
      if (value >= t[0]) return 5;
      if (value >= t[1]) return 4;
      if (value >= t[2]) return 3;
      if (value >= t[3]) return 2;
      return 1;
    }
    case 'resting_hr': {
      if (value <= 58) return 5;
      if (value <= 68) return 4;
      if (value <= 78) return 3;
      if (value <= 88) return 2;
      return 1;
    }
    case 'flexibility_score': {
      const m = [20, 12, 4, -4];
      const f = [25, 17, 9, 2];
      const t = sex === 'male' ? m : f;
      if (value >= t[0]) return 5;
      if (value >= t[1]) return 4;
      if (value >= t[2]) return 3;
      if (value >= t[3]) return 2;
      return 1;
    }
    case 'mile_time_minutes': {
      const m = [7.5, 9.0, 11.0, 13.0];
      const f = [9.5, 11.5, 13.5, 16.0];
      const t = sex === 'male' ? m : f;
      if (value <= t[0]) return 5;
      if (value <= t[1]) return 4;
      if (value <= t[2]) return 3;
      if (value <= t[3]) return 2;
      return 1;
    }
  }
}

function computeBodyAge(score: number, chronologicalAge: number): number {
  // score 15 = neutral, ±1 point = ±1.2 years
  return Math.max(10, Math.round(chronologicalAge - (score - 15) * 1.2));
}

export async function saveBodyAgeAssessment(input: TestInput): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('date_of_birth, sex')
    .eq('user_id', user.id)
    .single();

  if (!profile?.date_of_birth || !profile?.sex) return;

  const dob = new Date(profile.date_of_birth);
  const today = new Date();
  const chronologicalAge = Math.floor(
    (today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  const sex = profile.sex as 'male' | 'female';
  const total =
    scoreTest(input.pushup_max, sex, 'pushup_max') +
    scoreTest(input.situp_max, sex, 'situp_max') +
    scoreTest(input.resting_hr, sex, 'resting_hr') +
    scoreTest(input.flexibility_score, sex, 'flexibility_score') +
    scoreTest(input.mile_time_minutes, sex, 'mile_time_minutes');

  const bodyAge = computeBodyAge(total, chronologicalAge);

  const date = today.toISOString().split('T')[0];

  await supabase.from('body_age_assessments').insert({
    user_id: user.id,
    date,
    pushup_max: input.pushup_max,
    situp_max: input.situp_max,
    resting_hr: input.resting_hr,
    flexibility_score: input.flexibility_score,
    mile_time_minutes: input.mile_time_minutes,
    body_age_score: bodyAge,
    chronological_age: chronologicalAge,
  });

  revalidatePath('/profile/body-age');
}
