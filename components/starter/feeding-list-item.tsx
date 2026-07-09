"use client";

import { useRouter } from "next/navigation";
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

  return (
    <button
      type="button"
      onClick={() => router.push(`/starter/${feeding.id}/edit`)}
      data-feeding-id={feeding.id}
      className="pressable relative block min-h-touch w-full text-start rounded-2xl bg-paper shadow-sm p-4
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-3 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <h3 className="text-heading text-ink">{FEED_RATIO_LABELS[feeding.ratio]}</h3>
      <p className="mt-1 text-small text-ink-2">{formatFedAt(feeding.fedAt)}</p>
      {gramsSummary && (
        <p className="mt-1 text-small text-ink-2">{gramsSummary}</p>
      )}
    </button>
  );
}
