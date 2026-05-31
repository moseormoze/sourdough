"use client";

import { useRef, useState, useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { STAGES } from "@/lib/data/stages";
import { tempAdjustedDurationLabel, starterPeakSecs, durationRangeLabel, type FeedRatio } from "@/lib/bake-timing";
import { cn } from "@/lib/cn";

export interface BakeTimelineSheetProps {
  isOpen: boolean;
  currentStage: number;
  kitchenTemp: number;
  feedRatio: FeedRatio;
  retardHours: number;
  onClose: () => void;
}

export function BakeTimelineSheet({
  isOpen,
  currentStage,
  kitchenTemp,
  feedRatio,
  retardHours,
  onClose,
}: BakeTimelineSheetProps) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  // Keep content mounted during the close animation, then unmount to avoid DOM conflicts.
  const [contentMounted, setContentMounted] = useState(isOpen);
  const startY = useRef(0);
  const startTime = useRef(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isOpen) {
      setContentMounted(true);
    } else {
      setDragY(0);
      setIsDragging(false);
      timer = setTimeout(() => setContentMounted(false), 260);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  function handleHandlePointerDown(e: React.PointerEvent) {
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* jsdom */ }
    startY.current = e.clientY;
    startTime.current = Date.now();
    setIsDragging(true);
  }

  function handleHandlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return;
    const delta = e.clientY - startY.current;
    if (delta <= 0) { setDragY(0); return; }
    const next =
      delta <= 80
        ? delta
        : Math.min(80 + (delta - 80) * 0.35, 140);
    setDragY(next);
  }

  function handleHandlePointerUp(e: React.PointerEvent) {
    if (!isDragging) return;
    const delta = e.clientY - startY.current;
    const elapsed = Math.max(1, Date.now() - startTime.current);
    setIsDragging(false);
    if (delta / elapsed > 0.5 || delta > 80) {
      onClose();
    } else {
      setDragY(0);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        data-testid="timeline-backdrop"
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-black transition-opacity duration-base",
          isOpen ? "opacity-40 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="טיימליין האפייה"
        aria-hidden={isOpen ? undefined : true}
        className={cn(
          "fixed inset-x-0 bottom-0 z-sheet bg-paper rounded-t-2xl shadow-sheet",
          "max-h-[85dvh] flex flex-col",
          isDragging ? "transition-none" : "transition-transform duration-[250ms] ease-out",
        )}
        style={{ transform: isOpen ? `translateY(${dragY}px)` : "translateY(100%)" }}
      >
        {/* Content mounted during open + close animation to avoid DOM conflicts */}
        {contentMounted && (
          <>
            {/* Drag handle — only this element captures drag; keeps content scrollable */}
            <div
              aria-hidden="true"
              className="pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing select-none touch-none"
              onPointerDown={handleHandlePointerDown}
              onPointerMove={handleHandlePointerMove}
              onPointerUp={handleHandlePointerUp}
              onPointerCancel={handleHandlePointerUp}
            >
              <div className="w-10 h-1 rounded-full bg-line-2" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-line">
              <h2 className="text-heading text-ink">טיימליין</h2>
              <button
                onClick={onClose}
                aria-label="סגור טיימליין"
                className="flex items-center justify-center min-h-touch min-w-touch -me-2 text-ink-3 hover:text-ink transition-colors"
              >
                <X size={20} aria-hidden />
              </button>
            </div>

            {/* Stage list */}
            <ol className="overflow-y-auto pb-8" aria-label="שלבי האפייה">
              {STAGES.map((stage) => {
                const isPast = stage.n < currentStage;
                const isCurrent = stage.n === currentStage;
                const durationLabel = (() => {
                  if (stage.n === 1)
                    return durationRangeLabel(starterPeakSecs(kitchenTemp, feedRatio));
                  if (stage.n === 7)
                    return `${retardHours} שעות`;
                  if (stage.tempSensitiveBaseSecs != null)
                    return tempAdjustedDurationLabel(stage.tempSensitiveBaseSecs, kitchenTemp) + (stage.durationLabelSuffix ?? "");
                  return stage.durationLabel;
                })();

                return (
                  <li
                    key={stage.n}
                    data-state={isPast ? "past" : isCurrent ? "current" : "future"}
                    className={cn(
                      "flex items-center gap-3 px-5 min-h-touch",
                      isCurrent && "bg-accent-bg border-s-2 border-accent",
                    )}
                  >
                    <div className="w-5 flex-shrink-0 flex items-center justify-center">
                      {isPast && (
                        <CheckCircle2 size={16} className="text-accent" aria-hidden />
                      )}
                      {isCurrent && (
                        <div className="w-2 h-2 rounded-full bg-accent" aria-hidden />
                      )}
                    </div>
                    <span
                      className={cn(
                        "flex-1 text-small",
                        isPast && "text-ink-3",
                        isCurrent && "text-ink font-medium",
                        !isPast && !isCurrent && "text-ink-2",
                      )}
                    >
                      {stage.name}
                    </span>
                    {durationLabel && (
                      <span
                        className={cn(
                          "text-tiny flex-shrink-0",
                          isCurrent ? "text-ink-2" : "text-ink-3",
                        )}
                      >
                        {durationLabel}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </>
  );
}
