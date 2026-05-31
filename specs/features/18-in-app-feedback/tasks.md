# Tasks: In-App Feedback

## Task List

### T1 — API Route + Resend Setup
**Goal:** הקמת ה-backend הראשון בפרויקט — POST route שמקבל פידבק ושולח מייל דרך Resend.

**Files likely touched:**
- `app/api/feedback/route.ts` — חדש
- `package.json` — הוספת `resend`
- `.env.local` — `RESEND_API_KEY` (לא נכנס ל-git)
- `.env.local.example` — תיעוד המשתנה (כן נכנס ל-git)

**Test strategy:**
- mock `resend` עם `vi.mock('resend')`
- בדיקת validation: שליחה ללא `description` מחזירה 400
- בדיקת payload: הודעת המייל כוללת את כל השדות (סוג, שם, תיאור, תמונה base64)
- בדיקת הצלחה: Resend.emails.send נקרא עם הפרמטרים הנכונים

**Depends on:** —

**Done when:**
- [ ] Tests written and passing
- [ ] `POST /api/feedback` מחזיר 200 על payload תקין
- [ ] `POST /api/feedback` מחזיר 400 אם `description` חסר
- [ ] מייל מגיע ל-`eilon@mycache.ai` עם כל השדות
- [ ] `.env.local.example` מתועד

---

### T2 — Image Compression Util
**Goal:** פונקציית util טהורה לדחיסת תמונה בצד הלקוח: `File → Promise<string>` (base64 JPEG).

**Files likely touched:**
- `lib/utils/compress-image.ts` — חדש
- `lib/utils/compress-image.test.ts` — חדש

**Test strategy:**
- יצירת `File` מ-blob ובדיקה שהפלט הוא base64 string שמתחיל ב-`data:image/jpeg`
- תמונה שגדולה מ-1024px — לאחר דחיסה הרוחב/גובה המקסימלי הוא 1024px
- תמונה שכבר קטנה — לא מוגדלת (no upscale)
- `vitest` עם `jsdom` (Canvas API זמין ב-jsdom)

**Depends on:** —

**Done when:**
- [ ] Tests written and passing
- [ ] פונקציה מייצאת `compressImage(file: File): Promise<string>`
- [ ] פלט: JPEG, quality 0.7, max 1024px בצד הארוך
- [ ] לא מגדיל תמונות קטנות

---

### T3 — FeedbackFab + FeedbackSheet + Wire
**Goal:** כל ה-UI — כפתור floating, sheet טופס, חיבור ל-API, וחיבור ל-layout.

**Files likely touched:**
- `components/feedback/feedback-fab.tsx` — חדש
- `components/feedback/feedback-sheet.tsx` — חדש
- `components/providers.tsx` — הוספת `<FeedbackFab />`
- `lib/strings.ts` — הוספת `feedback.*` strings
- `tailwind.config.ts` — הוספת `fab: "20"` ל-zIndex
- `specs/design/tokens.css` — הוספת `--z-fab: 20`

**Test strategy:**
- `FeedbackSheet`: render, בדיקה שכפתור "שלח" disabled כשאין סוג או תיאור
- `FeedbackSheet`: בחירת סוג + הזנת תיאור → כפתור enabled
- `FeedbackSheet`: submit מוצלח → mock fetch → sheet נסגר (onClose נקרא)
- `FeedbackSheet`: submit נכשל → הודעת שגיאה inline מוצגת, sheet לא נסגר
- `FeedbackFab`: render + לחיצה פותחת sheet (state toggle)

**Depends on:** T1, T2

**Done when:**
- [ ] Tests written and passing
- [ ] FAB נראה בכל המסכים, `bottom-[88px] start-4 z-fab`
- [ ] FAB: 44×44px touch target, press feedback scale(0.965) 120ms
- [ ] Sheet נפתח ב-`full` (88%), סוג פידבק חובה, תיאור חובה
- [ ] העלאת תמונה → דחיסה → thumbnail; כפתור הסרה
- [ ] Submitting state: spinner על הכפתור, sheet לא ניתן לסגירה
- [ ] הצלחה: sheet נסגר + toast "הפידבק נשלח"
- [ ] שגיאה: הודעה inline, sheet נשאר פתוח
- [ ] כל המחרוזות מתוך `strings.feedback`
- [ ] RTL תקין

---

## Build Order

T1 → T3  
T2 → T3

(T1 ו-T2 מקבילים, T3 מחכה לשניהם)

## Risks

- **Canvas ב-test environment**: jsdom תומך ב-Canvas API בסיסי אבל `toBlob` עלול להיות stub — ייתכן שנצטרך `canvas` npm package בסביבת ה-test
- **Resend free tier**: 100 מיילים/יום — מספיק לבטא, לא לפרודקשן רחב
- **תמונה גדולה מדי אחרי דחיסה**: edge case — תמונה ב-PNG עם alpha channel שהמרה ל-JPEG שוברת transparency (לא רלוונטי לצורך הזה, מקובל)
