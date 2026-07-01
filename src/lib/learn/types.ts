import type { JSONContent } from '@tiptap/react';

export type ArticleCategory = 'Nutrition' | 'Training' | 'Recovery' | 'Body Composition' | 'Myths';

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  'Nutrition', 'Training', 'Recovery', 'Body Composition', 'Myths',
];

export type EducationArticle = {
  id: string;
  slug: string;
  title: string;
  category: ArticleCategory;
  summary: string;
  reading_time: number;
  key_takeaways: string[];
  content: JSONContent;
  sources: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export const EMPTY_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };
