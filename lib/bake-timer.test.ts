import { describe, expect, it } from "vitest";
import { getStage } from "@/lib/data/stages";
import type { ActiveBake } from "@/lib/types/active-bake";
import {
  deriveTimerSnapshot,
  formatTimerTime,
  resolveCurrentStageTimer,
  resolveStageTimerOptions,
} from "./bake-timer";

function makeBake(overrides: Partial<ActiveBake> = {}): ActiveBake {
  return {
    id: "bake-1",
    recipe: {
      id: "recipe-1",
      name: "לחם בדיקה",
      flour: {
        white: 80,
        wholeWheat: 20,
        rye: 0,
        speltWhite: 0,
        speltWhole: 0,
        other: 0,
      },
      hydration: 75,
      salt: 2,
      levain: 20,
      flourWeightGrams: 500,
      kitchenTemp: 24,
      inclusions: [],
      createdAt: 1,
      updatedAt: 1,
    },
    startedAt: 1,
    currentStage: 2,
    stageStartedAt: 1,
    observationChecks: {},
    subStep: 0,
    timerStartedAt: null,
    timerElapsedSeconds: 0,
    timerDurationSeconds: null,
    bakingMethod: "closed-vessel",
    feedAt: null,
    peakAt: null,
    feedRatio: 2,
    retardHours: 12,
    doughTempC: null,
    ...overrides,
  };
}

describe("deriveTimerSnapshot", () => {
  it.each([
    ["idle", null, 0, 120],
    ["running", 99_000, 0, 119],
    ["paused", null, 30, 90],
    ["finished", null, 120, 0],
  ] as const)("derives %s with a fixed clock", (phase, startedAt, elapsed, secondsLeft) => {
    expect(
      deriveTimerSnapshot({
        durationSeconds: 120,
        startedAt,
        elapsedSeconds: elapsed,
        nowMs: 100_000,
      }),
    ).toEqual({ phase, secondsLeft });
  });

  it("clamps elapsed wall time and remaining time at zero", () => {
    expect(
      deriveTimerSnapshot({
        durationSeconds: 10,
        startedAt: 80_000,
        elapsedSeconds: -5,
        nowMs: 100_000,
      }),
    ).toEqual({ phase: "finished", secondsLeft: 0 });
  });

  it("can preserve the OptionalTimer contract when the clock moves backward", () => {
    expect(
      deriveTimerSnapshot({
        durationSeconds: 120,
        startedAt: 110_000,
        elapsedSeconds: 0,
        nowMs: 100_000,
        clampFutureStart: false,
      }),
    ).toEqual({ phase: "running", secondsLeft: 130 });
  });
});

describe("formatTimerTime", () => {
  it("preserves autolyse ceil rounding and its hours boundary", () => {
    expect(formatTimerTime(119.1, 120, "ceil")).toBe("02:00");
    expect(formatTimerTime(3_599.1, 7_200, "ceil")).toBe("01:00:00");
  });

  it("preserves OptionalTimer floor rounding and duration-based hours", () => {
    expect(formatTimerTime(119.9, 120, "floor")).toBe("01:59");
    expect(formatTimerTime(3_599.9, 3_600, "floor")).toBe("00:59:59");
  });
});

describe("resolveCurrentStageTimer", () => {
  it("resolves the starter peak from recipe temperature and feed ratio", () => {
    expect(resolveCurrentStageTimer(makeBake({ currentStage: 1 }), getStage(1)!)).toEqual({
      durationSeconds: 8 * 60 * 60,
      clampFutureStart: false,
      rounding: "floor",
    });
  });

  it("uses the configured or default autolyse duration", () => {
    expect(
      resolveCurrentStageTimer(
        makeBake({ timerDurationSeconds: 30 * 60 }),
        getStage(2)!,
      ),
    ).toEqual({
      durationSeconds: 30 * 60,
      clampFutureStart: true,
      rounding: "ceil",
    });
    expect(resolveCurrentStageTimer(makeBake(), getStage(2)!)).toEqual({
      durationSeconds: 45 * 60,
      clampFutureStart: true,
      rounding: "ceil",
    });
  });

  it("uses stage and method-specific OptionalTimer durations", () => {
    expect(resolveCurrentStageTimer(makeBake({ currentStage: 4 }), getStage(4)!)).toEqual({
      durationSeconds: 30 * 60,
      clampFutureStart: false,
      rounding: "floor",
    });
    expect(
      resolveCurrentStageTimer(
        makeBake({ currentStage: 8, bakingMethod: "open-with-steam" }),
        getStage(8)!,
      ),
    ).toEqual({
      durationSeconds: 50 * 60,
      clampFutureStart: false,
      rounding: "floor",
    });
  });

  it("ignores stray timer data on a stage without a timer", () => {
    expect(
      resolveCurrentStageTimer(
        makeBake({ currentStage: 3, timerStartedAt: 1 }),
        getStage(3)!,
      ),
    ).toBeNull();
  });
});

describe("resolveStageTimerOptions", () => {
  const MIN = 60;

  it("returns no stops for a stage without a timer", () => {
    expect(resolveStageTimerOptions(makeBake({ currentStage: 3 }), getStage(3)!)).toEqual([]);
  });

  // Every set must contain the duration the stage already ships with, so opening
  // the wheel can never silently move a default.
  it.each([
    [2, 45 * MIN],
    [4, 30 * MIN],
    [9, 20 * MIN],
    [10, 22 * MIN],
    [11, 60 * MIN],
  ])("stage %i includes its shipped default (%i s)", (stage, shipped) => {
    const options = resolveStageTimerOptions(
      makeBake({ currentStage: stage }),
      getStage(stage)!,
    );
    expect(options).toContain(shipped);
  });

  it("stage 8 covers both per-method preheat durations", () => {
    const options = resolveStageTimerOptions(makeBake({ currentStage: 8 }), getStage(8)!);
    expect(options).toContain(45 * MIN);
    expect(options).toContain(50 * MIN);
  });

  it("stage 1 spreads an hour either side of the computed peak", () => {
    const bake = makeBake({ currentStage: 1 });
    const options = resolveStageTimerOptions(bake, getStage(1)!);
    const computed = resolveCurrentStageTimer(bake, getStage(1)!)!.durationSeconds;
    expect(options).toContain(computed);
    expect(options).toHaveLength(3);
    expect(Math.min(...options)).toBe(computed - 3600);
    expect(Math.max(...options)).toBe(computed + 3600);
  });

  it("stage 7 spreads the planned retard and clamps to 8–48h", () => {
    const options = resolveStageTimerOptions(
      makeBake({ currentStage: 7, retardHours: 10 }),
      getStage(7)!,
    );
    // 10h planned → 8 (clamped from 6), 10, 14
    expect(options).toContain(10 * 3600);
    expect(Math.min(...options)).toBeGreaterThanOrEqual(8 * 3600);
    expect(Math.max(...options)).toBeLessThanOrEqual(48 * 3600);
  });

  it("always returns ascending, de-duplicated stops", () => {
    for (const n of [1, 2, 4, 7, 8, 9, 10, 11]) {
      const options = resolveStageTimerOptions(makeBake({ currentStage: n }), getStage(n)!);
      expect(options.length).toBeGreaterThan(0);
      expect([...options]).toEqual([...new Set(options)].sort((a, b) => a - b));
    }
  });
});
