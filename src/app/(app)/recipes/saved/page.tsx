import Link from 'next/link';
import { Bookmark, ChefHat } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Recipe } from '@/lib/recipes/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Saved Recipes' };

export default async function SavedRecipesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: saved } = await supabase
    .from('saved_recipes')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Saved Recipes</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{saved?.length ?? 0} saved</p>
        </div>
        <Link href="/recipes" className="text-xs font-semibold px-3 py-2 rounded-xl border" style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}>
          Browse recipes
        </Link>
      </div>

      <div className="flex-1 px-8 py-6 max-w-5xl">
        {!saved?.length ? (
          <div
            className="rounded-xl border p-12 flex flex-col items-center gap-4 text-center"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="size-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-surface-elevated)' }}>
              <ChefHat size={28} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--color-text)' }}>No saved recipes yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Browse recipes and click Save to build your collection.
              </p>
            </div>
            <Link href="/recipes" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}>
              Browse recipes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {saved.map(row => {
              const recipe = row.recipe_snapshot as unknown as Recipe;
              return (
                <Link
                  key={row.id}
                  href={`/recipes/${row.recipe_id}`}
                  className="card-interactive group rounded-xl border overflow-hidden"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <div className="relative h-36 overflow-hidden" style={{ background: 'var(--color-surface-elevated)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={recipe.thumbnail} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    <div className="absolute top-2 right-2 size-6 rounded-full flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>
                      <Bookmark size={10} fill="currentColor" style={{ color: '#0a0c0f' }} />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: 'var(--color-text)' }}>{recipe.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {recipe.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>
                          {recipe.category}
                        </span>
                      )}
                      {recipe.area && <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{recipe.area}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
