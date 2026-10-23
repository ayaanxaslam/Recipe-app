import { photos } from "@/data/photos";
import { recipes as baseRecipes } from "@/data/recipes";
import { CATEGORIES, type Recipe, type RecipeSummary } from "./types";

const recipes: Recipe[] = baseRecipes.map((r) => (photos[r.slug] ? { ...r, photo: photos[r.slug] } : r));

const bySlug = new Map(recipes.map((r) => [r.slug, r]));

export function getAllRecipes(): Recipe[] {
  return recipes;
}

export function getRecipe(slug: string): Recipe | undefined {
  return bySlug.get(slug);
}

export function totalTime(r: Pick<Recipe, "prepTime" | "cookTime" | "waitTime">): number {
  return r.prepTime + r.cookTime + (r.waitTime ?? 0);
}

export function toSummary(r: Recipe): RecipeSummary {
  return {
    slug: r.slug,
    title: r.title,
    description: r.description,
    category: r.category,
    cuisine: r.cuisine,
    difficulty: r.difficulty,
    totalTime: totalTime(r),
    waitTime: r.waitTime,
    servings: r.servings,
    emoji: r.emoji,
    photo: r.photo?.thumb,
    diets: r.diets,
    tags: r.tags,
    ingredientText: r.ingredients.flatMap((g) => g.items).join("\n"),
  };
}

export function getSummaries(): RecipeSummary[] {
  return recipes.map(toSummary);
}

export function countBy<K extends string>(key: (r: Recipe) => K): Map<K, number> {
  const counts = new Map<K, number>();
  for (const r of recipes) counts.set(key(r), (counts.get(key(r)) ?? 0) + 1);
  return counts;
}

export function usedCuisines(): string[] {
  return [...new Set(recipes.map((r) => r.cuisine))].sort();
}

export function usedCategories(): string[] {
  const used = new Set<string>(recipes.map((r) => r.category));
  return CATEGORIES.filter((c) => used.has(c));
}

/** Recipes that share a category or cuisine, best matches first. */
export function getRelated(recipe: Recipe, limit = 4): Recipe[] {
  return recipes
    .filter((r) => r.slug !== recipe.slug)
    .map((r) => ({
      r,
      score:
        (r.category === recipe.category ? 2 : 0) +
        (r.cuisine === recipe.cuisine ? 3 : 0) +
        r.tags.filter((t) => recipe.tags.includes(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.r.title.localeCompare(b.r.title))
    .slice(0, limit)
    .map((x) => x.r);
}

/** A stable pick that changes once a day. */
export function getDailyPicks(count: number, date = new Date()): Recipe[] {
  const day = Math.floor(date.getTime() / 86_400_000);
  const picks: Recipe[] = [];
  const used = new Set<number>();
  let seed = day;
  while (picks.length < Math.min(count, recipes.length)) {
    seed = (seed * 9301 + 49297) % 233280;
    const i = seed % recipes.length;
    if (!used.has(i)) {
      used.add(i);
      picks.push(recipes[i]);
    }
  }
  return picks;
}
