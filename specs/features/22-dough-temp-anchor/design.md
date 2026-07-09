# Design: תזמון מעוגן-בצק — שלב א׳ (מצב צל)

## Screens Affected

- **שלב 4 בלבד** (`components/bake/stage-screen.tsx`): כרטיס מדידה חדש בין ה-Briefing למדיה
- **שום מסך אחר לא זז**: הפלאנר, ה-StageHeader, ה-BakeTimelineSheet והצ׳קליסט נשארים על טמפ׳ המטבח — זה לב מצב הצל

## Components

- **New**: `DoughTempCard` (`components/bake/dough-temp-card.tsx`) — כרטיס המדידה על שלושת מצביו. Props: `{ doughTempC: number | null; kitchenTempC: number; flour: Flour; onChange: (tempC: number | null) => void }`
- **Reused**: `NumberInput` (step ‎0.5, unit "°C"), `Button`, אייקון `Thermometer` (Lucide, סימטרי)
- **Modified**: `components/bake/stage-screen.tsx` — רינדור הכרטיס בשלב 4 + חיווט ל-hook
- **Modified**: `lib/types/active-bake.ts` — שדה חדש `doughTempC: z.number().min(18).max(35).nullable().default(null)` (שמירות ישנות נשארות תקפות)
- **Modified**: `lib/hooks/use-active-bake.ts` — סטר `setDoughTemp(tempC: number | null)`
- **Modified**: `lib/analytics/events.ts` — אירוע `dough_temp_recorded`
- **אין שינוי** ב-`lib/bake-timing.ts` — החישוב משתמש ב-`fermentationStageSecs` הקיים עם `doughTempC` במקום טמפ׳ המטבח

## User Flow

1. המשתמש מסיים לישה (שלב 3), שוטף ידיים, לוחץ "הבא" → מסך שלב 4 נפתח
2. מתחת ל-Briefing מופיע כרטיס מצומצם: "יש מד-חום? מדדו את טמפ׳ הבצק" + כפתור "מדדתי"
3. לחיצה פותחת את הקלט (NumberInput, ברירת התחלה = טמפ׳ המטבח של המתכון) → "שמירה"
4. הכרטיס מתקפל לשורת הצל: **"לפי טמפ׳ הבצק (26.5°): בין 3 ל-4 שעות — התחילו לבדוק מוקדם מהרגיל. הסימנים על הבצק עדיין קובעים."** + "עריכה"
5. דילוג (לא נגע) = המסך של היום בדיוק. אין נדנוד, אין תזכורת שנייה
6. הערך נשמר על הבייק הפעיל ושורד רענון; "עריכה" מאפשרת תיקון או הסרה (הסרה מחזירה למצב 2)

## States — DoughTempCard

- **Empty (ברירת מחדל)**: שורה מצומצמת — אייקון מד-חום + "יש מד-חום? מדדו את טמפ׳ הבצק" + כפתור "מדדתי" (ghost). גובה שורה אחת, לא מתחרה בתוכן ההדרכה
- **Editing**: NumberInput‏ (18–35, step ‎0.5, יחידה °C) + "שמירה" (accent, disabled מחוץ לטווח) + "ביטול". ולידציה: "טווח סביר: 18–35°C" דרך error של NumberInput
- **Set**: שורת הצל (ראו קופי למטה) + כפתור "עריכה" (טקסט קטן). ללא כפתור הסרה נפרד — ההסרה בתוך מצב העריכה ("הסרת המדידה")
- מעברי מצב: fade/height ‏200ms ease-in-out; בלי ספינרים — הכתיבה סינכרונית ל-localStorage

## שורת הצל — לוגיקת קופי

- **משך**: `durationRangeLabel(fermentationStageSecs(4h, doughTempC, flour))` — **אותו פורמט טווח כמו כל האפליקציה** ("בין 3 ל-4 שעות"). *סטייה מכוונת מהאיור שב-brief ("כ-3:20"): ‏h:mm משדר דיוק-שווא — בדיוק סיכון 3 מה-Discovery*
- **רמז השוואתי** מול תחזית טמפ׳-המטבח (דלתא של ההערכות):
  - צל קצר מהרגיל ב-≥20 דק׳ → "התחילו לבדוק מוקדם מהרגיל"
  - ארוך ב-≥20 דק׳ → "יש לכם יותר זמן מהרגיל"
  - בתוך ±20 דק׳ → "קרוב לתחזית הרגילה"
- **סיפא קבוע**: "הסימנים על הבצק עדיין קובעים." — עקרון פיצ׳ר 16 בתוך הפיצ׳ר

## Layout

```
┌─ Briefing ─────────────────────┐
└────────────────────────────────┘
┌─ DoughTempCard (empty) ────────┐
│ 🌡 יש מד-חום? מדדו את         │
│    טמפ׳ הבצק        [מדדתי]   │
└────────────────────────────────┘
┌─ סרטון קיפולים ────────────────┐
```

מיקום: מתחת ל-Briefing ומעל המדיה — רגע הפתיחה של השלב, לפני שהעיניים יורדות להוראות. כרטיס `paper` + `border-line` כמו באנר ההתקנה.

## Interaction Specs

- **State machine**: אין מחוות; כפתורים בלבד — `Idle → isPressed → Release` (§1), `.pressable` על "מדדתי"/"שמירה"/"עריכה" (§2)
- **Touch targets** (§10): כל הכפתורים ≥44px; ה-NumberInput כבר עומד (48px)
- **Carry-over** (§8): loading — אין (כתיבה סינכרונית); feedback — קריסת הכרטיס לשורת הצל היא האישור; cleanup — מצב העריכה מתאפס בסגירה
- **Curves** (§5): מעברי הכרטיס 200ms ease-in-out (layout shift)

## Optimistic / Sync Notes

`setDoughTemp` כותב ל-ActiveBake ב-localStorage מיידית (אותו מנגנון כמו `advanceSubStep`). אין רשת, אין rollback. רענון טוען מהסכמה.

## Locale / Direction Notes

- כל הקופי ב-`strings.bake.doughTemp.*` (חדש)
- המספר והיחידה: `<span dir="ltr">26.5°C</span>` בתוך משפט עברי — כמו דפוס הטמפרטורות הקיים
- `Thermometer` סימטרי — אין מירור

## Analytics

| אירוע | props | מתי |
|---|---|---|
| `dough_temp_recorded` | `doughTempC: number; kitchenTempC: number` | שמירת מדידה (גם עדכון) |

זה הדאטה של **שער ההוכחה**: יחד עם `stage_advanced` (4→5) הקיים אפשר להשוות בכל בייק נמדד את שתי התחזיות מול משך הבאלק בפועל. אין אירוע להסרה (רעש).

## Design System Impact

- אין tokens חדשים, אין רכיבי בסיס חדשים
- מחרוזות חדשות: `strings.bake.doughTemp.*`
- דפוס "כרטיס מתקפל תלת-מצבי" — חד-פעמי, לא מוכלל בשלב זה

## Open Questions

<אין — ההכרעה היחידה שנוספה בעיצוב (פורמט טווח במקום h:mm) מסומנת למעלה ומחכה לאישור בשער.>
