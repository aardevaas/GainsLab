'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { JSONContent } from '@tiptap/react';
import type { ArticleCategory } from '@/lib/learn/types';

export type ArticleInput = {
  slug: string;
  title: string;
  category: ArticleCategory;
  summary: string;
  reading_time: number;
  key_takeaways: string[];
  content: JSONContent;
  sources: string[];
};

export type ArticleState = { error?: string; id?: string };

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('user_id', user.id).single();
  if (!profile?.is_admin) redirect('/dashboard');

  return { supabase, userId: user.id };
}

export async function createArticle(input: ArticleInput): Promise<ArticleState> {
  const { supabase, userId } = await requireAdmin();

  if (!input.slug.trim() || !input.title.trim()) {
    return { error: 'Slug and title are required.' };
  }

  const { data, error } = await supabase
    .from('education_articles')
    .insert({
      slug: input.slug.trim(),
      title: input.title.trim(),
      category: input.category,
      summary: input.summary.trim(),
      reading_time: input.reading_time,
      key_takeaways: input.key_takeaways.filter(k => k.trim()),
      content: input.content,
      sources: input.sources.filter(s => s.trim()),
      author_user_id: userId,
      is_published: false,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return { error: 'That slug is already in use.' };
    return { error: error.message };
  }

  revalidatePath('/admin/articles');
  return { id: data.id };
}

export async function updateArticle(id: string, input: ArticleInput): Promise<ArticleState> {
  const { supabase } = await requireAdmin();

  if (!input.slug.trim() || !input.title.trim()) {
    return { error: 'Slug and title are required.' };
  }

  const { error } = await supabase
    .from('education_articles')
    .update({
      slug: input.slug.trim(),
      title: input.title.trim(),
      category: input.category,
      summary: input.summary.trim(),
      reading_time: input.reading_time,
      key_takeaways: input.key_takeaways.filter(k => k.trim()),
      content: input.content,
      sources: input.sources.filter(s => s.trim()),
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') return { error: 'That slug is already in use.' };
    return { error: error.message };
  }

  revalidatePath('/admin/articles');
  revalidatePath('/learn');
  return { id };
}

export async function deleteArticle(id: string): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from('education_articles').delete().eq('id', id);
  revalidatePath('/admin/articles');
  revalidatePath('/learn');
}

export async function toggleArticlePublish(id: string, current: boolean): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from('education_articles').update({ is_published: !current }).eq('id', id);
  revalidatePath('/admin/articles');
  revalidatePath('/learn');
}
