import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle2, BookOpen } from 'lucide-react';
import { getArticleBySlug, ARTICLES, type ArticleCategory } from '@/lib/learn/articles';
import type { Metadata } from 'next';

const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  Nutrition: '#4ade80',
  Training: '#60a5fa',
  Recovery: '#a78bfa',
  'Body Composition': '#f97316',
  Myths: '#f87171',
};

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return ARTICLES.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Article Not Found' };
  return { title: article.title, description: article.summary };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const catColor = CATEGORY_COLORS[article.category];

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link
          href="/learn"
          className="size-8 rounded-lg flex items-center justify-center border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div className="flex items-center gap-2">
          <BookOpen size={16} style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Education Hub</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8 max-w-2xl">
        {/* Article header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: `${catColor}20`, color: catColor }}
            >
              {article.category}
            </span>
            <div className="flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
              <Clock size={12} />
              <span className="text-xs">{article.readingTime} min read</span>
            </div>
          </div>

          <h1
            className="text-3xl font-extrabold leading-tight mb-4"
            style={{ color: 'var(--color-text)', letterSpacing: '-0.03em' }}
          >
            {article.title}
          </h1>

          <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {article.summary}
          </p>
        </div>

        {/* Key takeaways */}
        <div
          className="rounded-2xl p-5 mb-8 border"
          style={{ background: `${catColor}08`, borderColor: `${catColor}30` }}
        >
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: catColor }}>
            Key Takeaways
          </h2>
          <ul className="flex flex-col gap-2">
            {article.keyTakeaways.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 size={14} className="shrink-0 mt-0.5" style={{ color: catColor }} />
                <span className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="h-px mb-8" style={{ background: 'var(--color-border-subtle)' }} />

        {/* Article sections */}
        <div className="flex flex-col gap-8 mb-10">
          {article.sections.map((section, i) => (
            <div key={i}>
              <h2
                className="text-lg font-bold mb-3"
                style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}
              >
                {section.heading}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.75' }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>

        {/* Sources */}
        <div
          className="rounded-xl p-5 border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
            References
          </h3>
          <ol className="flex flex-col gap-2">
            {article.sources.map((source, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-xs shrink-0 mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{i + 1}.</span>
                <span className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{source}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Back link */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: 'var(--color-accent)' }}
          >
            <ArrowLeft size={14} />
            Back to Education Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
