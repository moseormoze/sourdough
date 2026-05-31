# Feature: Ratio Lever — Planner UX

## Problem
The planner screen currently has two structural problems. First, it conflates two
distinct jobs: comparing rhythms ("what fits my life?") and validating a schedule
("when is each step?"). Showing a full 9-row timeline inline when a preset is
selected pushes the other options off screen and breaks the comparison. Second,
the starter feed time is a black box — the engine (feature 14) now knows *why* it
lands when it does (feed ratio × kitchen temp = peak time), but the baker never
sees that lever, so they can't control when to feed. The result: the app is
simultaneously over-informative (timeline during comparison) and under-informative
(no feed-time control).

## User Story
As a baker planning a bake, I want to pick a rhythm that fits my day and see
clearly when I need to feed my starter, so that I can plan around my real schedule
without guessing.

## Scope — What's In
- **Compact preset card:** selected preset shows a ~3-line summary (active work
  window + ready time), not the full timeline. Full timeline available on demand
  behind a disclosure.
- **Timeline on demand:** "ראה את כל השלבים ▾" opens the full `BakeTimeline` in a
  bottom sheet (reusing the sheet infrastructure from feature 13).
- **Ratio lever (smart default + manual):** the planner computes and displays the
  recommended feed ratio for the chosen rhythm. In the manual ("לכוונן בעצמי")
  path, a 5-step segmented control lets the baker pin the ratio; the feed time
  updates accordingly (bidirectional: pin feed time → engine picks ratio, or pin
  ratio → engine moves feed time). Presets use the engine's DEFAULT_FEED_RATIO
  (1:2:2) and show the resulting feed time as read-only.
- **"לכוונן בעצמי" as option 5:** unified into the same radiogroup as the 4
  presets, same card pattern — not a separate element.
- Wire `feedRatio` through `calculateBakeSteps` / `computeBakeQuantities` so the
  quantities displayed in stage 1 of the walkthrough reflect the chosen ratio.

## Out of Scope
- Changing the walkthrough stage content/copy (feature 16).
- Saving the chosen ratio to the recipe or to `activeBake` persistence — ratio
  is a plan-time decision, not stored.
- Push notifications for feed time.
- Any change to the bake-in-progress screens.

## Acceptance Criteria
- [ ] All four preset cards are always visible simultaneously (no card pushes
      others below the fold when selected).
- [ ] Selecting a preset shows a ≤3-line compact summary; the full timeline is
      hidden by default and opens via disclosure.
- [ ] The compact summary shows: active-work window (start–end times) + ready
      time + feed time.
- [ ] "לכוונן בעצמי" is the fifth option in the same radiogroup as the presets.
- [ ] In manual mode, the ratio segmented control (5 options: 1:1:1 … 1:5:5)
      drives the feed time. Changing the ratio updates the feed time in ≤16ms
      (no async).
- [ ] In manual mode, changing the target-ready time updates the feed time to
      match the new ratio.
- [ ] All active-step times remain within 07:00–23:00 for each preset (existing
      preset-window invariant preserved).
- [ ] RTL layout correct throughout; all new strings in Hebrew via strings.ts.
- [ ] Existing planner + timeline tests pass; new tests cover the ratio control
      and compact summary.

## Dependencies
- Depends on: Feature 14 (timing model v2, `FeedRatio`, `DEFAULT_FEED_RATIO`,
  `calculateBakeSteps` with `feedRatio` param, `computeRefreshBreakdown`)
- Blocks: Feature 16 (walkthrough content — stage 1 quantities use the chosen ratio)

## Open Questions
_Resolved before brief was written:_
1. **Ratio domain** → 5 discrete options (not a continuous slider). ±1h peak
   window absorbs sub-ratio precision; simpler for beginners.
2. **Full timeline location** → bottom sheet (infrastructure already exists from
   feature 13).
3. **Preset ratio exposure** → read-only feed-time annotation on the compact
   summary; no ratio control in preset cards.
