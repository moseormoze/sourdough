# Design: In-Bake Timeline

## Screens Affected
- `StageScreen` / `StageHeader`: ProgressStrip הופך לאזור לחיץ עם affordance ברור
- חדש: `BakeTimelineSheet` — bottom sheet עם רשימת כל 12 השלבים

## Components

### Modified: `StageHeader`
- מוסיף `onTimelineOpen: () => void` prop
- עוטף את `<ProgressStrip>` ב-`<button>` שמושך פעולה על הlabel שמתחתיו
- הstrip + ה-label ביחד = אזור הלחיצה

### Modified: `ProgressStrip`
- נשאר pure: אין שינוי ל-API שלו
- ה-`button` נמצא ב-`StageHeader`, לא ב-`ProgressStrip`

### New: `BakeTimelineSheet`
```ts
interface BakeTimelineSheetProps {
  isOpen: boolean;
  currentStage: number;   // activeBake.currentStage
  kitchenTemp: number;    // לחישוב temp-adjusted duration labels
  onClose: () => void;
}
```
- Bottom sheet עם כל 12 השלבים
- Scrollable content, fixed drag-handle בראש
- `dir="rtl"` (יורש מה-html)

### New: `TimelineStageRow` (internal to BakeTimelineSheet)
- שלב אחד ברשימה: שם + משך + מצב (past / current / future)
- לא מקבל `onClick` — הsheet הוא view-only

---

## User Flow

1. משתמש על StageScreen, רואה את הProgressStrip עם hint "`טיימליין ∨`" מתחתיו
2. לוחץ על אזור הstrip
3. Press feedback (120ms) → BakeTimelineSheet נפתח מלמטה (250ms ease-out)
4. משתמש גולל ברשימה, רואה ✓ על שלבים שעברו, השלב הנוכחי מודגש
5. סוגר: גרירה למטה / לחיצה על backdrop / כפתור ✕
6. Sheet נסגר (200ms ease-in) → חוזר ל-StageScreen

---

## Affordance Solution

מתחת לProgressStrip, צמוד אליו (mt-1), שורת hint קטנה:

```
[ ProgressStrip ————————————————————————— ]
  טיימליין  ∨                               ← text-tiny text-ink-3, inline-flex items-center gap-0.5
```

- `∨` = `ChevronDown` (lucide) בגודל 12px — מרמז על פתיחה לכיוון מטה
- כל האזור (strip + hint row) עטוף ב-`<button>` אחד (`w-full`)
- Touch target: ה-button מקבל `min-h-touch` (44px) דרך padding מינימלי

---

## States

| State | תיאור |
|---|---|
| Closed | Strip רגיל + hint row גלוי |
| Pressed | Strip + hint row ב-`scale(0.985)` + `bg ink-06`, 120ms ease-out |
| Opening | Sheet עולה מ-`translateY(100%)` ל-`translateY(0)`, 250ms ease-out; backdrop מתגלה opacity 0→0.4, 250ms |
| Open | Sheet פתוח, ניתן לגלול, ניתן לגרור למטה |
| Dragging | גרירת ה-sheet למטה: מעקב 1:1 עד threshold 80px, rubber-band מעבר |
| Closing | Sheet יורד `translateY(0→100%)`, 200ms ease-in; backdrop opacity 0.4→0 |

---

## Interaction Specs

### State Machine (StageHeader button)
```
Idle → isPressed (pointerdown)
     → [if pointerup w/o drag] Release → onTimelineOpen() → Idle
     → [if pointermove >5px] isDragging → (drag suppressed, not relevant here) → Idle
```

### Press Feedback (§2)
```css
/* on isPressed */
transform: scale(0.985);         /* full-width bar → 0.985 not 0.965 */
background: rgba(0,0,0,0.06);    /* ink-06 */
transition: transform 120ms ease-out, background-color 120ms ease-out;
```
אזור הלחיצה מקבל `rounded-lg` כדי שה-ink-06 לא ישפוך

### Sheet Entrance (§4 + §5)
```css
/* sheet panel */
transition: transform 250ms ease-out;
/* backdrop */
transition: opacity 250ms ease-out;
```
כניסה בease-out (לא spring) — bottom sheet הוא motion גדול, spring ישמע "קפיצי" פה

