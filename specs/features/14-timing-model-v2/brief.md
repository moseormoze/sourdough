# Feature: Timing Model v2 — Engine

## Problem
The bake schedule is built on a timing engine that contradicts itself and the
biology. It runs **two** back-to-back fermentation builds (feed starter → peak,
then build levain → peak) — ~17 h of process the target audience's course does in
one. The starter's peak time is a fixed Q10 number, but in reality it's a function
of temperature **and feed ratio** (an empirical table that's steeper than Q10), so
the levain math (1:1:1) and the displayed times (8–10 h) can't both be right. The
result: redundant steps, and times the baker can't trust. This feature rebuilds
the engine — pure logic, no UI — so every downstream screen (planner, timeline,
walkthrough) stands on an accurate, self-consistent base. It is the foundation for
features 15 (ratio-as-lever UX) and 16 (walkthrough content).

## User Story
As a baker planning a bake, I want the schedule to model a **single** starter
build whose timing reflects my room temperature and chosen feed ratio, so the
times I see are real and I'm not doing a redundant second build.

## Scope — What's In
- **Single build:** collapse the `feed` and `levain` steps into one
  "refresh starter to peak" step in `bake-timing.ts`.
- **Table-based starter peak:** replace the fixed Q10 starter-peak calc with a
  lookup against the temp × ratio table ([`timing-model.md` §8](../../../context/timing-model.md)).
  Ratio is one of the **5 discrete columns**; temperature **interpolates linearly**
  between the table's rows and **clamps** below 16 °C / above 32 °C.
- **Ratio-driven levain math:** `bake-math.ts` derives the refresh breakdown
  (mother / flour / water) from the required active-starter amount + the chosen
  ratio (one of the 5), instead of a hard-coded 1:1:1 split.
- **Retard bounds:** update min 6 h → 8 h. **Max stays 48 h** (72 h is excessive
  for beginners; a long-retard warning is a UX concern for features 15/16).
- Keep the existing **Q10 + flour** model for the dough-axis fermentation stages
  (levain build folds into the single build; bulk unchanged in formula).
- Full unit-test coverage for the new lookup, interpolation, single-build sequence,
  and ratio-driven math.

## Out of Scope
- **Any UI / planner changes** — that's feature 15. This feature only changes the
  engine + math and their tests.
- **Walkthrough content** (`stages.ts` copy, stage numbering, bake temps) —
  feature 16.
- **starter-% → bulk lever.** The course asserts higher inoculation shortens bulk
  but gives no quantitative data. Deferred until we have a defensible model (see
  Open Questions); not worth guessing a formula here.
- **Persisted-bake migration** for active bakes saved under the two-build model
  (tracked as a risk; decide in design).

## Acceptance Criteria
- [ ] The bake sequence contains exactly one pre-mix fermentation step (the
      refresh/build), never a separate feed + levain pair.
- [ ] Starter peak time matches the §8 table exactly at every grid point;
      between rows it interpolates linearly on temperature; outside 16–32 °C it
      clamps to the edge value. Ratio is one of the 5 columns.
- [ ] Given a required active-starter amount and a ratio, the refresh breakdown
      sums correctly (mother + flour + water = total) at ratios 1:1:1 … 1:5:5.
- [ ] Retard accepts 8 h ≤ r ≤ 48 h; values outside clamp to the bounds.
- [ ] `bakeDurationSecs` and the full step schedule remain internally consistent
      (steps are contiguous, sum to the total, ready time matches).
- [ ] All new logic is covered by passing Vitest tests; existing timing tests are
      updated, not deleted, to reflect the new model.

## Dependencies
- Depends on: Discovery 14 (this overhaul) + `context/timing-model.md` (the data).
- Blocks: Feature 15 (ratio-as-lever UX), Feature 16 (walkthrough content).

## Open Questions
_Resolved in PM review (2026-05-31):_
1. **Interpolation** → linear on **temperature** only, clamp at 16/32 °C edges.
2. **Feed-ratio domain** → **5 discrete columns** (not continuous). The ±1 h peak
   window already absorbs finer precision; simpler for beginners and feature 15.
3. **starter-% → bulk** → **out of scope** for v2; revisit with real data.
4. **Retard max** → **stays 48 h** (not 72 h); long-retard warning is a UX concern
   for features 15/16.
