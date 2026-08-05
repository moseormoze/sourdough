"use client";

import { cn } from "@/lib/cn";
import { usePressActivation } from "@/lib/hooks/use-press-activation";
import { strings } from "@/lib/strings";
import { RecipeSummary, type SummaryPart } from "./recipe-summary";

export interface SavedRecipeRowProps {
  name: string;
  summary: SummaryPart[];
  onSelect: () => void;
}

export function SavedRecipeRow({ name, summary, onSelect }: SavedRecipeRowProps) {
  const { isPressed, pressProps } = usePressActivation<HTMLButtonElement>(onSelect);

  return (
    <button
      type="button"
      {...pressProps}
      data-pressed={isPressed ? "" : undefined}
      aria-label={`${name} (${strings.bake.myBadge})`}
      className={cn(
        "flex min-h-[64px] w-full items-center gap-3 px-5 py-3 text-start",
        "transition-[transform,background-color] duration-fast ease-out motion-reduce:transform-none",
        "focus-visible:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink-2",
        "max-[340px]:px-4",
        isPressed && "scale-[0.985] bg-ink/[0.05]",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-heading text-ink [overflow-wrap:anywhere]">{name}</span>
        <RecipeSummary
          parts={summary}
          className="mt-0.5 text-small text-ink-2 [overflow-wrap:anywhere]"
        />
      </span>
      <span
        aria-hidden="true"
        className="shrink-0 rounded-full bg-ink/85 px-2 py-1 text-tiny font-medium text-paper"
      >
        {strings.bake.myBadge}
      </span>
    </button>
  );
}
