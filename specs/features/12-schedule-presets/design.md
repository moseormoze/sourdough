# Design: Schedule Presets

## Screens Affected
- `BakePlannerScreen` — מבנה המסך משתנה משמעותית: סקשן "בחר את לוז הבייק" מחליף את הפריסטים הישנים (F11 T2), ה-toggle הכיוון + הבורר הידני יורדים לתוך disclosure.

## מבנה המסך (מעודכן)

```
Header (back + recipe info)        ← ללא שינוי
Recipe header (image + name)       ← ללא שינוי
Divider
Planning framing (h1 + subtitle)   ← ללא שינוי (F11 T1)
Starter readiness toggle           ← ללא שינוי
Temperature input + hints          ← ללא שינוי
Divider
━━━ סקשן: "בחר את לוז הבייק" ━━━   ← חדש (F12)
  [Preset card: מהיר]
  [Preset card: קלאסי]
  [Preset card: קלאסי מאוחר]
  [Preset card: ארוך]
  ↓ preset נבחר → ציר הזמן נפרס inline מתחתיו
  [disclosure: "לכוונן בעצמי"]
    ↓ disclosure פתוח → direction toggle + day picker + timeline
Divider
Baking method selector             ← ללא שינוי
Footer CTA                         ← ללא שינוי
```

## Components

### PresetCard (חדש)
**Props:** `preset`, `isSelected`, `onSelect`, `readyLabel`, `startLabel`

**מבנה כרטיס:**
```
┌──────────────────────────────────────────┐
│ [name]                [day] · [HH:MM]    │  ← שם + מתי מוכן
│ [hint]                                   │  ← תיאור קצר
└──────────────────────────────────────────┘
```
- שם: `text-body font-semibold text-ink` (כשנבחר: `text-accent`)
- מתי מוכן: `text-label font-semibold num` + `text-tiny text-ink-3` ליום
- hint: `text-body-sm text-ink-2`
- גובה מינימלי: 64px (עומד ב-44px §10 בנוחות)
- padding: `px-4 py-3.5`
- border-radius: `rounded-xl`

**States:**
| מצב | border | background | text |
|-----|--------|------------|------|
| idle | `border-line` | `bg-paper` | `ink` / `ink-2` |
| pressed | `border-line` | `bg-paper` | — + `scale(0.965)` |
| selected | `border-accent border-[1.5px]` | `bg-accent-bg` | name → `text-accent` |
| selected+pressed | `border-accent` | `bg-accent-bg` | — + `scale(0.985)` (larger surface → subtler) |

**ה-4 פריסטים:**
| key | שם | hint | התפחה בקירור (אומדן) |
|-----|-----|------|----------------------|
| `fast` | מהיר | מוכן הכי מהר · טעם עדין | 6h |
| `classic` | קלאסי | לילה במקרר · מוכן בבוקר | 12h |
| `classic-late` | קלאסי מאוחר | לילה ארוך · מוכן לקראת ערב | 16–18h |
| `long` | ארוך | התפחה ממושכת · חמצמץ ועשיר | 24–36h |

### ScheduleSection (חדש — wrapper)
- כותרת: `text-heading text-ink` → **"מתי הלחם מוכן?"** (קצר ומוכוון תוצאה)
- subtitle: `text-body-sm text-ink-3` → "כל קצב מבטיח שהשלבים האקטיביים בשעות נורמליות"
- ה-4 cards בעמודה, `gap-3`

### Timeline Expansion (inline, מתחת לכרטיס הנבחר)
- `max-height: 0 → content height`, `overflow: hidden`
- transition: `max-height 250ms ease-in-out` — layout shift, לא spring (§5)
- opacity: `0 → 1`, `200ms ease-out`, עם delay קל (50ms) כדי שה-height יתחיל קודם
- כשהכרטיס מתבטל → מתקפל: `max-height → 0`, `200ms ease-in`
- הציר מוצג בתוך `div.pt-4` מתחת ל-card content, **בתוך** אותה card surface (לא נפרד)

### Advanced Disclosure ("לכוונן בעצמי")
- Row מלא-רוחב, `min-h-touch`, `border border-line rounded-xl`
- טקסט: `text-body text-ink-2` + `ChevronDown` (auto-mirror ב-RTL)
- פתוח → chevron מסתובב 180°: `transform: rotate(180deg)`, `transition: 200ms ease-out`
- כשפתוח: מציג את direction toggle + day pills + hour stepper מ-F11
- **Exclusive:** פתיחת disclosure → מבטל preset נבחר. בחירת preset → סוגר disclosure ומנקה את הבורר הידני.
- אותה `max-height` expansion כמו ה-timeline

