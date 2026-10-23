"use client";

import { useState } from "react";

export function StepsList({ steps, large = false }: { steps: string[]; large?: boolean }) {
  const [done, setDone] = useState<Set<number>>(new Set());

  return (
    <ol className="space-y-4">
      {steps.map((step, i) => {
        const isDone = done.has(i);
        return (
          <li key={i}>
            <button
              type="button"
              onClick={() =>
                setDone((prev) => {
                  const next = new Set(prev);
                  if (next.has(i)) next.delete(i);
                  else next.add(i);
                  return next;
                })
              }
              aria-pressed={isDone}
              className={`group flex w-full gap-4 rounded-2xl border p-4 text-left transition ${
                isDone ? "border-line bg-surface-2/60" : "border-line bg-surface hover:border-accent/60"
              }`}
            >
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-full font-serif text-lg font-semibold transition ${
                  isDone ? "bg-sage text-white" : "bg-accent-soft text-accent"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </span>
              <span
                className={`pt-1 leading-relaxed ${large ? "text-xl" : ""} ${isDone ? "text-muted line-through decoration-1" : ""}`}
              >
                {step}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
