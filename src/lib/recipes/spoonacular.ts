const BASE = 'https://api.spoonacular.com';
const KEY = process.env.SPOONACULAR_API_KEY!;

export type SpoonRecipeSummary = {
  id: number;
  title: string;
  image: string;
  calories: number;
  protein: number;   // g
  carbs: number;     // g
  fat: number;       // g
  servings: number;
  readyInMinutes: number;
  diets: string[];
};

export type SpoonIngredient = {
  name: string;
  amount: number;
  unit: string;
};

export type SpoonRecipeDetail = SpoonRecipeSummary & {
  summary: string;
  instructions: string;
  extendedIngredients: SpoonIngredient[];
  sourceUrl: string | null;
};

export type SpoonDiet =
  | 'vegetarian' | 'vegan' | 'gluten free' | 'ketogenic'
  | 'paleo' | 'whole30' | 'dairy free' | 'low fodmap';

export const SPOON_DIETS: { id: SpoonDiet; label: string }[] = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten free', label: 'Gluten-free' },
  { id: 'ketogenic', label: 'Keto' },
  { id: 'paleo', label: 'Paleo' },
  { id: 'dairy free', label: 'Dairy-free' },
];

type RawNutrient = { name: string; amount: number };
type RawResult = {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  diets: string[];
  nutrition: { nutrients: RawNutrient[] };
};

function extractMacros(nutrients: RawNutrient[]) {
  const get = (name: string) => Math.round(nutrients.find(n => n.name === name)?.amount ?? 0);
  return { calories: get('Calories'), protein: get('Protein'), carbs: get('Carbohydrates'), fat: get('Fat') };
}

export async function searchSpoonacular(
  query: string,
  diet?: SpoonDiet,
  number = 12,
): Promise<SpoonRecipeSummary[]> {
  const params = new URLSearchParams({
    apiKey: KEY,
    query,
    number: String(number),
    addRecipeNutrition: 'true',
    ...(diet ? { diet } : {}),
  });

  const res = await fetch(`${BASE}/recipes/complexSearch?${params}`, {
    next: { revalidate: 86400 }, // cache 24h to preserve API quota
  });
  if (!res.ok) return [];
  const data = await res.json() as { results: RawResult[] };
  return (data.results ?? []).map(r => ({
    id: r.id,
    title: r.title,
    image: r.image,
    servings: r.servings,
    readyInMinutes: r.readyInMinutes,
    diets: r.diets ?? [],
    ...extractMacros(r.nutrition?.nutrients ?? []),
  }));
}

export async function getSpoonacularRecipe(id: number): Promise<SpoonRecipeDetail | null> {
  const params = new URLSearchParams({ apiKey: KEY, includeNutrition: 'true' });
  const res = await fetch(`${BASE}/recipes/${id}/information?${params}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const r = await res.json() as RawResult & {
    summary: string;
    instructions: string;
    extendedIngredients: Array<{ name: string; amount: number; unit: string }>;
    sourceUrl: string | null;
  };
  return {
    id: r.id,
    title: r.title,
    image: r.image,
    servings: r.servings,
    readyInMinutes: r.readyInMinutes,
    diets: r.diets ?? [],
    summary: (r.summary ?? '').replace(/<[^>]+>/g, ''), // strip HTML
    instructions: (r.instructions ?? '').replace(/<[^>]+>/g, ''),
    extendedIngredients: (r.extendedIngredients ?? []).map(i => ({
      name: i.name,
      amount: i.amount,
      unit: i.unit,
    })),
    sourceUrl: r.sourceUrl ?? null,
    ...extractMacros(r.nutrition?.nutrients ?? []),
  };
}
