import type { Recipe, RecipeIngredient, RecipeSummary } from './types';

const BASE = 'https://www.themealdb.com/api/json/v1/1';

type RawMeal = {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string | null;
  strSource: string | null;
  [key: string]: string | null;
};

function parseIngredients(raw: RawMeal): RecipeIngredient[] {
  const out: RecipeIngredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = raw[`strIngredient${i}`]?.trim();
    const measure = raw[`strMeasure${i}`]?.trim();
    if (name) out.push({ name, measure: measure ?? '' });
  }
  return out;
}

function toRecipe(raw: RawMeal): Recipe {
  return {
    id: raw.idMeal,
    name: raw.strMeal,
    category: raw.strCategory ?? '',
    area: raw.strArea ?? '',
    instructions: raw.strInstructions ?? '',
    thumbnail: raw.strMealThumb,
    tags: raw.strTags ? raw.strTags.split(',').map(t => t.trim()).filter(Boolean) : [],
    youtube: raw.strYoutube ?? null,
    source: raw.strSource ?? null,
    ingredients: parseIngredients(raw),
  };
}

function toSummary(raw: RawMeal | { idMeal: string; strMeal: string; strMealThumb: string; strCategory?: string; strArea?: string }): RecipeSummary {
  return {
    id: raw.idMeal,
    name: raw.strMeal,
    thumbnail: raw.strMealThumb,
    category: (raw as RawMeal).strCategory ?? undefined,
    area: (raw as RawMeal).strArea ?? undefined,
  };
}

export async function searchRecipes(query: string): Promise<RecipeSummary[]> {
  const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(query)}`, {
    next: { revalidate: 3600 },
  });
  const data = await res.json() as { meals: RawMeal[] | null };
  return (data.meals ?? []).map(toSummary);
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const res = await fetch(`${BASE}/lookup.php?i=${id}`, {
    next: { revalidate: 86400 },
  });
  const data = await res.json() as { meals: RawMeal[] | null };
  if (!data.meals?.[0]) return null;
  return toRecipe(data.meals[0]);
}

export async function getRecipesByCategory(category: string, limit = 20): Promise<RecipeSummary[]> {
  const res = await fetch(`${BASE}/filter.php?c=${encodeURIComponent(category)}`, {
    next: { revalidate: 3600 },
  });
  const data = await res.json() as { meals: Array<{ idMeal: string; strMeal: string; strMealThumb: string }> | null };
  return (data.meals ?? []).slice(0, limit).map(m => ({ id: m.idMeal, name: m.strMeal, thumbnail: m.strMealThumb, category }));
}

export async function getRandomRecipes(count = 6): Promise<RecipeSummary[]> {
  const results = await Promise.allSettled(
    Array.from({ length: count }, () =>
      fetch(`${BASE}/random.php`, { cache: 'no-store' })
        .then(r => r.json() as Promise<{ meals: RawMeal[] }>)
        .then(d => d.meals[0] ? toSummary(d.meals[0]) : null)
    )
  );
  const summaries = results
    .filter((r): r is PromiseFulfilledResult<RecipeSummary | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter((r): r is RecipeSummary => r !== null);

  // random.php can return the same meal more than once across parallel calls —
  // dedupe by id so React keys stay unique.
  return Array.from(new Map(summaries.map(s => [s.id, s])).values());
}

export async function getCategories(): Promise<string[]> {
  const res = await fetch(`${BASE}/categories.php`, { next: { revalidate: 86400 } });
  const data = await res.json() as { categories: Array<{ strCategory: string; strCategoryThumb: string }> };
  return data.categories.map(c => c.strCategory);
}

export async function getCategoriesWithThumbs(): Promise<Array<{ name: string; thumb: string }>> {
  const res = await fetch(`${BASE}/categories.php`, { next: { revalidate: 86400 } });
  const data = await res.json() as { categories: Array<{ strCategory: string; strCategoryThumb: string }> };
  return data.categories.map(c => ({ name: c.strCategory, thumb: c.strCategoryThumb }));
}
