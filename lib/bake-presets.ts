import type { Flour } from "@/lib/types/recipe";
import { calculateBakeSteps, earliestReadyAt, type FeedRatio } from "@/lib/bake-timing";

export type PresetKey = "fast" | "classic" | "classic-late" | "long";

export interface PresetResult {
  readyAt: Date;
  retardSecs: number;
  feedRatio: FeedRatio;
}

interface PresetConfig {
  retardSecs: number;
  targetReadyHour: number;
  // Default feed ratio chosen so the build start lands at a convenient hour:
  // ratios 2 (1:2:2, 8h) → morning feed; ratio 3 (1:3:3, 10h) → evening feed.
  defaultFeedRatio: FeedRatio;
}

const PRESET_CONFIGS: Record<PresetKey, PresetConfig> = {
  fast:           { retardSecs:  6 * 3600, targetReadyHour: 20, defaultFeedRatio: 3 }, // feed ~22:00, mix next morning
  classic:        { retardSecs: 12 * 3600, targetReadyHour: 10, defaultFeedRatio: 2 }, // feed ~07:00, mix same afternoon
  "classic-late": { retardSecs: 16 * 3600, targetReadyHour: 17, defaultFeedRatio: 2 }, // feed ~10:00, mix same evening
  long:           { retardSecs: 28 * 3600, targetReadyHour: 18, defaultFeedRatio: 3 }, // feed ~22:00, mix next morning
};

/** Exported so the planner can display the ratio without calling computePresetSchedule. */
export const PRESET_DEFAULT_RATIOS: Record<PresetKey, FeedRatio> = {
  fast:           3,
  classic:        2,
  "classic-late": 2,
  long:           3,
};

const ACTIVE_STEP_KEYS = new Set(["mix", "bulk", "shape", "preheat", "bake"]);
const ACTIVE_WINDOW_START = 7;   // 07:00
const ACTIVE_WINDOW_END   = 23;  // 23:00 (exclusive — step must START before this)

function hourOf(d: Date): number {
  return d.getHours() + d.getMinutes() / 60;
}

function allActiveStepsInWindow(
  readyAt: Date,
  retardSecs: number,
  kitchenTempC: number,
  starterReady: boolean,
  flour?: Flour,
): boolean {
  const steps = calculateBakeSteps(readyAt, kitchenTempC, starterReady, retardSecs, flour);
  return steps
    .filter((s) => ACTIVE_STEP_KEYS.has(s.key))
    .every((s) => {
      const h = hourOf(s.startAt);
      return h >= ACTIVE_WINDOW_START && h < ACTIVE_WINDOW_END;
    });
}

/**
 * Compute the start-ASAP schedule for a preset.
 * Finds the earliest readyAt (on the target hour) such that:
 *   1. readyAt >= earliestReadyAt(...)
 *   2. all active steps (mix/bulk/shape/preheat/bake) start between 07:00–23:00
 * Advances by one day per iteration; returns iteration 7 as a fallback.
 */
export function computePresetSchedule(
  key: PresetKey,
  now: Date,
  kitchenTempC: number,
  starterReady: boolean,
  flour?: Flour,
): PresetResult {
  const { retardSecs, targetReadyHour, defaultFeedRatio } = PRESET_CONFIGS[key];

  const floor = earliestReadyAt(kitchenTempC, now, starterReady, retardSecs, flour);

  // Build candidate: today at targetReadyHour
  const base = new Date(now);
  base.setHours(targetReadyHour, 0, 0, 0);

  // Advance until >= floor
  const candidate = new Date(base);
  if (candidate < floor) {
    const daysNeeded = Math.ceil(
      (floor.getTime() - candidate.getTime()) / 86400000,
    );
    candidate.setDate(candidate.getDate() + daysNeeded);
    candidate.setHours(targetReadyHour, 0, 0, 0);
  }

  // Advance until active steps are in-window (max 7 iterations)
  for (let i = 0; i < 7; i++) {
    if (allActiveStepsInWindow(candidate, retardSecs, kitchenTempC, starterReady, flour)) {
      break;
    }
    candidate.setDate(candidate.getDate() + 1);
    candidate.setHours(targetReadyHour, 0, 0, 0);
  }

  return { readyAt: candidate, retardSecs, feedRatio: defaultFeedRatio };
}
