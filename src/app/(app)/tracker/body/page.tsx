import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { BodyMeasurementsClient } from './BodyMeasurementsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Body Measurements' };

function nDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export type Measurement = {
  id: string;
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

export default async function BodyMeasurementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('body_measurements')
    .select('id,date,weight_kg,body_fat_pct,lean_mass_kg,waist_cm,chest_cm,hips_cm,left_arm_cm,right_arm_cm,left_thigh_cm,right_thigh_cm,neck_cm,notes')
    .eq('user_id', user.id)
    .gte('date', nDaysAgo(90))
    .order('date', { ascending: false });

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link
          href="/tracker"
          className="size-8 rounded-lg flex items-center justify-center border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Body Measurements
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            90-day trends · log & track every metric
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <BodyMeasurementsClient measurements={(data ?? []) as Measurement[]} />
      </div>
    </div>
  );
}
