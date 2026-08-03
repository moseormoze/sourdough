import {
  deriveTimerSnapshot,
  formatTimerTime,
  resolveCurrentStageTimer,
  type TimerPhase,
} from "@/lib/bake-timer";
import type { Stage } from "@/lib/data/stages";
import type { ActiveBake } from "@/lib/types/active-bake";

export type HomeBakeStatus =
  | {
      kind: "timer";
      phase: Exclude<TimerPhase, "idle">;
      secondsLeft: number;
      formattedTime: string;
    }
  | { kind: "folds"; current: number; total: number }
  | { kind: "none" };

export function getHomeBakeStatus(
  activeBake: ActiveBake,
  stage: Stage,
  nowMs = Date.now(),
): HomeBakeStatus {
  const timer = resolveCurrentStageTimer(activeBake, stage);

  if (timer !== null) {
    const snapshot = deriveTimerSnapshot({
      durationSeconds: timer.durationSeconds,
      startedAt: activeBake.timerStartedAt,
      elapsedSeconds: activeBake.timerElapsedSeconds,
      nowMs,
      clampFutureStart: timer.clampFutureStart,
    });

    if (snapshot.phase !== "idle") {
      return {
        kind: "timer",
        phase: snapshot.phase,
        secondsLeft: snapshot.secondsLeft,
        formattedTime: formatTimerTime(
          snapshot.secondsLeft,
          timer.durationSeconds,
          timer.rounding,
        ),
      };
    }
  }

  if (
    stage.n === activeBake.currentStage &&
    typeof stage.subSteps === "number" &&
    stage.subSteps > 0
  ) {
    return {
      kind: "folds",
      current: Math.min(stage.subSteps, Math.max(0, activeBake.subStep)),
      total: stage.subSteps,
    };
  }

  return { kind: "none" };
}
