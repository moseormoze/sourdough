"use client";

import { Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePressActivation } from "@/lib/hooks/use-press-activation";

export interface StageVideoCardProps {
  label: string;
  caption?: string;
  onOpen: () => void;
}

/**
 * A vertical asset embedded in the page flow eats almost a full screen — the
 * problem the autolyse pilot was built to remove. The card is the flow-safe
 * stand-in: no iframe and no remote thumbnail until the baker asks for it.
 */
export function StageVideoCard({ label, caption, onOpen }: StageVideoCardProps) {
  const { isPressed: pressed, pressProps } = usePressActivation<HTMLButtonElement>(onOpen);

  return (
    <button
      type="button"
      data-manual-press="true"
      data-pressed={pressed ? "" : undefined}
      {...pressProps}
      className={cn(
        "flex min-h-touch w-full items-center gap-3 rounded-2xl bg-ink/[0.04] px-4 py-3 text-start",
        "transition-[transform,background-color] duration-fast ease-out",
        "hover:bg-ink/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-2",
        "motion-reduce:transform-none motion-reduce:transition-colors",
        pressed && "scale-[0.965] bg-ink/[0.06]",
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink/[0.06] text-ink-2"
      >
        <Play className="size-4 fill-current" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-small font-medium text-ink">{label}</span>
        {caption && <span className="text-tiny text-ink-3">{caption}</span>}
      </span>
    </button>
  );
}
