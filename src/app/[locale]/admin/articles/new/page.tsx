import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ArticleForm } from '../ArticleForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'New Article — Admin' };

export default function NewArticlePage() {
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
        New article
      </h1>
      <ArticleForm />
    </div>
  );
}
