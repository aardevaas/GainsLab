import type { FoodItem } from './types';

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
const OFF_SEARCH = 'https://world.openfoodfacts.org/cgi/search.pl';
const OFF_PRODUCT = 'https://world.openfoodfacts.org/api/v2/product';

const USDA_KEY = process.env.USDA_API_KEY ?? 'DEMO_KEY';

// USDA FoodData Central nutrient IDs
const N = {
  energy: 1008,
  protein: 1003,
  fat: 1004,
  carb: 1005,
  fiber: 1079,
  satFat: 1258,
  transFat: 1257,
  cholesterol: 1253,
  sodium: 1093,
  sugar: 2000, // Sugars, total
  sugarAlt: 1063, // Sugars, total including NLEA
} as const;

const r1 = (n: number | undefined): number | undefined =>
  n == null ? undefined : Math.round(n * 10) / 10;

type UsdaNutrient = { nutrientId: number; value: number };
type UsdaFood = {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  foodNutrients: UsdaNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
  gtinUpc?: string;
};

function nv(nutrients: UsdaNutrient[], id: number): number | undefined {
  return nutrients.find((n) => n.nutrientId === id)?.value;
}

async function searchUSDA(query: string): Promise<FoodItem[]> {
  const url = new URL(`${USDA_BASE}/foods/search`);
  url.searchParams.set('query', query);
  url.searchParams.set('api_key', USDA_KEY);
  url.searchParams.set('pageSize', '8');
  url.searchParams.set('dataType', 'Foundation,SR Legacy,Branded');

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const data = (await res.json()) as { foods?: UsdaFood[] };
  return (data.foods ?? []).map<FoodItem>((f) => {
    const fn = f.foodNutrients;
    return {
      id: `usda_${f.fdcId}`,
      name: f.description,
      brand: f.brandOwner ?? f.brandName,
      source: 'usda',
      verified: true, // lab-verified / authoritative
      barcode: f.gtinUpc,
      per100g: {
        calories: Math.round(nv(fn, N.energy) ?? 0),
        proteinG: r1(nv(fn, N.protein)) ?? 0,
        carbsG: r1(nv(fn, N.carb)) ?? 0,
        fatG: r1(nv(fn, N.fat)) ?? 0,
        fiberG: r1(nv(fn, N.fiber)) ?? 0,
        saturatedFatG: r1(nv(fn, N.satFat)),
        transFatG: r1(nv(fn, N.transFat)),
        cholesterolMg: r1(nv(fn, N.cholesterol)),
        sodiumMg: r1(nv(fn, N.sodium)),
        sugarG: r1(nv(fn, N.sugar) ?? nv(fn, N.sugarAlt)),
      },
      servingSize: f.servingSize,
      servingUnit: f.servingSizeUnit,
    };
  });
}

type OffNutriments = {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
  'saturated-fat_100g'?: number;
  'trans-fat_100g'?: number;
  cholesterol_100g?: number; // grams
  sodium_100g?: number; // grams
  sugars_100g?: number;
};
type OffProduct = {
  _id?: string;
  code?: string;
  product_name?: string;
  brands?: string;
  serving_size?: string;
  nutriments?: OffNutriments;
};

function offToItem(p: OffProduct): FoodItem | null {
  const n = p.nutriments;
  if (!p.product_name || n?.['energy-kcal_100g'] == null) return null;
  const code = p.code ?? p._id ?? Math.random().toString(36).slice(2);
  return {
    id: `off_${code}`,
    name: p.product_name,
    brand: p.brands?.split(',')[0].trim(),
    source: 'off',
    verified: false,
    barcode: p.code ?? p._id,
    per100g: {
      calories: Math.round(n['energy-kcal_100g'] ?? 0),
      proteinG: r1(n.proteins_100g) ?? 0,
      carbsG: r1(n.carbohydrates_100g) ?? 0,
      fatG: r1(n.fat_100g) ?? 0,
      fiberG: r1(n.fiber_100g) ?? 0,
      saturatedFatG: r1(n['saturated-fat_100g']),
      transFatG: r1(n['trans-fat_100g']),
      cholesterolMg: n.cholesterol_100g != null ? r1(n.cholesterol_100g * 1000) : undefined,
      sodiumMg: n.sodium_100g != null ? r1(n.sodium_100g * 1000) : undefined,
      sugarG: r1(n.sugars_100g),
    },
  };
}

async function searchOFF(query: string): Promise<FoodItem[]> {
  const url = new URL(OFF_SEARCH);
  url.searchParams.set('search_terms', query);
  url.searchParams.set('search_simple', '1');
  url.searchParams.set('action', 'process');
  url.searchParams.set('json', '1');
  url.searchParams.set('page_size', '8');
  url.searchParams.set(
    'fields',
    'product_name,brands,serving_size,nutriments,_id,code',
  );

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = (await res.json()) as { products?: OffProduct[] };
  return (data.products ?? []).map(offToItem).filter((x): x is FoodItem => x !== null);
}

/** Text search across providers; USDA (verified) first, then Open Food Facts. */
export async function searchFoods(query: string): Promise<FoodItem[]> {
  if (query.trim().length < 2) return [];
  const [usda, off] = await Promise.allSettled([searchUSDA(query), searchOFF(query)]);
  const usdaItems = usda.status === 'fulfilled' ? usda.value : [];
  const offItems = off.status === 'fulfilled' ? off.value : [];
  return [...usdaItems.slice(0, 6), ...offItems.slice(0, 4)];
}

/** Barcode lookup — Open Food Facts (global packaged-goods coverage). */
export async function getFoodByBarcode(barcode: string): Promise<FoodItem | null> {
  const res = await fetch(`${OFF_PRODUCT}/${encodeURIComponent(barcode)}.json`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { status?: number; product?: OffProduct };
  if (data.status !== 1 || !data.product) return null;
  return offToItem({ ...data.product, code: barcode });
}

/** Pure mapper: canonical FoodItem → a `foods` cache row (per-100g basis). */
export function foodItemToCacheRow(item: FoodItem) {
  const [source, ...rest] = item.id.split('_');
  const p = item.per100g;
  return {
    source,
    source_id: rest.join('_'),
    barcode: item.barcode ?? null,
    name: item.name,
    brand: item.brand ?? null,
    serving_qty: item.servingSize ?? null,
    serving_unit: item.servingUnit ?? null,
    serving_grams: null,
    calories: p.calories,
    protein_g: p.proteinG,
    carbs_g: p.carbsG,
    fat_g: p.fatG,
    saturated_fat_g: p.saturatedFatG ?? null,
    trans_fat_g: p.transFatG ?? null,
    cholesterol_mg: p.cholesterolMg ?? null,
    sodium_mg: p.sodiumMg ?? null,
    fiber_g: p.fiberG ?? null,
    sugar_g: p.sugarG ?? null,
    added_sugar_g: p.addedSugarG ?? null,
    micronutrients: item.micronutrients ?? null,
    verified: item.verified ?? false,
  };
}
