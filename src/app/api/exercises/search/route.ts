import { type NextRequest, NextResponse } from 'next/server';
import { searchExercises } from '@/lib/exercises/db';
import { cacheExercises } from '@/lib/exercises/cache';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const items = await searchExercises({
    query: searchParams.get('q') ?? undefined,
    muscle: searchParams.get('muscle') ?? undefined,
    equipment: searchParams.get('equipment') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    level: searchParams.get('level') ?? undefined,
    limit: Number(searchParams.get('limit') ?? '20'),
  });
  await cacheExercises(items);
  return NextResponse.json({ items });
}
