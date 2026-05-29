"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { TempInput } from "@/components/recipes/temp-input";
import { calculateFeedingWindow, calculateMinReadyAt } from "@/lib/bake-timing";
import { strings } from "@/lib/strings";

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

const MIN_HOUR = 6;
const MAX_HOUR = 22;

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

/** Returns up to `count` days starting from the day of `minAt`. */
function getAvailableDays(minAt: Date, count = 6): Date[] {
  const base = startOfDay(minAt);
  return Array.from({ length: count }, (_, i) => addDays(base, i));
}

/** Earliest valid hour on a given day, constrained to MIN_HOUR–MAX_HOUR. */
function minHourForDay(day: Date, minAt: Date): number {
  const dayMs = startOfDay(day).getTime();
  const minDayMs = startOfDay(minAt).getTime();
  if (dayMs > minDayMs) return MIN_HOUR;
  // Same day as minAt
  const minH = minAt.getHours() + (minAt.getMinutes() > 0 ? 1 : 0);
  return Math.max(MIN_HOUR, Math.min(minH, MAX_HOUR));
}

function buildTargetDate(day: Date, hour: number): Date {
  const out = new Date(day);
  out.setHours(hour, 0, 0, 0);
  return out;
}

// Day label: "מחר" / "מחרתיים" / full weekday name
function dayLabel(day: Date, today: Date): string {
  const diff =
    Math.round((startOfDay(day).getTime() - startOfDay(today).getTime()) / 86400000);
  if (diff === 1) return "מחר";
  if (diff === 2) return "מחרתיים";
  return DAY_FMT.format(day);
}

// ---------------------------------------------------------------------------
// Sub-component: FeedingWindowCard
// ---------------------------------------------------------------------------

interface FeedingWindowCardProps {
  feedStart: Date;
  feedEnd: Date;
  peakStart: Date;
  peakEnd: Date;
}

function FeedingWindowCard({ feedStart, feedEnd, peakStart, peakEnd }: FeedingWindowCardProps) {
  const s = strings.starterGate;

  function timeRange(a: Date, b: Date): string {
    return s.feedCardRange(TIME_FMT.format(a), TIME_FMT.format(b));
  }

  // Show the day context if peak is a different calendar day from feed
  const feedDay = startOfDay(feedStart).getTime();
  const peakDay = startOfDay(peakStart).getTime();
  const showPeakDay = peakDay !== feedDay;
  const peakDayLabel = showPeakDay
    ? DAY_FMT.format(peakStart)
    : null;

  return (
    <div
      className="rounded-2xl bg-accent-bg border border-accent/30 px-4 py-4 flex flex-col gap-3
                 animate-in fade-in slide-in-from-bottom-2 duration-[250ms] ease-out"
      role="status"
      aria-live="polite"
    >
      <p className="text-label text-accent font-medium">{strings.starterGate.feedCardTitle}</p>

      <div className="flex flex-col gap-1">
        <p className="text-body-sm text-ink-2">{s.feedCardFeedLabel}</p>
        <p className="text-heading text-ink">
          <span dir="ltr" className="num">{timeRange(feedStart, feedEnd)}</span>
        </p>
        <p className="text-body-sm text-ink-3">{s.feedCardFeedHint}</p>
      </div>

      <div className="h-px bg-accent/20" />

      <div className="flex flex-col gap-1">
        <p className="text-body-sm text-ink-2">{s.feedCardPeakLabel}</p>
        <p className="text-heading text-ink">
          <span dir="ltr" className="num">{timeRange(peakStart, peakEnd)}</span>
        </p>
        {peakDayLabel && (
          <p className="text-body-sm text-ink-3">{peakDayLabel}</p>
        )}
      </div>
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

  const availableDays = useMemo(() => getAvailableDays(minReadyAt, 6), [minReadyAt]);

  // Selected day index (into availableDays)
  const [dayIdx, setDayIdx] = useState(0);
  // availableDays always has exactly 6 elements (count=6 passed to getAvailableDays)
  const selectedDay = availableDays[dayIdx]!;

  // Selected hour — clamp to valid range when day/temp changes
  const minHour = minHourForDay(selectedDay, minReadyAt);
  const [hour, setHour] = useState(() => minHour);

  const effectiveHour = Math.max(hour, minHour);

  const targetAt = buildTargetDate(selectedDay, effectiveHour);
  const isValid = targetAt.getTime() >= minReadyAt.getTime();

  const window = useMemo(
    () => (isValid ? calculateFeedingWindow(targetAt, kitchenTemp) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetAt.getTime(), kitchenTemp, isValid],
  );

  function handleDaySelect(idx: number) {
    setDayIdx(idx);
    const newMin = minHourForDay(availableDays[idx]!, minReadyAt);
    setHour((h) => Math.max(h, newMin));
  }

  function adjustHour(delta: number) {
    setHour((h) => {
      const next = Math.max(minHour, Math.min(MAX_HOUR, (h ?? minHour) + delta));
      return next;
    });
  }

  const minDateLabel = TIME_FMT.format(minReadyAt) + " " + DAY_FMT.format(minReadyAt);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-display-sm text-ink">{s.scheduleTitle}</h2>
      </div>

      {/* Target bread-ready time */}
      <div className="flex flex-col gap-3">
        <p className="text-label text-ink-2">{s.scheduleReadyLabel}</p>

        {/* Day pills */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {availableDays.map((day, idx) => (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => handleDaySelect(idx)}
              className={`pressable flex-shrink-0 rounded-full px-4 py-2 text-body font-medium
                border transition-colors duration-fast ease-out
                ${
                  idx === dayIdx
                    ? "bg-ink text-paper border-ink"
                    : "bg-paper text-ink-2 border-line"
                }`}
            >
              {dayLabel(day, now)}
            </button>
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
      {window && (
        <FeedingWindowCard
          feedStart={window.feedStart}
          feedEnd={window.feedEnd}
          peakStart={window.peakStart}
          peakEnd={window.peakEnd}
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
