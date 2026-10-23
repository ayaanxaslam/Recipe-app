import type { Metadata } from "next";
import { Suspense } from "react";
import { RecipeBrowser } from "@/components/RecipeBrowser";
import { getSummaries, usedCategories, usedCuisines } from "@/lib/recipes";

export const metadata: Metadata = { title: "Browse recipes" };

export default function RecipesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-20 text-muted sm:px-6">Loading recipes…</div>}>
      <RecipeBrowser recipes={getSummaries()} categories={usedCategories()} cuisines={usedCuisines()} />
    </Suspense>
  );
}
