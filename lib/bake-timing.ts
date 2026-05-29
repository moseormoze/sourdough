import type { Flour } from "@/lib/types/recipe";

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
// Fermentation engine — single source of truth.
//
// Each dough stage declares its KIND. A stage's duration is its base time
// multiplied by every modifier that applies to that kind:
//     stageSecs = base × Π(modifier.factor for modifiers where kind ∈ appliesTo)
// Today only the Q10 (temperature) modifier is registered, applying to
// fermentation stages. Adding flour-awareness later (Feature 10 T2) is a single
// Modifier object with appliesTo: ["fermentation"] — no signature changes.
//
// The starter peak is a SEPARATE axis (`starterPeakSecs`): it's the baker's
// culture, fed with its own fixed flour and calibrated at its own base temp,
// so it takes temperature but never the recipe's flour. Keeping it out of the
// stage pipeline guarantees that boundary by construction.
// ---------------------------------------------------------------------------

type StageKind = "fermentation" | "fixed";

interface StageDef {
  key: BakeStepKey;
  baseSecs: number;
  kind: StageKind;
}

/** Inputs that drive stage durations. `flour` is optional → neutral when absent. */
export interface FermentationParams {
  kitchenTempC: number;
  retardSecs: number;
  flour?: Flour;
}

interface Modifier {
  appliesTo: StageKind[];
  factor: (p: FermentationParams) => number;
}

const Q10_MODIFIER: Modifier = {
  appliesTo: ["fermentation"],
  factor: (p) => Math.pow(2, (BASE_TEMP_C - p.kitchenTempC) / 10),
};

// How much faster 100% of each flour ferments vs white. Whole grains/rye carry
// more enzymes, microbes and bran, so they ripen sooner. Weighted by the blend,
// the total shortening is capped (see flourFactor) to stay safe.
const FLOUR_SHORTENING: Record<keyof Flour, number> = {
  white: 0,
  speltWhite: 0.05,
  wholeWheat: 0.18,
  speltWhole: 0.18,
  rye: 0.25,
  other: 0,
};
const MAX_FLOUR_SHORTENING = 0.2;

/**
 * Fermentation-speed multiplier from the recipe's flour blend: 1.0 for white,
 * down to 0.80 for very high rye/whole. Capped so even 100% rye only shaves 20%.
 */
export function flourFactor(flour: Flour): number {
  const weighted = (Object.keys(FLOUR_SHORTENING) as (keyof Flour)[]).reduce(
    (sum, k) => sum + ((flour[k] ?? 0) / 100) * FLOUR_SHORTENING[k],
    0,
  );
  return 1 - Math.min(MAX_FLOUR_SHORTENING, weighted);
}

const FLOUR_MODIFIER: Modifier = {
  appliesTo: ["fermentation"], // recipe flour never touches the starter axis
  factor: (p) => (p.flour ? flourFactor(p.flour) : 1.0),
};

const MODIFIERS: readonly Modifier[] = [Q10_MODIFIER, FLOUR_MODIFIER];

// The cold retard is the schedule's shock absorber: the baker can stretch or
// shrink it to fit the bake around their life, within these bounds.
export const RETARD_DEFAULT_SECS = 12 * 3600;
export const RETARD_MIN_SECS = 6 * 3600; // below this the crumb/handling suffers
export const RETARD_MAX_SECS = 72 * 3600; // beyond ~3 days it over-proofs / too sour

const SEQUENCE: readonly StageDef[] = [
  { key: "levain", baseSecs: 10 * 3600, kind: "fermentation" }, // levain build
  { key: "mix", baseSecs: (45 + 15) * 60, kind: "fixed" }, // autolyse + mix
  { key: "bulk", baseSecs: 4 * 3600, kind: "fermentation" }, // bulk fermentation + folds
  { key: "shape", baseSecs: (25 + 10) * 60, kind: "fixed" }, // pre-shape + shape
  { key: "retard", baseSecs: RETARD_DEFAULT_SECS, kind: "fixed" }, // cold retard — editable
  { key: "preheat", baseSecs: 45 * 60, kind: "fixed" }, // preheat oven + vessel
  { key: "bake", baseSecs: (20 + 22) * 60, kind: "fixed" }, // bake covered + uncovered
];

