"use client";

import { useEffect, useState } from "react";
import { Pause, Pencil, Play, RotateCcw, Timer } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";
import { CountdownRing } from "./countdown-ring";
import { DurationWheel } from "./duration-wheel";

export interface AutolyseTimerProps {
  durationSeconds: number;
  /** epoch ms when the current run segment started, or null when idle/paused */
  startedAt: number | null;
  /** seconds accumulated before the current run segment */
  elapsedSeconds: number;
  onStart: (durationSeconds: number) => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSetRemaining: (durationSeconds: number) => void;
}

export const DEFAULT_AUTOLYSE_DURATION_SECONDS = 45 * 60;
type SheetMode = "setup" | "countdown" | "edit";

function formatCountdown(secondsLeft: number): string {
  const safeSeconds = Math.max(0, Math.ceil(secondsLeft));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const minuteSeconds = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return hours > 0 ? `${String(hours).padStart(2, "0")}:${minuteSeconds}` : minuteSeconds;
}

function nearestWheelMinutes(seconds: number): number {
  return Math.min(23 * 60 + 55, Math.max(5, Math.round(seconds / 60 / 5) * 5));
}

export function AutolyseTimer({
  durationSeconds,
  startedAt,
  elapsedSeconds,
  onStart,
  onPause,
  onResume,
  onReset,
  onSetRemaining,
}: AutolyseTimerProps) {
  const [now, setNow] = useState(() => Date.now());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>("setup");
  const [draftMinutes, setDraftMinutes] = useState(() => nearestWheelMinutes(durationSeconds));

  useEffect(() => {
    if (startedAt === null) return;
    setNow(Date.now());
    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, [startedAt]);

  const isIdle = startedAt === null && elapsedSeconds === 0;
  const liveSeconds = startedAt === null ? 0 : Math.max(0, (now - startedAt) / 1000);
  const totalElapsed = Math.max(0, elapsedSeconds + liveSeconds);
  const secondsLeft = Math.max(0, durationSeconds - totalElapsed);
  const isFinished = !isIdle && secondsLeft <= 0;
  const isPaused = !isIdle && startedAt === null && !isFinished;
  const formattedTime = formatCountdown(secondsLeft);
  const timerState = isFinished
    ? strings.bake.autolyseTimer.finished
    : isPaused
      ? strings.bake.autolyseTimer.paused
      : strings.bake.autolyseTimer.running;

  function openSetup() {
    setDraftMinutes(nearestWheelMinutes(durationSeconds));
    setSheetMode("setup");
    setSheetOpen(true);
  }

  function openCountdown() {
    setSheetMode("countdown");
    setSheetOpen(true);
  }

  function openEdit() {
    setDraftMinutes(nearestWheelMinutes(secondsLeft));
    setSheetMode("edit");
    setSheetOpen(true);
  }

  function startSelectedTimer() {
    onStart(draftMinutes * 60);
    setSheetMode("countdown");
  }

  function saveRemainingTime() {
    onSetRemaining(draftMinutes * 60);
    setSheetMode("countdown");
  }

  const sheetTitle =
    sheetMode === "setup"
      ? strings.bake.autolyseTimer.setupTitle
      : sheetMode === "edit"
        ? strings.bake.autolyseTimer.editTitle
        : strings.bake.autolyseTimer.countdownTitle;

  return (
    <>
      {isIdle ? (
        <section className="rounded-2xl border border-line/70 bg-paper p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent"
              aria-hidden
            >
              <Timer size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-heading text-ink">{strings.bake.autolyseTimer.heading}</h3>
              <p className="mt-1 text-small leading-relaxed text-ink-2">
                {strings.bake.autolyseTimer.idleHint}
              </p>
            </div>
          </div>
          <Button
            variant="soft"
            size="sm"
            onClick={openSetup}
            className="mt-4 w-full border border-line"
            iconStart={<Timer size={17} />}
          >
            {strings.bake.autolyseTimer.start}
          </Button>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl bg-ink text-paper shadow-lg">
          <div className="flex items-stretch">
            <button
              type="button"
              onClick={openCountdown}
              aria-label={strings.bake.autolyseTimer.openExpanded}
              className="pressable min-w-0 flex-1 px-5 py-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-2"
            >
              <span className="block text-tiny font-medium text-paper/55">{timerState}</span>
              <span
                dir="ltr"
                className="num mt-1 block font-mono text-[2rem] font-semibold leading-none tabular-nums"
              >
                {formattedTime}
              </span>
              <span className="mt-3 block h-1 overflow-hidden rounded-full bg-paper/10" aria-hidden>
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-accent via-accent-2 to-sage transition-[width] duration-1000 ease-linear motion-reduce:transition-none"
                  style={{ width: `${durationSeconds > 0 ? (secondsLeft / durationSeconds) * 100 : 0}%` }}
                />
              </span>
            </button>

            <div className="flex shrink-0 items-center gap-1 border-s border-paper/10 px-3">
              {!isFinished && (
                <button
                  type="button"
                  onClick={isPaused ? onResume : onPause}
                  aria-label={isPaused ? strings.bake.autolyseTimer.resume : strings.bake.autolyseTimer.pause}
                  className="pressable inline-flex size-11 items-center justify-center rounded-full bg-paper text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-2"
                >
                  {isPaused ? <Play size={18} fill="currentColor" aria-hidden /> : <Pause size={18} fill="currentColor" aria-hidden />}
                </button>
              )}
              <button
                type="button"
                onClick={openEdit}
                aria-label={strings.bake.autolyseTimer.edit}
                className="pressable inline-flex size-11 items-center justify-center rounded-full text-paper/70 hover:bg-paper/10 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-2"
              >
                <Pencil size={17} aria-hidden />
              </button>
            </div>
          </div>
        </section>
      )}

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        size="peek"
        title={sheetTitle}
      >
        {sheetMode === "countdown" ? (
          <div className="rounded-3xl bg-ink px-4 py-5 text-paper shadow-lg">
            <CountdownRing
              secondsLeft={secondsLeft}
              durationSeconds={durationSeconds}
              formattedTime={formattedTime}
              status={timerState}
            />

            <div className="mt-4 flex items-center justify-center gap-2">
              {!isFinished && (
                <Button
                  variant="soft"
                  size="sm"
                  onClick={isPaused ? onResume : onPause}
                  iconStart={isPaused ? <Play size={17} /> : <Pause size={17} />}
                  className="min-w-[7.5rem]"
                >
                  {isPaused ? strings.bake.autolyseTimer.resume : strings.bake.autolyseTimer.pause}
                </Button>
              )}
              <button
                type="button"
                onClick={openEdit}
                className="pressable inline-flex min-h-touch items-center gap-2 rounded-full px-4 text-small text-paper/65 hover:bg-paper/10 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-2"
              >
                <Pencil size={15} aria-hidden />
                <span>{strings.bake.autolyseTimer.edit}</span>
              </button>
              {isFinished && (
                <button
                  type="button"
                  onClick={onReset}
                  className="pressable inline-flex min-h-touch items-center gap-2 rounded-full px-4 text-small text-paper/65 hover:bg-paper/10 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-2"
                >
                  <RotateCcw size={15} aria-hidden />
                  <span>{strings.bake.autolyseTimer.reset}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
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
              className="mt-5 w-full"
              iconStart={sheetMode === "setup" ? <Play size={18} /> : undefined}
            >
              {sheetMode === "setup"
                ? strings.bake.autolyseTimer.start
                : strings.bake.autolyseTimer.saveTime}
            </Button>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
