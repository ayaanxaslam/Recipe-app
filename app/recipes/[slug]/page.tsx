import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeView } from "@/components/RecipeView";
import { getAllRecipes, getRecipe, getRelated, toSummary } from "@/lib/recipes";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllRecipes().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const recipe = getRecipe((await params).slug);
  return recipe ? { title: recipe.title, description: recipe.description } : {};
}

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const recipe = getRecipe((await params).slug);
  if (!recipe) notFound();
  const related = getRelated(recipe);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="no-print mb-8 text-sm text-muted">
        <Link href="/recipes" className="hover:text-accent">
          ← All recipes
        </Link>
      </nav>
      <RecipeView recipe={recipe} />
      {related.length > 0 && (
        <section className="no-print mt-20">
          <h2 className="mb-6 font-serif text-3xl font-semibold">You might also like</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <RecipeCard key={r.slug} recipe={toSummary(r)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
