# Design: מסלולי חילוץ (Rescue Paths)

## Screens Affected
- `StageScreen` (שלבים 4–7 בלבד): כפתור כניסה שקט "משהו לא מסתדר?" בתחתית תוכן השלב, אחרי כרטיס "מתי להמשיך" / הטיימר. לחיצה פותחת את דף החילוץ.
- שלבים 1–3, 8–12: ללא שינוי (אין נקודת כניסה).

## Components
- Reused: `BottomSheet` (`components/ui/bottom-sheet.tsx`) — התברר בבנייה שכבר קיים רכיב גנרי (משרת את starter-peak-sheet ו-feedback-sheet), כולל focus trap, ‏Escape, ‏scroll-lock ו-`prefers-reduced-motion`. אין צורך בחילוץ מהטיימליין — משתמשים בו כמו שהוא. (איחוד `BakeTimelineSheet` עליו — שיפור עתידי נפרד.)
- New: `RescueSheet` (`components/bake/rescue-sheet.tsx`) — מרנדר `StageRescue` בתוך `BottomSheet`: אינטרו + שלושה כרטיסי אבחנה.
- New data: `lib/data/rescue.ts` — `RescueVerdict { id: "ok"|"under"|"over", title, signs[], steps[] }`, `StageRescue { intro, verdicts }`, `getRescue(n)` לשלבים 4–7.
- Modified: `StageScreen` — state ‏`rescueOpen`, כפתור כניסה (`Button variant="ghost" size="sm"` + אייקון `LifeBuoy`), רינדור `RescueSheet`.

## User Flow
1. אופה בשלב 4–7 מרגיש שמשהו לא מסתדר → מזהה את הקישור השקט מתחת לסימני השלב.
2. לחיצה פותחת bottom sheet: משפט אינטרו + שלושה כרטיסים ממוספרים-בצבע: תקין (sage) / תת-תסיסה (accent) / תסיסת-יתר (danger).
3. כל כרטיס: כותרת, "הסימנים" (רשימת תבליטים), "מה עושים" (רשימה ממוספרת). המשתמש מזהה את עצמו לפי הסימנים וקורא את המסלול.
4. סגירה בכפתור ✕ / הקשה על ה-backdrop / גרירת הידית מטה — חזרה למסך השלב בדיוק כפי שנעזב (טיימר רץ, מונה קיפולים שמור).

## States
- Loading: אין (תוכן סטטי, ללא רשת).
- Empty: לא ייתכן — `getRescue` מחזיר תוכן מלא לכל שלב 4–7; בשלבים אחרים אין נקודת כניסה.
- Error: אין.
- Success: פתיחה/סגירה חלקה; ללא state מתמשך.

## Interaction Specs
- State machine: של `BottomSheet` — זהה ל-`BakeTimelineSheet` הקיים (isDragging, rubber-band ‏0.35 מעל 80px, תקרה 140px, סגירה ב-velocity > ‏0.5px/ms או delta > ‏80px). ‏(§1, §3)
- Press feedback: כפתור הכניסה משתמש ב-`Button` הקיים (עומד ב-§2).
- Gestures: גרירת ידית בלבד — התוכן נשאר גליל חופשי.
- Animation curves: כניסת sheet ‏250ms ease-out; backdrop opacity ‏duration-base. ‏(§5)
- Touch targets: כפתור כניסה, כפתור סגירה — ‏min-h-touch (44px). ‏(§10)

## Optimistic / Sync Notes (if applicable)
- לא רלוונטי — אין מוטציות.

## Locale / Direction Notes (if applicable)
- כל הקופי עברית; מאפיינים לוגיים בלבד (`ms-`/`me-`/`border-s`). אייקון `LifeBuoy` סימטרי — לא דורש שיקוף.
- מספרי טווחים (8–16, 30–75%) בתוך טקסט עברי — נבדק ויזואלית ב-RTL.

## Design System Impact
- רכיב `BottomSheet` גנרי חדש — מהיום כל sheet חדש נבנה עליו (מבטל שכפול מול הטיימליין).
- מיפוי צבע-אבחנה: sage=תקין, accent=דורש-המתנה, danger=דורש-פעולה. דפוס שכדאי לשמר בפיצ׳רים עתידיים.

## Open Questions
אין — הוסמכתי להחליט עד ה-PR ‏(2026-07-06).
