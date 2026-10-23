import Link from "next/link";
import { HeroSearch } from "@/components/HeroSearch";
import { RecipeArt } from "@/components/RecipeArt";
import { RecipeCard } from "@/components/RecipeCard";
import { CATEGORY_META, formatMinutes } from "@/lib/meta";
import { countBy, getAllRecipes, getDailyPicks, toSummary, totalTime, usedCategories, usedCuisines } from "@/lib/recipes";
import type { Category } from "@/lib/types";

export const revalidate = 3600;

export default function HomePage() {
  const all = getAllRecipes();
  const categoryCounts = countBy((r) => r.category);
  const cuisineCounts = countBy((r) => r.cuisine as string);
  const [feature, ...picks] = getDailyPicks(5);
  const quick = all
    .filter((r) => totalTime(r) <= 30 && r.category !== "Drinks")
    .sort((a, b) => a.title.localeCompare(b.title));
  const quickPicks = getDailyPicks(all.length)
    .filter((r) => quick.includes(r))
    .slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-accent-soft blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-sage-soft blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20">
          <p className="animate-rise mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            {all.length} recipes · {cuisineCounts.size} cuisines
          </p>
          <h1 className="animate-rise max-w-3xl font-serif text-5xl leading-[1.05] font-semibold tracking-tight sm:text-7xl">
            What are we cooking <em className="text-accent">today?</em>
          </h1>
          <p className="animate-rise mt-5 max-w-xl text-lg text-muted">
            My kitchen notebook — search by name, or tell it what&apos;s in the fridge.
          </p>
          <div className="animate-rise mt-8">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Recipe of the day */}
      {feature && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <Link
            href={`/recipes/${feature.slug}`}
            className="group grid overflow-hidden rounded-3xl border border-line bg-surface md:grid-cols-2"
          >
            <RecipeArt
              emoji={feature.emoji}
              category={feature.category}
              seed={feature.slug}
              photo={feature.photo?.src}
              alt={feature.title}
              size="lg"
              className="min-h-64 md:min-h-80"
            />
            <div className="flex flex-col justify-center gap-4 p-8 sm:p-10">
              <span className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                Recipe of the day
              </span>
              <h2 className="font-serif text-3xl font-semibold sm:text-4xl group-hover:text-accent">{feature.title}</h2>
              <p className="text-muted">{feature.description}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-surface-2 px-3 py-1">⏱ {formatMinutes(totalTime(feature))}</span>
                <span className="rounded-full bg-surface-2 px-3 py-1">{feature.cuisine}</span>
                <span className="rounded-full bg-surface-2 px-3 py-1">{feature.difficulty}</span>
              </div>
              <span className="mt-2 font-semibold text-accent">Let&apos;s cook →</span>
            </div>
          </Link>
        </section>
      )}

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading title="Browse by category" href="/recipes" linkLabel="All recipes" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {usedCategories().map((c) => {
            const meta = CATEGORY_META[c as Category];
            return (
              <Link
                key={c}
                href={`/recipes?category=${encodeURIComponent(c)}`}
                className="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-accent"
              >
                <span
                  className="grid size-12 shrink-0 place-items-center rounded-xl text-2xl transition group-hover:scale-110"
                  style={{ background: `hsl(${meta.hue} 80% 88%)` }}
                >
                  {meta.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{c}</span>
                  <span className="block text-xs text-muted">{categoryCounts.get(c as Category)} recipes</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <SectionHeading title="Ready in 30 minutes or less" href="/recipes?time=30" linkLabel={`All ${quick.length} quick recipes`} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {quickPicks.map((r) => (
            <RecipeCard key={r.slug} recipe={toSummary(r)} />
          ))}
        </div>
      </section>

      {/* Cuisines */}
      <section className="bg-surface-2/60 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading title="Travel by cuisine" />
          <div className="flex flex-wrap gap-2">
            {usedCuisines().map((c) => (
              <Link
                key={c}
                href={`/recipes?cuisine=${encodeURIComponent(c)}`}
                className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium transition hover:border-accent hover:text-accent"
              >
                {c} <span className="text-muted">{cuisineCounts.get(c)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* More picks */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading title="Today's picks" href="/random" linkLabel="Surprise me" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {picks.map((r) => (
            <RecipeCard key={r.slug} recipe={toSummary(r)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="font-serif text-3xl font-semibold tracking-tight">{title}</h2>
      {href && (
        <Link href={href} prefetch={href === "/random" ? false : undefined} className="shrink-0 text-sm font-semibold text-accent hover:underline">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
