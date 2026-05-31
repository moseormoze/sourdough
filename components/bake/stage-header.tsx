"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { X, ChevronDown } from "lucide-react";
import { ProgressStrip } from "./progress-strip";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";
import { tempAdjustedDurationLabel, starterPeakSecs, durationRangeLabel, type FeedRatio } from "@/lib/bake-timing";
import type { Stage } from "@/lib/data/stages";

export interface StageHeaderProps {
  stage: Stage;
  totalStages: number;
  kitchenTemp?: number;
  feedRatio?: FeedRatio;
  onTimelineOpen?: () => void;
}

export function StageHeader({
  stage,
  totalStages,
  kitchenTemp,
  feedRatio,
  onTimelineOpen,
}: StageHeaderProps) {
  const [isPressed, setIsPressed] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, didDrag: false });

  // Stage 1 (levain): duration is driven by both temp AND feedRatio.
  // Use the full peak-time lookup instead of the generic Q10 formula.
  const durationLabel =
    stage.n === 1 && kitchenTemp != null && feedRatio != null
      ? durationRangeLabel(starterPeakSecs(kitchenTemp, feedRatio))
      : stage.tempSensitiveBaseSecs != null && kitchenTemp != null
        ? tempAdjustedDurationLabel(stage.tempSensitiveBaseSecs, kitchenTemp) +
          (stage.durationLabelSuffix ?? "")
        : stage.durationLabel;

  function handlePointerDown(e: React.PointerEvent) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, didDrag: false };
    setIsPressed(true);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (dragRef.current.didDrag) return;
    const dx = Math.abs(e.clientX - dragRef.current.startX);
    const dy = Math.abs(e.clientY - dragRef.current.startY);
    if (dx > 5 || dy > 5) {
      dragRef.current.didDrag = true;
      setIsPressed(false);
    }
  }

  function handlePointerUp() {
    const didDrag = dragRef.current.didDrag;
    setIsPressed(false);
    if (!didDrag) onTimelineOpen?.();
  }

  const strip = <ProgressStrip total={totalStages} current={stage.n} />;

  return (
    <header className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <Link
          href="/"
          className={cn(
            "pressable inline-flex items-center gap-1.5 min-h-touch px-3 rounded-full",
            "text-ink-2 hover:bg-bg-2 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-3"
          )}
        >
          <X size={16} aria-hidden />
          <span className="text-small">{strings.bake.stageMenuLabel}</span>
        </Link>
        <span dir="ltr" className="num text-tiny font-mono text-ink-3">
          {strings.bake.stageCounter(stage.n, totalStages)}
        </span>
      </div>

      {onTimelineOpen ? (
        <button
          aria-label="פתח טיימליין"
          className={cn(
            "w-full min-h-touch flex flex-col justify-center gap-0.5 rounded-lg -mx-1 px-1",
            "transition-[transform,background-color] duration-fast ease-out",
            isPressed && "scale-[0.985] bg-black/[0.06]",
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => setIsPressed(false)}
          onPointerCancel={() => setIsPressed(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onTimelineOpen();
            }
          }}
        >
          {strip}
          <div className="flex items-center gap-0.5 text-tiny text-ink-3 select-none" aria-hidden="true">
            <ChevronDown size={12} />
            <span>טיימליין</span>
          </div>
        </button>
      ) : (
        strip
      )}

      <div className="mt-4">
        <span className="inline-block bg-accent-bg text-accent text-tiny font-medium px-3 py-1 rounded-full">
          {durationLabel || "—"}
        </span>
        <h1 className="mt-2 text-display-sm text-ink">
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
