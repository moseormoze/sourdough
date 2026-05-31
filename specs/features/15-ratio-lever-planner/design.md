# Design: Ratio Lever — Planner UX

## Screens Affected
- `BakePlannerScreen`: preset cards → compact summary; "לכוונן בעצמי" → 5th option;
  ratio segmented control in manual mode; full timeline behind bottom sheet.

## Components

### New: `CompactBakeSummary`
**Purpose:** 3-line read-only summary shown inside a selected preset card.  
**Props:**
```ts
interface CompactBakeSummaryProps {
  steps: BakeStep[];
  feedRatio: FeedRatio;      // displayed as "(יחס 1:N:N)" next to feed time
  now: Date;
  kitchenTemp: number;       // for temp hint copy
}
```
**Content (3 rows, RTL):**
```
🌙 האכל הסטארטר: הערב 22:00  (יחס 1:2:2)    ← build.startAt (omit if starterReady)
🤚 עבודה אקטיבית: מחר 08:00–09:30             ← mix.startAt – shape.endAt
✓  מוכן: מחר 10:00                            ← ready.startAt
```
- "האכל" row omitted when `starterReady=true` (no build step).
- Time labels use `dayPrefix` helper (היום / מחר / מחרתיים / weekday).
- "ראה את כל השלבים ▾" link below the 3 rows → opens the timeline bottom sheet.

### New: `RatioControl`
**Purpose:** 5-button segmented control for the manual-mode ratio lever.  
**Props:**
```ts
interface RatioControlProps {
  value: FeedRatio;
  onChange: (r: FeedRatio) => void;
  label: string;
}
```
- 5 buttons in a row: 1:1:1, 1:2:2, 1:3:3, 1:4:4, 1:5:5.
- Active button: `bg-accent text-paper border-accent`.
- Inactive: `bg-transparent text-ink-2 border-line`.
- Min touch target 44px height.
- Changing a button triggers `onChange` immediately (no async).

### Modified: `PresetCard` (in `bake-planner-screen.tsx`)
- **Was:** expands `BakeTimeline` inline when selected (~600px).
- **Now:** expands `CompactBakeSummary` inline when selected (~120px).
- Full timeline moves to a `BottomSheet` triggered by the "ראה את כל השלבים ▾"
  link inside `CompactBakeSummary`.

### Modified: `BakePlannerScreen`
- Adds `feedRatio` state (`FeedRatio`, default `DEFAULT_FEED_RATIO`).
- "לכוונן בעצמי" moves from the standalone advanced-disclosure button into the
  `PRESET_LIST` radiogroup as the 5th entry (`key: "manual"`).
- When "לכוונן בעצמי" is selected: shows `RatioControl` + the existing manual
  day/hour picker + full `BakeTimeline` (not behind a sheet — manual mode is
  already the "I want details" intent).
- `feedRatio` threads into `calculateBakeSteps`, `computePresetSchedule`, and
  `onConfirm`.
- State: `timelineSheetOpen: boolean` for the bottom sheet.

## User Flow
1. Baker opens planner. Four preset cards visible, all collapsed. StarterToggle + TempInput above.
2. Baker selects "קלאסי". Card expands to show `CompactBakeSummary` (~120px). Other three cards stay visible.
3. Baker taps "ראה את כל השלבים ▾". `BottomSheet` (size="full", title="לוח הזמנים") opens with `BakeTimeline`.
4. Baker closes sheet. Returns to compact summary.
5. Baker selects "לכוונן בעצמי". Shows `RatioControl` + day/hour picker + inline `BakeTimeline`.
6. Baker moves ratio from 1:2:2 to 1:4:4 → feed time updates instantly.
7. Baker taps "התחל בייק" → `onConfirm` receives chosen `feedRatio`.

## States
- **No preset selected:** all 4 preset cards + "לכוונן בעצמי" collapsed.
- **Preset selected:** card expands to `CompactBakeSummary`; timeline sheet closed.
- **Sheet open:** `BottomSheet` renders `BakeTimeline` over the planner.
- **Manual selected:** `RatioControl` + picker + inline `BakeTimeline` visible.
- **StarterReady=true:** `CompactBakeSummary` omits the "האכל הסטארטר" row.

## Interaction Specs
- **State machine (PresetCard):** idle → pressed (scale 0.965, 120ms ease-out) → selected.  
  Selected → pressed again → deselected (toggle). Same as today.
- **CompactSummary expansion:** `max-height` transition, 250ms ease-in-out (same as today's timeline expansion).
- **RatioControl press:** scale 0.96, 120ms ease-out; color transition 120ms.
- **BottomSheet:** uses existing `BottomSheet` component (`size="full"`), spring curve already defined in the component.
- **Touch targets:** RatioControl buttons ≥44px height; "ראה את כל השלבים" link ≥44px hit area.

## Optimistic / Sync Notes
- All ratio changes are synchronous (pure JS math, no fetch). No loading states needed.

## Locale / Direction Notes
- All strings in Hebrew via `strings.bakeScheduler`.
- Ratio labels (1:1:1 … 1:5:5) are numeric — render `dir="ltr"` inline.
- `CompactBakeSummary` layout: RTL, emoji + label + time on each row.
- `RatioControl` button order: 1:1:1 on the right (shortest), 1:5:5 on the left
  (longest) — matches RTL reading direction where "more" goes left.

## Design System Impact
- No new tokens or global patterns. `RatioControl` is a one-off segmented control
  (not worth a generic component at this stage).

## Open Questions
None — all resolved before design phase.
