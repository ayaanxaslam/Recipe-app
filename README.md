# Mise — personal recipe website

A private recipe collection: 222 recipes across 13 categories and 19 cuisines, with search by name or by the ingredients you have, filters, a servings scaler, and an optional AI recipe generator.

No accounts, no database, no external APIs needed. All recipes live in TypeScript files in `data/recipes/`. Nothing you do on the site is saved: no history, no preferences, no cookies.

## Run locally

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000.

## Features

- **Search** recipes by name, description, tags, or ingredients (`/recipes?q=curry`)
- **"What's in my fridge?"**: list ingredients and see recipes that use all of them (`/recipes?with=chicken,rice`). "Rice" won't match "rice vinegar" and "chicken" won't match "chicken broth".
- **Filters**: category, cuisine, diet (vegetarian, vegan, gluten-free, dairy-free), difficulty, and max time. Filters live in the URL, so you can bookmark a search.
- **Recipe pages**: scale servings (quantities update), tick off ingredients and steps as you go, keep the screen awake while cooking, and print.
- **Surprise me** (`/random`) opens a random recipe.
- **AI Kitchen** (`/generate`) is optional; see below.

## Adding your own recipes

Open the right file in `data/recipes/` (for example `desserts.ts`) and add an entry:

```ts
{
  title: "Grandma's Apple Crumble",
  description: "Warm spiced apples under a buttery oat crumble.",
  cuisine: "British",
  difficulty: "Easy",
  prepTime: 15,
  cookTime: 40,
  servings: 6,
  emoji: "🍎",
  diets: ["Vegetarian"],
  tags: ["fall"],
  ingredients: ["6 apples, sliced", "1 cup rolled oats", "1/2 cup butter"],
  steps: ["Heat the oven to 375°F.", "..."],
  tips: ["Optional notes."],
},
```

Start each ingredient line with its quantity (`1 1/2 cups ...`) so the servings scaler can adjust it. The URL slug and the "quick" tag (30 minutes or less) are added automatically.

## Optional: AI recipe generation

The AI Kitchen calls OpenAI from a **server-side** route only (`app/api/generate/route.ts` → `lib/ai.ts`, which is marked `server-only`). The key never reaches the browser. Without a key, the page shows a friendly "turned off" message and the rest of the site works normally.

To turn it on:

1. In Vercel, go to **Project → Settings → Environment Variables** and add `OPENAI_API_KEY`. Do **not** prefix it with `NEXT_PUBLIC_`.
2. Optionally set `OPENAI_MODEL` (default: `gpt-4.1-mini`).
3. Redeploy.

To test locally, copy `.env.example` to `.env.local` and fill in the key. `.env.local` is git-ignored.

Safeguards: input length limits, a same-origin check, and a basic per-IP rate limit (15 requests per 10 minutes). The site URL is public even though nobody else uses the site, so also set a **monthly spending limit** in your OpenAI dashboard.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import it at vercel.com/new. Vercel detects Next.js automatically, so no settings are needed.
3. (Optional) Add the environment variables above.

Recipe pages are pre-rendered at build time, so the site is fast and works with no backend beyond the optional AI route.

## Project layout

```
app/                  pages and the /api/generate route
components/           UI components (cards, browser, recipe view, AI kitchen)
data/recipes/         all recipes, one file per category
lib/                  types, search, quantity scaling, AI client (server-only)
```