### Sheet Dismiss — Drag (§3 adapted for vertical)
```
0–80px drag down   → 1:1 tracking (translateY = dragY)
80–140px           → rubber-band: next = 80 + (dragY - 80) * 0.35
>140px             → hard cap

onPointerUp:
  velocity = dragY / timeSincePointerDown  // px/ms
  if (velocity > 0.5 || dragY > 80) → close()
  else → snap back to 0 (250ms ease-out)
```

### Sheet Dismiss — Other triggers
- לחיצה על backdrop → `close()`
- לחיצה על כפתור ✕ בראש הsheet → `close()`

### Touch Targets (§10)
- Button ProgressStrip area: min 44px height
- כפתור ✕ בsheet: 44×44px (visible icon 20px, padding משלים)
- כל שורת stage ב-sheet: min 44px height

---

## Timeline Stage Row Design

```
[  ✓  ]  בניית שאור (levain)       כ-10 שעות   ← past: text-ink-3, checkmark accent
[  ●  ]  אוטוליזה + לישה           30–60 דקות   ← current: bg-accent-bg border-s-2 border-accent, text-ink bold
[     ]  תסיסה ראשונית (Bulk)      כ-4 שעות    ← future: text-ink-2
[     ]  עיצוב ראשוני + עיצוב     20–30 דקות
         ...
```

**Past** (`n < currentStage`):
- `CheckCircle2` (lucide, 16px, `text-accent`) ב-start
- שם + משך: `text-ink-3` (מעומעם)

**Current** (`n === currentStage`):
- `Circle` (lucide, 16px, `text-accent`, filled effect) ב-start — או dot 8px bg-accent
- `border-s-2 border-accent rounded-sm` על השורה
- `bg-accent-bg` רקע קל על השורה
- שם: `text-ink font-medium`; משך: `text-ink-2`

**Future** (`n > currentStage`):
- Empty space ב-start (aligned עם icon)
- שם: `text-ink-2`; משך: `text-ink-3`

---

## Sheet Structure

```
┌─────────────────────────────┐
│        ——  (drag handle pill)│
│                              │
│  הטיימליין              ✕   │  ← header, sticky
│ ————————————————————————    │
│ ✓  בניית שאור       כ-10ש  │
│ ●  אוטוליזה        30–60 ד  │  ← current, highlighted
│    תסיסה          כ-4 שעות  │
│    ...                       │
│    [שלב 12]                  │
└─────────────────────────────┘
```

- Drag handle: pill 40×4px, `bg-line`, `rounded-full`, `mx-auto mt-3 mb-1`
- Header: `flex justify-between items-center px-5 py-3`, sticky (position sticky top-0, bg-surface)
- Title: `text-subheading text-ink` — ״הטיימליין״
- Close button: `X` (lucide 20px), `min-h-touch min-w-touch` flex items-center justify-center
- Content: `overflow-y-auto`, padding `px-5 pb-safe-area`
- Max-height: ~85dvh (sheet לא כובש את המסך לגמרי)
- Border-radius: `rounded-t-2xl` בראש הsheet

---

## Locale / Direction Notes

- הsheet יורש `dir="rtl"` מה-html — אין צורך ב-prop מפורש
- `border-s-2` (logical) על השלב הנוכחי — ייצמד לצד הימני ב-RTL
- `CheckCircle2` + `Circle` הם icons ניטרליים — אין צורך במראה
- כפתור ✕ בsheader: נמצא ב-`start` (ימין ב-RTL) — בדוק placement

---

## Design System Impact

- **Token חדש בשימוש**: `pb-safe-area` (Tailwind safe-area plugin) — לוודא שהlist לא נחתך ב-iPhone
- **Pattern חדש**: bottom sheet עם drag-to-dismiss — יכול לשמש בפיצ׳רים עתידיים
- **אין** new color tokens; משתמש רק ב-`accent`, `accent-bg`, `ink`, `ink-2`, `ink-3`, `line`, `bg-surface`

---

## Open Questions

_ריק לפני Tech Lead phase._
