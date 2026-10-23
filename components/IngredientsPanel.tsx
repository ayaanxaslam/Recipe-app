"use client";

import { useState } from "react";
import { scaleIngredient } from "@/lib/scale";
import type { IngredientGroup } from "@/lib/types";

export function IngredientsPanel({ groups, servings }: { groups: IngredientGroup[]; servings: number }) {
  const [count, setCount] = useState(servings);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const factor = count / servings;

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="rounded-3xl border border-line bg-surface p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-serif text-2xl font-semibold">Ingredients</h2>
        <div className="no-print flex items-center gap-1 rounded-full border border-line p-1" role="group" aria-label="Servings">
          <button
            onClick={() => setCount((c) => Math.max(1, c - 1))}
            className="grid size-8 place-items-center rounded-full text-lg hover:bg-surface-2"
            aria-label="Fewer servings"
          >
            −
          </button>
          <span className="min-w-20 text-center text-sm font-semibold tabular-nums">
            {count} {count === 1 ? "serving" : "servings"}
          </span>
          <button
            onClick={() => setCount((c) => Math.min(99, c + 1))}
            className="grid size-8 place-items-center rounded-full text-lg hover:bg-surface-2"
            aria-label="More servings"
          >
            +
          </button>
        </div>
      </div>
      {factor !== 1 && (
        <p className="no-print -mt-2 mb-4 text-xs text-muted">
          Quantities scaled ×{Number(factor.toFixed(2))}.{" "}
          <button className="font-semibold text-accent hover:underline" onClick={() => setCount(servings)}>
            Reset
          </button>
        </p>
      )}
      <div className="space-y-5">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.title && <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">{group.title}</h3>}
            <ul className="space-y-1">
              {group.items.map((item, ii) => {
                const key = `${gi}-${ii}`;
                const done = checked.has(key);
                return (
                  <li key={key}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-2">
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => toggle(key)}
                        className="mt-1 size-4 shrink-0 accent-[var(--accent)]"
                      />
                      <span className={`leading-relaxed transition ${done ? "text-muted line-through" : ""}`}>
                        {scaleIngredient(item, factor)}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
