import Link from 'next/link';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';
import { ARTICLES, ARTICLE_CATEGORIES, type ArticleCategory } from '@/lib/learn/articles';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Education Hub' };

const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  Nutrition: '#4ade80',
  Training: '#60a5fa',
  Recovery: '#a78bfa',
  'Body Composition': '#f97316',
  Myths: '#f87171',
};

type Props = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export default async function LearnPage({ searchParams }: Props) {
  const { category: catParam, q } = await searchParams;

  const activeCategory = ARTICLE_CATEGORIES.find(c => c === catParam) ?? null;

  const filtered = ARTICLES.filter(a => {
    if (activeCategory && a.category !== activeCategory) return false;
    if (q) {
      const lower = q.toLowerCase();
      if (!a.title.toLowerCase().includes(lower) && !a.summary.toLowerCase().includes(lower)) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div className="flex items-center gap-3 mb-1">
          <BookOpen size={18} style={{ color: 'var(--color-accent)' }} />
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Education Hub
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)', marginLeft: '30px' }}>
          Science-backed guides on training, nutrition, and recovery
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-5xl">
        <div className="flex flex-col gap-4 mb-8">
          <form method="GET" className="relative">
            {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search articles..."
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </form>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/learn"
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={{
                background: !activeCategory ? 'var(--color-accent)' : 'var(--color-surface)',
                color: !activeCategory ? '#0a0c0f' : 'var(--color-text-secondary)',
                border: '1px solid',
                borderColor: !activeCategory ? 'transparent' : 'var(--color-border)',
              }}
            >
              All
            </Link>
            {ARTICLE_CATEGORIES.map(cat => (
              <Link
                key={cat}
                href={activeCategory === cat ? '/learn' : `/learn?category=${encodeURIComponent(cat)}`}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{
                  background: activeCategory === cat ? CATEGORY_COLORS[cat] : 'var(--color-surface)',
                  color: activeCategory === cat ? '#0a0c0f' : 'var(--color-text-secondary)',
                  border: '1px solid',
                  borderColor: activeCategory === cat ? 'transparent' : 'var(--color-border)',
                }}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {(q || activeCategory) && (
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
            {filtered.length} {filtered.length === 1 ? 'article' : 'articles'} found
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p style={{ color: 'var(--color-text-muted)' }}>No articles match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(article => (
              <Link
                key={article.slug}
                href={`/learn/${article.slug}`}
                className="group rounded-2xl p-5 border flex flex-col gap-3 transition-all"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: `${CATEGORY_COLORS[article.category]}20`,
                      color: CATEGORY_COLORS[article.category],
                    }}
                  >
                    {article.category}
                  </span>
                  <div className="flex items-center gap-1 shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                    <Clock size={11} />
                    <span className="text-xs">{article.readingTime} min</span>
                  </div>
                </div>

                <div className="flex-1">
                  <h2
                    className="font-bold text-base mb-1.5 leading-snug"
                    style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}
                  >
                    {article.title}
                  </h2>
                  <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {article.summary}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                  Read article
                  <ChevronRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
