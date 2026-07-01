import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Users, ExternalLink, ShoppingCart, Utensils } from 'lucide-react';
import { getSpoonacularRecipe } from '@/lib/recipes/spoonacular';
import { logSpoonRecipe } from '../../actions';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getSpoonacularRecipe(Number(id));
  return { title: recipe?.title ?? 'Recipe' };
}

export default async function SpoonacularDetailPage({ params }: Props) {
  const { id } = await params;
  const recipe = await getSpoonacularRecipe(Number(id));
  if (!recipe) notFound();

  const macroChips = [
    { label: 'Calories', value: recipe.calories, unit: 'kcal', color: '#4ade80' },
    { label: 'Protein', value: recipe.protein, unit: 'g', color: '#38bdf8' },
    { label: 'Carbs', value: recipe.carbs, unit: 'g', color: '#fb923c' },
    { label: 'Fat', value: recipe.fat, unit: 'g', color: '#f472b6' },
  ];

  const steps = recipe.instructions
    .split(/\n+/)
    .map(s => s.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Link href="/recipes?source=spoon" className="size-8 rounded-lg flex items-center justify-center border" style={{ borderColor: 'var(--color-border)' }}>
          <ArrowLeft size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            {recipe.title}
          </h1>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <Clock size={11} /> {recipe.readyInMinutes} min
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <Users size={11} /> {recipe.servings} servings
            </span>
          </div>
        </div>
        <form action={logSpoonRecipe.bind(null, recipe)}>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'var(--color-accent)', color: '#0a0c0f' }}
          >
            <Utensils size={13} /> Log to food
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: image + macros + ingredients */}
          <div className="space-y-5">
            <div className="rounded-xl overflow-hidden aspect-video" style={{ background: 'var(--color-surface-elevated)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
            </div>

            {/* Macro chips */}
            <div className="grid grid-cols-4 gap-2">
              {macroChips.map(m => (
                <div
                  key={m.label}
                  className="rounded-xl border p-3 text-center"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <p className="text-base font-bold tabular-nums" style={{ color: m.color }}>
                    {m.value}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {m.unit}
                  </p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    {m.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Diet badges */}
            {recipe.diets.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {recipe.diets.map(d => (
                  <span
                    key={d}
                    className="text-[10px] px-2 py-0.5 rounded-full border capitalize"
                    style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)', background: 'var(--color-accent-subtle)' }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}

            {/* Ingredients */}
            <div>
              <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>
                Ingredients ({recipe.extendedIngredients.length})
              </h2>
              <div className="rounded-xl border divide-y overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                {recipe.extendedIngredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm capitalize" style={{ color: 'var(--color-text)' }}>{ing.name}</span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {ing.amount > 0 ? `${ing.amount} ${ing.unit}`.trim() : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {recipe.sourceUrl && (
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                <ExternalLink size={14} /> Original recipe
              </a>
            )}
          </div>

          {/* Right: summary + instructions */}
          <div className="space-y-5">
            {recipe.summary && (
              <div
                className="rounded-xl border p-4 text-sm leading-relaxed"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                {recipe.summary.slice(0, 400)}{recipe.summary.length > 400 ? '…' : ''}
              </div>
            )}

            <div>
              <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>Instructions</h2>
              {steps.length > 0 ? (
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
              ) : (
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  No step-by-step instructions available. See the{' '}
                  {recipe.sourceUrl && (
                    <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>
                      original recipe
                    </a>
                  )}
                  .
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
