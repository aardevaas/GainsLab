import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { SupplementsListClient } from './SupplementsListClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Supplements — Admin' };

export default async function AdminSupplementsPage() {
  const supabase = await createClient();

  const { data: supplements } = await supabase
    .from('supplements')
    .select('id, slug, name, category, evidence, is_published')
    .order('name');

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            Supplements
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
            {supplements?.length ?? 0} supplement{supplements?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/supplements/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--color-accent)', color: '#0a0c0f', textDecoration: 'none' }}
        >
          <Plus size={14} /> New supplement
        </Link>
      </div>

      <SupplementsListClient supplements={supplements ?? []} />
    </div>
  );
}
