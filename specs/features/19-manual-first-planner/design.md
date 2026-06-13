# Design: Feature 19 — Manual-First Planner

## Resolved Decisions (from Discovery + brief gate)
- **פריסט כופה `direction = "end"`** — כמו היום. ה-chip מייצג "מתי הלחם יהיה מוכן".
- **chip נשאר "selected"** אחרי הזרקה, עד **שינוי ידני** של יום/שעה/כיוון/יחס/retard — שמנקה את הסימון.
- **CTA** פעיל בכל פעם ש-`isValid` (אין יותר תלות ב-`ScheduleMode`).

## Screens Affected
- `components/bake/bake-planner-screen.tsx` — כל השינויים כאן.
- `lib/strings.ts` — מחרוזת framing לשורת הפריסטים (`presetRowLabel`).
- (ללא שינוי: `lib/bake-presets.ts`, `lib/bake-timing.ts`, `components/bake/ratio-control.tsx`, `compact-bake-summary.tsx`, `bake-timeline.tsx`.)

## מבנה המסך — לאחר השינוי

```
┌─────────────────────────────────────┐
│  ← חזרה                             │
│  [תמונה] תכנון זמני הבייק / [שם]    │
│  ──────────────────────────────     │
│  [טמפרטורה] + hints                  │  ← ללא שינוי
│  ──────────────────────────────     │
│  תכננו את זמני הבייק                │  ← H2 (נשאר)
│  בחרו תבנית מומלצת או כווננו ידנית   │  ← sub (נשאר)
│                                      │
│  התחל מתבנית:                        │  ← label חדש, קטן
│  ‹ (מהיר)(קלאסי)(מאוחר)(ארוך) ›      │  ← chip row, גלילה אופקית
│                                      │
│  [ להתחיל ][ לסיים ✓ ]              │  ← direction toggle — גלוי תמיד
│  מתי שהלחם ייצא מהתנור?              │
│  תהליך של כ-X שעות                   │
│  [יום pills]                         │
│  [13:00  −/+]                        │
│  [יחס שאור 1:2:2]                    │
│  [CompactBakeSummary → פותח ציר מלא] │  ← גלוי תמיד
│  (הלחם מוכן ב-… / נדחף ל-…)          │  ← לפי כיוון
│  ──────────────────────────────     │
│  [שיטת האפייה]                       │
└─────────────────────────────────────┘
│  [התחל בייק]  ← פעיל כש-isValid       │
```

## State — לפני / אחרי

**הוסר:**
- `type ScheduleMode = none | preset | manual`
- `const [scheduleMode, setScheduleMode]`
- `const [isManualOpen, setIsManualOpen]`
- `function openManual()`, `closeManual()`
- קומפוננטת `PresetCard` כולה (כולל ה-expand/collapse `grid-template-rows`).

**נוסף:**
- `const [selectedPreset, setSelectedPreset] = useState<PresetKey | null>(null)`

**מותאם:**
- `selectPreset(key)` → `setSelectedPreset(key)`; `jumpTo(readyAt, hour)`; `setDirection("end")`; `setRetardHours`; `setFeedRatio`. (ללא `setIsManualOpen`.)
- `handleDaySelectAndClear` / `adjustHourAndClear` → קוראים גם `setSelectedPreset(null)` (היום הם no-op מבחינת ניקוי).
- `setDirection`, `setFeedRatio`, `setRetardHours` כשמופעלים ידנית → `setSelectedPreset(null)`.
- `ctaEnabled = isValid`.

## Components

### New: `PresetChips` (פנימי לקובץ, מחליף את `PresetCard`)
שורת chips אופקית נגללת. `role="radiogroup"` עם `selectedPreset` כבחירה היחידה.

```
<div role="radiogroup" aria-label="התחל מתבנית">
  {PRESET_LIST.map → <PresetChip selected={selectedPreset === key} … />}
</div>
```

