'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Recipe, RecipeIngredient } from '@/lib/recipes/types';
import type { Json } from '@/types/database';

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('saved_recipes').upsert(
    {
      user_id: user.id,
      recipe_id: recipe.id,
      source: 'themealdb' as const,
      recipe_snapshot: recipe as unknown as Json,
      notes: null,
    },
    { onConflict: 'user_id,recipe_id' }
  );
  revalidatePath('/recipes/saved');
}

export async function unsaveRecipe(recipeId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('saved_recipes')
    .delete()
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId);
  revalidatePath('/recipes/saved');
}

function weekOf(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // align to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Produce: ['tomato', 'onion', 'garlic', 'carrot', 'potato', 'lettuce', 'spinach', 'broccoli', 'pepper', 'celery', 'cucumber', 'zucchini', 'mushroom', 'avocado', 'lemon', 'lime', 'orange', 'apple', 'banana', 'ginger', 'herb', 'basil', 'parsley', 'cilantro', 'thyme', 'rosemary', 'chilli', 'capsicum', 'courgette', 'aubergine', 'eggplant', 'spring onion', 'shallot', 'leek'],
  'Meat & Fish': ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'salmon', 'tuna', 'shrimp', 'prawn', 'cod', 'fish', 'steak', 'bacon', 'ham', 'sausage', 'mince', 'ground', 'filet', 'fillet', 'anchovy', 'sardine', 'tilapia', 'sea bass', 'haddock'],
  'Dairy & Eggs': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg', 'cheddar', 'parmesan', 'mozzarella', 'ricotta', 'feta', 'brie', 'gouda', 'double cream', 'single cream', 'clotted cream'],
  'Grains & Bread': ['flour', 'rice', 'pasta', 'bread', 'noodle', 'oat', 'quinoa', 'barley', 'couscous', 'tortilla', 'pita', 'breadcrumb', 'cornmeal', 'polenta'],
  'Cans & Jars': ['tomato paste', 'tomato sauce', 'canned', 'coconut milk', 'beans', 'chickpeas', 'lentils', 'olives', 'capers', 'anchovies', 'kidney bean'],
  'Pantry': ['oil', 'vinegar', 'salt', 'pepper', 'sugar', 'honey', 'soy sauce', 'sauce', 'stock', 'broth', 'dried', 'spice', 'paprika', 'cumin', 'turmeric', 'cinnamon', 'nutmeg', 'cocoa', 'vanilla', 'baking powder', 'baking soda', 'cornstarch', 'cornflour', 'mustard', 'ketchup', 'mayonnaise', 'tabasco', 'worcestershire'],
};

function categorize(name: string): string {
  const lower = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return 'Other';
}

export async function addRecipeIngredientsToGrocery(ingredients: RecipeIngredient[]): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const wo = weekOf();

  // Get or create current week's list
  let listId: string;
  const { data: existing } = await supabase
    .from('grocery_lists')
    .select('id')
    .eq('user_id', user.id)
    .eq('week_of', wo)
    .single();

  if (existing) {
    listId = existing.id;
  } else {
    const { data: created, error } = await supabase
      .from('grocery_lists')
      .insert({ user_id: user.id, name: 'Weekly grocery list', week_of: wo, is_complete: false })
      .select('id')
      .single();
    if (error || !created) throw new Error('Failed to create grocery list');
    listId = created.id;
  }

  await supabase.from('grocery_items').insert(
    ingredients.map(ing => ({
      list_id: listId,
      ingredient: ing.name,
      quantity: null as null,
      unit: ing.measure || null as null,
      is_checked: false,
      category: categorize(ing.name),
    }))
  );

  revalidatePath('/grocery');
}
