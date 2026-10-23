import { NextResponse, type NextRequest } from "next/server";
import { AiError, generateRecipe, isAiEnabled, type GenerateRequest } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Best-effort, per-instance limit so a stray script can't burn through the API budget.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 15;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export async function GET() {
  return NextResponse.json({ enabled: isAiEnabled() });
}

export async function POST(request: NextRequest) {
  // Only accept requests made from this site's own pages.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Give it a few minutes." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const req: GenerateRequest = {
    prompt: text(body.prompt, 300),
    ingredients: text(body.ingredients, 300) || undefined,
    cuisine: text(body.cuisine, 40) || undefined,
    diet: text(body.diet, 40) || undefined,
    servings: Number.isInteger(body.servings) ? Math.min(20, Math.max(1, body.servings as number)) : undefined,
    maxTime: Number.isInteger(body.maxTime) ? Math.min(600, Math.max(5, body.maxTime as number)) : undefined,
  };
  if (!req.prompt && !req.ingredients) {
    return NextResponse.json({ error: "Describe a dish or list some ingredients." }, { status: 400 });
  }
  if (!req.prompt) req.prompt = "Something delicious using the listed ingredients";

  try {
    const recipe = await generateRecipe(req);
    return NextResponse.json({ recipe });
  } catch (e) {
    if (e instanceof AiError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
