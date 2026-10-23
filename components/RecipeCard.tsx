import Link from "next/link";
import { formatMinutes } from "@/lib/meta";
import type { RecipeSummary } from "@/lib/types";
import { RecipeArt } from "./RecipeArt";

type CardRecipe = Pick<
  RecipeSummary,
  "slug" | "title" | "description" | "category" | "cuisine" | "difficulty" | "totalTime" | "emoji" | "diets"
>;

export function RecipeCard({ recipe }: { recipe: CardRecipe }) {
  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_30px_-12px_rgba(60,30,10,0.25)]"
    >
      <RecipeArt
        emoji={recipe.emoji}
        category={recipe.category}
        seed={recipe.slug}
        className="aspect-[4/3] transition duration-300 [&>span]:transition [&>span]:duration-300 group-hover:[&>span]:scale-110"
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
          <span>{recipe.cuisine}</span>
          <span aria-hidden>·</span>
          <span>{recipe.category}</span>
        </div>
        <h3 className="font-serif text-lg leading-snug font-semibold group-hover:text-accent">{recipe.title}</h3>
        <p className="line-clamp-2 text-sm text-muted">{recipe.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs">
          <span className="rounded-full bg-surface-2 px-2.5 py-1 font-medium">⏱ {formatMinutes(recipe.totalTime)}</span>
          <span className="rounded-full bg-surface-2 px-2.5 py-1 font-medium">{recipe.difficulty}</span>
          {recipe.diets.includes("Vegan") ? (
            <span className="rounded-full bg-sage-soft px-2.5 py-1 font-medium text-sage">Vegan</span>
          ) : recipe.diets.includes("Vegetarian") ? (
            <span className="rounded-full bg-sage-soft px-2.5 py-1 font-medium text-sage">Vegetarian</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