## User Flow

1. יוזר מגיע למסך → רואה 4 כרטיסים, אף אחד לא נבחר; CTA disabled
2. יוזר לוחץ כרטיס → הכרטיס מקבל styling נבחר + ציר הזמן נגלה inline מתחתיו → CTA נהיה enabled
3. יוזר לוחץ כרטיס אחר → הציר הקודם מתקפל, החדש נגלה (sequential — לא בו-זמנית)
4. יוזר פותח "לכוונן בעצמי" → disclosure נפתח, preset מתבטל
5. יוזר בוחר זמן ידני → ציר הזמן מוצג בתוך ה-disclosure
6. יוזר לוחץ CTA → `onConfirm` עם feedAt + peakAt (זהה ל-F11)

## States

**Empty (לא בחר כלום):**
- 4 כרטיסים idle, disclosure סגור
- CTA: disabled

**Preset נבחר:**
- כרטיס עם accent styling, ציר פרוס מתחתיו
- disclosure: סגור, לא interactable (עדיין גלוי אבל לא מוסתר)
- CTA: enabled

**Manual open:**
- disclosure פתוח עם direction toggle + day/hour picker
- כרטיסים: idle כולם (ללא active state)
- CTA: enabled רק אם `isValid === true`

**Error (isValid false — ידני בלבד):**
- הודעת "המוקדם ביותר: [date]" ב-`text-warn` מתחת ל-disclosure (זהה ל-F11)
- CTA: disabled

## Interaction Specs

**Preset card tap:**
- State machine: `isPressed → onPointerDown`, `release → onPointerUp / onClick`
- Press feedback: `scale(0.965)` + bg ink-06, `120ms ease-out` (§2, §1)
- On commit: select preset, trigger max-height expansion
- `justFinishedDrag` cooldown: 200ms (§1, למנוע accidental double-tap)

**Timeline expansion:**
- Layout shift: `250ms ease-in-out` (§5)
- אסור spring (§5 — spring רק ל-position snap, לא layout)

**Disclosure chevron rotation:**
- `200ms ease-out` (§5 — hover/state change)

**Touch targets:**
- כרטיסים: min 64px גובה ✓
- Disclosure row: `min-h-touch` (44px) ✓
- כל אלמנטי F11 בתוך ה-disclosure: ללא שינוי ✓

## Animation Curves (§5)

| אלמנט | duration | easing |
|-------|----------|--------|
| Card press | 120ms | ease-out |
| Timeline/disclosure expand | 250ms | ease-in-out |
| Timeline/disclosure collapse | 200ms | ease-in |
| Timeline opacity fade-in | 200ms | ease-out (50ms delay) |
| Chevron rotate | 200ms | ease-out |

## Strings חדשות ב-lib/strings.ts

```typescript
// under bakeScheduler:
scheduleSectionTitle: "מתי הלחם מוכן?",
scheduleSectionSubtitle: "כל קצב מבטיח שלבים אקטיביים בשעות נורמליות",
presetReadyLabel: (day: string, time: string) => `${day} · ${time}`,
advancedDisclosureOpen: "לכוונן בעצמי",
advancedDisclosureClose: "סגור כוונון",
presets: {
  fast:        { name: "מהיר",          hint: "מוכן הכי מהר · טעם עדין" },
  classic:     { name: "קלאסי",         hint: "לילה במקרר · מוכן בבוקר" },
  classicLate: { name: "קלאסי מאוחר",  hint: "לילה ארוך · מוכן לקראת ערב" },
  long:        { name: "ארוך",          hint: "התפחה ממושכת · חמצמץ ועשיר" },
},
```

(הפריסטים הישנים של F11 T2 — `tonight/tomorrowMorning/fridayEvening/saturdayMorning` — נמחקים.)

## Locale / Direction Notes

- כרטיסי preset: RTL מלא. שם + hint מיושרים לימין; זמן מוכן — `<span dir="ltr" className="num">` ל-HH:MM.
- Chevron: `ChevronDown` auto-mirrors ב-RTL (parent `dir="rtl"` מטפל בזה).
- כל spacing: logical properties בלבד (`ps-`, `pe-`, `ms-`, `me-`).

## Design System Impact

- `PresetCard` — component חדש; לא נכנס ל-design-system כרגע (feature-specific).
- אין tokens חדשים.
- `buildPresets` (F11 T2) — מוחלפת לחלוטין ע"י לוגיקת start-ASAP חדשה (Tech Lead יפרט).

## Open Questions
<empty — ready for Tech Lead>
