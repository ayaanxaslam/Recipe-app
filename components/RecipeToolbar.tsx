"use client";

import { useEffect, useRef, useState } from "react";

type WakeLock = { release: () => Promise<void> };

/** Print + "keep screen awake" toggle for cooking. Nothing is saved. */
export function RecipeToolbar() {
  const [awake, setAwake] = useState(false);
  const [supported, setSupported] = useState(false);
  const lock = useRef<WakeLock | null>(null);

  useEffect(() => {
    setSupported("wakeLock" in navigator);
    return () => {
      lock.current?.release().catch(() => {});
    };
  }, []);

  async function toggleAwake() {
    if (awake) {
      await lock.current?.release().catch(() => {});
      lock.current = null;
      setAwake(false);
      return;
    }
    try {
      const nav = navigator as Navigator & { wakeLock: { request: (t: "screen") => Promise<WakeLock> } };
      lock.current = await nav.wakeLock.request("screen");
      setAwake(true);
    } catch {
      setAwake(false);
    }
  }

  return (
    <div className="no-print flex flex-wrap gap-2">
      {supported && (
        <button
          onClick={toggleAwake}
          aria-pressed={awake}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            awake ? "border-sage bg-sage text-white" : "border-line bg-surface hover:border-accent hover:text-accent"
          }`}
        >
          {awake ? "☀️ Screen stays on" : "🔆 Keep screen on"}
        </button>
      )}
      <button
        onClick={() => window.print()}
        className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold transition hover:border-accent hover:text-accent"
      >
        🖨️ Print
      </button>
    </div>
  );
}
