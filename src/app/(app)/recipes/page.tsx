import Link from 'next/link';
import { Search } from 'lucide-react';
import { getCategoriesWithThumbs, getRandomRecipes, getRecipesByCategory, searchRecipes } from '@/lib/recipes/mealdb';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Recipes' };

type SearchParams = Promise<{ q?: string; category?: string }>;

export default async function RecipesPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, category } = await searchParams;

  const hasSearch = !!(q && q.trim().length >= 2);

  const [categoriesData, recipesData] = await Promise.all([
    getCategoriesWithThumbs(),
    category
      ? getRecipesByCategory(category, 24)
      : hasSearch
        ? searchRecipes(q!)
        : getRandomRecipes(12),
  ]);

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-6 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Recipes</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Thousands of recipes · save for meal planning
            </p>
          </div>
          <Link href="/recipes/saved" className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
            Saved
          </Link>
        </div>

        <form method="GET" className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              name="q"
              defaultValue={q ?? ''}
              placeholder="Search recipes..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--color-accent)]"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>
          <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}>
            Search
          </button>
          {(q || category) && (
            <Link href="/recipes" className="px-4 py-2.5 rounded-xl border text-sm" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
              Clear
            </Link>
          )}
        </form>
      </div>

      <div className="flex-1 px-8 py-6 space-y-6 max-w-6xl">
        {/* Category chips */}
        {!hasSearch && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-muted)' }}>
              Browse by category
            </p>
            <div className="flex flex-wrap gap-2">
              {categoriesData.map(cat => (
                <Link
                  key={cat.name}
                  href={`/recipes?category=${encodeURIComponent(cat.name)}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all"
                  style={{
                    borderColor: category === cat.name ? 'var(--color-accent)' : 'var(--color-border)',
                    background: category === cat.name ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
                    color: category === cat.name ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cat.thumb} alt="" className="size-4 rounded-full object-cover" />
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recipe grid */}
        <div>
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
            {hasSearch
              ? `${recipesData.length} result${recipesData.length !== 1 ? 's' : ''} for "${q}"`
              : category
                ? `${recipesData.length} ${category} recipes`
                : 'Featured today'}
          </p>

          {recipesData.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No recipes found</p>
              <Link href="/recipes" className="text-xs mt-2 block" style={{ color: 'var(--color-accent)' }}>Browse all</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {recipesData.map(recipe => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="group rounded-xl border overflow-hidden hover:border-[var(--color-accent)] transition-colors"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <div className="relative h-36 overflow-hidden" style={{ background: 'var(--color-surface-elevated)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={recipe.thumbnail}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: 'var(--color-text)' }}>
                      {recipe.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {recipe.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>
                          {recipe.category}
                        </span>
                      )}
                      {recipe.area && (
                        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{recipe.area}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
