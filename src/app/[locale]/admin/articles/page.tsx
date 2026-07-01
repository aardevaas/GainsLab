import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ArticlesListClient } from './ArticlesListClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Education Hub — Admin' };

export default async function AdminArticlesPage() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from('education_articles')
    .select('id, slug, title, category, is_published, reading_time, updated_at')
    .order('updated_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            Education Hub
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
            {articles?.length ?? 0} article{articles?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--color-accent)', color: '#0a0c0f', textDecoration: 'none' }}
        >
          <Plus size={14} /> New article
        </Link>
      </div>

      <ArticlesListClient articles={articles ?? []} />
    </div>
  );
}
