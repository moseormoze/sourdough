"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";

export interface OptionalTimerProps {
  durationSeconds: number;
  /** epoch ms when the timer started, or null when not running */
  startedAt: number | null;
  onStart: () => void;
  onStop: () => void;
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
  onStart,
  onStop,
  className,
}: OptionalTimerProps) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (startedAt === null) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  if (startedAt === null) {
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

  const elapsed = Math.floor((now - startedAt) / 1000);
  const secondsLeft = durationSeconds - elapsed;
  const finished = secondsLeft <= 0;

  return (
    <div
      data-state={finished ? "finished" : "running"}
      className={cn(
        "inline-flex items-center gap-3 min-h-touch px-4 rounded-full",
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
      <button
        type="button"
        onClick={onStop}
        className="min-h-touch px-2 text-tiny text-ink-3 hover:text-danger transition-colors"
      >
        {strings.bake.timerStop}
      </button>
    </div>
  );
}
