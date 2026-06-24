import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  searchFoods,
  getFoodByBarcode,
  foodItemToCacheRow,
} from '@/lib/nutrition/search';
import type { FoodItem } from '@/lib/nutrition/types';

// Write provider results into the `foods` cache (build our proprietary DB over
// time). Best-effort: a cache failure never breaks search.
async function cacheItems(items: FoodItem[]): Promise<void> {
  if (items.length === 0) return;
  try {
    const supabase = await createClient();
    await supabase
      .from('foods')
      .upsert(items.map(foodItemToCacheRow), { onConflict: 'source,source_id' });
  } catch {
    // ignore — caching is an optimization, not a requirement
  }
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const barcode = params.get('barcode');

  if (barcode) {
    const item = await getFoodByBarcode(barcode);
    if (item) await cacheItems([item]);
    return NextResponse.json({ items: item ? [item] : [] });
  }

  const q = params.get('q') ?? '';
  if (q.trim().length < 2) return NextResponse.json({ items: [] });

  const items = await searchFoods(q);
  await cacheItems(items);
  return NextResponse.json({ items });
}
