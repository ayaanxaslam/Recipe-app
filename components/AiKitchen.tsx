"use client";

import Link from "next/link";
import { useState } from "react";
import { DIETS, type Recipe } from "@/lib/types";
import { RecipeView } from "./RecipeView";

const IDEAS = [
  "A cozy one-pot dinner for a rainy night",
  "Something impressive but easy for a date night",
  "High-protein vegetarian lunch I can meal prep",
  "A dessert with only 5 ingredients",
];

export function AiKitchen({ enabled, cuisines }: { enabled: boolean; cuisines: string[] }) {
  const [prompt, setPrompt] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [diet, setDiet] = useState("");
  const [servings, setServings] = useState(4);
  const [maxTime, setMaxTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  async function generate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!prompt.trim() && !ingredients.trim()) {
      setError("Describe a dish or list a few ingredients.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          ingredients,
          cuisine,
          diet,
          servings,
          maxTime: maxTime ? Number(maxTime) : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setRecipe(data.recipe);
      requestAnimationFrame(() => document.getElementById("ai-result")?.scrollIntoView({ behavior: "smooth" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="no-print mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">AI Kitchen</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Invent something new</h1>
        <p className="mt-3 text-muted">
          Describe a craving or list what you have, and get a full recipe. Results aren&apos;t saved — they disappear when
          you leave the page.
        </p>
      </div>

      {!enabled ? (
        <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-line bg-surface p-8 text-center">
          <p className="text-5xl">🔌</p>
          <h2 className="mt-4 font-serif text-2xl font-semibold">AI generation is turned off</h2>
          <p className="mt-2 text-muted">
            Everything else on the site works without it. To enable this page, add an{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm">OPENAI_API_KEY</code> environment variable in your
            Vercel project settings (or <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm">.env.local</code> when
            running locally) and redeploy.
          </p>
          <Link href="/recipes" className="mt-6 inline-block rounded-xl bg-accent px-5 py-3 font-semibold text-accent-ink">
            Browse saved recipes
          </Link>
        </div>
      ) : (
        <form onSubmit={generate} className="no-print mx-auto mt-10 max-w-3xl rounded-3xl border border-line bg-surface p-6 sm:p-8">
          <label className="block">
            <span className="text-sm font-semibold">What do you feel like?</span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="e.g. Spicy, crispy chicken sandwich with a tangy slaw"
              className="mt-2 w-full resize-none rounded-2xl border border-line bg-bg px-4 py-3 outline-none focus:border-accent"
            />
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {IDEAS.map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => setPrompt(idea)}
                className="rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-accent hover:text-accent"
              >
                {idea}
              </button>
            ))}
          </div>

          <label className="mt-6 block">
            <span className="text-sm font-semibold">Ingredients to use (optional)</span>
            <input
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              maxLength={300}
              placeholder="e.g. chickpeas, spinach, lemon"
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 outline-none focus:border-accent"
            />
          </label>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <Select label="Cuisine" value={cuisine} onChange={setCuisine} options={["", ...cuisines]} />
            <Select label="Diet" value={diet} onChange={setDiet} options={["", ...DIETS]} />
            <Select
              label="Max time"
              value={maxTime}
              onChange={setMaxTime}
              options={["", "20", "30", "45", "60", "90"]}
              format={(v) => (v ? `${v} min` : "Any")}
            />
            <label className="block">
              <span className="text-sm font-semibold">Servings</span>
              <input
                type="number"
                min={1}
                max={20}
                value={servings}
                onChange={(e) => setServings(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
                className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 outline-none focus:border-accent"
              />
            </label>
          </div>

          {error && (
            <p role="alert" className="mt-5 rounded-2xl bg-accent-soft px-4 py-3 text-sm font-medium text-accent">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-accent px-6 py-4 font-semibold text-accent-ink transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Cooking up a recipe… (10–20 seconds)" : "✨ Generate recipe"}
          </button>
        </form>
      )}

      {recipe && (
        <section id="ai-result" className="mt-16 scroll-mt-24 border-t border-line pt-12">
          <RecipeView recipe={recipe} badge="✨ AI-generated" />
          <div className="no-print mt-10 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => generate()}
              disabled={loading}
              className="rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold hover:border-accent hover:text-accent disabled:opacity-60"
            >
              {loading ? "Regenerating…" : "🔄 Try another version"}
            </button>
          </div>
          <p className="no-print mt-4 text-center text-xs text-muted">
            AI recipes aren&apos;t tested — use your judgment, especially with food safety and allergies.
          </p>
        </section>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  format = (v) => v || "Any",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  format?: (v: string) => string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 outline-none focus:border-accent"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {format(o)}
          </option>
        ))}
      </select>
    </label>
  );
}
