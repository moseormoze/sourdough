"use client";

import { useEffect, useRef, type UIEvent } from "react";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";

const ITEM_HEIGHT_PX = 56;
const SCROLL_SETTLE_MS = 100;
/** ui-playbook §1 `justFinishedDrag`: brief cooldown so momentum can't override a tap. */
const TAP_WINS_MS = 200;

/**
 * Whole hours read as hours only from two hours up: a 30/45/60 minute set should
 * stay in minutes throughout rather than ending in "1 שעה", while the cold
 * retard (8–48h) reads in hours.
 */
export function formatDurationOption(seconds: number): string {
  return seconds >= 2 * 3600 && seconds % 3600 === 0
    ? strings.bake.autolyseTimer.hoursOption(seconds / 3600)
    : strings.bake.autolyseTimer.durationOption(Math.round(seconds / 60));
}

export interface DurationWheelProps {
  /** The stage's curated stops, in seconds. The wheel cannot emit anything else. */
  options: readonly number[];
  valueSeconds: number;
  onChange: (seconds: number) => void;
}

export function DurationWheel({ options, valueSeconds, onChange }: DurationWheelProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapAtRef = useRef<number>(0);

  useEffect(() => {
    const selectedIndex = options.indexOf(valueSeconds);
    if (listRef.current && selectedIndex >= 0) {
      listRef.current.scrollTop = selectedIndex * ITEM_HEIGHT_PX;
    }
  }, [options, valueSeconds]);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current !== null) clearTimeout(settleTimerRef.current);
    };
  }, []);

  function cancelPendingSettle() {
    if (settleTimerRef.current !== null) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  }

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const list = event.currentTarget;
    cancelPendingSettle();
    settleTimerRef.current = setTimeout(() => {
      settleTimerRef.current = null;
      // A tap is an explicit choice; momentum settling just after it is not.
      if (Date.now() - tapAtRef.current < TAP_WINS_MS) return;
      const nextIndex = Math.max(
        0,
        Math.min(options.length - 1, Math.round(list.scrollTop / ITEM_HEIGHT_PX))
      );
      const next = options[nextIndex];
      if (next !== undefined && next !== valueSeconds) onChange(next);
    }, SCROLL_SETTLE_MS);
  }

  function handlePick(seconds: number) {
    // The tap wins over any scroll still waiting to settle.
    cancelPendingSettle();
    tapAtRef.current = Date.now();
    if (seconds !== valueSeconds) onChange(seconds);
  }

  return (
    <div
      data-testid="duration-wheel"
      data-surface="glass"
      className="relative mx-auto max-w-[18rem] overflow-hidden rounded-[1.75rem] border border-paper/55 bg-paper/25 px-4 py-2 backdrop-blur-sm"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-1/2 z-raised h-14 -translate-y-1/2 rounded-2xl border border-paper/70 bg-paper/80 shadow-sm"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-raised h-14 bg-gradient-to-b from-paper/60 via-paper/35 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-raised h-14 bg-gradient-to-t from-paper/60 via-paper/35 to-transparent"
      />

      <div
        ref={listRef}
        role="listbox"
        aria-label={strings.bake.autolyseTimer.setupTitle}
        aria-orientation="vertical"
        onScroll={handleScroll}
        className="relative z-base h-44 snap-y snap-mandatory touch-pan-y overflow-y-auto overscroll-contain py-[3.75rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {options.map((option) => {
          const selected = option === valueSeconds;
          return (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => handlePick(option)}
              className={cn(
                "relative z-[2] flex min-h-14 w-full snap-center items-center justify-center rounded-xl px-2 font-mono tabular-nums transition-[color,font-size,opacity,background-color] duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink-3 motion-reduce:transition-none",
                selected
                  ? "text-display-sm text-ink opacity-100"
                  : "text-body-lg text-ink-3 opacity-55 hover:bg-ink/[0.04] hover:text-ink-2 hover:opacity-100"
              )}
            >
              {formatDurationOption(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
