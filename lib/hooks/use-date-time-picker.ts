import { useMemo, useState } from "react";

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

export function buildTargetDate(day: Date, hour: number, minute = 0): Date {
  const out = new Date(day);
  out.setHours(hour, minute, 0, 0);
  return out;
}

// ---------------------------------------------------------------------------
// Hook interface
// ---------------------------------------------------------------------------

interface UseDateTimePickerOptions {
  minReadyAt: Date;
  now: Date;
  /**
   * When true, the floor drops to the start of today so the baker can pick an
   * hour that already passed earlier today (used for "מתי להתחיל" — logging a
   * start that already happened). When false, the floor is `minReadyAt`.
   */
  allowPast?: boolean;
}

interface UseDateTimePickerResult {
  availableDays: Date[];
  dayIdx: number;
  selectedDay: Date;
  effectiveHour: number;
  effectiveMinute: number;
  minHour: number;
  /** "HH:MM" of the effective selection — for display and the time input value. */
  timeLabel: string;
  handleDaySelect: (idx: number) => void;
  adjustHour: (delta: number) => void;
  /** Set an exact hour + minute (used by the precise time input). */
  setExactTime: (hour: number, minute: number) => void;
  /** Jump to an exact day + hour (+ optional minute). No-op if day not in availableDays. */
  jumpTo: (day: Date, hour: number, minute?: number) => void;
  targetAt: Date;
  isValid: boolean;
  totalProcessHours: number;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDateTimePicker(opts: UseDateTimePickerOptions): UseDateTimePickerResult {
  const { minReadyAt, now } = opts;
  const allowPast = opts.allowPast ?? false;

  const totalProcessHours = Math.round((minReadyAt.getTime() - now.getTime()) / 3600000);

  // The lower bound for day/hour selection. In "past" mode it drops to the start
  // of today so earlier-today hours open up; otherwise it's the min-ready floor.
  const floorAt = useMemo(
    () => (allowPast ? startOfDay(now) : minReadyAt),
    // startOfDay(now) is stable within a day; key the memo on that + minReadyAt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allowPast, startOfDay(now).getTime(), minReadyAt.getTime()],
  );

  const availableDays = useMemo(
    () => getAvailableDays(floorAt, 8),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startOfDay(floorAt).getTime()],
  );

  const [dayIdx, setDayIdx] = useState(0);
  const selectedDay = availableDays[dayIdx] ?? availableDays[0]!;

  const minHour = minHourForDay(selectedDay, floorAt);

  const [hour, setHour] = useState(() =>
    allowPast ? now.getHours() : minHourForDay(availableDays[0]!, floorAt),
  );
  const [minute, setMinute] = useState(() => (allowPast ? now.getMinutes() : 0));

  const effectiveHour = Math.max(hour, minHour);
  const effectiveMinute = minute;

  const targetAt = buildTargetDate(selectedDay, effectiveHour, effectiveMinute);
  const isValid = targetAt.getTime() >= floorAt.getTime();

  const timeLabel = `${String(effectiveHour).padStart(2, "0")}:${String(
    effectiveMinute,
  ).padStart(2, "0")}`;

  function handleDaySelect(idx: number) {
    setDayIdx(idx);
    const newMin = minHourForDay(availableDays[idx]!, floorAt);
    setHour((h) => Math.max(h, newMin));
  }

  function adjustHour(delta: number) {
    setHour((h) => Math.max(minHour, Math.min(MAX_HOUR, h + delta)));
  }

  function setExactTime(nextHour: number, nextMinute: number) {
    setHour(Math.max(0, Math.min(MAX_HOUR, Math.trunc(nextHour))));
    setMinute(Math.max(0, Math.min(59, Math.trunc(nextMinute))));
  }

  function jumpTo(day: Date, hour: number, minute = 0) {
    const idx = availableDays.findIndex(
      (d) => startOfDay(d).getTime() === startOfDay(day).getTime(),
    );
    if (idx === -1) return;
    setDayIdx(idx);
    setHour(hour);
    setMinute(minute);
  }

  return {
    availableDays,
    dayIdx,
    selectedDay,
    effectiveHour,
    effectiveMinute,
    minHour,
    timeLabel,
    handleDaySelect,
    adjustHour,
    setExactTime,
    jumpTo,
    targetAt,
    isValid,
    totalProcessHours,
  };
}
