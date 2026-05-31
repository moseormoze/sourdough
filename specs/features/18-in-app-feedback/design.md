# Design: In-App Feedback

## Screens Affected

- כל המסכים (global): הוספת FAB דרך `layout.tsx` (ב-`<Providers>` או ישירות ב-`<body>`)
- `stage-screen.tsx`: ה-FAB צריך לשבת מעל ה-sticky action bar — ראה מיקום למטה

## Components

- **New**: `FeedbackFab` — כפתור עיגולי floating, נגיש מכל מסך
- **New**: `FeedbackSheet` — טופס פידבק בתוך BottomSheet קיים
- **New**: `ImageCompressor` — util (לא component) לדחיסת תמונה ב-Canvas
- **Reused**: `BottomSheet` (`components/ui/bottom-sheet.tsx`) — עם גובה `full` (88%)
- **Reused**: `Button` (`components/ui/button.tsx`)
- **Reused**: `Toast` — הודעת הצלחה / שגיאה

---

## User Flow

1. משתמש רואה FAB קבוע בפינה — bottom-start (= ימין בעברית), מעל כל תוכן
2. לחיצה על FAB → BottomSheet נפתח (88%)
3. בוחר סוג פידבק (pill selector — חובה) + ממלא שם (אופציונלי) + תיאור (חובה)
4. אופציונלי: לוחץ "הוסף תמונה" → פותח file picker → תמונה נדחסת ב-Canvas → thumbnail מוצג
5. לוחץ "שלח" → כפתור עובר למצב loading, Sheet נעול
6. **הצלחה** → Sheet נסגר + toast "תודה! הפידבק נשלח" (2400ms)
7. **שגיאה** → הודעת שגיאה inline בתוך ה-sheet (לא סוגרת את ה-sheet)

---

## States

- **Idle**: FAB נראה, Sheet סגור
- **Open (empty)**: Sheet פתוח, טופס ריק, כפתור שלח מושבת
- **Open (valid)**: טופס מלא (סוג + תיאור), כפתור שלח פעיל
- **Submitting**: כפתור שלח → spinner + disabled, Sheet לא ניתן לסגירה (scrim לא סוגר)
- **Success**: Sheet נסגר, toast "הפידבק נשלח ✓"
- **Error**: הודעת שגיאה inline מתחת לכפתור, Sheet נשאר פתוח, ניתן לנסות שוב

---

## מיקום ה-FAB

**עיצוב**: עיגול 40px ויזואלי, 44×44px touch target, אייקון `MessageSquare` (Lucide, 18px)

**מיקום**: `fixed bottom-[88px] start-4 z-fab`
- `bottom-[88px]` — מעל ה-sticky action bar של stage-screen (שגובהו ~80px). בשאר המסכים זה floating נוח מעל אזור gesture-home של הטלפון
- `start-4` — RTL: 16px מהקצה הימני
- `z-fab` = 20 (חדש — בין z-sticky:10 לבין z-sheet:50)

**צבע**: `bg-paper` + `shadow-md` + `text-ink-2` — ניטרלי, לא מתחרה ב-accent CTAs הראשיים

**Token חדש**: יש להוסיף `fab: "20"` לאובייקט `zIndex` ב-`tailwind.config.ts` ול-`--z-fab: 20` ב-`tokens.css`

---

## עיצוב ה-Sheet

**גובה**: `full` (88%) — טופס עם textarea ו-image picker לא נכנס ב-peek (56%)

**מבנה (מלמעלה למטה, RTL)**:
```
─────────────────────────────
 [drag handle]
 שליחת פידבק              [X]
─────────────────────────────
 סוג:
 [באג] [הצעה לפיצ׳ר] [שאלה] [אחר]   ← pill selector, single select

 שם (אופציונלי):
 [______________________________]

 תיאור:
 [                              ]
 [        textarea ~4 rows      ]
 [______________________________]

 [+ הוסף תמונה]                       ← כשנבחרת: thumbnail + [X הסרה]

 [שלח פידבק]                          ← accent, disabled עד שיש סוג + תיאור
 [שגיאת שליחה — נסה שוב]              ← נראה רק ב-error state
─────────────────────────────
```

**Pill Selector**: 4 pills בשורה אחת, `text-sm`, בחירה מחדירה `bg-accent-bg text-accent` עם border. לא dropdown.

---

## Interaction Specs

**FAB — State Machine** (§1 ui-playbook):
```
Idle → isPressed (pointerdown) → Release → open sheet
```
- `isPressed`: `scale(0.965)` + `bg-ink-06`, 120ms ease-out (§2)
- אין drag על ה-FAB

**Sheet Entrance** (§4, §5):
- כבר מוגדר ב-`BottomSheet` — `translateY(100%) → translateY(0)`, 250ms spring
- לא לשנות

**Submit Button** (§8 carry-over):
1. Loading: כפתור → `opacity-60 pointer-events-none` + spinner icon (לא חוסם את כל ה-sheet, רק הכפתור)
2. Feedback: success → sheet נסגר (250ms ease-in) + toast; error → הודעה inline
3. Cleanup: לאחר הצלחה — reset הטופס לאחר ש-sheet נסגר (לא לפני, מניע flicker)

**Touch targets** (§10):
- FAB: 44×44px (עיגול 40px + 2px padding invisible)
- Pill selector: min-height 44px
- כפתור "הוסף תמונה": min-height 44px
- כפתור "שלח": min-height touch (56px — CTA גובה)

**Animation curves** (§5):
- Press FAB: 120ms ease-out
- Sheet enter/exit: כבר ב-BottomSheet
- Error message appear: `opacity 0 → 1`, 200ms ease-out
- Toast: כבר מוגדר ב-Toast component

---

## Locale / Direction Notes

- כל מחרוזות ב-`lib/strings.ts` (key חדש: `feedback.*`)
- `<textarea dir="auto">` — המשתמש יכול לכתוב עברית או אנגלית
- `<input name="name" dir="auto">` — כנ"ל
- אייקון `MessageSquare` — סימטרי, לא צריך מיררינג
- Pill selector: סדר pills מימין לשמאל: `באג | הצעה לפיצ׳ר | שאלה | אחר`

---

## Optimistic / Sync Notes

**לא** אופטימיסטי — שליחת מייל היא פעולה חד-כיוונית בלתי הפיכה. המשתמש מחכה לאישור (חצי שנייה–שנייה לרוב). Spinner על הכפתור בלבד, לא block על כל ה-UI.

---

## Design System Impact

- **Token חדש**: `z-fab: 20` — ב-`tailwind.config.ts` וב-`tokens.css`
- **מחרוזות חדשות**: `strings.feedback.*` — ב-`lib/strings.ts`
- **API route חדש**: `/api/feedback` — POST, לא component
- `FeedbackFab` + `FeedbackSheet` הם components חדשים, לא משנים קיימים

---

## Open Questions

<Should be empty before Tech Lead phase.>
