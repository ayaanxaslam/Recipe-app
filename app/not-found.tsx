import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-6xl">🍳</p>
      <h1 className="mt-6 font-serif text-4xl font-semibold">That recipe burned</h1>
      <p className="mt-3 text-muted">We couldn&apos;t find what you were looking for.</p>
      <Link href="/recipes" className="mt-8 inline-block rounded-xl bg-accent px-5 py-3 font-semibold text-accent-ink">
        Browse recipes
      </Link>
    </div>
  );
}
