import { useState, useMemo } from "react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const MAX_HOUR = 23;

// ---------------------------------------------------------------------------
// Exported helpers
// ---------------------------------------------------------------------------

export function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

/** Returns up to `count` days starting from the day of `minAt`. */
export function getAvailableDays(minAt: Date, count = 8): Date[] {
  const base = startOfDay(minAt);
  return Array.from({ length: count }, (_, i) => addDays(base, i));
}

/** Earliest valid hour on a given day. Only the minimum day has a real floor. */
export function minHourForDay(day: Date, minAt: Date): number {
  const dayMs = startOfDay(day).getTime();
  const minDayMs = startOfDay(minAt).getTime();
  if (dayMs > minDayMs) return 0;
  const minH = minAt.getHours() + (minAt.getMinutes() > 0 ? 1 : 0);
  return Math.min(minH, MAX_HOUR);
}

export function buildTargetDate(day: Date, hour: number): Date {
  const out = new Date(day);
  out.setHours(hour, 0, 0, 0);
  return out;
}

// ---------------------------------------------------------------------------
// Hook interface
// ---------------------------------------------------------------------------

interface UseDateTimePickerOptions {
  minReadyAt: Date;
  now: Date;
}

interface UseDateTimePickerResult {
  availableDays: Date[];
  dayIdx: number;
  selectedDay: Date;
  effectiveHour: number;
  minHour: number;
  handleDaySelect: (idx: number) => void;
  adjustHour: (delta: number) => void;
  /** Jump to an exact day + hour (used by presets). No-op if day not in availableDays. */
  jumpTo: (day: Date, hour: number) => void;
  targetAt: Date;
  isValid: boolean;
  totalProcessHours: number;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDateTimePicker(opts: UseDateTimePickerOptions): UseDateTimePickerResult {
  const { minReadyAt, now } = opts;

  const totalProcessHours = Math.round((minReadyAt.getTime() - now.getTime()) / 3600000);

  const availableDays = useMemo(() => getAvailableDays(minReadyAt, 6), [minReadyAt]);

  const [dayIdx, setDayIdx] = useState(0);
  const selectedDay = availableDays[dayIdx]!;

  const minHour = minHourForDay(selectedDay, minReadyAt);
  const [hour, setHour] = useState(() => minHourForDay(availableDays[0]!, minReadyAt));

  const effectiveHour = Math.max(hour, minHour);

  const targetAt = buildTargetDate(selectedDay, effectiveHour);
  const isValid = targetAt.getTime() >= minReadyAt.getTime();

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

  function jumpTo(day: Date, hour: number) {
    const idx = availableDays.findIndex(
      (d) => startOfDay(d).getTime() === startOfDay(day).getTime(),
    );
    if (idx === -1) return;
    setDayIdx(idx);
    setHour(hour);
  }

  return {
    availableDays,
    dayIdx,
    selectedDay,
    effectiveHour,
    minHour,
    handleDaySelect,
    adjustHour,
    jumpTo,
    targetAt,
    isValid,
    totalProcessHours,
  };
}
