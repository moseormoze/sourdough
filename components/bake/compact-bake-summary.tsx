"use client";

import { ChevronDown } from "lucide-react";
import { strings } from "@/lib/strings";
import type { BakeStep, FeedRatio } from "@/lib/bake-timing";
import { dayPrefix } from "./bake-timeline";

const TIME_FMT = new Intl.DateTimeFormat("he-IL", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const RATIO_LABELS: Record<FeedRatio, string> = {
  1: "1:1:1",
  2: "1:2:2",
  3: "1:3:3",
  4: "1:4:4",
  5: "1:5:5",
};

function fmt(d: Date, now: Date): string {
  return `${dayPrefix(d, now)} ${TIME_FMT.format(d)}`;
}

export interface CompactBakeSummaryProps {
  steps: BakeStep[];
  feedRatio: FeedRatio;
  now: Date;
  onTimelineOpen?: () => void;
}

export function CompactBakeSummary({
  steps,
  feedRatio,
  now,
  onTimelineOpen,
}: CompactBakeSummaryProps) {
  const s = strings.bakeScheduler.compactSummary;

  const buildStep  = steps.find((s) => s.key === "build");
  const mixStep    = steps.find((s) => s.key === "mix");
  const shapeStep  = steps.find((s) => s.key === "shape");
  const readyStep  = steps.find((s) => s.key === "ready");

  const activeStart = mixStep?.startAt;
  const activeEnd   = shapeStep
    ? new Date(shapeStep.startAt.getTime() + shapeStep.durationSecs * 1000)
    : undefined;

  return (
    <div className="flex flex-col gap-3">
      {/* Feed row — only when a build step exists */}
      {buildStep && (
        <div className="flex items-center gap-2 min-w-0" data-testid="feed-row">
          <span aria-hidden className="text-base leading-none shrink-0">🌙</span>
          <span className="text-body-sm text-ink-2 shrink-0">{s.feedLabel}</span>
          <span className="text-body-sm text-ink font-medium truncate" dir="ltr">
            {TIME_FMT.format(buildStep.startAt)}
          </span>
          <span className="text-label text-ink-3 shrink-0" dir="ltr">
            ({RATIO_LABELS[feedRatio]})
          </span>
        </div>
      )}

      {/* Active work window row */}
      {activeStart && activeEnd && (
        <div className="flex items-center gap-2" data-testid="active-window-row">
          <span aria-hidden className="text-base leading-none shrink-0">🤚</span>
          <span className="text-body-sm text-ink-2 shrink-0">{s.activeWindowLabel}</span>
          <span className="text-body-sm text-ink font-medium" dir="ltr">
            {TIME_FMT.format(activeStart)}–{TIME_FMT.format(activeEnd)}
          </span>
          <span className="text-body-sm text-ink-3 shrink-0">
            {dayPrefix(activeStart, now)}
          </span>
        </div>
      )}

      {/* Ready row */}
      {readyStep && (
        <div className="flex items-center gap-2" data-testid="ready-row">
          <span aria-hidden className="text-base leading-none shrink-0">✓</span>
          <span className="text-body-sm text-ink-2 shrink-0">{s.readyLabel}</span>
          <span className="text-body-sm text-ink font-medium">
            {fmt(readyStep.startAt, now)}
          </span>
        </div>
      )}

      {/* Timeline disclosure button */}
      <button
        type="button"
        data-testid="timeline-trigger"
        onClick={onTimelineOpen}
        className="pressable self-center flex items-center gap-1.5
                   px-4 py-2 rounded-full min-h-touch
                   border border-accent/40 bg-accent-bg
                   text-body-sm text-accent font-medium
                   transition-colors duration-fast"
      >
        <span>{s.showTimeline}</span>
        <ChevronDown size={14} aria-hidden />
      </button>
    </div>
  );
}
