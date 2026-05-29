"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TempInput } from "@/components/recipes/temp-input";
import { StarterToggle } from "./starter-toggle";
import { BakeTimeline } from "./bake-timeline";
import { BakingMethodSelector } from "./baking-method-selector";
import {
  useDateTimePicker,
  startOfDay,
  MAX_HOUR,
} from "@/lib/hooks/use-date-time-picker";
import {
  bakeDurationSecs,
  calculateMinReadyAt,
  calculateBakeTimeline,
  type BakeTimelinePoints,
} from "@/lib/bake-timing";
import { strings } from "@/lib/strings";
import { DEFAULT_BAKING_METHOD, type BakingMethod } from "@/lib/types/baking-method";
import type { Recipe } from "@/lib/types/recipe";

export interface BakeSchedulerSheetProps {
  recipe: Recipe;
  imageUrl?: string;
  onConfirm: (recipe: Recipe, bakingMethod: BakingMethod, feedAt?: Date, peakAt?: Date) => void;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

const DAY_FMT = new Intl.DateTimeFormat("he-IL", {
  weekday: "long",
  day: "numeric",
  month: "numeric",
});

const TIME_FMT = new Intl.DateTimeFormat("he-IL", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function dayLabel(day: Date, today: Date): string {
  const diff = Math.round(
    (startOfDay(day).getTime() - startOfDay(today).getTime()) / 86400000,
  );
  if (diff === 1) return "מחר";
  if (diff === 2) return "מחרתיים";
  return DAY_FMT.format(day);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BakeSchedulerSheet({
  recipe,
  imageUrl,
  onConfirm,
  onClose,
}: BakeSchedulerSheetProps) {
  const s = strings.bakeScheduler;
  const sg = strings.starterGate;

  const now = useMemo(() => new Date(), []);
  const sheetRef = useRef<HTMLDivElement>(null);

  const [starterReady, setStarterReady] = useState(true);
  const [temp, setTemp] = useState<number | "">(recipe.kitchenTemp);
  const [bakingMethod, setBakingMethod] = useState<BakingMethod>(DEFAULT_BAKING_METHOD);

  const kitchenTemp = typeof temp === "number" ? temp : recipe.kitchenTemp;

  const minReadyAt = useMemo(() => {
    if (starterReady) {
      return new Date(now.getTime() + bakeDurationSecs(kitchenTemp) * 1000);
    }
    return calculateMinReadyAt(kitchenTemp, now);
  }, [starterReady, kitchenTemp, now]);

  const {
    availableDays,
    dayIdx,
    effectiveHour,
    minHour,
    handleDaySelect,
    adjustHour,
    targetAt,
    isValid,
    totalProcessHours,
  } = useDateTimePicker({ minReadyAt, now });

  // Reset to earliest available slot when starter readiness changes
  useEffect(() => {
    handleDaySelect(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starterReady]);

  // Keyboard + focus
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    sheetRef.current?.focus();
  }, []);

  // Full timeline
  const timelinePoints = useMemo<BakeTimelinePoints | null>(() => {
    if (!isValid) return null;
    return calculateBakeTimeline(targetAt, kitchenTemp, starterReady);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetAt.getTime(), kitchenTemp, starterReady, isValid]);

  const minDateLabel =
    TIME_FMT.format(minReadyAt) + " " + DAY_FMT.format(minReadyAt);

  function handleConfirm() {
    const feedAt = timelinePoints?.feedAt;
    const peakAt = timelinePoints ? new Date(timelinePoints.levainStart) : undefined;
    onConfirm({ ...recipe, kitchenTemp }, bakingMethod, feedAt, peakAt);
  }

  return (
    <div
      className="fixed inset-0 z-overlay flex flex-col justify-end"
      role="dialog"
      aria-modal
      aria-label={s.headerTitle}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        style={{ animation: "sheet-fade-in 200ms ease-out both" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        tabIndex={-1}
        className="relative z-10 bg-bg rounded-t-3xl shadow-sheet max-h-[92dvh] flex flex-col outline-none"
        style={{ animation: "sheet-up 300ms cubic-bezier(0.34,1.56,0.64,1) both" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-line-2" />
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 pt-3 pb-4">

          {/* Recipe header */}
          <div className="flex items-center gap-3 mb-6">
            {imageUrl && (
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                <Image src={imageUrl} alt="" fill className="object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-tiny text-ink-3 mb-0.5">{s.headerTitle}</p>
              <p className="text-body-lg text-ink font-semibold leading-snug truncate">
                {recipe.name}
              </p>
            </div>
          </div>

          <div className="h-px bg-line mb-6" />

          {/* Starter readiness */}
          <section className="mb-6">
            <StarterToggle
              label={s.starterLabel}
              value={starterReady}
              onChange={setStarterReady}
            />
          </section>

          <div className="h-px bg-line mb-6" />

          {/* Target bread-ready time */}
          <div className="flex flex-col gap-3 mb-6">
            <div>
              <p className="text-label text-ink-2">{sg.scheduleReadyLabel}</p>
              <p className="text-body-sm text-ink-3 mt-0.5">
                {s.contextLine(totalProcessHours)}
              </p>
            </div>

            {/* Day pills */}
            <div
              className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none"
              style={{ scrollbarWidth: "none" }}
            >
              {availableDays.map((day, idx) => (
                <div
                  key={day.toISOString()}
                  className="flex-shrink-0 flex flex-col items-center gap-1"
                >
                  <button
                    type="button"
                    onClick={() => handleDaySelect(idx)}
                    className={`pressable rounded-full px-4 py-2 text-body font-medium
                      border transition-colors duration-fast ease-out
                      ${
                        idx === dayIdx
                          ? "bg-ink text-paper border-ink"
                          : "bg-paper text-ink-2 border-line"
                      }`}
                  >
                    {dayLabel(day, now)}
                  </button>
                  {idx === 0 && (
                    <span className="text-xs text-ink-3 whitespace-nowrap">
                      {sg.schedulePillEarliest}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Hour stepper */}
            <div className="flex items-center rounded-lg bg-paper border-[1.5px] border-line overflow-hidden">
              <button
                type="button"
                aria-label="פחות שעה"
                onClick={() => adjustHour(-1)}
                disabled={effectiveHour <= minHour}
                className="pressable min-h-touch min-w-touch flex items-center justify-center
                           text-ink-2 hover:text-ink disabled:opacity-40"
              >
                <span className="text-xl leading-none select-none">−</span>
              </button>
              <div className="flex-1 flex items-center justify-center min-h-touch">
                <span dir="ltr" className="num font-mono text-body-lg text-ink">
                  {String(effectiveHour).padStart(2, "0")}:00
                </span>
              </div>
              <button
                type="button"
                aria-label="עוד שעה"
                onClick={() => adjustHour(1)}
                disabled={effectiveHour >= MAX_HOUR}
                className="pressable min-h-touch min-w-touch flex items-center justify-center
                           text-ink-2 hover:text-ink disabled:opacity-40"
              >
                <span className="text-xl leading-none select-none">+</span>
              </button>
            </div>
          </div>

          {/* Temperature */}
          <div className="mb-6">
            <TempInput
              label={sg.scheduleTempLabel}
              value={temp}
              onChange={(v) => setTemp(v)}
            />
          </div>

          {/* Validation message */}
          {!isValid && (
            <p className="text-body-sm text-warn mb-6" role="alert">
              {s.tooSoon(minDateLabel)}
            </p>
          )}

          {/* Timeline — key forces remount (fade animation) on any time change */}
          {timelinePoints && (
            <div className="mb-6">
              <BakeTimeline
                key={targetAt.getTime()}
                points={timelinePoints}
                now={now}
              />
            </div>
          )}

          <div className="h-px bg-line mb-6" />

          {/* Baking method */}
          <section className="mb-2">
            <BakingMethodSelector value={bakingMethod} onChange={setBakingMethod} />
          </section>
        </div>

        {/* Fixed footer */}
        <div className="shrink-0 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-line bg-bg">
          <Button
            variant="accent"
            onClick={handleConfirm}
            disabled={!isValid}
            className="w-full"
          >
            {s.startButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
