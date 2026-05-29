import { describe, it, expect } from "vitest";
import {
  adjustDurationSeconds,
  tempAdjustedDurationLabel,
  BASE_TEMP_C,
  bakeDurationSecs,
  calculateMinReadyAt,
  calculateFeedingWindow,
} from "./bake-timing";

describe("adjustDurationSeconds", () => {
  it("returns base unchanged at BASE_TEMP_C", () => {
    const base = 10 * 3600; // 10h
    expect(adjustDurationSeconds(base, BASE_TEMP_C)).toBe(base);
  });

  it("shortens duration when warmer than base", () => {
    const base = 10 * 3600;
    const result = adjustDurationSeconds(base, 34);
    expect(result).toBeLessThan(base);
  });

  it("lengthens duration when cooler than base", () => {
    const base = 10 * 3600;
    const result = adjustDurationSeconds(base, 14);
    expect(result).toBeGreaterThan(base);
  });

  it("doubles duration for 10°C drop (Q10 rule)", () => {
    const base = 4 * 3600;
    const cooler = adjustDurationSeconds(base, BASE_TEMP_C - 10);
    expect(cooler).toBeCloseTo(base * 2, -2); // within ~100s
  });

  it("halves duration for 10°C rise (Q10 rule)", () => {
    const base = 4 * 3600;
    const warmer = adjustDurationSeconds(base, BASE_TEMP_C + 10);
    expect(warmer).toBeCloseTo(base / 2, -2);
  });
});

describe("tempAdjustedDurationLabel", () => {
  it("returns hours label for multi-hour durations", () => {
    const label = tempAdjustedDurationLabel(10 * 3600, BASE_TEMP_C);
    expect(label).toBe("כ-10 שעות");
  });

  it("returns minutes label for sub-hour durations", () => {
    // 30 min at base temp
    const label = tempAdjustedDurationLabel(30 * 60, BASE_TEMP_C);
    expect(label).toBe("כ-30 דקות");
  });

  it("reflects shorter time in a warmer kitchen (Israeli summer 30°C)", () => {
    // levain base 10h → should be noticeably shorter at 30°C
    const label = tempAdjustedDurationLabel(10 * 3600, 30);
    // At 30°C (6°C above 24°C): factor ≈ 0.66 → ~6.6h → "כ-7 שעות"
    expect(label).toBe("כ-7 שעות");
  });

  it("reflects longer time in a cooler kitchen (Israeli winter 18°C)", () => {
    // levain base 10h → should be noticeably longer at 18°C
    const label = tempAdjustedDurationLabel(10 * 3600, 18);
    // At 18°C (6°C below 24°C): factor ≈ 1.52 → ~15.2h → "כ-15 שעות"
    expect(label).toBe("כ-15 שעות");
  });
});

describe("bakeDurationSecs", () => {
  it("returns roughly 29–30h at 25°C", () => {
    const secs = bakeDurationSecs(25);
    const hours = secs / 3600;
    expect(hours).toBeGreaterThan(28);
    expect(hours).toBeLessThan(31);
  });

  it("returns more seconds in a cooler kitchen", () => {
    expect(bakeDurationSecs(18)).toBeGreaterThan(bakeDurationSecs(25));
  });

  it("returns fewer seconds in a warmer kitchen", () => {
    expect(bakeDurationSecs(30)).toBeLessThan(bakeDurationSecs(25));
  });
});

describe("calculateMinReadyAt", () => {
  it("returns a date ~38h in the future at 25°C", () => {
    const now = new Date("2025-01-10T10:00:00Z");
    const min = calculateMinReadyAt(25, now);
    const hoursAhead = (min.getTime() - now.getTime()) / 3600000;
    expect(hoursAhead).toBeGreaterThan(36);
    expect(hoursAhead).toBeLessThan(42);
  });

  it("min is further ahead in a cold kitchen", () => {
    const now = new Date("2025-01-10T10:00:00Z");
    expect(calculateMinReadyAt(18, now).getTime()).toBeGreaterThan(
      calculateMinReadyAt(25, now).getTime(),
    );
  });
});

describe("calculateFeedingWindow", () => {
  const now = new Date("2025-01-10T10:00:00Z");
  const targetReady = new Date(now.getTime() + 40 * 3600 * 1000); // 40h from now

  it("feedStart is before feedEnd", () => {
    const w = calculateFeedingWindow(targetReady, 25);
    expect(w.feedStart.getTime()).toBeLessThan(w.feedEnd.getTime());
  });

  it("peakStart is before peakEnd", () => {
    const w = calculateFeedingWindow(targetReady, 25);
    expect(w.peakStart.getTime()).toBeLessThan(w.peakEnd.getTime());
  });

  it("feeding window spans roughly 2h", () => {
    const w = calculateFeedingWindow(targetReady, 25);
    const spanH = (w.feedEnd.getTime() - w.feedStart.getTime()) / 3600000;
    expect(spanH).toBeCloseTo(2, 0);
  });

  it("peak window spans roughly 2h", () => {
    const w = calculateFeedingWindow(targetReady, 25);
    const spanH = (w.peakEnd.getTime() - w.peakStart.getTime()) / 3600000;
    expect(spanH).toBeCloseTo(2, 0);
  });

  it("feed window ends before peak window starts", () => {
    const w = calculateFeedingWindow(targetReady, 25);
    expect(w.feedEnd.getTime()).toBeLessThan(w.peakStart.getTime());
  });

  it("levainStart equals midpoint of peak window", () => {
    const w = calculateFeedingWindow(targetReady, 25);
    const mid = (w.peakStart.getTime() + w.peakEnd.getTime()) / 2;
    expect(w.levainStart.getTime()).toBeCloseTo(mid, -3);
  });

  it("earlier feed windows in a warmer kitchen", () => {
    const cold = calculateFeedingWindow(targetReady, 18);
    const warm = calculateFeedingWindow(targetReady, 30);
    // Warmer → starter peaks faster → feed window is later (closer to target)
    expect(warm.feedStart.getTime()).toBeGreaterThan(cold.feedStart.getTime());
  });
});
