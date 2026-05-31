# Tasks: Ratio Lever — Planner UX

> Design phase complete. See `design.md` for component specs, interaction curves,
> and RTL notes.

## Task List

### T1 — CompactBakeSummary component
**Goal:** New pure-display component that shows the 3-line schedule summary
(feed time + active work window + ready time) with the "ראה את כל השלבים ▾"
trigger. No state, no sheet logic — just renders from props.  
**Files likely touched:**
- `components/bake/compact-bake-summary.tsx` (new)
- `lib/strings.ts` (new strings: `compactSummary.*`)
**Test strategy:** render with steps where `starterReady=true` and `false`; assert
feed row present/absent; assert active-window and ready-time text render; assert
the disclosure trigger renders.  
**Depends on:** Feature 14 (BakeStep types with `build`/`mix`/`ready` keys)  
**Done when:**
- [ ] Tests written and passing
- [ ] Component renders correctly for both starter-ready states
- [ ] RTL layout verified (emoji + label + time, ratio label dir="ltr")

### T2 — Preset cards → CompactBakeSummary + bottom-sheet timeline
**Goal:** Replace the inline `BakeTimeline` expansion inside `PresetCard` with
`CompactBakeSummary`. Wire the "ראה את כל השלבים ▾" trigger to open a
`BottomSheet` (size="full") containing the full `BakeTimeline`. All four preset
cards must remain visible simultaneously when one is selected.  
**Files likely touched:**
- `components/bake/bake-planner-screen.tsx` (add `timelineSheetOpen` state,
  replace `BakeTimeline` in `PresetCard` children, add `BottomSheet`)
- `components/bake/bake-planner-screen.test.tsx`  
**Test strategy:** select a preset → assert `CompactBakeSummary` renders (not
`BakeTimeline`); assert other preset cards still in the DOM; open the sheet → assert
`BakeTimeline` renders inside it; close sheet → assert `BakeTimeline` unmounts.  
**Depends on:** T1  
**Done when:**
- [ ] Tests written and passing
- [ ] All 4 cards visible when one is selected (no scroll-away)
- [ ] Sheet opens/closes with correct spring animation

### T3 — "לכוונן בעצמי" as 5th radiogroup option + RatioControl
**Goal:** Move "לכוונן בעצמי" from the standalone advanced-disclosure button into
the `PRESET_LIST` radiogroup as the 5th entry. When selected, show `RatioControl`
(5-button segmented control, 1:1:1 … 1:5:5) + the existing day/hour picker +
inline `BakeTimeline` (manual mode keeps full timeline — no sheet, it's the
"details" intent). `feedRatio` state lives in `BakePlannerScreen`; changing the
ratio updates the schedule instantly.  
**Files likely touched:**
- `components/bake/bake-planner-screen.tsx` (add `feedRatio` state, add
  `RatioControl` inline, absorb `isManualOpen`/`openManual`/`closeManual` into
  the unified `scheduleMode`)
- `components/bake/ratio-control.tsx` (new, or inline in planner if small enough)
- `lib/strings.ts` (ratio labels, ratio lever label)
- `components/bake/bake-planner-screen.test.tsx`  
**Test strategy:** selecting "לכוונן בעצמי" renders `RatioControl`; changing ratio
button updates feed time in the timeline; all 5 ratio options trigger distinct
`feedRatio` values; existing preset selection tests pass unchanged.  
**Depends on:** T2  
**Done when:**
- [ ] Tests written and passing
- [ ] `RatioControl` buttons ≥44px height; active state visually distinct
- [ ] Ratio order RTL (1:1:1 rightmost, 1:5:5 leftmost)
- [ ] Feed time updates synchronously on ratio change (no perceptible lag)

### T4 — Wire feedRatio through onConfirm and quantities
**Goal:** Thread `feedRatio` from planner state into `calculateBakeSteps` (already
accepts it), `computePresetSchedule` (pass-through for now — presets use
`DEFAULT_FEED_RATIO`), and through `onConfirm` so the bake session starts with the
correct ratio. `computeBakeQuantities` in `stage-screen` should receive the ratio
from `activeBake` so stage-1 quantities reflect the baker's chosen ratio.  
**Files likely touched:**
- `components/bake/bake-planner-screen.tsx` (pass `feedRatio` to
  `calculateBakeSteps` and `onConfirm`)
- `app/bake/plan/page.tsx` (`start()` receives `feedRatio`)
- `lib/hooks/use-active-bake.ts` (add `feedRatio` to `ActiveBake`, default
  `DEFAULT_FEED_RATIO`)
- `lib/types/active-bake.ts` (add `feedRatio` field with zod default)
- `components/bake/stage-screen.tsx` (pass `activeBake.feedRatio` to
  `computeBakeQuantities`)
- `lib/bake-presets.ts` (pass `feedRatio` param through `computePresetSchedule`)  
**Test strategy:** `use-active-bake` test: `start()` persists `feedRatio`; stage-1
token substitution test: quantities differ between ratio 1 and ratio 2 for the same
recipe.  
**Depends on:** T3  
**Done when:**
- [ ] Tests written and passing
- [ ] Active bake schema backwards-compatible (old saves without `feedRatio`
      default to `DEFAULT_FEED_RATIO`)
- [ ] Stage-1 gram values in the walkthrough match the chosen ratio

### T5 — Remove StarterToggle gate; inline "כבר בשיא" into CompactSummary
**Goal:** Delete the top-level `StarterToggle` question. Default: build step always
shown (starter assumed to need feeding). Baker skips the feed step by tapping an ×
on the "האכל הסטארטר" row inside `CompactBakeSummary`, which sets
`starterReady=true` and removes the build step + pulls the schedule forward.
In manual mode: same — the feed row in the timeline has a dismiss affordance.  
**Files likely touched:**
- `components/bake/bake-planner-screen.tsx` (remove `StarterToggle`, change
  `starterReady` default to `false`, expose dismiss from `CompactBakeSummary`)
- `components/bake/compact-bake-summary.tsx` (add `onDismissFeed?: () => void` prop)
- `components/bake/starter-toggle.tsx` (can be deleted or kept for other uses)
- `lib/strings.ts` (new string for "כבר בשיא ✓" dismiss affordance)  
**Test strategy:** planner renders without `StarterToggle`; tapping × on feed row
sets `starterReady=true` and removes the feed row; schedule starts earlier after
dismiss.  
**Depends on:** T2 (CompactBakeSummary must exist)  
**Done when:**
- [ ] Tests written and passing
- [ ] No `StarterToggle` in the planner DOM
- [ ] Dismiss affordance ≥44px touch target
- [ ] Schedule correctly shortens after dismiss

## Build Order
T1 → T2 → T3 → T4 → T5

## Risks
- **Schedule mode state machine:** merging `isManualOpen` + `scheduleMode` into
  one clean union may surface edge cases (e.g. switching from preset → manual →
  back to preset). Map every transition before coding.
- **`CompactBakeSummary` active-window calc:** "active work window" is not a
  stored field — derive it from `mix.startAt` to `shape.endAt` (`mix.durationSecs
  + bulk.durationSecs + shape.durationSecs`). Guard against missing steps if
  `starterReady` changes mid-render.
- **Backwards-compatible `activeBake`:** adding `feedRatio` to the zod schema must
  `.default(DEFAULT_FEED_RATIO)` so existing localStorage saves don't crash.
- **Bottom sheet + retard slider:** the `BakeTimeline` inside the sheet still needs
  `editableRetard` to work. Pass it through `CompactBakeSummary` → sheet → timeline.
