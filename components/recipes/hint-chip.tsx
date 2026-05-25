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
          "bg-accent-bg text-accent text-tiny font-medium",
          "transition-[transform,background-color] duration-fast ease-out",
          "hover:bg-accent-2/40 active:scale-[0.97]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
          // 44px touch target via ::before overlay
          "before:absolute before:inset-x-0 before:-inset-y-[10px] before:content-['']"
        )}
        aria-label={`מומלץ ${recommended} אחוז — הקש לעדכן`}
      >
        <Sparkles size={12} className="text-accent shrink-0" aria-hidden />
        <span>מומלץ:</span>
        <span dir="ltr" className="num font-mono">
          {recommended}%
        </span>
        <span>· הקש לעדכן</span>
      </button>
    </div>
  );
}
