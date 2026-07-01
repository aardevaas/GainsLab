import Link from 'next/link';
import { Search, Zap } from 'lucide-react';
import { getCategoriesWithThumbs, getRandomRecipes, getRecipesByCategory, searchRecipes } from '@/lib/recipes/mealdb';
import { searchSpoonacular, SPOON_DIETS } from '@/lib/recipes/spoonacular';
import type { SpoonRecipeSummary } from '@/lib/recipes/spoonacular';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Recipes' };

type SearchParams = Promise<{ q?: string; category?: string; source?: string; diet?: string }>;

function MacroChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="text-[10px] font-semibold tabular-nums" style={{ color }}>
      {value}{label === 'kcal' ? '' : 'g'} {label}
    </span>
  );
}

export default async function RecipesPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, category, source, diet } = await searchParams;

  const isSpoon = source === 'spoon';
  const hasSearch = !!(q && q.trim().length >= 2);

  const spoonKeySet = !!process.env.SPOONACULAR_API_KEY;

  const [categoriesData, recipesData, spoonResults] = await Promise.all([
    isSpoon ? Promise.resolve([]) : getCategoriesWithThumbs(),
    isSpoon
      ? Promise.resolve([])
      : category
        ? getRecipesByCategory(category, 24)
        : hasSearch
          ? searchRecipes(q!)
          : getRandomRecipes(12),
    isSpoon && spoonKeySet
      ? searchSpoonacular(q?.trim() || 'healthy', diet as never, 24)
      : Promise.resolve([] as SpoonRecipeSummary[]),
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

        {/* Source tabs */}
        <div className="flex gap-2 mb-4">
          <Link
            href={q ? `/recipes?q=${encodeURIComponent(q)}` : '/recipes'}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all"
            style={{
              background: !isSpoon ? 'var(--color-accent)' : 'var(--color-surface)',
              borderColor: !isSpoon ? 'var(--color-accent)' : 'var(--color-border)',
              color: !isSpoon ? '#0a0c0f' : 'var(--color-text-secondary)',
            }}
          >
            TheMealDB
          </Link>
          <Link
            href={q ? `/recipes?source=spoon&q=${encodeURIComponent(q)}${diet ? `&diet=${diet}` : ''}` : '/recipes?source=spoon'}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all"
            style={{
              background: isSpoon ? 'var(--color-accent)' : 'var(--color-surface)',
              borderColor: isSpoon ? 'var(--color-accent)' : 'var(--color-border)',
              color: isSpoon ? '#0a0c0f' : 'var(--color-text-secondary)',
            }}
          >
            <Zap size={11} /> Nutrition Search
          </Link>
        </div>

        {/* Search bar */}
        <form method="GET" className="flex gap-2 max-w-md">
          {isSpoon && <input type="hidden" name="source" value="spoon" />}
          {isSpoon && diet && <input type="hidden" name="diet" value={diet} />}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              name="q"
              defaultValue={q ?? ''}
              placeholder={isSpoon ? 'Search with nutrition data...' : 'Search recipes...'}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--color-accent)]"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>
          <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}>
            Search
          </button>
          {(q || category || diet) && (
            <Link href={isSpoon ? '/recipes?source=spoon' : '/recipes'} className="px-4 py-2.5 rounded-xl border text-sm" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
              Clear
            </Link>
          )}
        </form>
      </div>

      <div className="flex-1 px-8 py-6 space-y-6 max-w-6xl">
        {/* Spoonacular API key not configured */}
        {isSpoon && !spoonKeySet && (
          <div
            className="rounded-xl border p-8 text-center space-y-2"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Spoonacular API key not configured</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Add <code className="px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-elevated)' }}>SPOONACULAR_API_KEY</code> to <code className="px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-elevated)' }}>.env.local</code> to enable nutrition search.
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Free tier at{' '}
              <span style={{ color: 'var(--color-accent)' }}>spoonacular.com/food-api</span>
              {' '}gives 150 calls/day.
            </p>
          </div>
        )}

        {/* Spoonacular dietary filters */}
        {isSpoon && spoonKeySet && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-muted)' }}>
              Dietary filter
            </p>
            <div className="flex flex-wrap gap-2">
              {SPOON_DIETS.map(d => (
                <Link
                  key={d.id}
                  href={`/recipes?source=spoon${q ? `&q=${encodeURIComponent(q)}` : ''}&diet=${encodeURIComponent(d.id)}`}
                  className="px-3 py-1.5 rounded-full border text-xs font-medium transition-all"
                  style={{
                    borderColor: diet === d.id ? 'var(--color-accent)' : 'var(--color-border)',
                    background: diet === d.id ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
                    color: diet === d.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  }}
                >
                  {d.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* TheMealDB category chips */}
        {!isSpoon && !hasSearch && (
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

        {/* Spoonacular results */}
        {isSpoon && spoonKeySet && (
          <div>
            <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
              {spoonResults.length} recipe{spoonResults.length !== 1 ? 's' : ''}
              {diet ? ` · ${diet}` : ''}
              {q ? ` for "${q}"` : ' — healthy picks'}
              {' '}· macros per serving
            </p>

            {spoonResults.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No results. Try a different search or diet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {spoonResults.map(recipe => (
                  <Link
                    key={recipe.id}
                    href={`/recipes/spoon/${recipe.id}`}
                    className="card-interactive group rounded-xl border overflow-hidden"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  >
                    <div className="relative h-36 overflow-hidden" style={{ background: 'var(--color-surface-elevated)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div
                        className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-0.5"
                        style={{ background: 'rgba(0,0,0,0.65)', color: '#4ade80' }}
                      >
                        <Zap size={9} /> {recipe.calories} kcal
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <p className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: 'var(--color-text)' }}>
                        {recipe.title}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <MacroChip label="kcal" value={recipe.calories} color="#4ade80" />
                        <MacroChip label="P" value={recipe.protein} color="#38bdf8" />
                        <MacroChip label="C" value={recipe.carbs} color="#fb923c" />
                        <MacroChip label="F" value={recipe.fat} color="#f472b6" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TheMealDB results */}
        {!isSpoon && (
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
                    className="card-interactive group rounded-xl border overflow-hidden"
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
        )}
      </div>
    </div>
  );
}
