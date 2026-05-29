// Q10 fermentation rule: every 10°C doubles/halves fermentation speed.
// Calibrated at BASE_TEMP_C; stages store their base duration at that temp.
export const BASE_TEMP_C = 24;

export function adjustDurationSeconds(baseSecs: number, kitchenTemp: number): number {
  const factor = Math.pow(2, (BASE_TEMP_C - kitchenTemp) / 10);
  return Math.round(baseSecs * factor);
}

export function tempAdjustedDurationLabel(baseSecs: number, kitchenTemp: number): string {
  const secs = adjustDurationSeconds(baseSecs, kitchenTemp);
  const totalMins = Math.round(secs / 60);

  if (totalMins < 60) {
    return `כ-${totalMins} דקות`;
  }

  const hours = Math.round(totalMins / 60);
  return `כ-${hours} שעות`;
}

// ---------------------------------------------------------------------------
// Starter readiness / feeding window
// ---------------------------------------------------------------------------

export interface FeedingWindow {
  feedStart: Date;
  feedEnd: Date;
  peakStart: Date;
  peakEnd: Date;
  /** When the levain build (stage 1) should begin — midpoint of peak window. */
  levainStart: Date;
}

// Fixed stage durations (seconds) — not temp-sensitive, using dutch-oven defaults
// Stage 2 autolyse: 45m, stage 3 mix: 15m, stage 5 pre-shape+bench: 25m,
// stage 6 shape: 10m, stage 7 retard: 12h, stage 8 preheat: 45m,
// stage 9 bake covered: 20m, stage 10 bake uncovered: 22m, stage 11 cool: 60m
const FIXED_STAGE_SECS =
  45 * 60 + 15 * 60 + 25 * 60 + 10 * 60 +
  12 * 3600 + 45 * 60 + 20 * 60 + 22 * 60 + 60 * 60;

// Starter peaks ~9h after feeding at 25°C (Q10-adjusted below)
const STARTER_PEAK_BASE_SECS = 9 * 3600;
const STARTER_PEAK_BASE_TEMP_C = 25;

// ±1h window applied to both feeding and peak ranges
const WINDOW_SECS = 3600;

/** Total seconds from levain-start to bread-ready, at the given kitchen temp. */
export function bakeDurationSecs(kitchenTempC: number): number {
  return (
    FIXED_STAGE_SECS +
    adjustDurationSeconds(10 * 3600, kitchenTempC) + // stage 1 levain
    adjustDurationSeconds(4 * 3600, kitchenTempC)    // stage 4 bulk
  );
}

/** Earliest Date at which bread can realistically be ready. */
export function calculateMinReadyAt(kitchenTempC: number, now: Date = new Date()): Date {
  const peakSecs = Math.round(
    STARTER_PEAK_BASE_SECS * Math.pow(2, (STARTER_PEAK_BASE_TEMP_C - kitchenTempC) / 10),
  );
  return new Date(now.getTime() + (peakSecs + bakeDurationSecs(kitchenTempC)) * 1000);
}

export interface BakeTimelinePoints {
  feedAt?: Date;     // only when starter not ready — midpoint of feeding window
  levainStart: Date; // when to start levain build (= when starter reaches peak)
  bulkStart: Date;   // when bulk fermentation begins (after levain + autolyse + mix)
  ovenStart: Date;   // when to put dough in oven (after everything except preheat+bake+cool)
  breadReady: Date;  // targetAt — when bread is done
}

export function calculateBakeTimeline(
  targetReadyAt: Date,
  kitchenTempC: number,
  starterReady: boolean,
): BakeTimelinePoints {
  const levainStart = new Date(
    targetReadyAt.getTime() - bakeDurationSecs(kitchenTempC) * 1000,
  );

  const levainAdjustedSecs = adjustDurationSeconds(10 * 3600, kitchenTempC);
  const bulkStart = new Date(
    levainStart.getTime() + (levainAdjustedSecs + 45 * 60 + 15 * 60) * 1000,
  );

  const ovenStart = new Date(
    targetReadyAt.getTime() - (45 * 60 + 20 * 60 + 22 * 60 + 60 * 60) * 1000,
  );

  const result: BakeTimelinePoints = {
    levainStart,
    bulkStart,
    ovenStart,
    breadReady: targetReadyAt,
  };

  if (!starterReady) {
    const w = calculateFeedingWindow(targetReadyAt, kitchenTempC);
    result.feedAt = new Date((w.feedStart.getTime() + w.feedEnd.getTime()) / 2);
  }

  return result;
}

/**
 * Given a target bread-ready time and kitchen temperature, returns the
 * optimal feeding window and peak window for the starter.
 * Both windows span ±1h around the central estimate to reflect the
 * natural variability in starter activity.
 */
export function calculateFeedingWindow(
  targetReadyAt: Date,
  kitchenTempC: number,
): FeedingWindow {
  const levainStart = new Date(
    targetReadyAt.getTime() - bakeDurationSecs(kitchenTempC) * 1000,
  );

  const peakSecs = Math.round(
    STARTER_PEAK_BASE_SECS * Math.pow(2, (STARTER_PEAK_BASE_TEMP_C - kitchenTempC) / 10),
  );

  const peakStart = new Date(levainStart.getTime() - WINDOW_SECS * 1000);
  const peakEnd   = new Date(levainStart.getTime() + WINDOW_SECS * 1000);
  const feedStart = new Date(peakStart.getTime() - peakSecs * 1000);
  const feedEnd   = new Date(peakEnd.getTime()   - peakSecs * 1000);

  return { feedStart, feedEnd, peakStart, peakEnd, levainStart };
}
