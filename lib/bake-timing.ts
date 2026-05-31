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
export const RETARD_MIN_SECS = 8 * 3600; // below 8h crumb/handling suffers (course minimum)
export const RETARD_MAX_SECS = 48 * 3600; // beyond 48h over-proofs / gets too sour for beginners

// The dough-axis sequence (mix → ready). The starter build is handled separately
// on the starter axis (starterPeakSecs) and injected by calculateBakeSteps when
// starterReady === false. Keeping it off this list ensures recipe flour never
// influences the build duration (starter-axis boundary by construction).
const SEQUENCE: readonly StageDef[] = [
  { key: "mix",     baseSecs: (45 + 15) * 60,  kind: "fixed" },        // autolyse + mix
  { key: "bulk",    baseSecs: 4 * 3600,         kind: "fermentation" }, // bulk + folds
  { key: "shape",   baseSecs: (25 + 10) * 60,  kind: "fixed" },        // pre-shape + shape
  { key: "retard",  baseSecs: RETARD_DEFAULT_SECS, kind: "fixed" },    // cold retard — editable
  { key: "preheat", baseSecs: 45 * 60,          kind: "fixed" },       // preheat oven + vessel
  { key: "bake",    baseSecs: (20 + 22) * 60,  kind: "fixed" },        // bake covered + uncovered
];

// Recommended rest on a rack before slicing — shown as a tip, not part of "ready".
export const COOL_RECOMMENDATION_SECS = 60 * 60;

// ---------------------------------------------------------------------------
// Starter-peak axis (T1) — table-driven, not Q10.
//
// The starter's feed ratio (1:N:N where N = FeedRatio) is the baker's primary
// scheduling lever: at 24°C, choosing ratio 1 gives a 5h peak; ratio 5 gives 14h.
// Temperature interpolates linearly between the 2°C rows and clamps at the
// table edges (16°C / 32°C). See context/timing-model.md §8.
// ---------------------------------------------------------------------------

/** Multiplier N in the 1:N:N feed ratio. 1 = 1:1:1, 5 = 1:5:5. */
export type FeedRatio = 1 | 2 | 3 | 4 | 5;

/** Default ratio until the UX lever (Feature 15) is wired. 1:2:2 = ~8h at 24°C. */
export const DEFAULT_FEED_RATIO: FeedRatio = 2;

/** Display label for each feed ratio (starter:flour:water). */
export const FEED_RATIO_LABELS: Record<FeedRatio, string> = {
  1: "1:1:1",
  2: "1:2:2",
  3: "1:3:3",
  4: "1:4:4",
  5: "1:5:5",
};

// Empirical "hours to peak after refresh" — rows: temp in °C, cols: ratio 1…5.
// Source: Israeli sourdough course reference table (timing-model.md §8).
const PEAK_TABLE: { temp: number; hours: readonly number[] }[] = [
  { temp: 16, hours: [12,   14,   16,   18,   20  ] },
  { temp: 18, hours: [10,   12,   14,   16,   18  ] },
  { temp: 20, hours: [ 8,   10,   12,   14,   16  ] },
  { temp: 22, hours: [ 6.5,  9,   11,   13,   15  ] },
  { temp: 24, hours: [ 5,    8,   10,   12,   14  ] },
  { temp: 26, hours: [ 4,    7,    9,   11,   13  ] },
  { temp: 28, hours: [ 3,    6,    8,   10,   12  ] },
  { temp: 30, hours: [ 2.5,  5,    7,    9,   11  ] },
  { temp: 32, hours: [ 2,    4.5,  6,    8,   10  ] },
];

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

