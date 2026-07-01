import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Bookmark, ExternalLink, ShoppingCart } from 'lucide-react';
import { getRecipeById } from '@/lib/recipes/mealdb';
import { createClient } from '@/lib/supabase/server';
import { saveRecipe, unsaveRecipe, addRecipeIngredientsToGrocery } from '../actions';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipeById(id);
  return { title: recipe?.name ?? 'Recipe' };
}

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [recipe, { data: { user } }] = await Promise.all([
    getRecipeById(id),
    supabase.auth.getUser(),
  ]);

  if (!recipe) notFound();

  // Check if already saved
  const { data: savedRow } = user
    ? await supabase
        .from('saved_recipes')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipe.id)
        .single()
    : { data: null };

  const isSaved = !!savedRow;
  const steps = recipe.instructions.split('\r\n').filter(s => s.trim());

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link href="/recipes" className="size-8 rounded-lg flex items-center justify-center border" style={{ borderColor: 'var(--color-border)' }}>
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            {recipe.name}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            {recipe.category && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>
                {recipe.category}
              </span>
            )}
            {recipe.area && <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{recipe.area}</span>}
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <form action={addRecipeIngredientsToGrocery.bind(null, recipe.ingredients)}>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              title="Add ingredients to grocery list"
            >
              <ShoppingCart size={13} /> Grocery list
            </button>
          </form>
          {isSaved ? (
            <form action={unsaveRecipe.bind(null, recipe.id)}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
              >
                <Bookmark size={13} fill="currentColor" /> Saved
              </button>
            </form>
          ) : (
            <form action={saveRecipe.bind(null, recipe)}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold"
                style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
              >
                <Bookmark size={13} /> Save
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: image + ingredients */}
          <div className="space-y-5">
            <div className="rounded-xl overflow-hidden aspect-video" style={{ background: 'var(--color-surface-elevated)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={recipe.thumbnail} alt={recipe.name} className="w-full h-full object-cover" />
            </div>

            {recipe.youtube && (
              <a
                href={recipe.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                <ExternalLink size={16} /> Watch on YouTube
              </a>
            )}

            <div>
              <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>
                Ingredients ({recipe.ingredients.length})
              </h2>
              <div
                className="rounded-xl border divide-y overflow-hidden"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm capitalize" style={{ color: 'var(--color-text)' }}>{ing.name}</span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{ing.measure}</span>
                  </div>
                ))}
              </div>
            </div>

            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {recipe.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full border"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: instructions */}
          <div>
            <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>Instructions</h2>
            <ol className="space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="shrink-0 size-6 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5"
                    style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{step}</p>
                </li>
              ))}
            </ol>

            {recipe.source && (
              <a
                href={recipe.source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 text-xs"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Original source →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
