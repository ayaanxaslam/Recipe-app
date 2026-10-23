export const CATEGORIES = [
  "Breakfast & Brunch",
  "Appetizers & Snacks",
  "Soups & Stews",
  "Salads",
  "Main Dishes",
  "Seafood",
  "Meatless Mains",
  "Pasta & Noodles",
  "Rice & Grains",
  "Sides",
  "Desserts",
  "Breads & Baking",
  "Drinks",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CUISINES = [
  "African",
  "American",
  "British",
  "Caribbean",
  "Chinese",
  "French",
  "Greek",
  "Indian",
  "Italian",
  "Japanese",
  "Korean",
  "Latin American",
  "Mediterranean",
  "Mexican",
  "Middle Eastern",
  "Moroccan",
  "Spanish",
  "Thai",
  "Vietnamese",
] as const;
export type Cuisine = (typeof CUISINES)[number];

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIETS = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free"] as const;
export type Diet = (typeof DIETS)[number];

export interface IngredientGroup {
  /** Optional sub-heading, e.g. "For the sauce" */
  title?: string;
  /** Ingredient lines, e.g. "2 cups all-purpose flour". A leading quantity is scaled with servings. */
  items: string[];
}

/** A freely licensed food photo stored in public/images/recipes. */
export interface Photo {
  /** Large image, e.g. /images/recipes/shakshuka.jpg */
  src: string;
  /** Small image for cards */
  thumb: string;
  artist: string;
  license: string;
  licenseUrl?: string;
  /** Wikimedia Commons file page */
  source: string;
}

export interface Recipe {
  slug: string;
  title: string;
  description: string;
  category: Category;
  cuisine: Cuisine | string;
  difficulty: Difficulty;
  /** Minutes */
  prepTime: number;
  /** Minutes */
  cookTime: number;
  servings: number;
  emoji: string;
  diets: Diet[];
  tags: string[];
  ingredients: IngredientGroup[];
  steps: string[];
  tips?: string[];
  photo?: Photo;
}

/** Lightweight version of a recipe sent to the browser for searching and listing. */
export interface RecipeSummary {
  slug: string;
  title: string;
  description: string;
  category: Category;
  cuisine: string;
  difficulty: Difficulty;
  totalTime: number;
  servings: number;
  emoji: string;
  /** Card-sized photo URL, if the recipe has one */
  photo?: string;
  diets: Diet[];
  tags: string[];
  /** Every ingredient line joined, used for ingredient search */
  ingredientText: string;
}
