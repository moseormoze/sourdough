import { describe, it, expect } from "vitest";
import {
  adjustDurationSeconds,
  tempAdjustedDurationLabel,
  durationLabel,
  durationRangeLabel,
  BASE_TEMP_C,
  bakeDurationSecs,
  calculateMinReadyAt,
  calculateFeedingWindow,
  calculateBakeSteps,
  COOL_RECOMMENDATION_SECS,
  earliestReadyAt,
  starterPeakSecs,
  flourFactor,
  RETARD_DEFAULT_SECS,
} from "./bake-timing";
import type { Flour } from "@/lib/types/recipe";

const blend = (f: Partial<Flour>): Flour => ({
  white: 0,
  wholeWheat: 0,
  rye: 0,
  speltWhite: 0,
  speltWhole: 0,
  other: 0,
  ...f,
});

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
  it("returns roughly 27–30h at 25°C (cooling excluded)", () => {
    const secs = bakeDurationSecs(25);
    const hours = secs / 3600;
    expect(hours).toBeGreaterThan(27);
    expect(hours).toBeLessThan(30);
  });

  it("excludes the cooling recommendation from the headline duration", () => {
    // Cooling must not be baked into the active duration.
    const secs = bakeDurationSecs(BASE_TEMP_C);
    // Sum of stages at base temp: 10h + 1h + 4h + 12h35m + 45m + 42m = 29h02m
    expect(secs).toBe((10 + 1 + 4) * 3600 + (12 * 3600 + 35 * 60) + 45 * 60 + 42 * 60);
    expect(COOL_RECOMMENDATION_SECS).toBe(3600);
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

describe("durationLabel", () => {
  it("formats multi-hour durations in hours", () => {
    expect(durationLabel(9 * 3600)).toBe("כ-9 שעות");
  });

  it("formats sub-hour durations in minutes", () => {
    expect(durationLabel(45 * 60)).toBe("כ-45 דקות");
  });
});

describe("calculateBakeSteps", () => {
  const targetReady = new Date("2025-01-12T14:00:00Z");
  const temp = 25;

  function byKey(steps: ReturnType<typeof calculateBakeSteps>, key: string) {
    return steps.find((s) => s.key === key);
  }

  it("omits the feed step when starterReady=true", () => {
    const steps = calculateBakeSteps(targetReady, temp, true);
    expect(byKey(steps, "feed")).toBeUndefined();
  });

  it("includes the feed step when starterReady=false", () => {
    const steps = calculateBakeSteps(targetReady, temp, false);
    expect(byKey(steps, "feed")).toBeDefined();
  });

  it("ends with a zero-duration 'ready' step at the target time", () => {
    const steps = calculateBakeSteps(targetReady, temp, true);
    const ready = steps[steps.length - 1]!;
    expect(ready.key).toBe("ready");
    expect(ready.durationSecs).toBe(0);
    expect(ready.startAt.getTime()).toBe(targetReady.getTime());
  });

  it("separates preheat, bake, and ready into distinct steps", () => {
    const steps = calculateBakeSteps(targetReady, temp, true);
    expect(byKey(steps, "preheat")).toBeDefined();
    expect(byKey(steps, "bake")).toBeDefined();
    expect(byKey(steps, "ready")).toBeDefined();
    expect(byKey(steps, "preheat")!.durationSecs).toBe(45 * 60);
    expect(byKey(steps, "bake")!.durationSecs).toBe(42 * 60);
  });

  it("steps are contiguous: each step starts when the previous ends", () => {
    const steps = calculateBakeSteps(targetReady, temp, true);
    for (let i = 1; i < steps.length; i++) {
      const prev = steps[i - 1]!;
      const expectedStart = prev.startAt.getTime() + prev.durationSecs * 1000;
      expect(steps[i]!.startAt.getTime()).toBe(expectedStart);
    }
  });

  it("the feed step ends exactly at levain start", () => {
    const steps = calculateBakeSteps(targetReady, temp, false);
    const feed = byKey(steps, "feed")!;
    const levain = byKey(steps, "levain")!;
    expect(feed.startAt.getTime() + feed.durationSecs * 1000).toBe(
      levain.startAt.getTime(),
    );
  });

  it("levain starts bakeDurationSecs before the target", () => {
    const steps = calculateBakeSteps(targetReady, temp, true);
    const levain = byKey(steps, "levain")!;
    expect(targetReady.getTime() - levain.startAt.getTime()).toBe(
      bakeDurationSecs(temp) * 1000,
    );
  });

  it("has a distinct editable 'retard' step defaulting to 12h", () => {
    const steps = calculateBakeSteps(targetReady, temp, true);
    const retard = byKey(steps, "retard")!;
    expect(retard).toBeDefined();
    expect(retard.durationSecs).toBe(12 * 3600);
  });

  it("a longer retard pushes levain earlier and lengthens the total", () => {
    const base = calculateBakeSteps(targetReady, temp, true, 12 * 3600);
    const longer = calculateBakeSteps(targetReady, temp, true, 24 * 3600);
    const baseLevain = base.find((s) => s.key === "levain")!;
    const longLevain = longer.find((s) => s.key === "levain")!;
    // ready time is fixed, so a 12h-longer retard moves the start 12h earlier
    expect(baseLevain.startAt.getTime() - longLevain.startAt.getTime()).toBe(
      12 * 3600 * 1000,
    );
    expect(longer.find((s) => s.key === "retard")!.durationSecs).toBe(24 * 3600);
  });

  it("bakeDurationSecs grows with a longer retard", () => {
    expect(bakeDurationSecs(temp, 24 * 3600)).toBe(
      bakeDurationSecs(temp, 12 * 3600) + 12 * 3600,
    );
  });
});

describe("stage kinds (engine invariant for flour-awareness)", () => {
  const target = new Date("2025-01-12T14:00:00");
  const dur = (steps: ReturnType<typeof calculateBakeSteps>, key: string) =>
    steps.find((s) => s.key === key)!.durationSecs;

  it("fixed stages are temperature-independent; fermentation stages scale", () => {
    const cold = calculateBakeSteps(target, 18, true);
    const warm = calculateBakeSteps(target, 30, true);

    // fixed stages: identical across temps
    for (const k of ["mix", "shape", "retard", "preheat", "bake"]) {
      expect(dur(cold, k)).toBe(dur(warm, k));
    }
    // fermentation stages: cooler kitchen = longer
    expect(dur(cold, "levain")).toBeGreaterThan(dur(warm, "levain"));
    expect(dur(cold, "bulk")).toBeGreaterThan(dur(warm, "bulk"));
  });

  it("the starter peak is its own axis (its own calibration, not BASE_TEMP_C)", () => {
    // Calibrated at 25°C, so at 25°C it equals the base 9h exactly —
    // distinct from the fermentation stages' 24°C reference.
    expect(starterPeakSecs(25)).toBe(9 * 3600);
  });
});

describe("flourFactor (flour-aware fermentation, T2)", () => {
  it("is 1.0 for 100% white", () => {
    expect(flourFactor(blend({ white: 100 }))).toBe(1);
  });

  it("matches the locked science table", () => {
    expect(flourFactor(blend({ wholeWheat: 100 }))).toBeCloseTo(0.82, 5);
    expect(flourFactor(blend({ white: 70, rye: 30 }))).toBeCloseTo(0.925, 5);
    expect(flourFactor(blend({ white: 60, speltWhite: 40 }))).toBeCloseTo(0.98, 5);
  });

  it("caps the shortening at 20% even for 100% rye", () => {
    expect(flourFactor(blend({ rye: 100 }))).toBeCloseTo(0.8, 5);
    expect(flourFactor(blend({ rye: 100 }))).toBeGreaterThanOrEqual(0.8);
  });
});

describe("flour-aware durations (T2)", () => {
  const temp = 25;
  const dur = (steps: ReturnType<typeof calculateBakeSteps>, key: string) =>
    steps.find((s) => s.key === key)!.durationSecs;
  const target = new Date("2025-01-12T14:00:00");

  it("rye/whole shortens levain + bulk vs white, at the same temp", () => {
    const white = calculateBakeSteps(target, temp, true, RETARD_DEFAULT_SECS, blend({ white: 100 }));
    const rye = calculateBakeSteps(target, temp, true, RETARD_DEFAULT_SECS, blend({ white: 50, rye: 50 }));
    expect(dur(rye, "levain")).toBeLessThan(dur(white, "levain"));
    expect(dur(rye, "bulk")).toBeLessThan(dur(white, "bulk"));
  });

  it("does NOT change fixed stages", () => {
    const white = calculateBakeSteps(target, temp, true, RETARD_DEFAULT_SECS, blend({ white: 100 }));
    const rye = calculateBakeSteps(target, temp, true, RETARD_DEFAULT_SECS, blend({ rye: 100 }));
    for (const k of ["mix", "shape", "retard", "preheat", "bake"]) {
      expect(dur(rye, k)).toBe(dur(white, k));
    }
  });

  it("does NOT change the starter peak (recipe flour off the starter axis)", () => {
    // starterPeakSecs takes no flour at all — the feed step's wait is flour-independent.
    const ryeNotReady = calculateBakeSteps(target, temp, false, RETARD_DEFAULT_SECS, blend({ rye: 100 }));
    const whiteNotReady = calculateBakeSteps(target, temp, false, RETARD_DEFAULT_SECS, blend({ white: 100 }));
    expect(dur(ryeNotReady, "feed")).toBe(dur(whiteNotReady, "feed"));
  });

  it("regression: omitting flour equals 100% white (backward compatible)", () => {
    const noFlour = calculateBakeSteps(target, temp, true, RETARD_DEFAULT_SECS);
    const white = calculateBakeSteps(target, temp, true, RETARD_DEFAULT_SECS, blend({ white: 100 }));
    expect(dur(noFlour, "levain")).toBe(dur(white, "levain"));
    expect(dur(noFlour, "bulk")).toBe(dur(white, "bulk"));
  });
});

describe("durationRangeLabel", () => {
  it("brackets the estimate at the top of the range", () => {
    expect(durationRangeLabel(9 * 3600)).toBe("בין 7 ל-9 שעות");
    expect(durationRangeLabel(4 * 3600)).toBe("בין 3 ל-4 שעות");
  });
});

describe("earliestReadyAt", () => {
  const now = new Date("2025-01-10T15:00:00");

  it("is bakeDurationSecs ahead of now when the starter is ready", () => {
    const e = earliestReadyAt(25, now, true, 12 * 3600);
    expect(e.getTime() - now.getTime()).toBe(bakeDurationSecs(25, 12 * 3600) * 1000);
  });

  it("is further ahead when the starter isn't ready (adds the peak)", () => {
    expect(earliestReadyAt(25, now, false).getTime()).toBeGreaterThan(
      earliestReadyAt(25, now, true).getTime(),
    );
  });

  it("is further ahead with a longer retard", () => {
    expect(earliestReadyAt(25, now, true, 24 * 3600).getTime()).toBeGreaterThan(
      earliestReadyAt(25, now, true, 12 * 3600).getTime(),
    );
  });
});
