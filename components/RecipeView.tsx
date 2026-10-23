import Link from "next/link";
import { formatMinutes } from "@/lib/meta";
import type { Recipe } from "@/lib/types";
import { IngredientsPanel } from "./IngredientsPanel";
import { RecipeArt } from "./RecipeArt";
import { RecipeToolbar } from "./RecipeToolbar";
import { StepsList } from "./StepsList";

/** Full recipe layout, shared by saved recipes and AI-generated ones. */
export function RecipeView({ recipe, badge }: { recipe: Recipe; badge?: string }) {
  const total = recipe.prepTime + recipe.cookTime;
  const facts = [
    { label: "Prep", value: formatMinutes(recipe.prepTime) },
    { label: "Cook", value: recipe.cookTime ? formatMinutes(recipe.cookTime) : "—" },
    { label: "Total", value: formatMinutes(total) },
    { label: "Serves", value: String(recipe.servings) },
    { label: "Level", value: recipe.difficulty },
  ];

  return (
    <article>
      <header className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div className="animate-rise order-2 md:order-1">
          <div className="mb-4 flex flex-wrap gap-2 text-sm">
            {badge && <span className="rounded-full bg-ink px-3 py-1 font-semibold text-bg">{badge}</span>}
            <Link
              href={`/recipes?cuisine=${encodeURIComponent(recipe.cuisine)}`}
              className="no-print rounded-full bg-accent-soft px-3 py-1 font-semibold text-accent hover:brightness-95"
            >
              {recipe.cuisine}
            </Link>
            <Link
              href={`/recipes?category=${encodeURIComponent(recipe.category)}`}
              className="no-print rounded-full bg-surface-2 px-3 py-1 font-semibold hover:brightness-95"
            >
              {recipe.category}
            </Link>
            {recipe.diets.map((d) => (
              <span key={d} className="rounded-full bg-sage-soft px-3 py-1 font-semibold text-sage">
                {d}
              </span>
            ))}
          </div>
          <h1 className="font-serif text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">{recipe.title}</h1>
          <p className="mt-4 text-lg text-muted">{recipe.description}</p>
          <dl className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {facts.map((f) => (
              <div key={f.label} className="rounded-2xl border border-line bg-surface px-3 py-3 text-center">
                <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">{f.label}</dt>
                <dd className="mt-1 text-sm font-semibold">{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6">
            <RecipeToolbar />
          </div>
        </div>
        <RecipeArt
          emoji={recipe.emoji}
          category={recipe.category}
          seed={recipe.slug}
          size="lg"
          className="no-print order-1 aspect-[4/3] rounded-3xl md:order-2 md:aspect-square"
        />
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[380px_1fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <IngredientsPanel groups={recipe.ingredients} servings={recipe.servings} />
        </div>
        <div>
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-2xl font-semibold">Method</h2>
            <span className="no-print text-xs text-muted">Tap a step to mark it done</span>
          </div>
          <StepsList steps={recipe.steps} />
          {recipe.tips && recipe.tips.length > 0 && (
            <aside className="mt-8 rounded-3xl border border-accent/20 bg-accent-soft/60 p-6">
              <h2 className="mb-3 font-serif text-xl font-semibold">Cook&apos;s notes</h2>
              <ul className="space-y-2">
                {recipe.tips.map((t, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed">
                    <span aria-hidden>💡</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </aside>
          )}
          {recipe.tags.length > 0 && (
            <div className="no-print mt-8 flex flex-wrap gap-2">
              {recipe.tags.map((t) => (
                <Link
                  key={t}
                  href={`/recipes?q=${encodeURIComponent(t.replace(/-/g, " "))}`}
                  className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted hover:border-accent hover:text-accent"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
