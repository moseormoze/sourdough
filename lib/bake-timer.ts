import { starterPeakSecs } from "@/lib/bake-timing";
import type { Stage } from "@/lib/data/stages";
import type { ActiveBake } from "@/lib/types/active-bake";

export const DEFAULT_AUTOLYSE_DURATION_SECONDS = 45 * 60;

export type TimerPhase = "idle" | "running" | "paused" | "finished";
export type TimerRounding = "ceil" | "floor";

export interface TimerSnapshot {
  phase: TimerPhase;
  secondsLeft: number;
}

export interface ResolvedStageTimer {
  durationSeconds: number;
  clampFutureStart: boolean;
  rounding: TimerRounding;
}

export function deriveTimerSnapshot({
  durationSeconds,
  startedAt,
  elapsedSeconds,
  nowMs,
  clampFutureStart = true,
}: {
  durationSeconds: number;
  startedAt: number | null;
  elapsedSeconds: number;
  nowMs: number;
  clampFutureStart?: boolean;
}): TimerSnapshot {
  const wallSeconds = startedAt === null ? 0 : (nowMs - startedAt) / 1000;
  const liveSeconds = clampFutureStart ? Math.max(0, wallSeconds) : wallSeconds;
  const elapsed = elapsedSeconds + liveSeconds;
  const totalElapsed = clampFutureStart ? Math.max(0, elapsed) : elapsed;
  const secondsLeft = Math.max(0, durationSeconds - totalElapsed);
  const phase: TimerPhase = startedAt === null && elapsedSeconds === 0
    ? "idle"
    : secondsLeft <= 0
      ? "finished"
      : startedAt === null
        ? "paused"
        : "running";

  return { phase, secondsLeft };
}

export function formatTimerTime(
  secondsLeft: number,
  durationSeconds: number,
  rounding: TimerRounding,
): string {
  const round = rounding === "ceil" ? Math.ceil : Math.floor;
  const safeSeconds = Math.max(0, round(secondsLeft));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const minuteSeconds = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const showHours = rounding === "ceil" ? hours > 0 : durationSeconds >= 3600;

  return showHours
    ? `${String(hours).padStart(2, "0")}:${minuteSeconds}`
    : minuteSeconds;
}

export function resolveCurrentStageTimer(
  activeBake: ActiveBake,
  stage: Stage,
): ResolvedStageTimer | null {
  if (stage.n !== activeBake.currentStage) return null;

  if (stage.n === 1) {
    return {
      durationSeconds: starterPeakSecs(
        activeBake.recipe.kitchenTemp,
        activeBake.feedRatio,
      ),
      clampFutureStart: false,
      rounding: "floor",
    };
  }

  if (stage.n === 2) {
    return {
      durationSeconds:
        activeBake.timerDurationSeconds ?? DEFAULT_AUTOLYSE_DURATION_SECONDS,
      clampFutureStart: true,
      rounding: "ceil",
    };
  }

  if (stage.type !== "timer" && stage.type !== "bulk") return null;

  const durationSeconds =
    stage.byMethod?.[activeBake.bakingMethod]?.durationSeconds ??
    stage.durationSeconds;

  return durationSeconds === undefined
    ? null
    : { durationSeconds, clampFutureStart: false, rounding: "floor" };
}

const MIN = 60;
const HOUR = 60 * MIN;

/**
 * Curated stops per stage, anchored so that each set contains the duration the
 * stage already ships with — choosing a timer never changes a default silently.
 * Durations are recycled from the earlier feature-27 analysis, but mapped onto
 * the stage list on `main` (that analysis was written against a list where 9 was
 * scoring, so its stage numbers are off by one from 9 upward).
 *
 * Stages 1 and 7 are computed per bake and resolved in `resolveStageTimerOptions`.
 * Stages 3, 5, 6 and 12 carry no timer.
 */
const STATIC_TIMER_OPTIONS: Record<number, readonly number[]> = {
  2: [30 * MIN, 45 * MIN, 60 * MIN], // autolyse — ships 45
  4: [15 * MIN, 20 * MIN, 30 * MIN, 45 * MIN], // bulk fold reminder — ships 30
  8: [30 * MIN, 45 * MIN, 50 * MIN, 60 * MIN], // preheat — ships 45, or 50 by method
  9: [18 * MIN, 20 * MIN, 22 * MIN, 25 * MIN], // covered bake — ships 20
  10: [20 * MIN, 22 * MIN, 25 * MIN, 30 * MIN], // uncovered bake — ships 22
  11: [45 * MIN, 60 * MIN, 90 * MIN], // cooling — ships 60
};

const LEVAIN_SPREAD_SECONDS = HOUR;
const RETARD_SPREAD_HOURS = 4;
const RETARD_MIN_HOURS = 8;
const RETARD_MAX_HOURS = 48;

function unique(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}

/**
 * The stops offered for a stage's timer. Empty when the stage has no timer.
 * The resolved duration is always included, so the wheel can always show the
 * value it is currently sitting on.
 */
export function resolveStageTimerOptions(
  activeBake: ActiveBake,
  stage: Stage,
): readonly number[] {
  const resolved = resolveCurrentStageTimer(activeBake, stage);
  if (resolved === null) return [];

  if (stage.n === 1) {
    const base = resolved.durationSeconds;
    return unique([
      Math.max(MIN, base - LEVAIN_SPREAD_SECONDS),
      base,
      base + LEVAIN_SPREAD_SECONDS,
    ]);
  }

  if (stage.n === 7) {
    const planned = activeBake.retardHours;
    const hours = unique(
      [planned - RETARD_SPREAD_HOURS, planned, planned + RETARD_SPREAD_HOURS]
        .map((h) => Math.min(RETARD_MAX_HOURS, Math.max(RETARD_MIN_HOURS, h))),
    );
    return unique([...hours.map((h) => h * HOUR), resolved.durationSeconds]);
  }

  const options = STATIC_TIMER_OPTIONS[stage.n];
  if (options === undefined) return [resolved.durationSeconds];
  return unique([...options, resolved.durationSeconds]);
}