// Recommended rest on a rack before slicing — shown as a tip, not part of "ready".
export const COOL_RECOMMENDATION_SECS = 60 * 60;

// Starter peaks ~9h after feeding at 25°C (Q10-adjusted below)
const STARTER_PEAK_BASE_SECS = 9 * 3600;
const STARTER_PEAK_BASE_TEMP_C = 25;

// ±1h window applied to both feeding and peak ranges
const WINDOW_SECS = 3600;

/** Duration of one dough stage = base × product of the modifiers for its kind. */
function stageSecs(def: StageDef, p: FermentationParams): number {
  if (def.key === "retard") return p.retardSecs;
  const product = MODIFIERS.filter((m) => m.appliesTo.includes(def.kind)).reduce(
    (acc, m) => acc * m.factor(p),
    1,
  );
  return Math.round(def.baseSecs * product);
}

/** Total seconds from levain-start to the loaf leaving the oven. */
export function bakeDurationSecs(
  kitchenTempC: number,
  retardSecs: number = RETARD_DEFAULT_SECS,
  flour?: Flour,
): number {
  const p: FermentationParams = { kitchenTempC, retardSecs, flour };
  return SEQUENCE.reduce((sum, def) => sum + stageSecs(def, p), 0);
}

/** When the levain build must begin to hit a given out-of-oven target. */
function levainStartFor(
  targetReadyAt: Date,
  kitchenTempC: number,
  retardSecs: number,
  flour?: Flour,
): Date {
  return new Date(
    targetReadyAt.getTime() - bakeDurationSecs(kitchenTempC, retardSecs, flour) * 1000,
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
  flour?: Flour,
): Date {
  return new Date(
    now.getTime() +
      (starterPeakSecs(kitchenTempC) + bakeDurationSecs(kitchenTempC, retardSecs, flour)) *
        1000,
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
  flour?: Flour,
): BakeStep[] {
  const levainStart = levainStartFor(targetReadyAt, kitchenTempC, retardSecs, flour);
  const p: FermentationParams = { kitchenTempC, retardSecs, flour };

  const steps: BakeStep[] = [];

  if (!starterReady) {
    const w = calculateFeedingWindow(targetReadyAt, kitchenTempC, retardSecs, flour);
    const feedAt = new Date((w.feedStart.getTime() + w.feedEnd.getTime()) / 2);
    steps.push({
      key: "feed",
      startAt: feedAt,
      durationSecs: Math.round((levainStart.getTime() - feedAt.getTime()) / 1000),
    });
  }

  let cursor = levainStart.getTime();
  for (const def of SEQUENCE) {
    const dur = stageSecs(def, p);
    steps.push({ key: def.key, startAt: new Date(cursor), durationSecs: dur });
    cursor += dur * 1000;
  }

  steps.push({ key: "ready", startAt: targetReadyAt, durationSecs: 0 });

  return steps;
}

export interface FeedingWindow {
  feedStart: Date;
  feedEnd: Date;
  peakStart: Date;
  peakEnd: Date;
  /** When the levain build (stage 1) should begin — midpoint of peak window. */
  levainStart: Date;
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
  flour?: Flour,
): FeedingWindow {
  const levainStart = levainStartFor(targetReadyAt, kitchenTempC, retardSecs, flour);
  const peakSecs = starterPeakSecs(kitchenTempC);

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
  flour?: Flour,
): Date {
  const lead = starterReady ? 0 : starterPeakSecs(kitchenTempC);
  return new Date(
    now.getTime() + (lead + bakeDurationSecs(kitchenTempC, retardSecs, flour)) * 1000,
  );
}
