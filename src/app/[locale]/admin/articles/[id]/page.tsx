import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ArticleForm } from '../ArticleForm';
import type { EducationArticle } from '@/lib/learn/types';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('education_articles').select('title').eq('id', id).single();
  return { title: data ? `Edit: ${data.title}` : 'Edit Article' };
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from('education_articles')
    .select('*')
    .eq('id', id)
    .single();

  if (!article) notFound();

  return (
    <div>
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-2 text-xs font-semibold mb-6"
        style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
      >
        <ArrowLeft size={13} /> Education Hub
      </Link>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 20px', letterSpacing: '-0.03em' }}>
        Edit article
      </h1>
      <ArticleForm article={article as unknown as EducationArticle} />
    </div>
  );
}