**PresetChip — מפרט אינטראקציה (ui-playbook §1/§2/§5/§10):**
- `role="radio"`, `aria-checked`, `aria-label={name}`, `data-preset={key}`.
- State machine: `isPressed` בלבד (tap, אין drag → אין `isDragging`/`justFinishedDrag`).
- Press: `scale(0.965)` + `transition: transform 120ms ease-out` (§2).
- צבע selected: `border-[1.5px] border-accent bg-accent-bg text-accent`; default: `border border-line text-ink-2`. מעבר צבע `120ms ease-out` (§5 — לא spring).
- Touch target: `min-h-[44px]`, `px-4` (§10).
- גלילה: `overflow-x-auto scrollbar-none -mx-5 px-5` (כמו ה-day pills הקיימים), RTL מטופל ע״י `dir` של ההורה (§11).
- אין readyLabel על ה-chip (קומפקטי); זמן הסיום מוצג ב-`CompactBakeSummary` שמתחת.

### Always-visible manual block
מה שהיום עטוף ב-`{scheduleMode.kind === "manual" && (…)}` יוצא החוצה ומוצג תמיד:
direction toggle → day/hour picker → `RatioControl` → `CompactBakeSummary`.

### `CompactBakeSummary` — בית חדש
היום חי בתוך ה-preset card. עובר ל**מתחת ל-`RatioControl`**, גלוי תמיד (כש-`isValid`). הטריגר שלו פותח את `BottomSheet` עם ה-`BakeTimeline` המלא + `editableRetard` (קיים, ללא שינוי).
- שורת `readyResultLabel` (כיוון start) ושורת `retardOverflowNote` (כיוון end) מוצגות מתחת ל-summary, כמו היום.
- כש-`!isValid` → במקום ה-summary מוצגת הודעת `tooSoon(minDateLabel)` (כמו היום).

## User Flow
1. כניסה → רואים מיד: טמפ׳, שורת פריסטים, toggle כיוון, יום/שעה, יחס שאור, תקציר ציר.
2. (אופציונלי) לחיצה על "קלאסי" → ממלא יום+שעה+retard+יחס, כיוון→"לסיים", ה-chip מסומן.
3. המשתמש משנה שעה ל-21:00 → סימון ה-chip מתנקה (זה כבר לא "קלאסי" טהור), הזמנים מתעדכנים.
4. CTA פעיל לכל אורך הדרך (כל עוד `isValid`) → אישור שולח `feedAt/peakAt/feedRatio/retardHours` כמו היום.

## States
- **ברירת מחדל (אין preset):** הכל גלוי, `selectedPreset = null`, כיוון = "start" (ברירת המחדל הקיימת), CTA פעיל.
- **preset נבחר:** chip ב-accent, כיוון = "end", ערכים ממולאים.
- **אחרי שינוי ידני:** `selectedPreset = null`, ערכים נשמרים (לא מתאפסים), אף chip לא מסומן.
- **`!isValid`:** הודעת `tooSoon` במקום ה-summary; CTA disabled.

## Interaction Specs
- **PresetChip press:** §2 — `scale(0.965)`, 120ms ease-out; color shift 120ms ease-out.
- **Direction toggle:** ללא שינוי (segmented, accent fill).
- **ניקוי סימון:** state change מיידי, ללא animation (לא gesture).
- **Micro-interaction (§8):** chip — feedback=סימון accent, cleanup=ניקוי בשינוי ידני. אין loading (סינכרוני, מקומי).

## Design System Impact
אין tokens חדשים. ה-chip משתמש בשפת ה-accent הקיימת (`accent`, `accent-bg`, `line`). אין צורך ב-spring (אין מיקום מונפש).

## Revision (post-review)
מתוך שימוש: התקציר המצומצם (`CompactBakeSummary`) + ה-sheet הוסרו. **הציר המלא (`BakeTimeline`) מוצג inline תמיד** (כש-`isValid`), עם עריכת retard inline. `CompactBakeSummary` נמחק (קוד מת אחרי הסרת הצרכן היחיד).

## Open Questions
- אין. שלוש השאלות מה-brief נסגרו (ראו "Resolved Decisions").
