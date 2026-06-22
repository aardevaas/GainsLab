export type RecipeIngredient = {
  name: string;
  measure: string;
};

export type Recipe = {
  id: string;
  name: string;
  category: string;
  area: string;
  instructions: string;
  thumbnail: string;
  tags: string[];
  youtube: string | null;
  source: string | null;
  ingredients: RecipeIngredient[];
};

export type RecipeSummary = {
  id: string;
  name: string;
  thumbnail: string;
  category?: string;
  area?: string;
};
