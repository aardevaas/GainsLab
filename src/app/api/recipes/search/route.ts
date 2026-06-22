import { NextRequest, NextResponse } from 'next/server';
import { searchRecipes, getRecipesByCategory } from '@/lib/recipes/mealdb';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  const category = request.nextUrl.searchParams.get('category') ?? '';

  if (category) {
    const items = await getRecipesByCategory(category, 24);
    return NextResponse.json({ items });
  }

  if (q.trim().length < 2) return NextResponse.json({ items: [] });
  const items = await searchRecipes(q);
  return NextResponse.json({ items });
}
