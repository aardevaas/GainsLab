import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProgramEditorClient } from './ProgramEditorClient';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('programs').select('title').eq('id', id).single();
  return { title: data?.title ?? 'Program Editor' };
}

export default async function ProgramEditorPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: creator } = await supabase
    .from('creator_profiles').select('id').eq('user_id', user.id).maybeSingle();
  if (!creator) redirect('/apply');

  const { data: program } = await supabase
    .from('programs')
    .select('id, title, type, goal, duration_weeks, price_bob, is_free, is_published')
    .eq('id', id)
    .eq('creator_id', creator.id)
    .single();

  if (!program) notFound();

  const { data: weeks } = await supabase
    .from('program_weeks')
    .select('id, week_number, title')
    .eq('program_id', id)
    .order('week_number');

  const weekIds = weeks?.map(w => w.id) ?? [];

  const { data: days } = weekIds.length > 0
    ? await supabase
        .from('program_days')
        .select('id, week_id, day_number, title, rest_day')
        .in('week_id', weekIds)
        .order('day_number')
    : { data: [] };

  const tree = (weeks ?? []).map(w => ({
    ...w,
    days: (days ?? []).filter(d => d.week_id === w.id),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ProgramEditorClient program={program} weeks={tree} />
    </div>
  );
}
