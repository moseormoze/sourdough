"use client";

import { useId, useState } from "react";
import { Pause, Pencil, Play, RotateCcw, Timer } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_AUTOLYSE_DURATION_SECONDS,
  deriveTimerSnapshot,
  formatTimerTime,
  type TimerPhase,
} from "@/lib/bake-timer";
import { cn } from "@/lib/cn";
import { strings } from "@/lib/strings";
import { DurationWheel } from "./duration-wheel";

export { DEFAULT_AUTOLYSE_DURATION_SECONDS } from "@/lib/bake-timer";

export interface AutolyseTimerProps {
  durationSeconds: number;
  /** epoch ms when the current run segment started, or null when idle/paused */
  startedAt: number | null;
  /** seconds accumulated before the current run segment */
  elapsedSeconds: number;
  /** shared page clock; defaults to the current time for static renders */
  nowMs?: number;
  onStart: (durationSeconds: number) => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSetRemaining: (durationSeconds: number) => void;
}

type SheetMode = "setup" | "edit";
export type AutolyseTimerState = TimerPhase;

export function getAutolyseTimerState(
  durationSeconds: number,
  startedAt: number | null,
  elapsedSeconds: number,
  nowMs = Date.now(),
): { state: AutolyseTimerState; secondsLeft: number } {
  const { phase, secondsLeft } = deriveTimerSnapshot({
    durationSeconds,
    startedAt,
    elapsedSeconds,
    nowMs,
  });

  return { state: phase, secondsLeft };
}

export function formatAutolyseCountdown(secondsLeft: number): string {
  return formatTimerTime(secondsLeft, secondsLeft, "ceil");
}

function nearestWheelMinutes(seconds: number): number {
  return Math.min(23 * 60 + 55, Math.max(5, Math.round(seconds / 60 / 5) * 5));
}

function TimerSignal({ finished }: { finished: boolean }) {
  const signalId = useId().replace(/:/g, "");
  const gradientId = `timer-signal-gradient-${signalId}`;
  const glowId = `timer-signal-glow-${signalId}`;
  const smokeId = `timer-signal-smoke-${signalId}`;
  const path =
    "M4 23 C22 23 29 13 44 14 C57 15 64 25 78 23 C96 20 103 8 119 10 C137 12 145 20 156 12";

  return (
    <span
      data-testid="autolyse-timer-signal"
      aria-hidden
      className="mt-0.5 block h-5 w-full"
    >
      <svg
        viewBox="0 0 160 28"
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
        focusable="false"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#F28A55" />
            <stop offset="0.52" stopColor="#B9DCE7" />
            <stop offset="1" stopColor="var(--sage)" />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={smokeId} x="-25%" y="-130%" width="150%" height="360%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.14"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="8"
              xChannelSelector="R"
              yChannelSelector="B"
              result="drift"
            />
            <feGaussianBlur in="drift" stdDeviation="3.6" />
          </filter>
        </defs>
        <g
          data-testid="autolyse-timer-smoke"
          opacity={finished ? 0.04 : 0.18}
          filter={`url(#${smokeId})`}
        >
          <path
            d={path}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d={path}
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            transform="translate(0 -2)"
          />
        </g>
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          className={finished ? "text-ink/10" : "text-paper/15"}
        />
        <path
          data-testid="autolyse-timer-line"
          d={path}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.25"
          strokeLinecap="round"
          filter={`url(#${glowId})`}
        />
      </svg>
    </span>
  );
}

