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
