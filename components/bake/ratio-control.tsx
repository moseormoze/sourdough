"use client";

import { strings } from "@/lib/strings";
import type { FeedRatio } from "@/lib/bake-timing";

const RATIOS: FeedRatio[] = [5, 4, 3, 2, 1]; // RTL: 1:5:5 leftmost, 1:1:1 rightmost

const RATIO_LABELS: Record<FeedRatio, string> = {
  1: "1:1:1",
  2: "1:2:2",
  3: "1:3:3",
  4: "1:4:4",
  5: "1:5:5",
};

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
              className={`pressable flex-1 min-h-touch rounded-lg text-label font-medium
                border-[1.5px] transition-colors duration-fast ease-out
                ${active
                  ? "bg-accent text-paper border-accent"
                  : "bg-transparent text-ink-2 border-line"
                }`}
            >
              {RATIO_LABELS[r]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
