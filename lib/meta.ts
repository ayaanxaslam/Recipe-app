import type { Category } from "./types";

export const CATEGORY_META: Record<Category, { emoji: string; blurb: string; hue: number }> = {
  "Breakfast & Brunch": { emoji: "🍳", blurb: "Slow weekends and quick weekdays", hue: 42 },
  "Appetizers & Snacks": { emoji: "🥟", blurb: "Small bites and party plates", hue: 18 },
  "Soups & Stews": { emoji: "🍲", blurb: "Bowls of comfort", hue: 28 },
  Salads: { emoji: "🥗", blurb: "Crisp, bright, and filling", hue: 95 },
  "Main Dishes": { emoji: "🍗", blurb: "Meat and poultry centerpieces", hue: 12 },
  Seafood: { emoji: "🐟", blurb: "Fish and shellfish", hue: 195 },
  "Meatless Mains": { emoji: "🥦", blurb: "Hearty without the meat", hue: 120 },
  "Pasta & Noodles": { emoji: "🍝", blurb: "Twirls, slurps, and bakes", hue: 35 },
  "Rice & Grains": { emoji: "🍚", blurb: "Pilafs, risottos, and bowls", hue: 50 },
  Sides: { emoji: "🥔", blurb: "Everything on the side", hue: 65 },
  Desserts: { emoji: "🍰", blurb: "Something sweet", hue: 340 },
  "Breads & Baking": { emoji: "🍞", blurb: "Loaves, rolls, and bakes", hue: 30 },
  Drinks: { emoji: "🥤", blurb: "Sips hot and cold", hue: 280 },
};

/** Warm gradient behind a recipe's emoji, derived from its category. */
export function artGradient(category: Category | string, seed: string): string {
  const base = CATEGORY_META[category as Category]?.hue ?? 30;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  const hue = (base + (h % 40) - 20 + 360) % 360;
  return `radial-gradient(120% 120% at 20% 10%, hsl(${hue} 85% 88%) 0%, hsl(${(hue + 25) % 360} 70% 75%) 55%, hsl(${(hue + 50) % 360} 55% 62%) 100%)`;
}

export function formatMinutes(min: number): string {
  if (min >= 1440) {
    const d = Math.floor(min / 1440);
    const h = Math.round((min % 1440) / 60);
    return `${d} ${d === 1 ? "day" : "days"}${h ? ` ${h} hr` : ""}`;
  }
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}
