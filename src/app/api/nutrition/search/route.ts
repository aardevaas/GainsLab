import { type NextRequest, NextResponse } from 'next/server';
import { searchFoods } from '@/lib/nutrition/search';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (q.trim().length < 2) return NextResponse.json({ items: [] });
  const items = await searchFoods(q);
  return NextResponse.json({ items });
}
