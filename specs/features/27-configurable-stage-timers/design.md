# Design: טיימרים ניתנים לשינוי בשלבי המתנה

## Screens Affected
- `/bake/stage/1,2,4,5,7,8,9,10,11`: טיימר קומפקטי עם בחירת משך לפני הפעלה.
- `/bake/stage/3,6,12`: ללא שינוי וללא טיימר.

## Components
- Modified: `OptionalTimer` — מקבל אפשרויות, משך נבחר ו-callback לשינוי.
- Modified: `StageScreen` — פותר ברירת מחדל, אפשרויות ומשך שמור עבור השלב.
- Modified: `Stage` / `StageMethodContent` — מגדירים אפשרויות זמן סטטיות.
- Modified: `ActiveBake` / `useActiveBake` — שומרים ומאפסים משך נבחר.

## User Flow
1. המשתמש מגיע לשלב המתנה ורואה שורה קטנה: `[45 דקות ▾] [התחל טיימר]`.
2. לחיצה על הזמן פותחת את בורר ה-`select` הטבעי של המכשיר.
3. בחירה נשמרת מיד אך אינה מפעילה את הטיימר.
4. לחיצה על ״התחל טיימר״ עוברת לתצוגת הספירה הקיימת.
5. pause/resume/finished פועלים כעת; הבורר מוסתר כדי למנוע שינוי באמצע ספירה.
6. reset מחזיר ל-idle עם הזמן שנבחר. מעבר שלב מחזיר לברירת המחדל של השלב הבא.

## Timer Defaults and Options

| שלב | ברירת מחדל | אפשרויות |
|---|---:|---|
| 1 — בניית שאור | חישוב קיים | שעה פחות, מומלץ, שעה יותר |
| 2 — אוטוליזה | 45 דק׳ | 30, 45, 60 דק׳ |
| 4 — תסיסה ראשונית | 30 דק׳ | 15, 20, 30, 45 דק׳ |
| 5 — עיצוב ראשוני | 25 דק׳ | 20, 25, 30 דק׳ |
| 7 — התפחה במקרר | התכנון הקיים | 4 שעות פחות, מומלץ, 4 שעות יותר; תחום 8–48 |
| 8 — חימום תנור | לפי שיטת האפייה | 30/45/60 או 45/50/60 דק׳ |
| 9 — אפייה מכוסה | 20 דק׳ | 20, 22, 25 דק׳ |
| 10 — אפייה לא מכוסה | 22 דק׳ | 20, 22, 25, 30 דק׳ |
| 11 — קירור | 60 דק׳ | 60, 90, 120 דק׳ |

## States
- Loading: אין; כל הנתונים מקומיים.
- Idle: בורר native וכפתור התחלה מוצגים בשורה קומפקטית.
- Running: ספירה, pause ו-reset; אין בורר.
- Paused: ספירה קפואה, resume ו-reset; אין בורר.
- Finished: ״הסתיים״ ו-reset; אין בורר.
- Error: ערכים לא-חיוביים נדחים בשכבת ה-state ואינם נוצרים מנתוני השלבים.
- Success: הבחירה נשמרת מיד ללא toast; הערך הנבחר שמוצג הוא המשוב.

## Interaction Specs
- State machine: `Idle → SelectOpen → Idle` או `Idle → Start → Running → Pause → Paused → Resume → Running → Finished|Reset → Idle`.
- Press feedback: כפתור ההתחלה והפעולות שומרים `scale(0.965)` ב-120ms. ה-`select`
  נשאר control טבעי כדי לא לפגוע בהתנהגות מערכת ההפעלה.
- Gestures: אין gesture מותאם; הבחירה מנוהלת על-ידי הדפדפן.
- Animation curves: ללא motion חדש.
- Touch targets: הבורר, ההתחלה וכל פעולות הטיימר בגובה/רוחב 44px לפחות.

## Optimistic / Sync Notes
- הבחירה נשמרת מיד ב-`localStorage`; אין רשת או rollback.
- `timerDurationSeconds` אופציונלי בסכמה כדי שבייקים ישנים ייטענו ללא migration.

## Locale / Direction Notes
- aria-label: ״משך הטיימר״.
- suffix לברירת המחדל: ״מומלץ״.
- משכי זמן מעוצבים בעברית דרך `strings`, ומספר הספירה נשאר `dir="ltr"`.
- אין אייקון כיווני חדש; ה-`select` מקבל RTL מהמסמך.

## Design System Impact
אין token או primitive חדש. `OptionalTimer` נשאר הרכיב המשותף.

## Open Questions
אין.