/** When mix must begin to hit a given out-of-oven target (dough axis only). */
function mixStartFor(
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

/** Seconds for a fed starter to reach peak, given kitchen temp and feed ratio. */
export function starterPeakSecs(kitchenTempC: number, ratio: FeedRatio = DEFAULT_FEED_RATIO): number {
  const col = ratio - 1; // ratio 1 → col 0, …, ratio 5 → col 4
  const clamped = Math.max(PEAK_TABLE[0]!.temp, Math.min(PEAK_TABLE[PEAK_TABLE.length - 1]!.temp, kitchenTempC));

  // Find the two surrounding rows and interpolate linearly on temperature.
  for (let i = 0; i < PEAK_TABLE.length - 1; i++) {
    const lo = PEAK_TABLE[i]!;
    const hi = PEAK_TABLE[i + 1]!;
    if (clamped >= lo.temp && clamped <= hi.temp) {
      const t = (clamped - lo.temp) / (hi.temp - lo.temp);
      const hours = lo.hours[col]! + t * (hi.hours[col]! - lo.hours[col]!);
      return Math.round(hours * 3600);
    }
  }

  // Exact match on the last row (clamped === last temp).
  return Math.round(PEAK_TABLE[PEAK_TABLE.length - 1]!.hours[col]! * 3600);
}

/** Earliest Date at which bread can realistically be ready (starter not yet at peak). */
export function calculateMinReadyAt(
  kitchenTempC: number,
  now: Date = new Date(),
  retardSecs: number = RETARD_DEFAULT_SECS,
  flour?: Flour,
  feedRatio: FeedRatio = DEFAULT_FEED_RATIO,
): Date {
  return new Date(
    now.getTime() +
      (starterPeakSecs(kitchenTempC, feedRatio) + bakeDurationSecs(kitchenTempC, retardSecs, flour)) *
        1000,
  );
}

export type BakeStepKey =
  | "build"   // single starter refresh-to-peak step (only when starterReady=false)
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
 * leave the oven. When the starter isn't at peak a single "build" step is
 * prepended (refresh starter → peak). Cooling is excluded — it's a
 * recommendation after "ready".
 */
export function calculateBakeSteps(
  targetReadyAt: Date,
  kitchenTempC: number,
  starterReady: boolean,
  retardSecs: number = RETARD_DEFAULT_SECS,
  flour?: Flour,
  feedRatio: FeedRatio = DEFAULT_FEED_RATIO,
): BakeStep[] {
  const mixStart = mixStartFor(targetReadyAt, kitchenTempC, retardSecs, flour);
  const p: FermentationParams = { kitchenTempC, retardSecs, flour };

  const steps: BakeStep[] = [];

  if (!starterReady) {
    const buildSecs = starterPeakSecs(kitchenTempC, feedRatio);
    steps.push({
      key: "build",
      startAt: new Date(mixStart.getTime() - buildSecs * 1000),
      durationSecs: buildSecs,
    });
  }

  let cursor = mixStart.getTime();
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
  /** When mix should begin — midpoint of peak window. */
  mixStart: Date;
}

/**
 * Given a target bread-ready time, kitchen temperature and feed ratio, returns
 * the optimal feeding window and peak window for the starter.
 * Both windows span ±1h around the central estimate to reflect the
 * natural variability in starter activity.
 */
export function calculateFeedingWindow(
  targetReadyAt: Date,
  kitchenTempC: number,
  retardSecs: number = RETARD_DEFAULT_SECS,
  flour?: Flour,
  feedRatio: FeedRatio = DEFAULT_FEED_RATIO,
): FeedingWindow {
  const mxStart  = mixStartFor(targetReadyAt, kitchenTempC, retardSecs, flour);
  const peakSecs = starterPeakSecs(kitchenTempC, feedRatio);

  const peakStart = new Date(mxStart.getTime() - WINDOW_SECS * 1000);
  const peakEnd   = new Date(mxStart.getTime() + WINDOW_SECS * 1000);
  const feedStart = new Date(peakStart.getTime() - peakSecs * 1000);
  const feedEnd   = new Date(peakEnd.getTime()   - peakSecs * 1000);

  return { feedStart, feedEnd, peakStart, peakEnd, mixStart: mxStart };
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
  feedRatio: FeedRatio = DEFAULT_FEED_RATIO,
): Date {
  const lead = starterReady ? 0 : starterPeakSecs(kitchenTempC, feedRatio);
  return new Date(
    now.getTime() + (lead + bakeDurationSecs(kitchenTempC, retardSecs, flour)) * 1000,
  );
}
