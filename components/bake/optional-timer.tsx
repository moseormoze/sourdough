"use client";

import { useEffect, useState } from "react";
import { Timer, Pause, Play, RotateCcw } from "lucide-react";
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
}

function format(secondsLeft: number): string {
  const safe = Math.max(0, Math.floor(secondsLeft));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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
}: OptionalTimerProps) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (startedAt === null) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const isIdle = startedAt === null && elapsedSeconds === 0;
  const isRunning = startedAt !== null;
  const isPaused = startedAt === null && elapsedSeconds > 0;

  if (isIdle) {
    return (
      <button
        type="button"
        onClick={onStart}
        className={cn(
          "pressable inline-flex items-center gap-2 min-h-touch px-4 rounded-full",
          "bg-bg-2 text-ink-2 text-body hover:bg-line transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-3 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          className
        )}
      >
        <Timer size={16} aria-hidden />
        <span>{strings.bake.timerStart}</span>
      </button>
    );
  }

  const liveSegment = isRunning && startedAt !== null ? (now - startedAt) / 1000 : 0;
  const totalElapsed = elapsedSeconds + liveSegment;
  const secondsLeft = durationSeconds - totalElapsed;
  const finished = secondsLeft <= 0;

  const stateAttr = finished ? "finished" : isPaused ? "paused" : "running";

  return (
    <div
      data-state={stateAttr}
      className={cn(
        "inline-flex items-center gap-2 min-h-touch px-3 rounded-full",
        finished ? "bg-sage-bg text-sage-2" : "bg-bg-2 text-ink-2",
        className
      )}
    >
      <Timer size={16} aria-hidden />
      {finished ? (
        <span className="text-body">{strings.bake.timerFinished}</span>
      ) : (
        <span dir="ltr" className="num font-mono text-body-lg">
          {format(secondsLeft)}
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
          className="pressable min-h-touch min-w-touch inline-flex items-center justify-center text-accent hover:text-accent/80 transition-colors"
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
