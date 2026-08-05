"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { usePressActivation } from "@/lib/hooks/use-press-activation";
import { FEED_RATIO_LABELS } from "@/lib/bake-timing";
import { strings } from "@/lib/strings";
import type { Feeding } from "@/lib/types/feeding";

const dateTimeFormatter = new Intl.DateTimeFormat("he-IL", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatFedAt(fedAt: string): string {
  return dateTimeFormatter.format(new Date(fedAt));
}

export function summarizeGrams(feeding: Feeding): string {
  const { grams } = strings.starterTracker;
  const parts: string[] = [];
  if (feeding.starterGrams !== null) {
    parts.push(`${grams.starterLabel} ${feeding.starterGrams}${grams.unit}`);
  }
  if (feeding.flourGrams !== null) {
    parts.push(`${grams.flourLabel} ${feeding.flourGrams}${grams.unit}`);
  }
  if (feeding.waterGrams !== null) {
    parts.push(`${grams.waterLabel} ${feeding.waterGrams}${grams.unit}`);
  }
  return parts.join(" · ");
}

export interface FeedingListItemProps {
  feeding: Feeding;
}

export function FeedingListItem({ feeding }: FeedingListItemProps) {
  const router = useRouter();
  const gramsSummary = summarizeGrams(feeding);
  const { isPressed, pressProps } = usePressActivation<HTMLButtonElement>(() =>
    router.push(`/starter/${feeding.id}/edit`)
  );

  return (
    <button
      type="button"
      {...pressProps}
      data-feeding-id={feeding.id}
      data-pressed={isPressed ? "" : undefined}
      className={cn(
        "relative block min-h-touch w-full text-start px-5 py-3.5 max-[340px]:px-4",
        "transition-[transform,background-color] duration-fast ease-out motion-reduce:transform-none",
        "focus-visible:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink-2",
        isPressed && "scale-[0.985] bg-ink/[0.05]"
      )}
    >
      <h3 className="text-heading text-ink">{FEED_RATIO_LABELS[feeding.ratio]}</h3>
      <p className="mt-1 text-small text-ink-2">{formatFedAt(feeding.fedAt)}</p>
      {gramsSummary && (
        <p className="mt-1 text-small text-ink-2">{gramsSummary}</p>
      )}
    </button>
  );
}
