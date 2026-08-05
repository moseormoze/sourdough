"use client";

import Link from "next/link";
import { X, ChevronDown } from "lucide-react";
import { ProgressStrip } from "./progress-strip";
import { cn } from "@/lib/cn";
import { usePressActivation } from "@/lib/hooks/use-press-activation";
import { strings } from "@/lib/strings";
import { fermentationStageSecs, starterPeakSecs, durationRangeLabel, type FeedRatio } from "@/lib/bake-timing";
import type { Flour } from "@/lib/types/recipe";
import type { Stage } from "@/lib/data/stages";

export interface StageHeaderProps {
  stage: Stage;
  totalStages: number;
  kitchenTemp?: number;
  feedRatio?: FeedRatio;
  retardHours?: number;
  flour?: Flour;
  onTimelineOpen?: () => void;
  variant?: "default" | "pilot";
  /**
   * Opt-in rollout title treatment: plain H1 on the canvas with a tonal
   * duration eyebrow. Charcoal is reserved for the live moment (the running
   * timer) and is never title chrome. Default keeps the legacy title so
   * unconverted surfaces are untouched.
   */
  rollout?: boolean;
}

export function StageHeader({
  stage,
  totalStages,
  kitchenTemp,
  feedRatio,
  retardHours,
  flour,
  onTimelineOpen,
  variant = "default",
  rollout = false,
}: StageHeaderProps) {
  const { isPressed, pressProps } = usePressActivation<HTMLButtonElement>(onTimelineOpen);

  const durationLabel = (() => {
    if (stage.n === 1 && kitchenTemp != null && feedRatio != null)
      return durationRangeLabel(starterPeakSecs(kitchenTemp, feedRatio));
    if (stage.n === 7 && retardHours != null)
      return `${retardHours} שעות`;
    if (stage.tempSensitiveBaseSecs != null && kitchenTemp != null)
      return durationRangeLabel(fermentationStageSecs(stage.tempSensitiveBaseSecs, kitchenTemp, flour)) + (stage.durationLabelSuffix ?? "");
    return stage.durationLabel;
  })();

  const strip = <ProgressStrip total={totalStages} current={stage.n} />;

  return (
    <header className={cn("relative z-10", variant === "pilot" && "text-ink")}>
      <div className="flex items-center justify-between mb-3">
        <Link
          href="/"
          className={cn(
            "pressable inline-flex items-center gap-1.5 min-h-touch px-3 rounded-full",
            "text-ink-2 transition-colors duration-fast ease-out",
            variant === "pilot" ? "hover:bg-ink/[0.04]" : "hover:bg-bg-2",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-3"
          )}
        >
          <X size={16} aria-hidden />
          <span className="text-small">{strings.bake.stageMenuLabel}</span>
        </Link>
        <span
          dir="ltr"
          className={cn(
            "num text-tiny font-mono",
            variant === "pilot" ? "text-ink-2" : "text-ink-3",
          )}
        >
          {strings.bake.stageCounter(stage.n, totalStages)}
        </span>
      </div>

      {onTimelineOpen ? (
        <button
          data-manual-press="true"
          type="button"
          aria-label="פתח טיימליין"
          className={cn(
            "w-full min-h-touch flex flex-col justify-center gap-0.5 rounded-lg -mx-1 px-1",
            "transition-[transform,background-color] duration-fast ease-out",
            variant === "pilot" && "hover:bg-ink/[0.04]",
            isPressed && "scale-[0.985] bg-ink/[0.06]",
          )}
          {...pressProps}
        >
          {strip}
          <div
            className={cn(
              "flex items-center gap-0.5 text-tiny select-none",
              variant === "pilot" ? "text-ink-2" : "text-ink-3",
            )}
            aria-hidden="true"
          >
            <ChevronDown size={12} />
            <span>טיימליין</span>
          </div>
        </button>
      ) : (
        strip
      )}

      <div
        data-testid={rollout ? "stage-title" : undefined}
        className={cn("mt-4", variant === "pilot" && !rollout && "pt-1")}
      >
        {durationLabel && (
          <span
            data-testid={rollout ? "stage-title-eyebrow" : undefined}
            className={cn(
              "inline-block text-tiny font-medium px-3 py-1 rounded-full",
              rollout
                ? "bg-ink/[0.04] text-ink-2"
                : variant === "pilot"
                  ? "border border-paper/55 bg-paper/30 text-ink-2 shadow-sm backdrop-blur-sm"
                  : "bg-accent-bg text-accent",
            )}
          >
            {durationLabel}
          </span>
        )}
        <h1
          className={cn(
            "mt-2 text-ink",
            variant === "pilot" ? "text-display-md" : "text-display-sm",
          )}
        >
          {stage.name}
          {stage.hint && (
            <>
              {" "}
              <span className="text-body text-ink-3" dir="ltr">
                {stage.hint}
              </span>
            </>
          )}
        </h1>
      </div>
    </header>
  );
}
