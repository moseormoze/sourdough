"use client";

import { useEffect, useState } from "react";
import { Timer, Pause, Play, RotateCcw } from "lucide-react";
import { deriveTimerSnapshot, formatTimerTime } from "@/lib/bake-timer";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";

export interface OptionalTimerProps {
  durationSeconds: number;
  /** epoch ms when the current run segment started, or null when not running */
  startedAt: number | null;
  /** total seconds accumulated across prior pause/resume cycles */
  elapsedSeconds: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  className?: string;
  /**
   * "inset" is the rollout-language frosted pill (no borders, no orange, mono
   * value); "legacy" keeps the pre-redesign look for unconverted surfaces.
   */
  appearance?: "legacy" | "inset";
}

export function OptionalTimer({
  durationSeconds,
  startedAt,
  elapsedSeconds,
  onStart,
  onPause,
  onResume,
  onReset,
  className,
  appearance = "legacy",
}: OptionalTimerProps) {
  const inset = appearance === "inset";
  const [now, setNow] = useState<number>(() => Date.now());

  const { phase, secondsLeft } = deriveTimerSnapshot({
    durationSeconds,
    startedAt,
    elapsedSeconds,
    nowMs: now,
    clampFutureStart: false,
  });
  const isIdle = phase === "idle";
  const isRunning = phase === "running";
  const isPaused = phase === "paused";
  const finished = phase === "finished";

  useEffect(() => {
    if (startedAt === null || finished) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [finished, startedAt]);

  if (isIdle) {
    return (
      <button
        type="button"
        onClick={() => onStart()}
        className={cn(
          "pressable inline-flex items-center gap-2 min-h-touch px-4 rounded-full",
          "text-body transition-colors",
          inset
            ? "bg-paper/70 text-ink-2 hover:bg-paper/85 focus-visible:ring-ink-2"
            : "bg-bg-2 text-ink-2 hover:bg-line focus-visible:ring-ink-3 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          "focus-visible:outline-none focus-visible:ring-2",
          className
        )}
      >
        <Timer size={16} aria-hidden />
        <span>{strings.bake.timerStart}</span>
      </button>
    );
  }

  return (
    <div
      data-state={phase}
      className={cn(
        "inline-flex items-center gap-2 min-h-touch px-3 rounded-full",
        finished
          ? "bg-sage-bg text-sage-2"
          : inset
            ? "bg-paper/70 text-ink-2"
            : "bg-bg-2 text-ink-2",
        className
      )}
    >
      <Timer size={16} aria-hidden />
      {finished ? (
        <span className="text-body">{strings.bake.timerFinished}</span>
      ) : (
        <span
          dir="ltr"
          className={cn("num font-mono", inset ? "text-lg text-ink" : "text-body-lg")}
        >
          {formatTimerTime(secondsLeft, durationSeconds, "floor")}
        </span>
      )}

      {!finished && isRunning && (
        <button
          type="button"
          onClick={onPause}
          aria-label={strings.bake.timerPause}
          className="pressable min-h-touch min-w-touch inline-flex items-center justify-center text-ink-2 hover:text-ink transition-colors"
        >
          <Pause size={18} aria-hidden />
        </button>
      )}

      {!finished && isPaused && (
        <button
          type="button"
          onClick={onResume}
          aria-label={strings.bake.timerResume}
          className={cn(
            "pressable min-h-touch min-w-touch inline-flex items-center justify-center transition-colors",
            inset ? "text-ink hover:text-ink-2" : "text-accent hover:text-accent/80",
          )}
        >
          <Play size={18} aria-hidden />
        </button>
      )}

      <button
        type="button"
        onClick={onReset}
        aria-label={strings.bake.timerReset}
        className="pressable min-h-touch min-w-touch inline-flex items-center justify-center text-ink-3 hover:text-danger transition-colors"
      >
        <RotateCcw size={16} aria-hidden />
      </button>
    </div>
  );
}
