import type { Category, Cuisine, Diet, Difficulty, IngredientGroup, Recipe } from "./types";

/** The shape used when writing recipes in data/recipes. Slug and category are filled in for you. */
export interface RecipeInput {
  title: string;
  description: string;
  cuisine: Cuisine;
  difficulty: Difficulty;
  prepTime: number;
  cookTime: number;
  waitTime?: number;
  waitLabel?: string;
  servings: number;
  emoji: string;
  diets?: Diet[];
  tags?: string[];
  /** Either a flat list of lines or titled groups */
  ingredients: string[] | IngredientGroup[];
  steps: string[];
  tips?: string[];
}

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toGroups(ingredients: RecipeInput["ingredients"]): IngredientGroup[] {
  if (ingredients.length === 0) return [];
  return typeof ingredients[0] === "string"
    ? [{ items: ingredients as string[] }]
    : (ingredients as IngredientGroup[]);
}

export function defineRecipes(category: Category, inputs: RecipeInput[]): Recipe[] {
  return inputs.map((r) => {
    const tags = new Set(r.tags ?? []);
    if (r.prepTime + r.cookTime + (r.waitTime ?? 0) <= 30) tags.add("quick");
    return {
      ...r,
      slug: slugify(r.title),
      category,
      diets: r.diets ?? [],
      tags: [...tags],
      ingredients: toGroups(r.ingredients),
    };
  });
}
