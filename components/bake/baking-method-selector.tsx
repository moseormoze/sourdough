"use client";

import { Circle, CircleDot } from "lucide-react";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";
import { BAKING_METHODS, type BakingMethod } from "@/lib/types/baking-method";

export interface BakingMethodSelectorProps {
  value: BakingMethod;
  onChange: (next: BakingMethod) => void;
}

export function BakingMethodSelector({ value, onChange }: BakingMethodSelectorProps) {
  const copy = strings.bake.bakingMethod;
  return (
    <section aria-label={copy.selectorTitle} className="flex flex-col gap-3">
      <h2 className="text-heading text-ink">{copy.selectorTitle}</h2>
      <div role="radiogroup" aria-label={copy.selectorTitle} className="flex flex-col gap-2.5">
        {BAKING_METHODS.map((method) => {
          const selected = value === method;
          const meta = copy.methods[method];
          return (
            <button
              key={method}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(method)}
              className={cn(
                "w-full min-h-touch rounded-2xl p-4 text-start",
                "flex items-start gap-3",
                "border-[1.5px] transition-colors duration-fast ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
                selected
                  ? "border-accent ring-2 ring-accent/20 bg-accent-bg/30"
                  : "border-line bg-paper hover:border-line-2"
              )}
            >
              <span aria-hidden className={cn("mt-0.5 shrink-0", selected ? "text-accent" : "text-ink-3")}>
                {selected ? <CircleDot size={20} /> : <Circle size={20} />}
              </span>
              <span className="flex flex-col gap-1 min-w-0">
                <span className="text-heading text-ink">{meta.title}</span>
                <span className="text-small text-ink-2 leading-relaxed">{meta.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
