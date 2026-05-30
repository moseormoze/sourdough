# Design: Starter Peak Explainer

## Screens Affected

- **Bake Planner** ([`bake-planner-screen.tsx`](../../../components/bake/bake-planner-screen.tsx)) — ללא שינוי מבני; הטריגר מתווסף בתוך רכיב הטוגל
- **StarterToggle** ([`starter-toggle.tsx`](../../../components/bake/starter-toggle.tsx)) — טריגר "מה זה בשיא?" מתווסף ליד ה-label

---

## Components

### New: `BottomSheet` — `components/ui/bottom-sheet.tsx`

פּרימיטיב גנרי. Props:

```tsx
interface BottomSheetProps {
  open: boolean;
  size?: "peek" | "full";   // peek = 56vh, full = 88vh; default: "peek"
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}
```

- Scrim: `rgba(31,26,20,0.45)` + `backdrop-filter: blur(2px)`, z-index `z-sheet` (50)
- Sheet panel: `bg-paper`, `rounded-t-3xl`, `shadow-sheet` — כולם מ-design tokens
- Drag handle: pill 36×4px, `bg-line`, מרכז בראש ה-panel
- Tap על ה-scrim → `onClose()`
- Drag-down על ה-panel (≥80px) → `onClose()`
- Escape (מקלדת) → `onClose()`
- focus trap בתוך ה-panel; focus חוזר לטריגר בסגירה

### New: `StarterPeakSheet` — `components/bake/starter-peak-sheet.tsx`

תוכן ה-sheet הספציפי לפיצ׳ר הזה. משתמש ב-`BottomSheet`.

```tsx
interface StarterPeakSheetProps {
  open: boolean;
  onClose: () => void;
}
```

תוכן:
1. תמונת השוואה 3-פריים (`/stages/starter-peak-comparison.jpg`) — `width="100%"`, `height` קבוע (180px), `object-cover`, `alt` מלא
2. כותרת `text-heading`: "סטארטר בשיא — 4 הסימנים"
3. רשימה (4 פריטים, `text-body`, רווח 8px):
   - הוכפל בנפח מאז ההאכלה האחרונה
   - מלא בועות אוויר
   - ריח חמצמץ-מתוק (לא חומצי חד)
   - עובר מבחן ציפה (float test) — כפית בכוס מים, הסטארטר צף

### Modified: `StarterToggle` — `components/bake/starter-toggle.tsx`

שינוי אחד: טריגר מתווסף **ליד ה-label** (לא ליד הטוגל עצמו), כך שמסך התכנון (`bake-planner-screen.tsx`) לא משתנה בכלל.

```tsx
// label row — existing:
<p className="text-label text-ink-2">{label}</p>

// label row — new:
<div className="flex items-center gap-2">
  <p className="text-label text-ink-2">{label}</p>
  <PeakInfoTrigger onOpen={openSheet} />
</div>
```

`StarterToggle` מחזיק את ה-state `sheetOpen` + `StarterPeakSheet`. לא צפה אל `bake-planner-screen`.

### New: `PeakInfoTrigger` (inline, private ב-`starter-toggle.tsx`)

Chip קטן — לא component נפרד:

```tsx
// ~32px גובה ויזואלי, 44px touch target דרך overlay ::before
<button type="button" onClick={onOpen}
  className="relative inline-flex items-center gap-1 h-8 px-2 rounded-full
             bg-accent-bg text-accent text-tiny font-medium
             transition-[transform,background-color] duration-fast ease-out
             active:scale-[0.97]
             before:absolute before:inset-x-[-4px] before:inset-y-[-8px] before:content-['']"
  aria-label={strings.starterGate.peakInfoAriaLabel}
>
  <Info size={12} aria-hidden />
  {strings.starterGate.peakInfoTrigger}
</button>
```

---

## User Flow

```
Bake Planner מוצג
  ↓
label "הסטארטר שלך בשיא?" + chip "מה זה בשיא?" גלוי
  ↓
משתמש מקיש על ה-chip
  ↓
BottomSheet נפתח כלפי מעלה (spring, peek 56vh)
  ↓
רואה תמונת השוואה + 4 סימנים
  ↓
סוגר (tap scrim / drag-down / Escape)
  ↓
focus חוזר ל-chip, ממשיך לבחור כן/לא
```

---

## States

| State | מה המשתמש רואה |
|---|---|
| Idle | label + chip קטן |
| Chip pressed | chip ב-scale(0.97) 120ms |
| Sheet open | scrim + panel עולה, drag-handle, תוכן |
| Sheet drag-down | panel נגרר עם האצבע 1:1, snap בחזרה אם < 80px |
| Sheet dismissed | panel יורד, scrim נמוג, focus חוזר |
| `prefers-reduced-motion` | פתיחה/סגירה מיידית — opacity fade בלבד, ללא translateY |

