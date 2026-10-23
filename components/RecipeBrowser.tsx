"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchRecipes, type SortKey } from "@/lib/search";
import { DIETS, DIFFICULTIES, type Diet, type Difficulty, type RecipeSummary } from "@/lib/types";
import { RecipeCard } from "./RecipeCard";

const PAGE_SIZE = 24;
const TIME_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
];
const SORTS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Best match" },
  { value: "name", label: "A → Z" },
  { value: "quickest", label: "Quickest" },
  { value: "fewest-ingredients", label: "Fewest ingredients" },
];

function list(params: URLSearchParams, key: string): string[] {
  return params.getAll(key).flatMap((v) => v.split(",")).map((v) => v.trim()).filter(Boolean);
}

export function RecipeBrowser({
  recipes,
  categories,
  cuisines,
}: {
  recipes: RecipeSummary[];
  categories: string[];
  cuisines: string[];
}) {
  const params = useSearchParams();

  const urlQuery = params.get("q") ?? "";
  const ingredients = list(params, "with");
  const selCategories = list(params, "category");
  const selCuisines = list(params, "cuisine");
  const selDiets = list(params, "diet") as Diet[];
  const selDifficulty = list(params, "difficulty") as Difficulty[];
  const maxTime = Number(params.get("time")) || null;
  const sort = (params.get("sort") as SortKey) || "relevance";

  const [query, setQuery] = useState(urlQuery);
  const [ingredientDraft, setIngredientDraft] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const queryFocused = useRef(false);

  // Keep the box in sync when the URL changes from elsewhere (e.g. header links).
  useEffect(() => {
    if (!queryFocused.current) setQuery(urlQuery);
  }, [urlQuery]);

  function update(mutate: (p: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    const qs = next.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
    setVisible(PAGE_SIZE);
  }

  // Debounce typing into the URL.
  useEffect(() => {
    if (query === urlQuery) return;
    const id = setTimeout(() => update((p) => (query.trim() ? p.set("q", query) : p.delete("q"))), 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function setList(key: string, values: string[]) {
    update((p) => {
      p.delete(key);
      if (values.length) p.set(key, values.join(","));
    });
  }

  function toggle(key: string, current: string[], value: string) {
    setList(key, current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  }

  function addIngredients(text: string) {
    const added = text.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (!added.length) return;
    setList("with", [...new Set([...ingredients, ...added])]);
    setIngredientDraft("");
  }

  const results = useMemo(
    () =>
      searchRecipes(recipes, {
        query: urlQuery,
        ingredients,
        categories: selCategories,
        cuisines: selCuisines,
        diets: selDiets,
        difficulties: selDifficulty,
        maxTime,
        sort,
      }),
    // params.toString() captures every filter
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recipes, params.toString()],
  );

  const activeCount =
    ingredients.length + selCategories.length + selCuisines.length + selDiets.length + selDifficulty.length + (maxTime ? 1 : 0);

  const filters = (
    <div className="space-y-7">
      <FilterGroup title="I have these ingredients">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addIngredients(ingredientDraft);
          }}
          className="flex gap-2"
        >
          <input
            value={ingredientDraft}
            onChange={(e) => setIngredientDraft(e.target.value)}
            onBlur={() => addIngredients(ingredientDraft)}
            placeholder="e.g. eggs, spinach"
            aria-label="Add an ingredient"
            className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button type="submit" className="rounded-xl bg-ink px-3 text-sm font-semibold text-bg">
            Add
          </button>
        </form>
        {ingredients.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {ingredients.map((i) => (
              <button
                key={i}
                onClick={() => setList("with", ingredients.filter((x) => x !== i))}
                className="group flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-ink"
                aria-label={`Remove ${i}`}
              >
                {i} <span className="opacity-70 group-hover:opacity-100">×</span>
              </button>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-muted">Shows recipes that use every ingredient listed.</p>
      </FilterGroup>

      <FilterGroup title="Ready in">
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map((t) => (
            <Chip
              key={t.value}
              active={maxTime === t.value}
              onClick={() => update((p) => (maxTime === t.value ? p.delete("time") : p.set("time", String(t.value))))}
            >
              ≤ {t.label}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Diet">
        <div className="flex flex-wrap gap-2">
          {DIETS.map((d) => (
            <Chip key={d} active={selDiets.includes(d)} onClick={() => toggle("diet", selDiets, d)}>
              {d}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Category">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Chip key={c} active={selCategories.includes(c)} onClick={() => toggle("category", selCategories, c)}>
              {c}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Cuisine">
        <div className="flex flex-wrap gap-2">
          {cuisines.map((c) => (
            <Chip key={c} active={selCuisines.includes(c)} onClick={() => toggle("cuisine", selCuisines, c)}>
              {c}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Difficulty">
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => (
            <Chip key={d} active={selDifficulty.includes(d)} onClick={() => toggle("difficulty", selDifficulty, d)}>
              {d}
            </Chip>
          ))}
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">All recipes</h1>
        <p className="mt-2 text-muted">Search by name or ingredient, then narrow it down.</p>
      </div>

      <div className="sticky top-16 z-20 -mx-4 mb-6 bg-bg/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex gap-2">
          <label className="flex flex-1 items-center gap-2 rounded-2xl border border-line bg-surface px-4 focus-within:border-accent">
            <span aria-hidden>🔎</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => (queryFocused.current = true)}
              onBlur={() => (queryFocused.current = false)}
              placeholder="Search recipes or ingredients…"
              aria-label="Search recipes"
              className="min-w-0 flex-1 bg-transparent py-3 outline-none placeholder:text-muted/70"
            />
          </label>
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            className="rounded-2xl border border-line bg-surface px-4 text-sm font-semibold lg:hidden"
          >
            Filters{activeCount ? ` (${activeCount})` : ""}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
          <div className="rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-36 lg:max-h-[calc(100dvh-10rem)] lg:overflow-y-auto">
            {filters}
          </div>
        </aside>

        <section aria-live="polite">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              <strong className="text-ink">{results.length}</strong> {results.length === 1 ? "recipe" : "recipes"}
              {activeCount > 0 || urlQuery ? (
                <button
                  onClick={() => {
                    setQuery("");
                    window.history.replaceState(null, "", window.location.pathname);
                  }}
                  className="ml-3 font-semibold text-accent hover:underline"
                >
                  Clear all
                </button>
              ) : null}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted">Sort</span>
              <select
                value={sort}
                onChange={(e) => update((p) => (e.target.value === "relevance" ? p.delete("sort") : p.set("sort", e.target.value)))}
                className="rounded-xl border border-line bg-surface px-3 py-2 font-medium outline-none focus:border-accent"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {results.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-line px-6 py-20 text-center">
              <p className="text-5xl">🥄</p>
              <h2 className="mt-4 font-serif text-2xl font-semibold">Nothing matches that yet</h2>
              <p className="mx-auto mt-2 max-w-md text-muted">
                Try fewer filters or a different ingredient — or ask the AI Kitchen to invent something.
              </p>
              <a href="/generate" className="mt-6 inline-block rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-ink">
                Open AI Kitchen
              </a>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.slice(0, visible).map((r) => (
                  <RecipeCard key={r.slug} recipe={r} />
                ))}
              </div>
              {visible < results.length && (
                <div className="mt-10 text-center">
                  <button
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold transition hover:border-accent hover:text-accent"
                  >
                    Show more ({results.length - visible} left)
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">{title}</legend>
      {children}
    </fieldset>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        active ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}
