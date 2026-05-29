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

// Display steps from levain-start to the loaf leaving the oven, in order.
// Each step groups one or more underlying stages; durations sum to the total
// active bake time. Cooling is deliberately NOT here — "bread ready" means
// out of the oven; the ~1h rest is a trailing recommendation (see below).
interface StageDef {
  key: BakeStepKey;
  baseSecs: number;
  tempAdjust: boolean;
}

// The cold retard is the schedule's shock absorber: the baker can stretch or
// shrink it to fit the bake around their life, within these bounds.
export const RETARD_DEFAULT_SECS = 12 * 3600;
export const RETARD_MIN_SECS = 6 * 3600; // below this the crumb/handling suffers
export const RETARD_MAX_SECS = 72 * 3600; // beyond ~3 days it over-proofs / too sour

const SEQUENCE: readonly StageDef[] = [
  { key: "levain", baseSecs: 10 * 3600, tempAdjust: true }, // levain build
  { key: "mix", baseSecs: (45 + 15) * 60, tempAdjust: false }, // autolyse + mix
  { key: "bulk", baseSecs: 4 * 3600, tempAdjust: true }, // bulk fermentation + folds
  { key: "shape", baseSecs: (25 + 10) * 60, tempAdjust: false }, // pre-shape + shape
  { key: "retard", baseSecs: RETARD_DEFAULT_SECS, tempAdjust: false }, // cold retard — editable
  { key: "preheat", baseSecs: 45 * 60, tempAdjust: false }, // preheat oven + vessel
  { key: "bake", baseSecs: (20 + 22) * 60, tempAdjust: false }, // bake covered + uncovered
];

// Recommended rest on a rack before slicing — shown as a tip, not part of "ready".
export const COOL_RECOMMENDATION_SECS = 60 * 60;

// Starter peaks ~9h after feeding at 25°C (Q10-adjusted below)
const STARTER_PEAK_BASE_SECS = 9 * 3600;
const STARTER_PEAK_BASE_TEMP_C = 25;

// ±1h window applied to both feeding and peak ranges
const WINDOW_SECS = 3600;

function stageDurationSecs(
  def: StageDef,
  kitchenTempC: number,
  retardSecs: number,
): number {
  if (def.key === "retard") return retardSecs;
  return def.tempAdjust ? adjustDurationSeconds(def.baseSecs, kitchenTempC) : def.baseSecs;
}

/** Total seconds from levain-start to the loaf leaving the oven, at the given kitchen temp. */
export function bakeDurationSecs(
  kitchenTempC: number,
  retardSecs: number = RETARD_DEFAULT_SECS,
): number {
  return SEQUENCE.reduce(
    (sum, def) => sum + stageDurationSecs(def, kitchenTempC, retardSecs),
    0,
  );
}

/** Human label for an already-temp-adjusted duration (e.g. "כ-9 שעות" / "כ-45 דקות"). */
export function durationLabel(secs: number): string {
  const totalMins = Math.round(secs / 60);
  if (totalMins < 60) return `כ-${totalMins} דקות`;
  return `כ-${Math.round(totalMins / 60)} שעות`;
}

/**
 * Range label for biology-driven steps, reflecting natural variability:
 * "בין 7 ל-9 שעות". The estimate sits at the top of the range.
 */
export function durationRangeLabel(secs: number): string {
  const est = secs / 3600;
  const low = Math.max(1, Math.round(est * 0.8));
  const high = Math.max(low, Math.round(est));
  if (low === high) return `כ-${high} שעות`;
  return `בין ${low} ל-${high} שעות`;
}

/** Seconds for a fed starter to reach peak, at the given kitchen temp (Q10). */
export function starterPeakSecs(kitchenTempC: number): number {
  return Math.round(
    STARTER_PEAK_BASE_SECS * Math.pow(2, (STARTER_PEAK_BASE_TEMP_C - kitchenTempC) / 10),
  );
}

/** Earliest Date at which bread can realistically be ready. */
export function calculateMinReadyAt(
  kitchenTempC: number,
  now: Date = new Date(),
  retardSecs: number = RETARD_DEFAULT_SECS,
): Date {
  return new Date(
    now.getTime() +
      (starterPeakSecs(kitchenTempC) + bakeDurationSecs(kitchenTempC, retardSecs)) * 1000,
  );
}

export type BakeStepKey =
  | "feed"
  | "levain"
  | "mix"
  | "bulk"
  | "shape"
  | "retard"
  | "preheat"
  | "bake"
  | "ready";

export interface BakeStep {
  key: BakeStepKey;
  /** When this step begins. For "ready", the moment the loaf leaves the oven. */
  startAt: Date;
  /** Active duration of the step in seconds. 0 for the "ready" marker. */
  durationSecs: number;
}

/**
 * The full ordered bake schedule working backwards from when the loaf should
 * leave the oven. Includes the optional feeding step when the starter isn't
 * yet at peak. Cooling is excluded — it's a recommendation after "ready".
 */
export function calculateBakeSteps(
  targetReadyAt: Date,
  kitchenTempC: number,
  starterReady: boolean,
  retardSecs: number = RETARD_DEFAULT_SECS,
): BakeStep[] {
  const levainStart = new Date(
    targetReadyAt.getTime() - bakeDurationSecs(kitchenTempC, retardSecs) * 1000,
  );

  const steps: BakeStep[] = [];

  if (!starterReady) {
    const w = calculateFeedingWindow(targetReadyAt, kitchenTempC, retardSecs);
    const feedAt = new Date((w.feedStart.getTime() + w.feedEnd.getTime()) / 2);
    steps.push({
      key: "feed",
      startAt: feedAt,
      durationSecs: Math.round((levainStart.getTime() - feedAt.getTime()) / 1000),
    });
  }

  let cursor = levainStart.getTime();
  for (const def of SEQUENCE) {
    const dur = stageDurationSecs(def, kitchenTempC, retardSecs);
    steps.push({ key: def.key, startAt: new Date(cursor), durationSecs: dur });
    cursor += dur * 1000;
  }

  steps.push({ key: "ready", startAt: targetReadyAt, durationSecs: 0 });

  return steps;
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
  retardSecs: number = RETARD_DEFAULT_SECS,
): FeedingWindow {
  const levainStart = new Date(
    targetReadyAt.getTime() - bakeDurationSecs(kitchenTempC, retardSecs) * 1000,
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

/**
 * Earliest the loaf can be out of the oven for a given retard length —
 * the floor for the target picker and the basis for graceful overflow.
 */
export function earliestReadyAt(
  kitchenTempC: number,
  now: Date,
  starterReady: boolean,
  retardSecs: number = RETARD_DEFAULT_SECS,
): Date {
  const lead = starterReady ? 0 : starterPeakSecs(kitchenTempC);
  return new Date(
    now.getTime() + (lead + bakeDurationSecs(kitchenTempC, retardSecs)) * 1000,
  );
}
