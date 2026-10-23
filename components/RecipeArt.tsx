import { artGradient } from "@/lib/meta";

export function RecipeArt({
  emoji,
  category,
  seed,
  photo,
  alt = "",
  size = "md",
  className = "",
}: {
  emoji: string;
  category: string;
  seed: string;
  /** Photo URL; falls back to emoji art when missing */
  photo?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const emojiSize = size === "lg" ? "text-8xl sm:text-9xl" : size === "sm" ? "text-4xl" : "text-6xl";
  return (
    <div
      className={`relative grid place-items-center overflow-hidden ${className}`}
      style={{ background: artGradient(category, seed) }}
      aria-hidden={photo ? undefined : true}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={alt}
          loading={size === "lg" ? "eager" : "lazy"}
          fetchPriority={size === "lg" ? "high" : undefined}
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <>
          <div className="grain absolute inset-0 opacity-60" />
          <div className="absolute -right-6 -bottom-6 size-32 rounded-full bg-white/20 blur-2xl" />
          <span className={`relative drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)] ${emojiSize}`}>{emoji}</span>
        </>
      )}
    </div>
  );
}
