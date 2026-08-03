"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { usePressActivation } from "@/lib/hooks/use-press-activation";
import type { Preset } from "@/lib/presets";

export interface PresetCardProps {
  preset: Preset;
  onSelect: (preset: Preset) => void;
}

export function PresetCard({ preset, onSelect }: PresetCardProps) {
  const { isPressed: pressed, pressProps } = usePressActivation<HTMLButtonElement>(
    () => onSelect(preset),
  );

  const flourSummary = formatFlourSummary(preset);

  return (
    <button
      type="button"
      {...pressProps}
      data-pressed={pressed ? "" : undefined}
      data-preset-id={preset.id}
      aria-label={preset.name}
      className={cn(
        "flex flex-col w-full text-start rounded-2xl bg-paper shadow-sm overflow-hidden",
        "transition-[transform,box-shadow] duration-fast ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-3 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        pressed && "scale-[0.97] shadow-none"
      )}
    >
      <div className="relative aspect-[4/3] bg-bg-2">
        <Image
          src={preset.image}
          alt=""
          fill
          sizes="(max-width: 480px) 50vw, 240px"
          className="object-cover"
          priority={false}
        />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-heading text-ink">{preset.name}</h3>
        <p className="mt-1 text-small text-ink-2 line-clamp-2 min-h-[2.9em]">
          {preset.blurb}
        </p>
        <p className="mt-3 text-tiny text-ink-3">
          <span dir="ltr" className="num">
            {preset.data.hydration}%
          </span>{" "}
          הידרציה · {flourSummary}
        </p>
      </div>
    </button>
  );
}

function formatFlourSummary(preset: Preset): string {
  const { white, wholeWheat, rye } = preset.data.flour;
  const speltWhite = preset.data.flour.speltWhite ?? 0;
  const speltWhole = preset.data.flour.speltWhole ?? 0;
  const parts: string[] = [];
  if (white > 0) parts.push(`${white}% לבן`);
  if (wholeWheat > 0) parts.push(`${wholeWheat}% מלא`);
  if (rye > 0) parts.push(`${rye}% שיפון`);
  if (speltWhite > 0) parts.push(`${speltWhite}% כוסמין לבן`);
  if (speltWhole > 0) parts.push(`${speltWhole}% כוסמין מלא`);
  return parts.join(" · ");
}
