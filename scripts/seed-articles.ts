/**
 * One-time migration: copies the hardcoded articles from
 * src/lib/learn/articles.ts into the education_articles table so existing
 * content survives the move to the Supabase + TipTap CMS (see migration
 * 019_education_cms.sql). Safe to re-run — upserts on slug.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... npx tsx scripts/seed-articles.ts
 */
import { createClient } from '@supabase/supabase-js';
import { ARTICLES } from '../src/lib/learn/articles';
import type { JSONContent } from '@tiptap/react';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

function sectionsToTipTapDoc(sections: { heading: string; body: string }[]): JSONContent {
  return {
    type: 'doc',
    content: sections.flatMap(s => [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: s.heading }] },
      { type: 'paragraph', content: [{ type: 'text', text: s.body }] },
    ]),
  };
}

async function main() {
  for (const article of ARTICLES) {
    const { error } = await supabase
      .from('education_articles')
      .upsert(
        {
          slug: article.slug,
          title: article.title,
          category: article.category,
          summary: article.summary,
          reading_time: article.readingTime,
          key_takeaways: article.keyTakeaways,
          content: sectionsToTipTapDoc(article.sections),
          sources: article.sources,
          is_published: true,
        },
        { onConflict: 'slug' },
      );

    if (error) {
      console.error(`Failed to seed "${article.slug}":`, error.message);
    } else {
      console.log(`Seeded: ${article.slug}`);
    }
  }
}

main().then(() => process.exit(0));
