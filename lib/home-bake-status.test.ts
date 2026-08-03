import { describe, expect, it } from "vitest";
import { getStage } from "@/lib/data/stages";
import type { ActiveBake } from "@/lib/types/active-bake";
import { getHomeBakeStatus } from "./home-bake-status";

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
    currentStage: 4,
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

describe("getHomeBakeStatus", () => {
  const nowMs = 100_000;

  it("shows folds when the current stage timer is idle", () => {
    expect(getHomeBakeStatus(makeBake({ subStep: 2 }), getStage(4)!, nowMs)).toEqual({
      kind: "folds",
      current: 2,
      total: 4,
    });
  });

  it("gives a running timer precedence over folds", () => {
    expect(
      getHomeBakeStatus(
        makeBake({ subStep: 2, timerStartedAt: 40_000 }),
        getStage(4)!,
        nowMs,
      ),
    ).toEqual({
      kind: "timer",
      phase: "running",
      secondsLeft: 29 * 60,
      formattedTime: "29:00",
    });
  });

  it("uses autolyse ceil formatting with the configured duration", () => {
    expect(
      getHomeBakeStatus(
        makeBake({
          currentStage: 2,
          timerDurationSeconds: 120,
          timerStartedAt: 99_100,
        }),
        getStage(2)!,
        nowMs,
      ),
    ).toEqual({
      kind: "timer",
      phase: "running",
      secondsLeft: 119.1,
      formattedTime: "02:00",
    });
  });

  it("keeps the starter timer hour display contract", () => {
    expect(
      getHomeBakeStatus(
        makeBake({ currentStage: 1, timerStartedAt: 40_000 }),
        getStage(1)!,
        nowMs,
      ),
    ).toEqual({
      kind: "timer",
      phase: "running",
      secondsLeft: 7 * 60 * 60 + 59 * 60,
      formattedTime: "07:59:00",
    });
  });

  it("formats a method-specific timer through the selector", () => {
    expect(
      getHomeBakeStatus(
        makeBake({
          currentStage: 8,
          bakingMethod: "open-with-steam",
          timerStartedAt: 40_000,
        }),
        getStage(8)!,
        nowMs,
      ),
    ).toEqual({
      kind: "timer",
      phase: "running",
      secondsLeft: 49 * 60,
      formattedTime: "49:00",
    });
  });

  it.each([
    ["paused", { timerStartedAt: null, timerElapsedSeconds: 120 }, 28 * 60, "28:00"],
    ["finished", { timerStartedAt: null, timerElapsedSeconds: 30 * 60 }, 0, "00:00"],
  ] as const)("returns a %s timer", (phase, timer, secondsLeft, formattedTime) => {
    expect(
      getHomeBakeStatus(makeBake(timer), getStage(4)!, nowMs),
    ).toEqual({ kind: "timer", phase, secondsLeft, formattedTime });
  });

  it("clamps persisted fold progress to the stage total", () => {
    expect(getHomeBakeStatus(makeBake({ subStep: 9 }), getStage(4)!, nowMs)).toEqual({
      kind: "folds",
      current: 4,
      total: 4,
    });
  });

  it("does not fabricate a status on a non-timer stage", () => {
    expect(
      getHomeBakeStatus(
        makeBake({ currentStage: 3, timerStartedAt: 1, subStep: 2 }),
        getStage(3)!,
        nowMs,
      ),
    ).toEqual({ kind: "none" });
  });
});
