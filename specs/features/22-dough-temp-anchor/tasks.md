# Tasks: תזמון מעוגן-בצק — שלב א׳ (מצב צל)

## Task List

### T1 — DoughTempCard: סכמה + סטר + כרטיס + חיווט שלב 4
**Goal:** כל שלב א׳ ביחידה אחת — שדה `doughTempC` על הבייק הפעיל, סטר ב-hook עם אירוע אנליטיקס, כרטיס תלת-מצבי בשלב 4, ושורת הצל מחושבת ב-Q10 הקיים.

**Files likely touched:**
- `lib/types/active-bake.ts` — `doughTempC: z.number().min(18).max(35).nullable().default(null)`
- `lib/hooks/use-active-bake.ts` — `setDoughTemp(tempC | null)`; אירוע `dough_temp_recorded` בשמירה (לא בהסרה)
- `lib/analytics/events.ts` — `dough_temp_recorded { doughTempC, kitchenTempC }`
- `lib/strings.ts` — `bake.doughTemp.*`
- `components/bake/dough-temp-card.tsx` + test — חדש
- `components/bake/stage-screen.tsx` + test — רינדור בשלב bulk בין ה-Briefing למדיה
- עדכון פיקסצ׳רים (`doughTempC: null`) בכל טסט שבונה ActiveBake מלא

**Test strategy:**
- כרטיס: שלושת המצבים; ברירת התחלה = טמפ׳ המטבח; ולידציה 18–35; חישוב הצל (`fermentationStageSecs` על טמפ׳ הבצק) בפורמט טווח; רמז השוואתי לפי דלתא ±20 דק׳ (מוקדם/יותר זמן/קרוב); סיפא הסימנים תמיד
- hook: שמירה כותבת ל-storage + track עם שתי הטמפרטורות; הסרה כותבת null בלי track
- סכמה: roundtrip; שמירות ישנות בלי השדה → null; ערך מחוץ לטווח → הבייק נדחה (לא קורס)
- מסך: הכרטיס רק בשלב 4; דילוג לא משנה את המסך; הצל לא נוגע ב-StageHeader/sheet

**Depends on:** —

**Done when:**
- [ ] Tests written and passing
- [ ] דילוג = המסך של היום; אף תצוגה רשמית לא זזה (מצב צל)
- [ ] הניסוח: טווח + "הסימנים על הבצק עדיין קובעים."
- [ ] הערך שורד רענון; עריכה והסרה עובדות

## Build Order

```
T1   (משימה אחת — כל השלב)
```

## Risks

- **סחף פיקסצ׳רים**: שדה default חדש ב-ActiveBake מחייב עדכון כל פיקסצ׳ר מלא — tsc אוכף (לקח מ-#41)
- **דיוק-שווא**: מכוסה בניסוח (טווח + סיפא סימנים) ובטסט קופי
- **strict-mode double-track**: ה-track יושב בתוך updater כמו `advanceTo` הקיים — דפוס מוכר בקוד