---

## Interaction Specs

### BottomSheet — state machine

```
Idle → [chip tap] → Opening (translateY 100%→0, spring 300ms) → Open
Open → [scrim tap] → Closing (translateY 0→100%, 200ms ease-in) → Idle
Open → [drag start] → Dragging (translateY follow finger 1:1)
Dragging → [release ≥80px OR velocity >0.5px/ms] → Closing → Idle
Dragging → [release <80px AND velocity ≤0.5] → Snap-back (spring 250ms) → Open
Open → [Escape] → Closing → Idle
```

### Animation values

| Action | Transform | Duration | Easing |
|---|---|---|---|
| Chip press | `scale(0.97)` | 120ms | `ease-out` |
| Sheet enter | `translateY(100% → 0)` | 300ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Sheet exit | `translateY(0 → 100%)` | 200ms | `ease-in` |
| Drag snap-back | `translateY(n → 0)` | 250ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Scrim fade-in | `opacity 0 → 0.45` | 200ms | `ease-out` |
| Scrim fade-out | `opacity 0.45 → 0` | 200ms | `ease-in` |
| `prefers-reduced-motion` | ללא translateY | 150ms | opacity-only |

### Touch targets

- Chip: ויזואל ~32px, touch target 44×44px דרך `::before` overlay
- Drag handle: ויזואל 36×4px, touch target 44px גובה (padding)
- Scrim: כל שטח מחוץ ל-panel

### Drag-dismiss math

```ts
const DISMISS_THRESHOLD = 80; // px
const velocity = dragY / timeSincePointerDown; // px/ms
if (dragY >= DISMISS_THRESHOLD || velocity > 0.5) onClose();
else snapBack();
```

---

## Locale / Direction Notes

### Copy (עברית — סופי)

| Key ב-`strings.starterGate` | ערך |
|---|---|
| `peakInfoTrigger` | `"מה זה בשיא?"` |
| `peakInfoAriaLabel` | `"פתח הסבר — מה זה סטארטר בשיא"` |
| `peakSheetTitle` | `"סטארטר בשיא — 4 הסימנים"` |
| `peakSign1` | `"הוכפל בנפח מאז ההאכלה האחרונה"` |
| `peakSign2` | `"מלא בועות אוויר"` |
| `peakSign3` | `"ריח חמצמץ-מתוק (לא חומצי חד)"` |
| `peakSign4` | `"עובר מבחן ציפה — כפית בכוס מים, הסטארטר צף"` |
| `peakImageAlt` | `"שלושה מצבי סטארטר: שטוח לפני השיא, מבעבע בשיא, קרוס אחרי השיא"` |

כל ה-keys מתווספים תחת `strings.starterGate` ב-[`lib/strings.ts`](../../../lib/strings.ts).

### RTL / direction

- ה-chip יושב בשורת ה-label — `dir="rtl"` גורם לו להופיע **משמאל** ל-label (אחרי הטקסט בסדר DOM, לפני בקריאה RTL). זו ההתנהגות הנכונה — "שאלה ← הסבר?"
- אין אלמנטים דירקציונליים ב-sheet — כולו RTL רגיל
- `Info` icon מ-Lucide — לא דירקציונלי, ללא מירור

### תמונת ההשוואה — prompt ל-Nano Banana

```
A simple, clean photographic comparison strip showing three stages of
sourdough starter in identical glass jars, photographed from the same angle
with natural warm light and a light beige/cream background.

Right jar: flat starter, just fed, no bubbles, rubber band at bottom marking
start level.
Center jar: starter at peak — doubled in height, dome-shaped surface, many
visible bubbles throughout, rubber band now at the halfway point.
Left jar: starter past peak — surface has collapsed and is slightly concave,
rubber band visible high up showing how much it has shrunk back.

Labels in Hebrew above each jar (right-to-left order):
right jar = "לפני", center jar = "בשיא", left jar = "אחרי".

Minimal, educational, warm bakery feel. No text other than the three labels.
Aspect ratio: 3:1 (e.g. 900×300px). JPG.
```

שמור כ-`public/stages/starter-peak-comparison.jpg`.

---

## Design System Impact

### פּרימיטיב `BottomSheet` — נבנה עכשיו בקוד

כבר מתועד ב-[`specs/design/components.md`](../../../specs/design/components.md). Tokens בשימוש: `--shadow-sheet`, `z-sheet`, `--ease-spring`, `--duration-slow` — **כולם קיימים**. **אין tokens חדשים**.

---

## Open Questions

<כל השאלות מ-Discovery נסגרו. ריק — מוכן ל-Tech Lead.>
