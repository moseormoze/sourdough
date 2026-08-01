# Tasks: טיימרים ניתנים לשינוי בשלבי המתנה

## Task List

### T1 — טיימרים ניתנים לשינוי בכל שלבי ההמתנה
**Goal:** לספק vertical slice מלא: נתוני אפשרויות לכל שלב, בחירה native קומפקטית,
שמירת הבחירה ב-ActiveBake, טיימר חדש בשלב 5 וחיבור לכל מסכי ההמתנה.

**Files likely touched:**
- `lib/types/active-bake.ts` + test
- `lib/hooks/use-active-bake.ts` + test
- `lib/data/stages.ts` + test
- `lib/strings.ts` + test
- `components/bake/optional-timer.tsx` + test
- `components/bake/stage-screen.tsx` + test

**Test strategy:**
- Schema/hook: משך חיובי נשמר; בייק ישן נטען; reset שומר; advance מנקה.
- Component: idle מציג `select`, מומלץ ו-44px; change קורא callback; running/paused/
  finished מסתירים אותו ושומרים פעולות קיימות.
- Integration/data: טיימר מופיע בדיוק בשלבים 1,2,4,5,7,8,9,10,11; ברירות
  המחדל והאפשרויות מותאמות; שלב 7 משתמש בתכנון ושיטת אפייה משנה את שלב 8.
- Regression: כל בדיקות הטיימר והמסכים הקיימות, type-check, lint ו-RTL audit.

**Depends on:** Feature 26 T2.

**Done when:**
- [x] בדיקות נכשלות נכתבו לפני המימוש ועוברות לאחריו.
- [x] הבחירה native, קומפקטית ונגישה; כל יעד מגע 44px לפחות.
- [x] הבחירה נשמרת ברענון וב-reset ומתאפסת במעבר שלב.
- [x] כל שלבי ההמתנה ורק הם מציגים טיימר.
- [x] אין dependency, dialog, bottom sheet, notification או צליל חדשים.
- [x] `npm test`, `npm run type-check`, `npm run lint` ו-`rtl-check` עוברים.

## Build Order
T1 בלבד.

## Risks
- בייקים ישנים ללא `timerDurationSeconds` חייבים להמשיך להיטען.
- ברירת המחדל הדינמית בשלבים 1 ו-7 חייבת תמיד להיכלל ב-`select`.
- שינוי משך בזמן ספירה עלול לשנות countdown קיים, ולכן הבורר מוסתר מחוץ ל-idle.
- שלב 4 משתמש בטיימר כתזכורת בלבד; הקופי הקיים ממשיך לקבוע שהבצק, לא השעון,
  מסיים את התסיסה.
