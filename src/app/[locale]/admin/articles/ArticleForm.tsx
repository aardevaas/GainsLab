'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import type { JSONContent } from '@tiptap/react';
import { TipTapEditor } from '@/components/learn/TipTapEditor';
import { ARTICLE_CATEGORIES, EMPTY_DOC, type ArticleCategory, type EducationArticle } from '@/lib/learn/types';
import { createArticle, updateArticle, type ArticleInput } from './actions';

type Props = {
  article?: EducationArticle;
};

export function ArticleForm({ article }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState(article?.slug ?? '');
  const [title, setTitle] = useState(article?.title ?? '');
  const [category, setCategory] = useState<ArticleCategory>(article?.category ?? 'Nutrition');
  const [summary, setSummary] = useState(article?.summary ?? '');
  const [readingTime, setReadingTime] = useState(article?.reading_time ?? 5);
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>(article?.key_takeaways ?? ['']);
  const [sources, setSources] = useState<string[]>(article?.sources ?? ['']);
  const [content, setContent] = useState<JSONContent>(article?.content ?? EMPTY_DOC);

  function handleSave() {
    setError(null);
    const input: ArticleInput = {
      slug, title, category, summary,
      reading_time: readingTime,
      key_takeaways: keyTakeaways,
      sources,
      content,
    };

    startTransition(async () => {
      const result = article
        ? await updateArticle(article.id, input)
        : await createArticle(input);

      if (result.error) { setError(result.error); return; }
      router.push('/admin/articles');
      router.refresh();
    });
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Title">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </Field>
        <Field label="Slug">
          <input
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="how-much-protein-do-you-need"
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Category">
          <select
            value={category}
            onChange={e => setCategory(e.target.value as ArticleCategory)}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            {ARTICLE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Reading time (minutes)">
          <input
            type="number"
            min={1}
            value={readingTime}
            onChange={e => setReadingTime(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
        </Field>
      </div>

      <Field label="Summary">
        <textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        />
      </Field>

      <Field label="Key takeaways">
        <ListEditor items={keyTakeaways} onChange={setKeyTakeaways} placeholder="Add a takeaway..." />
      </Field>

      <Field label="Content">
        <TipTapEditor content={content} onChange={setContent} />
      </Field>

      <Field label="Sources">
        <ListEditor items={sources} onChange={setSources} placeholder="Add a citation..." />
      </Field>

      {error && <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
          style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
        >
          {isPending ? 'Saving…' : article ? 'Save changes' : 'Create article'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/articles')}
          className="px-5 py-2.5 rounded-xl border text-sm"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={e => onChange(items.map((v, idx) => idx === i ? e.target.value : v))}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="size-9 flex items-center justify-center rounded-lg border shrink-0"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="flex items-center gap-1.5 text-xs font-semibold"
        style={{ color: 'var(--color-accent)' }}
      >
        <Plus size={12} /> Add
      </button>
    </div>
  );
}
