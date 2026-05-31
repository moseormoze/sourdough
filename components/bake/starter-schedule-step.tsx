"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TempInput } from "@/components/recipes/temp-input";
import { calculateFeedingWindow, calculateMinReadyAt } from "@/lib/bake-timing";
import { strings } from "@/lib/strings";
import { useDateTimePicker, startOfDay, MAX_HOUR } from "@/lib/hooks/use-date-time-picker";

// ---------------------------------------------------------------------------
// Helpers
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
  const diff =
    Math.round((startOfDay(day).getTime() - startOfDay(today).getTime()) / 86400000);
  if (diff === 1) return "מחר";
  if (diff === 2) return "מחרתיים";
  return DAY_FMT.format(day);
}

/** Short contextual day prefix: "היום", "מחר", "מחרתיים", or full weekday. */
function dayPrefix(d: Date, now: Date): string {
  const diff = Math.round((startOfDay(d).getTime() - startOfDay(now).getTime()) / 86400000);
  if (diff === 0) return "היום";
  if (diff === 1) return "מחר";
  if (diff === 2) return "מחרתיים";
  return DAY_FMT.format(d);
}

// ---------------------------------------------------------------------------
// Sub-component: FeedingWindowCard
// ---------------------------------------------------------------------------

interface FeedingWindowCardProps {
  feedAt: Date;
  peakAt: Date;
  peakHours: number;
  kitchenTemp: number;
  now: Date;
  peakDayLabel: string | null;
}

function FeedingWindowCard({
  feedAt,
  peakAt,
  peakHours,
  kitchenTemp,
  now,
  peakDayLabel,
}: FeedingWindowCardProps) {
  const s = strings.starterGate;

  return (
    <div
      className="rounded-2xl bg-accent-bg border border-accent/30 px-4 py-4 flex flex-col gap-4
                 animate-in fade-in slide-in-from-bottom-2 duration-[250ms] ease-out"
      role="status"
      aria-live="polite"
    >
      {/* Card title */}
      <p className="text-label text-accent font-medium">{s.feedCardTitle}</p>

      {/* Step 1: Feed the starter */}
      <div className="flex flex-col gap-0.5">
        <p className="text-body-sm text-ink-2">{s.feedCardFeedLabel}</p>
        <p className="text-body-sm text-ink-3">{dayPrefix(feedAt, now)}</p>
        <p className="text-heading text-ink font-semibold">
          <span dir="ltr" className="num">{TIME_FMT.format(feedAt)}</span>
        </p>
      </div>

      {/* Duration bridge */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-accent/25" />
        <p className="text-body-sm text-ink-3 whitespace-nowrap">
          {s.feedCardDurationBridge(peakHours)}
        </p>
        <div className="h-px flex-1 bg-accent/25" />
      </div>

      {/* Step 2: Starter at peak */}
      <div className="flex flex-col gap-0.5">
        <p className="text-body-sm text-ink-2">{s.feedCardPeakLabel}</p>
        <p className="text-body-sm text-ink-3">
          {peakDayLabel ?? dayPrefix(peakAt, now)}
        </p>
        <p className="text-heading text-ink font-semibold">
          <span dir="ltr" className="num">{TIME_FMT.format(peakAt)}</span>
        </p>
        <p className="text-body-sm text-ink-3 mt-1">{s.feedCardTimeDisclaimer}</p>
      </div>

      {/* Separator */}
      <div className="h-px bg-accent/20" />

      {/* Visual readiness signs */}
      <div className="flex flex-col gap-2">
        <div className="rounded-xl overflow-hidden relative h-36 w-full">
          <Image
            src="/stages/1-levain.png"
            alt="סטארטר מוכן: הוכפל בנפח, מלא בועות, גומייה מסמנת גובה התחלה"
            fill
            className="object-cover"
            sizes="(max-width: 448px) 100vw, 448px"
          />
        </div>
        <p className="text-body-sm text-ink font-medium">{s.feedCardReadinessTitle}</p>
        <p className="text-body-sm text-ink-2">{s.feedCardReadinessSigns}</p>
      </div>

      {/* Calc note */}
      <p className="text-body-sm text-ink-3">{s.feedCardCalcNote(kitchenTemp)}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface StarterScheduleStepProps {
  onDismiss: () => void;
}

export function StarterScheduleStep({ onDismiss }: StarterScheduleStepProps) {
  const s = strings.starterGate;
  const now = useMemo(() => new Date(), []);

  const [temp, setTemp] = useState<number | "">(25);
  const kitchenTemp = typeof temp === "number" ? temp : 25;

  const minReadyAt = useMemo(
    () => calculateMinReadyAt(kitchenTemp, now),
    [kitchenTemp, now],
  );

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

  const window = useMemo(
    () => (isValid ? calculateFeedingWindow(targetAt, kitchenTemp) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetAt.getTime(), kitchenTemp, isValid],
  );

  // Single recommended times (midpoints of the ±1h windows)
  const feedAt = window
    ? new Date((window.feedStart.getTime() + window.feedEnd.getTime()) / 2)
    : null;
  const peakAt = window ? window.mixStart : null;

  const peakHours = feedAt && peakAt
    ? Math.round((peakAt.getTime() - feedAt.getTime()) / 3600000)
    : 0;

  // Show day label on peak only if it's a different calendar day from the feed
  const peakDayLabel =
    feedAt && peakAt && startOfDay(peakAt).getTime() !== startOfDay(feedAt).getTime()
      ? dayPrefix(peakAt, now)
      : null;

  const minDateLabel = TIME_FMT.format(minReadyAt) + " " + DAY_FMT.format(minReadyAt);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-display-sm text-ink">{s.scheduleTitle}</h2>
      </div>

      {/* Target bread-ready time */}
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-label text-ink-2">{s.scheduleReadyLabel}</p>
          <p className="text-body-sm text-ink-3 mt-0.5">
            {s.scheduleContextLine(totalProcessHours)}
          </p>
        </div>

        {/* Day pills */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {availableDays.map((day, idx) => (
            <div key={day.toISOString()} className="flex-shrink-0 flex flex-col items-center gap-1">
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
                  {s.schedulePillEarliest}
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
      <TempInput
        label={s.scheduleTempLabel}
        value={temp}
        onChange={(v) => setTemp(v)}
      />

      {/* Validation message when time is below minimum */}
      {!isValid && (
        <p className="text-body-sm text-warn" role="alert">
          {s.scheduleTooSoon(minDateLabel)}
        </p>
      )}

      {/* Feeding window result */}
      {window && feedAt && peakAt && (
        <FeedingWindowCard
          feedAt={feedAt}
          peakAt={peakAt}
          peakHours={peakHours}
          kitchenTemp={kitchenTemp}
          now={now}
          peakDayLabel={peakDayLabel}
        />
      )}

      <Button
        variant="soft"
        className="w-full"
        disabled={!isValid}
        onClick={onDismiss}
      >
        {s.scheduleDismiss}
      </Button>
    </div>
  );
}
