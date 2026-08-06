"use client";

import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePressActivation } from "@/lib/hooks/use-press-activation";
import { strings } from "@/lib/strings";

export interface StageKnowledgeTriggerProps {
  /** Per-stage label — each guide names its own subject. */
  label: string;
  onOpen: () => void;
}

export function StageKnowledgeTrigger({ label, onOpen }: StageKnowledgeTriggerProps) {
  const { isPressed: pressed, pressProps } = usePressActivation<HTMLButtonElement>(onOpen);

  return (
    <div className="border-t border-ink/[0.08]">
      <button
        data-manual-press="true"
        type="button"
        {...pressProps}
        className={cn(
          "flex min-h-touch w-full items-center gap-2 rounded-xl px-2 text-start text-small font-medium text-ink-2",
          "transition-[transform,background-color,color] duration-fast ease-out",
          "hover:bg-ink/[0.04] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-2",
          "motion-reduce:transform-none motion-reduce:transition-colors",
          pressed && "scale-[0.965] bg-ink/[0.06] text-ink",
        )}
      >
        <GraduationCap aria-hidden="true" className="size-5 shrink-0" />
        {label}
      </button>
    </div>
  );
}
