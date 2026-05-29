# Design: Starter Readiness Gate

## Screens Affected

- **"התחל אפייה" entry flow**: מוסיפים שלב חדש לפני מסך בחירת המתכון
- **StarterGateScreen** (חדש): שאלת הכניסה
- **StarterScheduleScreen** (חדש): מסך התכנון למסלול "לא"

---

## Components

### חדשים
- **`StarterGateScreen`** — מסך שאלת הכניסה. Props: `onReady()`, `onNotReady()`
- **`StarterEducationCard`** — כרטיס הסבר "מה זה שיא?": תמונה + 2 שורות + תיאור float test. Props: `imageUrl`, `description`
- **`StarterScheduleScreen`** — מסך התכנון. Props: `onDismiss()`
- **`FeedingWindowCard`** — כרטיס תוצאה. Props: `feedStart`, `feedEnd`, `peakStart`, `peakEnd`
- **`calculateFeedingWindow(targetReadyTime: Date, kitchenTempC: number)`** — פונקציה טהורה (לא קומפוננט), מחזירה `{ feedStart, feedEnd, peakStart, peakEnd }`

### בשימוש חוזר
- **`TemperatureStepper`** (קיים) — רכיב הטמפ׳ הקיים (°C, +/−, presets קיץ/חורף), default 25

### ללא שינוי
- כל הזרימה שאחרי "כן" (recipe selection → drawer → bake) — אפס שינוי

---

## User Flow

### מסלול א׳ — "כן, הסטארטר בשיא"
1. משתמש לוחץ "התחל אפייה" (קיים)
2. `StarterGateScreen` נכנס מלמטה (spring entrance, 250ms ease-out)
3. המשתמש רואה: `StarterEducationCard` + שני כפתורים ראשיים
4. לוחץ "כן, הסטארטר בשיא" → dismiss עם fade 200ms → זרימת בחירת מתכון (קיימת)

### מסלול ב׳ — "לא, צריך לתכנן"
1. לוחץ "לא, צריך לתכנן" → dismiss `StarterGateScreen` → `StarterScheduleScreen` נכנס
2. מסך מציג:
   - Time picker "מתי הלחם מוכן?" — ברירת מחדל: `עכשיו + 38 שעות`, מינימום: `עכשיו + 38 שעות`
   - `TemperatureStepper` — ברירת מחדל 25°C
3. כל שינוי ב-picker או בטמפ׳ → `calculateFeedingWindow()` → `FeedingWindowCard` מתעדכן (חישוב מקומי, אפס latency)
4. לוחץ "הבנתי, אחזור מאוחר יותר" → חזרה למסך הראשי

---

## חישוב `calculateFeedingWindow`

**קלטים:** `targetReadyTime: Date`, `kitchenTempC: number`

**קבוע בסיס:** `BAKE_DURATION_SECS = 30 * 3600` (30 שעות מתחילת שאור ועד לחם מוכן)

**חישוב זמן שיא סטארטר לפי טמפ׳:**
```
BASE_PEAK_SECS = 9 * 3600  // 9 שעות ב-25°C
tempDelta = kitchenTempC - 25
adjustedPeakSecs = BASE_PEAK_SECS - (tempDelta * 0.4 * 3600)  // כל מעלה = ~24 דק׳
peakWindowSecs = 2 * 3600  // חלון שיא ±1 שעה
feedWindowSecs = 2 * 3600  // חלון האכלה ±1 שעה
```

**פלט:**
```
levainStart    = targetReadyTime - BAKE_DURATION_SECS
peakEnd        = levainStart + 1h
peakStart      = levainStart - 1h
feedEnd        = peakEnd - adjustedPeakSecs
feedStart      = peakStart - adjustedPeakSecs
```

**edge case — זמן בלתי ריאלי:** אם `feedStart < now + 30min`, ה-picker מציג הודעה:
> "המינימום לבייק זה הוא [date]. אנחנו ממליצים להתחיל מחר."  
> הכפתור "הבנתי" מושבת עד לבחירה תקינה.

---

## States

### `StarterGateScreen`
- **Default**: כרטיס חינוכי + שני כפתורים
- (אין loading / error — תוכן סטטי)

### `StarterScheduleScreen`
- **Default**: picker (38h מעכשיו) + stepper + FeedingWindowCard מוסתר
- **With result**: FeedingWindowCard נכנס עם spring entrance לאחר בחירה תקינה
- **Below minimum**: picker locked + הודעת מינימום + כפתור "הבנתי" מושבת

### `FeedingWindowCard`
- **Appearing**: `translateY(20px) → 0`, `opacity 0 → 1`, 250ms ease-out
- **Updating** (כשמשנים טמפ׳ או זמן): fade-out 100ms → עדכון → fade-in 150ms

---

## Interaction Specs

### כפתורי "כן" / "לא" (StarterGateScreen)
- State machine: `Idle → Press → Release → Action` (§1)
- Press feedback: `scale(0.965)`, bg shift `ink-06`, 120ms ease-out (§2)
- גובה מינימלי: **56px** (כפתורי CTA ראשיים — מעל הרצפה של 44px, §10)
- "כן" — `accent` (clay fill), "לא" — outline/secondary

### כפתור "הבנתי" (StarterScheduleScreen)
- אותו state machine ו-press feedback
- מושבת אם הזמן מתחת למינימום → `opacity: 0.4`, לא ניתן ללחיצה

### `TemperatureStepper` (קיים — ללא שינוי ב-press feedback)
- ודא שה-+/− buttons כבר עומדים ב-44×44px (§10)

### כניסת מסכים
- `StarterGateScreen`: slides up from bottom, 250ms ease-out (modal entrance, §5)
- `StarterScheduleScreen`: מחליף את GateScreen ב-crossfade 200ms
- `FeedingWindowCard`: `translateY(20px) → 0`, opacity, 250ms ease-out (§5, §8)

### `prefers-reduced-motion` — Known Gap #2
כל ה-transform animations (כניסות מסכים, כניסת `FeedingWindowCard`) חייבים לכבד את:
```css
@media (prefers-reduced-motion: reduce) {
  /* החלף transform ב-opacity בלבד, duration 120ms */
}
```
**הנחיה לEngineer:** להשתמש ב-`tokens.css` שכבר מטפל בזה — ודא שהערכים מוגדרים נכון.

---

## Locale / Direction Notes

- כל מחרוזות — עברית בלבד, ללא hard-code אנגלית בקומפוננטים
- כל תאריכים ושעות מוצגים דרך `Intl.DateTimeFormat('he-IL', { hour: '2-digit', minute: '2-digit' })`
- מספרים בתוך משפטים עבריים עטופים ב-`<span dir="ltr" className="num">`
- `dir="rtl"` יורש מה-`<html>` — אין צורך להוסיף על המסכים החדשים

---

## Design System Impact

- **אין טוקנים חדשים** — משתמשים ב-`accent`, `paper`, `ink`, `ink-2`, `ink-3`, `line`
- **אין קומפוננטים גלובליים חדשים** — `StarterGateScreen` ו-`StarterScheduleScreen` הם מסכי feature פרטיים
- `calculateFeedingWindow` — ל-`lib/utils/` (או `lib/bake-timing.ts` אם קיים)

---

## Open Questions

<Should be empty before Tech Lead phase.>