export function AutolyseTimer({
  durationSeconds,
  startedAt,
  elapsedSeconds,
  nowMs = Date.now(),
  onStart,
  onPause,
  onResume,
  onReset,
  onSetRemaining,
}: AutolyseTimerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>("setup");
  const [draftMinutes, setDraftMinutes] = useState(() => nearestWheelMinutes(durationSeconds));

  const { state: timerPhase, secondsLeft } = getAutolyseTimerState(
    durationSeconds,
    startedAt,
    elapsedSeconds,
    nowMs,
  );
  const isIdle = timerPhase === "idle";
  const isFinished = timerPhase === "finished";
  const isPaused = timerPhase === "paused";
  const formattedTime = formatAutolyseCountdown(secondsLeft);
  const timerState = isIdle
    ? strings.bake.autolyseTimer.heading
    : isFinished
      ? strings.bake.autolyseTimer.finished
      : isPaused
        ? strings.bake.autolyseTimer.paused
        : strings.bake.autolyseTimer.running;

  function openSetup() {
    setDraftMinutes(nearestWheelMinutes(durationSeconds));
    setSheetMode("setup");
    setSheetOpen(true);
  }

  function openEdit() {
    setDraftMinutes(nearestWheelMinutes(secondsLeft));
    setSheetMode("edit");
    setSheetOpen(true);
  }

  function startSelectedTimer() {
    onStart(draftMinutes * 60);
    setSheetOpen(false);
  }

  function saveRemainingTime() {
    onSetRemaining(draftMinutes * 60);
    setSheetOpen(false);
  }

  return (
    <>
      <div id="autolyse-timer" data-testid="autolyse-timer" data-state={timerPhase}>
        {!isIdle && (
          <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {timerState}
          </span>
        )}

        {isIdle ? (
          <section
            data-testid="autolyse-timer-card"
            data-variant="compact"
            data-surface="glass"
            className="overflow-hidden rounded-3xl border border-paper/55 bg-paper/35 p-5 shadow-sm backdrop-blur-md"
          >
            <div className="flex items-start gap-3">
              <span
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent"
                aria-hidden
              >
                <Timer size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-tiny font-medium text-ink-2" dir="rtl">
                  {timerState}
                </h3>
                <p className="mt-1 text-small leading-relaxed text-ink-2">
                  {strings.bake.autolyseTimer.idleHint}
                </p>
              </div>
            </div>
            <Button
              variant="soft"
              size="sm"
              onClick={openSetup}
              className="mt-4 w-full border border-paper/60 bg-paper/60 hover:!bg-paper/75"
              iconStart={<Timer size={17} />}
            >
              {strings.bake.autolyseTimer.start}
            </Button>
          </section>
        ) : (
          <section
            data-testid="autolyse-timer-card"
            data-variant="compact"
            data-surface={isFinished ? "glass" : "charcoal"}
            className={cn(
              "overflow-hidden rounded-3xl",
              isFinished
                ? "border border-sage/50 bg-sage-bg/70 text-ink shadow-sm"
                : "bg-[#292A28] text-paper shadow-lg",
            )}
          >
            <div className="flex items-stretch">
              <div className="min-w-0 flex-1 px-4 py-2.5 text-start">
                <h3
                  className={cn(
                    "text-tiny font-medium",
                    isFinished ? "text-ink-2" : "text-paper/60",
                  )}
                  dir="rtl"
                >
                  {strings.bake.autolyseTimer.heading}
                </h3>
                <span
                  dir="ltr"
                  className="num mt-0.5 block font-mono text-2xl font-medium leading-none tabular-nums"
                >
                  {formattedTime}
                </span>
                <TimerSignal finished={isFinished} />
              </div>

              <div
                className={cn(
                  "flex shrink-0 items-center border-s px-2",
                  isFinished ? "border-ink/10" : "border-paper/10",
                )}
              >
                <button
                  type="button"
                  onClick={isFinished ? onReset : isPaused ? onResume : onPause}
                  aria-label={isFinished
                    ? strings.bake.autolyseTimer.reset
                    : isPaused
                      ? strings.bake.autolyseTimer.resume
                      : strings.bake.autolyseTimer.pause}
                  className="pressable inline-flex size-11 items-center justify-center rounded-full bg-paper text-ink transition-colors duration-fast ease-out hover:bg-paper/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-2"
                >
                  {isFinished
                    ? <RotateCcw size={17} aria-hidden />
                    : isPaused
                      ? <Play size={18} fill="currentColor" aria-hidden />
                      : <Pause size={18} fill="currentColor" aria-hidden />}
                </button>
                <button
                  type="button"
                  onClick={openEdit}
                  aria-label={strings.bake.autolyseTimer.edit}
                  className={cn(
                    "pressable inline-flex size-11 items-center justify-center rounded-full transition-colors duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-2",
                    isFinished
                      ? "text-ink-2 hover:bg-ink/5 hover:text-ink"
                      : "text-paper/70 hover:bg-paper/10 hover:text-paper",
                  )}
                >
                  <Pencil size={17} aria-hidden />
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        size="peek"
        title={sheetMode === "setup"
          ? strings.bake.autolyseTimer.setupTitle
          : strings.bake.autolyseTimer.editTitle}
        variant="pilot"
      >
        <p className="mb-4 text-body leading-relaxed text-ink-2">
          {sheetMode === "setup"
            ? strings.bake.autolyseTimer.setupHint
            : strings.bake.autolyseTimer.editHint}
        </p>
        <DurationWheel valueMinutes={draftMinutes} onChange={setDraftMinutes} />
        <Button
          variant="primary"
          onClick={sheetMode === "setup" ? startSelectedTimer : saveRemainingTime}
          disabled={draftMinutes === 0}
          className="mt-5 w-full bg-[#292A28] hover:!bg-[#343532]"
          iconStart={sheetMode === "setup" ? <Play size={18} /> : undefined}
        >
          {sheetMode === "setup"
            ? strings.bake.autolyseTimer.start
            : strings.bake.autolyseTimer.saveTime}
        </Button>
      </BottomSheet>
    </>
  );
}
