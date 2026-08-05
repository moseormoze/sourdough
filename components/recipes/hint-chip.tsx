"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

export interface HintChipProps {
  recommended: number;
  onAccept: () => void;
}

export function HintChip({ recommended, onAccept }: HintChipProps) {
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={onAccept}
        className={cn(
          "relative inline-flex items-center gap-1.5 h-7 ps-2 pe-3 rounded-full",
          "bg-ink/[0.04] text-ink-2 text-tiny font-medium",
          "transition-[transform,background-color] duration-fast ease-out",
          "hover:bg-ink/[0.07] active:scale-[0.97]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20",
          // 44px touch target via ::before overlay
          "before:absolute before:inset-x-0 before:-inset-y-[10px] before:content-['']"
        )}
        aria-label={`מומלץ ${recommended} אחוז — הקש לעדכן`}
      >
        <Sparkles size={12} className="text-ink-3 shrink-0" aria-hidden />
        <span>מומלץ:</span>
        <span dir="ltr" className="num font-mono">
          {recommended}%
        </span>
        <span>· הקש לעדכן</span>
      </button>
    </div>
  );
}
