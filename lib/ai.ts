import "server-only";
import { slugify } from "./define";
import { CATEGORIES, DIETS, DIFFICULTIES, type Category, type Diet, type Difficulty, type Recipe } from "./types";

/** True when an OpenAI key is configured on the server. The key itself never leaves this module. */
export function isAiEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export interface GenerateRequest {
  prompt: string;
  ingredients?: string;
  cuisine?: string;
  diet?: string;
  servings?: number;
  maxTime?: number;
}

const RECIPE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "description",
    "category",
    "cuisine",
    "difficulty",
    "prepTime",
    "cookTime",
    "waitTime",
    "waitLabel",
    "servings",
    "emoji",
    "diets",
    "tags",
    "ingredients",
    "steps",
    "tips",
  ],
  properties: {
    title: { type: "string" },
    description: { type: "string", description: "One appetizing sentence." },
    category: { type: "string", enum: [...CATEGORIES] },
    cuisine: { type: "string" },
    difficulty: { type: "string", enum: [...DIFFICULTIES] },
    prepTime: { type: "integer", description: "Minutes" },
    cookTime: { type: "integer", description: "Minutes" },
    waitTime: {
      type: "integer",
      description: "Hands-off minutes not included in prep or cook, such as marinating, chilling, soaking, or rising. 0 if none.",
    },
    waitLabel: { type: "string", description: "One word for the waiting, e.g. Marinating or Chilling. Empty if none." },
    servings: { type: "integer" },
    emoji: { type: "string", description: "A single food emoji that represents the dish." },
    diets: { type: "array", items: { type: "string", enum: [...DIETS] } },
    tags: { type: "array", items: { type: "string" }, description: "Short lowercase kebab-case tags." },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "items"],
        properties: {
          title: { type: "string", description: "Group heading, or empty string for a single group." },
          items: {
            type: "array",
            items: { type: "string", description: "Quantity first, US units, e.g. '1 1/2 cups flour'." },
          },
        },
      },
    },
    steps: { type: "array", items: { type: "string" } },
    tips: { type: "array", items: { type: "string" } },
  },
} as const;

const SYSTEM_PROMPT = `You are a meticulous recipe developer for a home cook's personal recipe site.
Write one complete, reliable, home-kitchen recipe that actually works.
Rules:
- Ingredient lines start with the quantity (use fractions like 1/2, not decimals) then the unit, then the ingredient and prep.
- Steps are clear, ordered, and include heat levels, times, and doneness cues.
- Times are realistic integers in minutes. Use US units and Fahrenheit.
- Put marinating, chilling, soaking, rising, and resting in waitTime, never in prepTime or cookTime.
- Give safe internal temperatures for meat, poultry, and fish where it matters.
- Only list a diet (Vegetarian, Vegan, Gluten-Free, Dairy-Free) if the recipe truly qualifies.
- If the request is not about food or cooking, still return a simple, sensible recipe loosely inspired by it.`;

function buildUserPrompt(req: GenerateRequest): string {
  const lines = [`Request: ${req.prompt}`];
  if (req.ingredients) lines.push(`Use these ingredients where sensible: ${req.ingredients}`);
  if (req.cuisine) lines.push(`Cuisine: ${req.cuisine}`);
  if (req.diet) lines.push(`Must be: ${req.diet}`);
  if (req.servings) lines.push(`Servings: ${req.servings}`);
  if (req.maxTime) lines.push(`Total time must be at most ${req.maxTime} minutes.`);
  return lines.join("\n");
}

export class AiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function clampInt(n: unknown, min: number, max: number, fallback: number): number {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
}

function strings(value: unknown, max: number): string[] {
  return Array.isArray(value)
    ? value.filter((s): s is string => typeof s === "string" && s.trim().length > 0).slice(0, max).map((s) => s.trim().slice(0, 400))
    : [];
}

/** Never trust model output blindly: coerce it into a safe Recipe. */
function toRecipe(raw: Record<string, unknown>): Recipe {
  const title = String(raw.title ?? "Untitled recipe").slice(0, 120);
  const category = CATEGORIES.includes(raw.category as Category) ? (raw.category as Category) : "Main Dishes";
  const difficulty = DIFFICULTIES.includes(raw.difficulty as Difficulty) ? (raw.difficulty as Difficulty) : "Medium";
  const ingredients = (Array.isArray(raw.ingredients) ? raw.ingredients : [])
    .slice(0, 8)
    .map((g: { title?: unknown; items?: unknown }) => ({
      title: typeof g?.title === "string" && g.title.trim() ? g.title.trim().slice(0, 60) : undefined,
      items: strings(g?.items, 40),
    }))
    .filter((g) => g.items.length > 0);
  const steps = strings(raw.steps, 30);
  if (!ingredients.length || !steps.length) throw new AiError("The AI returned an incomplete recipe. Try again.", 502);

  return {
    slug: `ai-${slugify(title) || "recipe"}`,
    title,
    description: String(raw.description ?? "").slice(0, 300),
    category,
    cuisine: String(raw.cuisine ?? "Fusion").slice(0, 40) || "Fusion",
    difficulty,
    prepTime: clampInt(raw.prepTime, 0, 1440, 15),
    cookTime: clampInt(raw.cookTime, 0, 2880, 20),
    waitTime: clampInt(raw.waitTime, 0, 10080, 0) || undefined,
    waitLabel: String(raw.waitLabel ?? "").trim().slice(0, 24) || undefined,
    servings: clampInt(raw.servings, 1, 50, 4),
    emoji: String(raw.emoji ?? "🍽️").slice(0, 8) || "🍽️",
    diets: strings(raw.diets, 4).filter((d): d is Diet => DIETS.includes(d as Diet)),
    tags: strings(raw.tags, 8).map((t) => slugify(t)).filter(Boolean),
    ingredients,
    steps,
    tips: strings(raw.tips, 6),
  };
}

export async function generateRecipe(req: GenerateRequest): Promise<Recipe> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new AiError("AI generation isn't set up. Add OPENAI_API_KEY in your Vercel environment variables.", 503);

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";

  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(req) },
        ],
        response_format: { type: "json_schema", json_schema: { name: "recipe", strict: true, schema: RECIPE_SCHEMA } },
      }),
      signal: AbortSignal.timeout(55_000),
    });
  } catch {
    throw new AiError("Couldn't reach the AI service. Please try again.", 504);
  }

  if (!response.ok) {
    // Log details server-side only; never echo provider errors (or the key) to the browser.
    console.error("OpenAI error", response.status, await response.text().catch(() => ""));
    if (response.status === 401) throw new AiError("The OpenAI API key was rejected. Check the key in Vercel.", 502);
    if (response.status === 429) throw new AiError("The AI is busy or out of quota. Try again shortly.", 429);
    throw new AiError("The AI service returned an error. Please try again.", 502);
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string; refusal?: string } }[] };
  const message = data.choices?.[0]?.message;
  if (message?.refusal) throw new AiError("The AI declined that request. Try asking for a different dish.", 422);
  try {
    return toRecipe(JSON.parse(message?.content ?? ""));
  } catch (e) {
    if (e instanceof AiError) throw e;
    throw new AiError("The AI returned something unreadable. Try again.", 502);
  }
}
