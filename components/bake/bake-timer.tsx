"use client";

import { useState } from "react";
import { Pause, Pencil, Play, RotateCcw, Timer } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import {
  AMBIENT_CHARCOAL,
  AMBIENT_CHARCOAL_SHADOW,
  AMBIENT_GLASS,
} from "@/components/ui/ambient";
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

export interface BakeTimerProps {
  durationSeconds: number;
  /** epoch ms when the current run segment started, or null when idle/paused */
  startedAt: number | null;
  /** seconds accumulated before the current run segment */
  elapsedSeconds: number;
  /** shared page clock; defaults to the current time for static renders */
  nowMs?: number;
  /**
   * Stage-specific copy. Omitted where the stage has no approved wording yet —
   * T6 fills the remaining stages; nothing generic is invented in the meantime.
   */
  idleHint?: string;
  setupHint?: string;
  /** T4b widens this to "travelling" | "status". */
  variant?: "stage";
  onStart: (durationSeconds: number) => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSetRemaining: (durationSeconds: number) => void;
}

type SheetMode = "setup" | "edit";
export type BakeTimerState = TimerPhase;

export function getBakeTimerState(
  durationSeconds: number,
  startedAt: number | null,
  elapsedSeconds: number,
  nowMs = Date.now(),
): { state: BakeTimerState; secondsLeft: number } {
  const { phase, secondsLeft } = deriveTimerSnapshot({
    durationSeconds,
    startedAt,
    elapsedSeconds,
    nowMs,
  });

  return { state: phase, secondsLeft };
}

export function formatBakeCountdown(secondsLeft: number): string {
  return formatTimerTime(secondsLeft, secondsLeft, "ceil");
}

function nearestWheelMinutes(seconds: number): number {
  return Math.min(23 * 60 + 55, Math.max(5, Math.round(seconds / 60 / 5) * 5));
}

function TimerProgress({
  secondsLeft,
  durationSeconds,
}: {
  secondsLeft: number;
  durationSeconds: number;
}) {
  const ratio =
    durationSeconds > 0
      ? Math.min(1, Math.max(0, secondsLeft / durationSeconds))
      : 0;
  const width = `${Math.round(ratio * 10000) / 100}%`;

  return (
    <span
      data-testid="timer-progress"
      aria-hidden="true"
      className="mt-2 block h-[3px] w-full overflow-hidden rounded-full bg-paper/20"
    >
      {/*
        Physical `to-l` is deliberate: the app is RTL-only, so the fill grows
        from the start (right) edge and the warm end sits where reading begins.
        Tailwind has no logical gradient direction.
      */}
      <span
        data-testid="timer-progress-fill"
        style={{ width }}
        className="block h-full rounded-full bg-gradient-to-l from-accent to-accent-2 transition-[width] duration-base ease-out motion-reduce:transition-none"
      />
    </span>
  );
}

