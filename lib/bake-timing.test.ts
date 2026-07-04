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
  fermentationStageSecs,
  RETARD_DEFAULT_SECS,
  RETARD_MIN_SECS,
  RETARD_MAX_SECS,
  DEFAULT_FEED_RATIO,
  type FeedRatio,
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
  it("returns roughly 16–20h at 25°C (cooling excluded; levain build no longer in dough sequence)", () => {
    // dough sequence at 25°C: mix(1h) + bulk(~3.7h) + shape(35m) + retard(12h) + preheat(45m) + bake(42m) ≈ 18.7h
    const secs = bakeDurationSecs(25);
    const hours = secs / 3600;
    expect(hours).toBeGreaterThan(16);
    expect(hours).toBeLessThan(20);
  });

  it("excludes the cooling recommendation from the headline duration", () => {
    // Cooling must not be baked into the active duration.
    const secs = bakeDurationSecs(BASE_TEMP_C);
    // Dough-axis stages at base temp (levain build removed from SEQUENCE):
    // 1h mix + 4h bulk + 35m shape + 12h retard + 45m preheat + 42m bake
    expect(secs).toBe((1 + 4) * 3600 + (12 * 3600 + 35 * 60) + 45 * 60 + 42 * 60);
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
  it("returns a date ~25–30h in the future at 25°C (starter peak + dough sequence)", () => {
    // build (1:2:2 @ 25°C → 7.5h) + dough sequence (≈18.7h) ≈ 26.3h
    const now = new Date("2025-01-10T10:00:00Z");
    const min = calculateMinReadyAt(25, now);
    const hoursAhead = (min.getTime() - now.getTime()) / 3600000;
    expect(hoursAhead).toBeGreaterThan(24);
    expect(hoursAhead).toBeLessThan(30);
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

  it("mixStart equals midpoint of peak window", () => {
    const w = calculateFeedingWindow(targetReady, 25);
    const mid = (w.peakStart.getTime() + w.peakEnd.getTime()) / 2;
    expect(w.mixStart.getTime()).toBeCloseTo(mid, -3);
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

  it("omits the build step when starterReady=true", () => {
    const steps = calculateBakeSteps(targetReady, temp, true);
    expect(byKey(steps, "build")).toBeUndefined();
  });

  it("includes the build step when starterReady=false", () => {
    const steps = calculateBakeSteps(targetReady, temp, false);
    expect(byKey(steps, "build")).toBeDefined();
  });

  it("first step is 'mix' when starterReady=true", () => {
    const steps = calculateBakeSteps(targetReady, temp, true);
    expect(steps[0]!.key).toBe("mix");
  });

  it("first step is 'build' when starterReady=false", () => {
    const steps = calculateBakeSteps(targetReady, temp, false);
    expect(steps[0]!.key).toBe("build");
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

  it("the build step ends exactly at mix start", () => {
    const steps = calculateBakeSteps(targetReady, temp, false);
    const build = byKey(steps, "build")!;
    const mix = byKey(steps, "mix")!;
    expect(build.startAt.getTime() + build.durationSecs * 1000).toBe(
      mix.startAt.getTime(),
    );
  });

  it("mix starts bakeDurationSecs before the target when starterReady=true", () => {
    const steps = calculateBakeSteps(targetReady, temp, true);
    const mix = byKey(steps, "mix")!;
    expect(targetReady.getTime() - mix.startAt.getTime()).toBe(
      bakeDurationSecs(temp) * 1000,
    );
  });

  it("never contains a 'levain' step", () => {
    const withBuild = calculateBakeSteps(targetReady, temp, false);
    const noBuild  = calculateBakeSteps(targetReady, temp, true);
    expect(byKey(withBuild, "levain")).toBeUndefined();
    expect(byKey(noBuild,  "levain")).toBeUndefined();
  });

  it("has a distinct editable 'retard' step defaulting to 12h", () => {
    const steps = calculateBakeSteps(targetReady, temp, true);
    const retard = byKey(steps, "retard")!;
    expect(retard).toBeDefined();
    expect(retard.durationSecs).toBe(12 * 3600);
  });

  it("a longer retard pushes mix earlier and lengthens the total", () => {
    const base = calculateBakeSteps(targetReady, temp, true, 12 * 3600);
    const longer = calculateBakeSteps(targetReady, temp, true, 24 * 3600);
    const baseMix = base.find((s) => s.key === "mix")!;
    const longMix = longer.find((s) => s.key === "mix")!;
    // ready time is fixed, so a 12h-longer retard moves the start 12h earlier
    expect(baseMix.startAt.getTime() - longMix.startAt.getTime()).toBe(
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
    // bulk is the remaining fermentation stage (levain build gone from SEQUENCE)
    expect(dur(cold, "bulk")).toBeGreaterThan(dur(warm, "bulk"));
  });

  it("the starter peak is table-driven, not Q10 — its own calibration axis", () => {
    // At 24°C with default ratio (1:2:2), the table says 8h exactly.
    // This is distinct from the dough fermentation axis (BASE_TEMP_C = 24°C, Q10).
    expect(starterPeakSecs(24)).toBe(8 * 3600);
  });
});

describe("starterPeakSecs (table-based, T1)", () => {
  it("DEFAULT_FEED_RATIO is 2 (1:2:2)", () => {
    const r: FeedRatio = DEFAULT_FEED_RATIO;
    expect(r).toBe(2);
  });

  it("exact grid: 24°C — all five ratios", () => {
    expect(starterPeakSecs(24, 1)).toBe(5 * 3600);
    expect(starterPeakSecs(24, 2)).toBe(8 * 3600);
    expect(starterPeakSecs(24, 3)).toBe(10 * 3600);
    expect(starterPeakSecs(24, 4)).toBe(12 * 3600);
    expect(starterPeakSecs(24, 5)).toBe(14 * 3600);
  });

  it("exact grid: all rows for ratio 1:2:2", () => {
    expect(starterPeakSecs(16, 2)).toBe(14 * 3600);
    expect(starterPeakSecs(18, 2)).toBe(12 * 3600);
    expect(starterPeakSecs(20, 2)).toBe(10 * 3600);
    expect(starterPeakSecs(22, 2)).toBe(9 * 3600);
    expect(starterPeakSecs(24, 2)).toBe(8 * 3600);
    expect(starterPeakSecs(26, 2)).toBe(7 * 3600);
    expect(starterPeakSecs(28, 2)).toBe(6 * 3600);
    expect(starterPeakSecs(30, 2)).toBe(5 * 3600);
    expect(starterPeakSecs(32, 2)).toBe(Math.round(4.5 * 3600));
  });

  it("exact grid: 1:1:1 column", () => {
    expect(starterPeakSecs(16, 1)).toBe(12 * 3600);
    expect(starterPeakSecs(22, 1)).toBe(Math.round(6.5 * 3600));
    expect(starterPeakSecs(30, 1)).toBe(Math.round(2.5 * 3600));
    expect(starterPeakSecs(32, 1)).toBe(2 * 3600);
  });

  it("exact grid: 1:5:5 column", () => {
    expect(starterPeakSecs(16, 5)).toBe(20 * 3600);
    expect(starterPeakSecs(24, 5)).toBe(14 * 3600);
    expect(starterPeakSecs(32, 5)).toBe(10 * 3600);
  });

  it("interpolates linearly at mid-row temp (ratio 1:2:2: 23°C between 22→9h and 24→8h)", () => {
    // midpoint = 8.5h
    expect(starterPeakSecs(23, 2)).toBe(Math.round(8.5 * 3600));
  });

  it("interpolates at non-midpoint temp (ratio 1:3:3: 25°C between 24→10h and 26→9h)", () => {
    // t = 0.5 → 9.5h
    expect(starterPeakSecs(25, 3)).toBe(Math.round(9.5 * 3600));
  });

  it("clamps below 16°C — returns 16°C value", () => {
    expect(starterPeakSecs(14, 2)).toBe(14 * 3600);
    expect(starterPeakSecs(0,  2)).toBe(14 * 3600);
  });

  it("clamps above 32°C — returns 32°C value", () => {
    expect(starterPeakSecs(35, 2)).toBe(Math.round(4.5 * 3600));
    expect(starterPeakSecs(40, 1)).toBe(2 * 3600);
  });

  it("calling without ratio uses DEFAULT_FEED_RATIO", () => {
    expect(starterPeakSecs(24)).toBe(starterPeakSecs(24, DEFAULT_FEED_RATIO));
    expect(starterPeakSecs(20)).toBe(starterPeakSecs(20, DEFAULT_FEED_RATIO));
  });
});

describe("RETARD_MIN_SECS", () => {
  it("is at least 8h (below this crumb/handling suffers)", () => {
    expect(RETARD_MIN_SECS).toBeGreaterThanOrEqual(8 * 3600);
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

  it("rye/whole shortens bulk vs white, at the same temp (levain build no longer in dough sequence)", () => {
    const white = calculateBakeSteps(target, temp, true, RETARD_DEFAULT_SECS, blend({ white: 100 }));
    const rye = calculateBakeSteps(target, temp, true, RETARD_DEFAULT_SECS, blend({ white: 50, rye: 50 }));
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
    // starterPeakSecs takes no flour at all — the build step's wait is flour-independent.
    const ryeNotReady = calculateBakeSteps(target, temp, false, RETARD_DEFAULT_SECS, blend({ rye: 100 }));
    const whiteNotReady = calculateBakeSteps(target, temp, false, RETARD_DEFAULT_SECS, blend({ white: 100 }));
    expect(dur(ryeNotReady, "build")).toBe(dur(whiteNotReady, "build"));
  });

  it("regression: omitting flour equals 100% white (backward compatible)", () => {
    const noFlour = calculateBakeSteps(target, temp, true, RETARD_DEFAULT_SECS);
    const white = calculateBakeSteps(target, temp, true, RETARD_DEFAULT_SECS, blend({ white: 100 }));
    expect(dur(noFlour, "bulk")).toBe(dur(white, "bulk"));
  });
});

describe("durationRangeLabel", () => {
  it("brackets the estimate symmetrically (±1h, matching the feeding window)", () => {
    expect(durationRangeLabel(8 * 3600)).toBe("בין 7 ל-9 שעות");
    expect(durationRangeLabel(9 * 3600)).toBe("בין 8 ל-10 שעות");
    expect(durationRangeLabel(4 * 3600)).toBe("בין 3 ל-5 שעות");
  });

  it("never drops below 1 hour on the low side", () => {
    expect(durationRangeLabel(1.5 * 3600)).toBe("בין 1 ל-3 שעות");
  });
});

describe("fermentationStageSecs", () => {
  it("applies Q10 and flour factors to a base duration", () => {
    expect(fermentationStageSecs(4 * 3600, 24)).toBe(4 * 3600);
    expect(fermentationStageSecs(4 * 3600, 24, blend({ rye: 100 }))).toBe(
      Math.round(4 * 3600 * 0.8)
    );
    expect(fermentationStageSecs(4 * 3600, 34, blend({ white: 100 }))).toBe(
      adjustDurationSeconds(4 * 3600, 34)
    );
  });
});

describe("RETARD_MAX_SECS", () => {
  it("is capped at 48h (not 72h)", () => {
    expect(RETARD_MAX_SECS).toBe(48 * 3600);
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
