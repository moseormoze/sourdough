# Tasks: מסלולי חילוץ (Rescue Paths)

> הוסמך ב-2026-07-06: שלוש המשימות נבנות ברצף ונוחתות ב-PR אחד deployable (הוראת המשתמש — "עד ה-PR עצמו, נעשה דפלוי ונבדוק בפרודקשן").

## Task List

### T1 — תוכן החילוץ (data)
**Goal:** ‏`lib/data/rescue.ts` — תוכן מלא לשלבים 4–7 במבנה `StageRescue`, מעוגן ב-baking-reference.md ובטריאז׳ הבייק החי (2026-07-04/05).
**Files likely touched:** `lib/data/rescue.ts`, `lib/data/rescue.test.ts`.
**Test strategy:** חוזי תוכן — לכל שלב 4–7 שלוש אבחנות בסדר ok/under/over עם sings+steps לא-ריקים; מסלול over בשלבים 4–6 כולל קירור מיידי, ריטרד מקוצר ומסלולי גיבוי (תבנית/פוקאצ׳ה); שלב 7 over מורה לאפות מיד; `getRescue` מחזיר null לשלבים 1–3 ו-8–12.
**Done when:**
- [x] Tests written and passing

### T2 — ‏`BottomSheet` משותף
**Goal:** ~~חילוץ מעטפת מ-`BakeTimelineSheet`~~ — התייתר: `components/ui/bottom-sheet.tsx` גנרי כבר קיים (starter-peak-sheet, feedback-sheet) עם focus trap, ‏Escape ו-reduced-motion. ‏T3 משתמש בו ישירות.
**Done when:**
- [x] אומת שהרכיב הקיים מכסה את הצורך (בדיקות קיימות ב-bottom-sheet.test.tsx)

> שיפור עתידי (מחוץ להיקף): איחוד `BakeTimelineSheet` על `BottomSheet` — כרגע שני מנגנוני sheet חיים זה לצד זה.

### T3 — ‏`RescueSheet` + כניסה ממסך השלב
**Goal:** רכיב הצגת התוכן + כפתור "משהו לא מסתדר?" בשלבים 4–7 בלבד, פתיחה/סגירה בלי לאבד את מצב המסך.
**Files likely touched:** `components/bake/rescue-sheet.tsx` (+test), `components/bake/stage-screen.tsx` (+test), `lib/strings.ts`.
**Test strategy:** טסט נכשל ראשון — שלב 5 מציג את הכפתור ושלב 2 לא; לחיצה פותחת dialog עם שלוש האבחנות; סגירה ב-✕ וב-backdrop; מונה הקיפולים נשמר אחרי פתיחה/סגירה (שלב 4).
**Done when:**
- [x] Tests written and passing

## Build Order
T1 → T2 → T3

## Risks
- ‏T2 נוגע ברכיב חי (טיימליין) — ממותן ע״י כיסוי הטסטים הקיים ושימור props/aria/test-ids.
- אורך התוכן ב-sheet — נבדק שהגלילה עובדת בתוך `max-h-[85dvh]`.