export function BakeTimer({
  durationSeconds,
  startedAt,
  elapsedSeconds,
  nowMs = Date.now(),
  idleHint,
  setupHint,
  variant = "stage",
  onStart,
  onPause,
  onResume,
  onReset,
  onSetRemaining,
}: BakeTimerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>("setup");
  const [draftMinutes, setDraftMinutes] = useState(() => nearestWheelMinutes(durationSeconds));

  const { state: timerPhase, secondsLeft } = getBakeTimerState(
    durationSeconds,
    startedAt,
    elapsedSeconds,
    nowMs,
  );
  const isIdle = timerPhase === "idle";
  const isFinished = timerPhase === "finished";
  const isPaused = timerPhase === "paused";
  const formattedTime = formatBakeCountdown(secondsLeft);
  const timerState = isIdle
    ? strings.bake.bakeTimer.heading
    : isFinished
      ? strings.bake.bakeTimer.finished
      : isPaused
        ? strings.bake.bakeTimer.paused
        : strings.bake.bakeTimer.running;

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
      <div
        id="bake-timer"
        data-testid="bake-timer"
        data-state={timerPhase}
        data-timer-variant={variant}
      >
        {!isIdle && (
          <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {timerState}
          </span>
        )}

        {isIdle ? (
          <section
            data-testid="bake-timer-card"
            data-variant="compact"
            data-surface="glass"
            className={cn("overflow-hidden p-5", AMBIENT_GLASS)}
          >
            <div className="flex items-start gap-3">
              <span
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-ink/[0.04] text-ink"
                aria-hidden
              >
                <Timer size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-tiny font-medium text-ink-2" dir="rtl">
                  {timerState}
                </h3>
                {idleHint && (
                  <p className="mt-1 text-small leading-relaxed text-ink-2">
                    {idleHint}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="inset"
              size="sm"
              onClick={openSetup}
              className="mt-4 w-full"
              iconStart={<Timer size={17} />}
            >
              {strings.bake.bakeTimer.start}
            </Button>
          </section>
        ) : (
          <section
            data-testid="bake-timer-card"
            data-variant="compact"
            data-surface={isFinished ? "glass" : "charcoal"}
            className={cn(
              "overflow-hidden rounded-[2rem]",
              isFinished
                ? "border border-sage/50 bg-sage-bg/70 text-ink shadow-sm"
                : `${AMBIENT_CHARCOAL} ${AMBIENT_CHARCOAL_SHADOW}`,
            )}
          >
            <div className="flex items-stretch">
              <div className="min-w-0 flex-1 px-5 py-3.5 text-start">
                <h3
                  className={cn(
                    "text-tiny font-medium",
                    isFinished ? "text-ink-2" : "text-paper/65",
                  )}
                  dir="rtl"
                >
                  {strings.bake.bakeTimer.heading}
                </h3>
                <span
                  dir="ltr"
                  className="num mt-1 block font-mono text-display-lg leading-none tabular-nums"
                >
                  {formattedTime}
                </span>
                <TimerProgress
                  secondsLeft={secondsLeft}
                  durationSeconds={durationSeconds}
                />
              </div>

              <div className="flex shrink-0 items-center gap-1.5 pe-3 ps-1">
                <button
                  type="button"
                  onClick={isFinished ? onReset : isPaused ? onResume : onPause}
                  aria-label={isFinished
                    ? strings.bake.bakeTimer.reset
                    : isPaused
                      ? strings.bake.bakeTimer.resume
                      : strings.bake.bakeTimer.pause}
                  className={cn(
                    "pressable inline-flex size-11 items-center justify-center rounded-full transition-colors duration-fast ease-out focus-visible:outline-none focus-visible:ring-2",
                    isFinished
                      ? "bg-[#292A28] text-paper hover:bg-[#3A3B38] focus-visible:ring-ink-2"
                      : "bg-paper text-[#292A28] hover:bg-paper/85 focus-visible:ring-accent-2",
                  )}
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
                  aria-label={strings.bake.bakeTimer.edit}
                  className={cn(
                    "pressable inline-flex size-11 items-center justify-center rounded-full transition-colors duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-2",
                    isFinished
                      ? "bg-ink/[0.04] text-ink-2 hover:bg-ink/[0.08] hover:text-ink"
                      : "bg-paper/10 text-paper hover:bg-paper/15",
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
          ? strings.bake.bakeTimer.setupTitle
          : strings.bake.bakeTimer.editTitle}
        variant="pilot"
      >
        {(sheetMode === "setup" ? setupHint : strings.bake.bakeTimer.editHint) && (
          <p className="mb-4 text-body leading-relaxed text-ink-2">
            {sheetMode === "setup" ? setupHint : strings.bake.bakeTimer.editHint}
          </p>
        )}
        <DurationWheel valueMinutes={draftMinutes} onChange={setDraftMinutes} />
        <Button
          variant="primary"
          onClick={sheetMode === "setup" ? startSelectedTimer : saveRemainingTime}
          disabled={draftMinutes === 0}
          className="mt-5 w-full bg-[#292A28] hover:!bg-[#343532]"
          iconStart={sheetMode === "setup" ? <Play size={18} /> : undefined}
        >
          {sheetMode === "setup"
            ? strings.bake.bakeTimer.start
            : strings.bake.bakeTimer.saveTime}
        </Button>
      </BottomSheet>
    </>
  );
}
