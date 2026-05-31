# Tasks: Timing Model v2 — Engine

> Design phase skipped (pure-logic feature, no UI). The minimal "design" — data
> model, function signatures, sequence shape — is folded into the tasks below.

## Design notes (folded in)

**Step model change.** Today the pre-mix fermentation is two steps: `feed`
(only when starter not ready) + `levain` (always, 8 h). v2 makes it **one**: a
single **refresh build** that exists *only when the starter isn't at peak*, with
duration = `starterPeakSecs(temp, ratio)` from the §8 table. When the starter is
already at peak, the schedule starts at `mix` (no build). The `levain` SEQUENCE
step is removed.

**Scope boundary.** The engine steps are used at **plan time only** (planner
timeline + `feedAt`/`peakAt` persistence). The walkthrough (`STAGES`,
`feed-stage-screen`, `/bake/feed`, active-bake `feedAt`/`peakAt`/`feedStagePassed`
fields, routing) is **untouched here** — that flow/content merge is Feature 16.
The planner UX (exposing the ratio lever) is Feature 15. Feature 14 only keeps the
existing consumers **compiling and functional**, not redesigned.

**Default ratio.** Until Feature 15 exposes the lever, the engine + math use a
single centralized default ratio constant (**1:2:2**) so 15 can swap it for the
control. Persisted active bakes are unaffected (schema unchanged; engine steps are
plan-time only).

## Task List

### T1 — Starter-peak table lookup
**Goal:** Replace the Q10 `starterPeakSecs(kitchenTempC)` with a table-driven
`starterPeakSecs(kitchenTempC, ratio)`. Encode the §8 table as a const. Ratio is
one of the 5 columns (1:1:1 … 1:5:5); temperature interpolates **linearly**
between rows; **clamp** below 16 °C / above 32 °C.
**Files likely touched:** `lib/bake-timing.ts` (+ table data), `lib/bake-timing.test.ts`.
**Test strategy:** every grid cell returns the table value exactly; a mid-row temp
(e.g. 23 °C) interpolates; 14 °C and 35 °C clamp to the edge; all 5 ratios.
**Depends on:** —
**Done when:**
- [ ] Tests written and passing
- [ ] Old Q10 starter constant + base-temp removed; no caller references them

### T2 — Collapse feed + levain into a single refresh build
**Goal:** Remove the `levain` step from `SEQUENCE`. The refresh build exists only
when `starterReady === false`, as one step of duration
`starterPeakSecs(temp, ratio)`. When `starterReady === true`, the schedule starts
at `mix`. Update `BakeStepKey`, `calculateBakeSteps`, `bakeDurationSecs`,
`earliestReadyAt`, and `calculateFeedingWindow` accordingly. Mechanical consumer
wiring (no redesign): `bake-timeline.tsx` step-key references,
`bake-planner-screen.tsx` `feedAt`/`peakAt` extraction (single build →
`feedAt` = build start, `peakAt` = build end = mix start), `starter-schedule-step.tsx`.
**Files likely touched:** `lib/bake-timing.ts` (includes `RETARD_MIN_SECS` 6h→8h),
`components/bake/bake-timeline.tsx`, `components/bake/bake-planner-screen.tsx`,
`components/bake/starter-schedule-step.tsx`, `lib/bake-timing.test.ts`.
**Test strategy:** sequence never contains `levain`; `starterReady=false` → exactly
one refresh step; `starterReady=true` → first step is `mix`; steps stay contiguous
and sum to the total; `feedAt`/`peakAt` still derivable.
**Depends on:** T1
**Done when:**
- [ ] Tests written and passing
- [ ] `npm run build` / typecheck clean; app renders planner without runtime errors

### T3 — Ratio-driven refresh math
**Goal:** In `bake-math.ts`, replace the 1:1:1 thirds split with a breakdown driven
by `levainTotalGrams` + ratio (one of 5). Recompute `mixFlour`/`mixWater` so the
mother starter's flour + water (at 100 % hydration) reconcile and total hydration
is preserved. Thread a `ratio` param defaulting to the shared 1:2:2 constant.
**Files likely touched:** `lib/bake-math.ts`, `lib/bake-math.test.ts`.
**Test strategy:** refresh breakdown sums to `levainTotalGrams` at all 5 ratios;
mix additions + refresh reconcile to recipe flour/water totals; hydration unchanged
across ratios.
**Depends on:** T2 (shared default-ratio constant)
**Done when:**
- [ ] Tests written and passing
- [ ] Breakdown correct and sums exact at ratios 1:1:1 … 1:5:5

## Build Order
T1 → T2 (includes retard min 6h→8h) → T3.

## Risks
- **UI cascade.** Removing the `levain` step key touches 3 components. Keep them
  *functional, not redesigned* — guard against runtime crashes where a step key
  disappears. The real redesign is Features 15/16.
- **Schedule shrinks** ~8 h when the starter is ready (the redundant levain build
  is gone). Expected — update any snapshot/timeline tests rather than fighting it.
- **Default ratio.** 1:2:2 is a placeholder until Feature 15; centralize it as one
  constant so the lever swaps in cleanly.
- **Walkthrough still shows old "בניית שאור" stage 1.** That's intentional — the
  stage-0/stage-1 merge is Feature 16. 14 must not break the existing feed-stage flow.
