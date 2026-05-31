# Tasks: In-Bake Timeline

## Task List

### T1 — BakeTimelineSheet component
**Goal:** בנות את ה-bottom sheet עם רשימת 12 השלבים — כולל drag-to-dismiss, backdrop, וסגירה ב-✕. מוכן לwire-up ב-T2.

**Files likely touched:**
- `components/bake/bake-timeline-sheet.tsx` (חדש)
- `components/bake/bake-timeline-sheet.test.tsx` (חדש)

**API:**
```ts
interface BakeTimelineSheetProps {
  isOpen: boolean;
  currentStage: number;
  kitchenTemp: number;   // for temp-adjusted duration labels on relevant stages
  onClose: () => void;
}
```

**Stage row states** (derived from `currentStage`):
- `n < currentStage` → past: CheckCircle2 accent + text-ink-3
- `n === currentStage` → current: border-s-2 border-accent + bg-accent-bg + text-ink font-medium
- `n > currentStage` → future: text-ink-2

**Duration labels:** use `stage.durationLabel` directly (same string already shown in StageHeader). For `tempSensitiveBaseSecs` stages use `tempAdjustedDurationLabel(stage.tempSensitiveBaseSecs, kitchenTemp)`.

**Dismiss state machine:**
```
Idle → isDragging (pointerdown on handle)
     → track dragY 1:1 until 80px → rubber-band 0.35 past 80
     → onPointerUp: velocity > 0.5px/ms OR dragY > 80 → onClose(); else → snap to 0
```
Backdrop click and ✕ button → `onClose()` directly (no drag state involved).

**Sheet structure:**
- `position: fixed, inset-x-0, bottom-0` — always bottom of viewport
- `translateY(isOpen ? 0 : 100%)` — controlled by `isOpen`, transition via CSS
- `rounded-t-2xl`, `max-h-[85dvh]`, `overflow-y-auto` on content
- Drag handle pill + sticky header (title + ✕) + scrollable stage list

**Animation:**
- Enter: `transform 250ms ease-out` (CSS transition, not JS)
- Dismiss (drag): `transition: none` while dragging, re-enable on snap/close
- Backdrop: `opacity 250ms ease-out` (0 ↔ 0.4)

**Test strategy:**
- Renders all 12 stage names when `isOpen={true}`
- Stage 1–(n-1) have `data-state="past"` (or test for CheckCircle presence)
- Stage `n` has `data-state="current"`
- Stage (n+1)–12 have `data-state="future"`
- `onClose` called when ✕ button clicked
- `onClose` called when backdrop clicked
- When `isOpen={false}`, sheet is in DOM but translated (or not rendered — decide in implementation)
- `tempAdjustedDurationLabel` used for stage 1 and stage 4 (tempSensitiveBaseSecs stages)

**Depends on:** `lib/data/stages.ts` (STAGES, TOTAL_STAGES), `lib/bake-timing.ts` (tempAdjustedDurationLabel)

**Done when:**
- [ ] Tests written and passing
- [ ] `isOpen={false}` → sheet not visible (translateY 100% or unmounted)
- [ ] `isOpen={true}` → all 12 stages listed, correct state styling
- [ ] Drag-to-dismiss state machine wired (pointerdown/move/up on handle)
- [ ] Backdrop + ✕ both call `onClose`
- [ ] CSS transitions: 250ms enter, 200ms dismiss
- [ ] RTL: border-s-2 on current row, no hardcoded LTR positioning
- [ ] Touch target: ✕ button min 44×44px

---

### T2 — Wire affordance into StageHeader + StageScreen
**Goal:** הפוך את הProgressStrip לחיץ — affordance ברור, press feedback, ו-BakeTimelineSheet נפתח מStageScreen.

**Files likely touched:**
- `components/bake/stage-header.tsx` (עדכון)
- `components/bake/stage-header.test.tsx` (עדכון)
- `components/bake/stage-screen.tsx` (עדכון)
- `components/bake/stage-screen.test.tsx` (עדכון)

**Changes to `StageHeader`:**
- מוסיף prop: `onTimelineOpen?: () => void`
- עוטף `<ProgressStrip>` + hint row ב-`<button>` (רק כשהprop קיים)
- Hint row: `<ChevronDown size={12} /> טיימליין` — `text-tiny text-ink-3`
- Press state machine: `isPressed` flag + pointer events; clear on `isDragging` (>5px)
- Press feedback (CSS-in-Tailwind): `scale(0.985)` + `bg-black/[0.06]` + `rounded-lg`, `120ms ease-out`
- `min-h-touch` (44px) על ה-button
- כש-`onTimelineOpen` לא מועבר: ProgressStrip מוצג plain, ללא button (backward compat)

**Changes to `StageScreen`:**
- `const [timelineOpen, setTimelineOpen] = useState(false)`
- `<StageHeader onTimelineOpen={() => setTimelineOpen(true)} ... />`
- לאחר ה-`<main>`: `<BakeTimelineSheet isOpen={timelineOpen} currentStage={activeBake.currentStage} kitchenTemp={activeBake.recipe.kitchenTemp} onClose={() => setTimelineOpen(false)} />`

**Test strategy (StageHeader):**
- כש-`onTimelineOpen` מועבר: button עם `aria-label` נמצא ב-DOM
- לחיצה על ה-button קוראת ל-`onTimelineOpen`
- ProgressBar (role="progressbar") עדיין קיים ב-DOM
- כש-`onTimelineOpen` לא מועבר: אין button, ProgressBar קיים

**Test strategy (StageScreen):**
- לחיצה על כפתור הstepper פותחת את ה-sheet (`getByRole("dialog")` visible)
- לחיצה על ✕ בsheet סוגרת אותו

**Depends on:** T1

**Done when:**
- [ ] Tests written and passing
- [ ] Stepper area = `<button>` עם `min-h-touch`, `aria-label="פתח טיימליין"`
- [ ] Hint row: "`טיימליין ∨`" גלוי מתחת לstrip
- [ ] Press: `isPressed` flag מנוהל ב-pointer events, לא CSS `:active`
- [ ] Press feedback: scale 0.985 + ink-06 bg, 120ms ease-out
- [ ] לחיצה על הstepper → BakeTimelineSheet נפתח
- [ ] סגירת sheet → חוזר ל-StageScreen תקין
- [ ] Existing StageHeader tests עוברים (backward compat כש-`onTimelineOpen` לא מועבר)
- [ ] RTL: hint row aligned correctly (start-side icon)

---

## Build Order
T1 → T2

## Risks
- **Drag handle + scroll conflict**: כשהcontent גולל והמשתמש מתחיל גרירה מאמצע הlist, `pointermove` יכול להתנגש עם ה-scroll הטבעי. פתרון: drag-to-dismiss יתחיל **רק** מ-handle הpill בראש הsheet, לא מה-content.
- **`position: fixed` ב-iOS Safari**: fixed elements מתנהגים שונה כשה-virtual keyboard פתוח. לא רלוונטי לfeature הזה (אין input בsheet), אבל לשמור בראש.
- **`max-h-[85dvh]`**: `dvh` נתמך ב-Safari 16+ ו-Chrome 108+. ה-target audience (iOS 16.4+) תומך — בסדר.
