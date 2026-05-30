# Tasks: Schedule Presets

> כל טאסק = ענף + טסט נכשל ראשון + PR אחד.
> **תלות:** נבנה מעל Feature 11 (merged ✅) ו-Feature 10 (merged ✅).

## Task List

---

### T1 — Quick fix: RETARD_MAX 72h → 48h
**Goal:** לתקן את המקסימום של ההתפחה בקירור לערך ריאלי.
**Files:**
- `lib/bake-timing.ts` — שורה 101: `72 * 3600` → `48 * 3600`
**Test strategy:** אין שינוי בטסטים קיימים (אף טסט לא מפנה לערך 72). הטסט הנכשל הראשון: `expect(RETARD_MAX_SECS).toBe(48 * 3600)` ב-`bake-timing.test.ts`.
**Depends on:** —
**Done when:**
- [ ] `RETARD_MAX_SECS === 48 * 3600`
- [ ] `tsc` נקי, `npm test` ירוק
- [ ] הסליידר הידני במסך לא יכול לעלות מעל 48

---

### T2 — computePresetSchedule (לוגיקה טהורה)
**Goal:** פונקציה טהורה שמחשבת `readyAt` + `retardSecs` עבור כל אחד מ-4 הפריסטים, כך שכל השלבים האקטיביים (mix, bulk, shape, preheat, bake) נופלים בחלון 07:00–23:00.
**Files:**
- `lib/bake-presets.ts` — קובץ חדש
- `lib/bake-timing.ts` — ייתכן import בלבד, ללא שינוי signature
**Depends on:** T1

**Signature:**
```typescript
export type PresetKey = "fast" | "classic" | "classic-late" | "long";

export interface PresetResult {
  readyAt: Date;
  retardSecs: number;
}

export function computePresetSchedule(
  key: PresetKey,
  now: Date,
  kitchenTempC: number,
  starterReady: boolean,
  flour?: Flour,
): PresetResult
```

**פרמטרים per-preset** (Engineer מכוונן לפי בדיקה; אלה נקודות התחלה):
| key | retardSecs ברירת מחדל | שעת מוכן יעד |
|-----|-----------------------|----------------|
| `fast` | 6h | 14:00 (אחה״צ מוקדם) |
| `classic` | 12h | 10:00 (בוקר) |
| `classic-late` | 15h | 17:00 (אחה״צ) |
| `long` | 28h | 10:00 (בוקר, יומיים) |

**האלגוריתם:**
1. `candidateReadyAt` = היום בשעת היעד; אם `candidateReadyAt < earliestReadyAt(...)` — הרם יום אחד.
2. חשב `calculateBakeSteps(candidateReadyAt, ...)` עם ה-retardSecs של הפריסט.
3. בדוק: `mix`, `bulk`, `shape` — כל `step.startAt` נמצא בין 07:00 ל-23:00.
4. אם לא — הרם את `candidateReadyAt` ביום אחד וחזור ל-2. מקסימום 7 iterations (פאלבק: החזר iteration 7 בלי validation error).
5. החזר `{ readyAt: candidateReadyAt, retardSecs }`.

**Test strategy — טסטים נכשלים ראשון** ב-`lib/bake-presets.test.ts`:
- `fast` בשעה 08:00 → readyAt אותו יום ≥ 14:00; כל שלב אקטיבי בחלון
- `classic` בשעה 20:00 → readyAt מחר בין 09:00–11:00
- `classic-late` בשעה 09:00 → readyAt מחר בין 16:00–18:00
- `long` בכל שעה → readyAt ≥ 28h מ-now; כל שלב אקטיבי בחלון
- כל פריסט: `readyAt >= earliestReadyAt(...)`
- כל פריסט בשעה 23:00 (edge) → לא קורס, מחזיר תאריך תקף

**Done when:**
- [ ] כל טסטי T2 עוברים
- [ ] `tsc` נקי, `npm test` ירוק

---

### T3 — ScheduleSection + PresetCard + disclosure ידני
**Goal:** לשנות את `BakePlannerScreen` — פריסטים primary, עריכה ידנית ב-disclosure. הסרת הפריסטים הישנים (F11 T2). ציר הזמן נפרס inline.
**Files:**
- `components/bake/bake-planner-screen.tsx` — שינוי מרכזי
- `lib/strings.ts` — strings חדשות, הסרת הישנות
- `components/bake/bake-planner-screen.test.tsx` — טסטים חדשים + עדכון קיימים
**Depends on:** T2

