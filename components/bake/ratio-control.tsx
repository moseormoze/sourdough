"use client";

import { strings } from "@/lib/strings";
import { AMBIENT_CHARCOAL } from "@/components/ui/ambient";
import type { FeedRatio } from "@/lib/bake-timing";
import { FEED_RATIO_LABELS } from "@/lib/bake-timing";

const RATIOS: FeedRatio[] = [5, 4, 3, 2, 1]; // RTL: 1:5:5 leftmost, 1:1:1 rightmost

export interface RatioControlProps {
  value: FeedRatio;
  onChange: (r: FeedRatio) => void;
}

export function RatioControl({ value, onChange }: RatioControlProps) {
  const s = strings.bakeScheduler.ratioControl;

  return (
    <div data-testid="ratio-control">
      <p className="text-label text-ink-2 mb-2">{s.label}</p>
      <div role="radiogroup" aria-label={s.label} className="flex gap-1">
        {RATIOS.map((r) => {
          const active = r === value;
          return (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={active}
              data-testid={`ratio-btn-${r}`}
              onClick={() => onChange(r)}
              onPointerDown={() => onChange(r)}
              dir="ltr"
              className={`pressable flex-1 min-h-touch rounded-full text-label font-medium
                transition-colors duration-fast ease-out
                ${active ? AMBIENT_CHARCOAL : "bg-paper/70 text-ink-2"}`}
            >
              {FEED_RATIO_LABELS[r]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
