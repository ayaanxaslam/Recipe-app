import type { Diet, Difficulty, RecipeSummary } from "./types";

export type SortKey = "relevance" | "name" | "quickest" | "fewest-ingredients";

export interface SearchOptions {
  query?: string;
  ingredients?: string[];
  categories?: string[];
  cuisines?: string[];
  diets?: Diet[];
  difficulties?: Difficulty[];
  maxTime?: number | null;
  sort?: SortKey;
}

export function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Very small stemmer so "tomatoes" finds "tomato" and "eggs" finds "egg". */
function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.length > 4 && word.endsWith("oes")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function tokens(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(stem);
}

interface Indexed {
  recipe: RecipeSummary;
  title: string;
  titleWords: string[];
  meta: string;
  ingredients: string;
  ingredientLines: string[];
}

const indexCache = new WeakMap<RecipeSummary[], Indexed[]>();

function buildIndex(recipes: RecipeSummary[]): Indexed[] {
  const cached = indexCache.get(recipes);
  if (cached) return cached;
  const index = recipes.map((recipe) => ({
    recipe,
    title: tokens(recipe.title).join(" "),
    titleWords: tokens(recipe.title),
    meta: tokens(
      [recipe.description, recipe.cuisine, recipe.category, ...recipe.tags, ...recipe.diets].join(" "),
    ).join(" "),
    ingredients: tokens(recipe.ingredientText).join(" "),
    ingredientLines: recipe.ingredientText.split("\n").map((line) => tokens(line).join(" ")),
  }));
  indexCache.set(recipes, index);
  return index;
}

/** Whole-word-prefix match: "chick" matches "chicken", "pea" does not match "chickpea". */
function hasWord(haystack: string, needle: string): boolean {
  if (!needle) return true;
  return (" " + haystack).includes(" " + needle);
}

/**
 * Words that turn an ingredient into a different pantry item, so having "rice"
 * doesn't match "rice vinegar" and having "chicken" doesn't match "chicken broth".
 */
const COMPOUND_WORDS = new Set(
  ["vinegar", "broth", "stock", "wine", "flour", "noodle", "paper", "bouillon", "powder", "seasoning", "paste", "extract"].map(stem),
);

/** Does any ingredient line genuinely contain this ingredient? */
function hasIngredient(lines: string[], phrase: string): boolean {
  const t = tokens(phrase).join(" ");
  if (!t) return false;
  const needle = " " + t;
  return lines.some((line) => {
    const hay = " " + line + " ";
    let i = hay.indexOf(needle);
    while (i !== -1) {
      const rest = hay.slice(i + needle.length);
      // Allow plurals/prefix forms ("egg" → "eggs" already stemmed, "chick" → "chicken").
      const wordEnd = rest.indexOf(" ");
      const nextWord = rest.slice(wordEnd + 1).split(" ")[0];
      if (!COMPOUND_WORDS.has(nextWord)) return true;
      i = hay.indexOf(needle, i + 1);
    }
    return false;
  });
}

export function searchRecipes(recipes: RecipeSummary[], opts: SearchOptions): RecipeSummary[] {
  const queryTokens = tokens(opts.query ?? "");
  const wanted = (opts.ingredients ?? []).map((i) => i.trim()).filter(Boolean);

  const scored: { recipe: RecipeSummary; score: number }[] = [];

  for (const item of buildIndex(recipes)) {
    const r = item.recipe;
    if (opts.categories?.length && !opts.categories.includes(r.category)) continue;
    if (opts.cuisines?.length && !opts.cuisines.includes(r.cuisine)) continue;
    if (opts.difficulties?.length && !opts.difficulties.includes(r.difficulty)) continue;
    if (opts.diets?.length && !opts.diets.every((d) => r.diets.includes(d))) continue;
    if (opts.maxTime && r.totalTime > opts.maxTime) continue;
    if (wanted.length && !wanted.every((w) => hasIngredient(item.ingredientLines, w))) continue;

    let score = 0;
    let matchedAll = true;
    for (const t of queryTokens) {
      let s = 0;
      if (item.titleWords.includes(t)) s += 12;
      else if (hasWord(item.title, t)) s += 8;
      if (hasWord(item.meta, t)) s += 3;
      if (hasWord(item.ingredients, t)) s += 4;
      if (s === 0) {
        matchedAll = false;
        break;
      }
      score += s;
    }
    if (!matchedAll) continue;
    if (queryTokens.length > 1 && item.title.includes(queryTokens.join(" "))) score += 15;
    scored.push({ recipe: r, score });
  }

  const sort = opts.sort ?? "relevance";
  scored.sort((a, b) => {
    if (sort === "name") return a.recipe.title.localeCompare(b.recipe.title);
    if (sort === "quickest") return a.recipe.totalTime - b.recipe.totalTime || a.recipe.title.localeCompare(b.recipe.title);
    if (sort === "fewest-ingredients")
      return countLines(a.recipe) - countLines(b.recipe) || a.recipe.title.localeCompare(b.recipe.title);
    return b.score - a.score || a.recipe.title.localeCompare(b.recipe.title);
  });

  return scored.map((s) => s.recipe);
}

function countLines(r: RecipeSummary): number {
  return r.ingredientText.split("\n").length;
}
