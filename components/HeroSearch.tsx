"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SUGGESTIONS = ["chicken", "pasta", "chickpeas", "salmon", "eggs", "coconut milk", "tofu", "chocolate"];

export function HeroSearch() {
  const router = useRouter();
  const [mode, setMode] = useState<"name" | "ingredients">("name");
  const [value, setValue] = useState("");

  function go(text: string) {
    const v = text.trim();
    if (!v) return router.push("/recipes");
    const params = new URLSearchParams();
    if (mode === "name") params.set("q", v);
    else params.set("with", v.split(",").map((s) => s.trim()).filter(Boolean).join(","));
    router.push(`/recipes?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-3 inline-flex rounded-full border border-line bg-surface p-1 text-sm font-medium">
        {(["name", "ingredients"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`rounded-full px-4 py-1.5 transition ${mode === m ? "bg-ink text-bg" : "text-muted hover:text-ink"}`}
          >
            {m === "name" ? "Search recipes" : "What's in my fridge?"}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(value);
        }}
        className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-2 shadow-[0_10px_40px_-15px_rgba(60,30,10,0.3)] focus-within:border-accent"
      >
        <span className="pl-3 text-xl" aria-hidden>
          {mode === "name" ? "🔎" : "🧺"}
        </span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={mode === "name" ? "Try “carbonara”, “curry”, or “quick chicken”" : "e.g. chicken, rice, spinach"}
          aria-label={mode === "name" ? "Search recipes" : "Ingredients you have, separated by commas"}
          className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-muted/70"
        />
        <button
          type="submit"
          className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition hover:brightness-110"
        >
          Search
        </button>
      </form>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">Popular:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => go(s)}
            className="rounded-full border border-line bg-surface px-3 py-1 transition hover:border-accent hover:text-accent"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