**State:**
```typescript
type ScheduleMode =
  | { kind: "none" }
  | { kind: "preset"; key: PresetKey }
  | { kind: "manual" };

const [scheduleMode, setScheduleMode] = useState<ScheduleMode>({ kind: "none" });
const [isManualOpen, setIsManualOpen] = useState(false);
```

**כשבוחרים פריסט:**
1. `setScheduleMode({ kind: "preset", key })`
2. `setIsManualOpen(false)`
3. `const result = computePresetSchedule(key, now, kitchenTemp, starterReady, recipe.flour)`
4. `jumpTo(result.readyAt, result.readyAt.getHours())`
5. `setDirection("end")`
6. `setRetardHours(result.retardSecs / 3600)`

**כשפותחים disclosure:**
1. `setIsManualOpen(true)`
2. `setScheduleMode({ kind: "manual" })`

**CTA enabled כאשר:**
- `scheduleMode.kind === "preset"` — תמיד תקין (הפריסט מבטיח)
- `scheduleMode.kind === "manual" && isValid`
- `scheduleMode.kind === "none"` → disabled

**מה מוסר:** `buildPresets` (F11 T2), `selectedPreset` state הישן, preset pills, strings ישנות (`presets.tonight/tomorrowMorning/fridayEvening/saturdayMorning`).

**Disclosure animation:**
- `max-height: 0 → fit-content` (ידוע מראש: ~300px), `transition: max-height 250ms ease-in-out`
- opacity: `0 → 1`, `200ms ease-out`, עם `transitionDelay: 50ms`
- chevron: `rotate(0deg) → rotate(180deg)`, `200ms ease-out`
- כל זה ב-CSS בלבד (no JS animation library — §12 בפלייבוק)

**Timeline inline (מתחת לכרטיס הנבחר):**
- נעטף ב-div עם `overflow: hidden`, `max-height` זהה
- מוצג רק כש-`scheduleMode.kind === "preset"`
- ב-disclosure: מוצג רק כש-`scheduleMode.kind === "manual" && isValid`

**Test strategy — טסטים נכשלים ראשון** ב-`bake-planner-screen.test.tsx`:
- 4 כרטיסי פריסט מוצגים (by name)
- בחירת "קלאסי" → כרטיס מקבל `aria-checked=true`, ציר הזמן נגלה
- בחירת פריסט → CTA enabled
- ברירת מחדל: CTA disabled (אין בחירה)
- פתיחת disclosure → `scheduleMode === manual`, כרטיסים לא active
- disclosure פתוח + `isValid` → CTA enabled
- הסרת preset pills ישנים (הערב/מחר בבוקר/ערב שבת/בוקר שבת) — לא מוצגים
- רגרסיה: כל טסטי F11 שנשמרים בחיים (starter toggle, temp, retard slider, confirm, baking method)

**Done when:**
- [ ] 4 preset cards מוצגים ומשנים state
- [ ] disclosure "לכוונן בעצמי" נפתח עם F11 controls
- [ ] ציר זמן inline בשני המסלולים
- [ ] CTA logic נכון
- [ ] strings ישנות נמחקו, חדשות נוספו
- [ ] `tsc` נקי, `npm test` ירוק

---

## Build Order
```
T1 (standalone, שולחים מיד) → T2 (לוגיקה) → T3 (UI)
```

T1 יכול להיכנס ל-main לפני שמתחילים T2.

## Risks

- **T3: רגרסיה ב-F11 flow** — direction toggle + day/hour picker זז לתוך disclosure. כל הטסטים הקיימים שנגעו בהם ב-F11 צריכים לעבוד גם כשה-disclosure סגור ➜ לוודא שה-disclosure נפתח בטסט לפני שמחפשים את ה-controls.
- **T2: tune של retardSecs per preset** — הערכים הראשוניים בטבלה ייתכן שיצריכו כוונון ב-integration (לבדוק שבכל שעה של היום, bulk לא נופל לפני 07:00). הפתרון: הכנס לוגים בטסט שמדפיסים את כל שעות השלבים ← קל לכוונן.
- **T3: max-height animation** — CSS `max-height` לאנימציה דורש ערך ידוע מראש. לקבוע ל-`500px` (מספיק לכל timeline) ולא לנסות לחשב dynamically.
