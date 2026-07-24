import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useDateTimePicker,
  buildTargetDate,
  startOfDay,
} from "./use-date-time-picker";

// Fri Jul 24 2026, 14:30 local
const NOW = new Date(2026, 6, 24, 14, 30, 0, 0);
const DAY_MS = 86_400_000;

describe("buildTargetDate", () => {
  it("defaults minute to 0 (back-compat with existing callers)", () => {
    const d = buildTargetDate(new Date(2026, 6, 24), 9);
    expect(d.getHours()).toBe(9);
    expect(d.getMinutes()).toBe(0);
  });

  it("sets an exact minute when provided", () => {
    const d = buildTargetDate(new Date(2026, 6, 24), 15, 34);
    expect(d.getHours()).toBe(15);
    expect(d.getMinutes()).toBe(34);
  });
});

describe("useDateTimePicker — end mode (allowPast omitted)", () => {
  const minReadyAt = new Date(2026, 6, 25, 18, 0); // tomorrow 18:00

  it("day list starts at the min-ready day — no past days offered", () => {
    const { result } = renderHook(() => useDateTimePicker({ minReadyAt, now: NOW }));
    expect(startOfDay(result.current.availableDays[0]!).getTime()).toBe(
      startOfDay(minReadyAt).getTime(),
    );
    expect(result.current.dayIdx).toBe(0);
  });

  it("keeps the future floor — can't target before min-ready", () => {
    const { result } = renderHook(() => useDateTimePicker({ minReadyAt, now: NOW }));
    // min-ready is 18:00; the floor hour clamps up
    expect(result.current.effectiveHour).toBe(18);
    expect(result.current.isValid).toBe(true);
  });

  it("still allows exact minutes", () => {
    const { result } = renderHook(() => useDateTimePicker({ minReadyAt, now: NOW }));
    act(() => result.current.setExactTime(20, 45));
    expect(result.current.targetAt.getHours()).toBe(20);
    expect(result.current.targetAt.getMinutes()).toBe(45);
    expect(result.current.timeLabel).toBe("20:45");
  });
});

describe("useDateTimePicker — start mode (allowPast=true)", () => {
  const minReadyAt = NOW; // the planner passes `now` in start mode

  it("keeps day 0 = today but floors its hours at 00:00 (earlier-today opens up)", () => {
    const { result } = renderHook(() =>
      useDateTimePicker({ minReadyAt, now: NOW, allowPast: true }),
    );
    expect(startOfDay(result.current.availableDays[0]!).getTime()).toBe(
      startOfDay(NOW).getTime(),
    );
    expect(result.current.minHour).toBe(0);
  });

  it("does not offer days before today", () => {
    const { result } = renderHook(() =>
      useDateTimePicker({ minReadyAt, now: NOW, allowPast: true }),
    );
    const yesterday = startOfDay(new Date(NOW.getTime() - DAY_MS)).getTime();
    expect(
      result.current.availableDays.some(
        (d) => startOfDay(d).getTime() === yesterday,
      ),
    ).toBe(false);
  });

  it("defaults the selection to now (today, current clock time)", () => {
    const { result } = renderHook(() =>
      useDateTimePicker({ minReadyAt, now: NOW, allowPast: true }),
    );
    expect(startOfDay(result.current.selectedDay).getTime()).toBe(
      startOfDay(NOW).getTime(),
    );
    expect(result.current.effectiveHour).toBe(14);
    expect(result.current.effectiveMinute).toBe(30);
    expect(result.current.timeLabel).toBe("14:30");
  });

  it("allows a past hour earlier today (e.g. logging a 09:15 start)", () => {
    const { result } = renderHook(() =>
      useDateTimePicker({ minReadyAt, now: NOW, allowPast: true }),
    );
    act(() => result.current.setExactTime(9, 15));
    expect(result.current.targetAt.getHours()).toBe(9);
    expect(result.current.targetAt.getMinutes()).toBe(15);
    expect(result.current.targetAt.getTime()).toBeLessThan(NOW.getTime());
    expect(result.current.isValid).toBe(true);
  });

  it("adjustHour preserves the chosen minute", () => {
    const { result } = renderHook(() =>
      useDateTimePicker({ minReadyAt, now: NOW, allowPast: true }),
    );
    act(() => result.current.setExactTime(10, 20));
    act(() => result.current.adjustHour(2));
    expect(result.current.effectiveHour).toBe(12);
    expect(result.current.effectiveMinute).toBe(20);
  });
});
