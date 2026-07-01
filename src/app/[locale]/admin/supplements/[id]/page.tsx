import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { SupplementForm } from '../SupplementForm';
import type { Supplement } from '@/lib/supplements/types';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('supplements').select('name').eq('id', id).single();
  return { title: data ? `Edit: ${data.name}` : 'Edit Supplement' };
}

export default async function EditSupplementPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: supplement } = await supabase
    .from('supplements')
    .select('*')
    .eq('id', id)
    .single();

  if (!supplement) notFound();

  return (
    <div>
      <Link
        href="/admin/supplements"
        className="inline-flex items-center gap-2 text-xs font-semibold mb-6"
        style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
      >
        <ArrowLeft size={13} /> Supplements
      </Link>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 20px', letterSpacing: '-0.03em' }}>
        Edit supplement
      </h1>
      <SupplementForm supplement={supplement as unknown as Supplement} />
    </div>
  );
}
