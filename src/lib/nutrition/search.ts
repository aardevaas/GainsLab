import type { FoodItem } from './types';

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
const OFF_BASE = 'https://world.openfoodfacts.org/cgi/search.pl';

const USDA_KEY = process.env.USDA_API_KEY ?? 'DEMO_KEY';

const ENERGY_ID = 1008;
const PROTEIN_ID = 1003;
const FAT_ID = 1004;
const CARB_ID = 1005;
const FIBER_ID = 1079;

type UsdaNutrient = { nutrientId: number; value: number };
type UsdaFood = {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  foodNutrients: UsdaNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
};
type OffProduct = {
  _id?: string;
  product_name?: string;
  brands?: string;
  serving_size?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
  };
};

function nv(nutrients: UsdaNutrient[], id: number): number {
  return nutrients.find(n => n.nutrientId === id)?.value ?? 0;
}

async function searchUSDA(query: string): Promise<FoodItem[]> {
  const url = new URL(`${USDA_BASE}/foods/search`);
  url.searchParams.set('query', query);
  url.searchParams.set('api_key', USDA_KEY);
  url.searchParams.set('pageSize', '8');
  url.searchParams.set('dataType', 'Foundation,SR Legacy');

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const data = await res.json() as { foods?: UsdaFood[] };
  return (data.foods ?? []).map<FoodItem>(f => ({
    id: `usda_${f.fdcId}`,
    name: f.description,
    brand: f.brandOwner ?? f.brandName,
    source: 'usda',
    per100g: {
      calories: Math.round(nv(f.foodNutrients, ENERGY_ID)),
      proteinG: Math.round(nv(f.foodNutrients, PROTEIN_ID) * 10) / 10,
      carbsG: Math.round(nv(f.foodNutrients, CARB_ID) * 10) / 10,
      fatG: Math.round(nv(f.foodNutrients, FAT_ID) * 10) / 10,
      fiberG: Math.round(nv(f.foodNutrients, FIBER_ID) * 10) / 10,
    },
    servingSize: f.servingSize,
    servingUnit: f.servingSizeUnit,
  }));
}

async function searchOFF(query: string): Promise<FoodItem[]> {
  const url = new URL(OFF_BASE);
  url.searchParams.set('search_terms', query);
  url.searchParams.set('search_simple', '1');
  url.searchParams.set('action', 'process');
  url.searchParams.set('json', '1');
  url.searchParams.set('page_size', '8');
  url.searchParams.set('fields', 'product_name,brands,serving_size,nutriments,_id');

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const data = await res.json() as { products?: OffProduct[] };
  return (data.products ?? [])
    .filter(p => p.product_name && p.nutriments?.['energy-kcal_100g'] != null)
    .map<FoodItem>(p => ({
      id: `off_${p._id ?? Math.random().toString(36).slice(2)}`,
      name: p.product_name!,
      brand: p.brands?.split(',')[0].trim(),
      source: 'off',
      per100g: {
        calories: Math.round(p.nutriments!['energy-kcal_100g'] ?? 0),
        proteinG: Math.round((p.nutriments!.proteins_100g ?? 0) * 10) / 10,
        carbsG: Math.round((p.nutriments!.carbohydrates_100g ?? 0) * 10) / 10,
        fatG: Math.round((p.nutriments!.fat_100g ?? 0) * 10) / 10,
        fiberG: Math.round((p.nutriments!.fiber_100g ?? 0) * 10) / 10,
      },
    }));
}

export async function searchFoods(query: string): Promise<FoodItem[]> {
  if (query.trim().length < 2) return [];

  const [usda, off] = await Promise.allSettled([
    searchUSDA(query),
    searchOFF(query),
  ]);

  const usdaItems = usda.status === 'fulfilled' ? usda.value : [];
  const offItems = off.status === 'fulfilled' ? off.value : [];
  return [...usdaItems.slice(0, 6), ...offItems.slice(0, 4)];
}
