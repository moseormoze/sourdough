# Tasks: bake-session-shell

5 משימות, כל אחת PR נפרד. ה-shell מבוסס על תשתית 01 (Recipe, listRecipes, Dialog, Toast, ToastProvider).

## Task List

### T1 — ActiveBake schema, storage, hook, AbandonBakeDialog

**Goal:** מודל ה-ActiveBake (Zod), שכבת אחסון מקומית, hook קליינט לקריאה/יצירה/ביטול/קידום שלב, ודיאלוג ה-״ויתור״ — כל היסודות שכל המסכים הבאים יסתמכו עליהם.

**Files likely touched:**
- `lib/types/active-bake.ts` (Zod schema + types)
- `lib/storage/active-bake.ts` (load/save/clear + tests)
- `lib/hooks/use-active-bake.ts` (`"use client"` hook)
- `components/bake/abandon-bake-dialog.tsx` + test
- `lib/strings.ts` (תוספת לקטגוריה חדשה `bake.*`)

**Test strategy:**
- Vitest על ה-schema (טווחי `currentStage` 1..12, snapshot Recipe תקף, observationChecks אופציונלי).
- Vitest על storage: load/save/clear, חוסר עמידות ל-JSON שבור, רישום `sourdough:v1:active-bake`.
- RTL על AbandonBakeDialog: focus trap, scrim click, confirm/cancel handlers.

**Depends on:** 01-recipe-builder (קיים) — משתמש ב-`RecipeSchema`.

**Done when:**
- [ ] `ActiveBake` type + `ActiveBakeSchema` עם פילדים: `id, recipe (snapshot, RecipeSchema), startedAt, currentStage 1..12, stageStartedAt, observationChecks: Record<number, Record<string, boolean>>`
- [ ] `lib/storage/active-bake.ts` עם `loadActiveBake() / saveActiveBake(b) / clearActiveBake()`; שגיאות פרסור → null (כמו ב-recipes)
- [ ] `useActiveBake()` hook מחזיר `{ activeBake, start(recipe), abandon(), advanceTo(stage) }`. Initial load דרך useEffect; כל פעולה מסנכרנת `localStorage` + `setState`
- [ ] `AbandonBakeDialog` משתמש ב-`Dialog` הקיים, מקבל `recipeName/onConfirm/onCancel`, מציג את הטקסט הסופי מ-design.md
- [ ] 10+ unit/RTL tests, כולם ירוקים. type-check + lint + build נקיים.

---

### T2 — ChooserScreen (replaces /bake/new stub)

**Goal:** מסך בחירה שמציג בגריד אחד את 6 הפריסטים + מתכוני המשתמש; לחיצה על קלף יוצרת active bake חדשה ומנווטת ל-`/bake/stage/1`. אם כבר יש active bake — דיאלוג אישור לפני החלפה.

**Files likely touched:**
- `app/bake/new/page.tsx` (מחליף את BakeStubScreen)
- `components/bake/chooser-screen.tsx`
- `components/bake/chooser-card.tsx`
- `components/bake/bake-stub-screen.tsx` ← **נמחק** (כולל הטסטים)

**Test strategy:**
- RTL: 6 פריסטים + N מתכונים מ-`saveRecipe`; תג ״שלי״ על מתכונים בלבד; לחיצה על קלף → `useActiveBake.start` נקרא; redirect לכתובת הצפויה.
- RTL: כשיש active bake → לחיצה על קלף פותחת AbandonBakeDialog; confirm → abandon+start+navigate; cancel → לא קורה כלום.
- Press state machine (תואם `PresetCard`).

**Depends on:** T1.

**Done when:**
- [ ] `ChooserScreen` מציג גריד `grid-cols-2 gap-3` של פריסטים (תמיד 6) ואז מתכוני המשתמש
- [ ] `ChooserCard` מציג שם, סיכום קצר, וכששייך — תג ״שלי״ (בתוכן + לקריאת מסך)
- [ ] לחיצה ללא active bake → `start(snapshot)` → `router.push("/bake/stage/1")`
- [ ] לחיצה עם active bake → `AbandonBakeDialog` (טקסט ״לוותר על הבייק הנוכחי״); confirm → start חדש; cancel → נשאר במסך
- [ ] `BakeStubScreen` + הטסטים שלו נמחקו לחלוטין
- [ ] כותרת המסך: ״במה אופים?״ (השונה מ-״מאיפה להתחיל?״ של בונה־מתכון)
- [ ] בדיקות חדשות עוברות; הקיימות לא שבורות.

---

### T3 — HomeScreen Resume mode + ResumeCard

**Goal:** כשיש active bake, מסך הבית מציג כרטיס ״ממשיכים את הבייק שלך״ במקום שני ה-CTAs. הכרטיס פותח דיאלוג ביטול או ממשיך לשלב הנוכחי.

**Files likely touched:**
- `components/home/home-screen.tsx` (modify)
- `components/home/resume-card.tsx` (new)
- `components/home/home-screen.test.tsx` (extend)

**Test strategy:**
- RTL: בלי active bake → שני CTAs נראים, ResumeCard לא; עם active bake → ResumeCard נראה, CTAs מוסתרים.
- RTL: לחיצה ״המשך לבייק״ → router.push לכתובת הנכונה לפי `currentStage`.
- RTL: לחיצה ״ביטול בייק״ → דיאלוג; confirm → `abandon()` → home re-renders fresh; cancel → דיאלוג נסגר, ResumeCard נשאר.

**Depends on:** T1.

**Done when:**
- [ ] `HomeScreen` קורא ל-`useActiveBake()`; מצב initial = loading (לא מציגים שום CTA עד שטעון); אחרי טעינה → fresh או active
- [ ] `ResumeCard` מציג שם המתכון + ״שלב N״ (ל-02 נציג רק את המספר; שם השלב מ-03+) + שני CTAs
- [ ] press state machine על ה-CTA הראשי (זהה ל-HomeCta)
- [ ] לחיצה על ״ביטול בייק״ פותחת `AbandonBakeDialog`; confirm → `abandon()`; cancel → רק סוגר
- [ ] ספירת המתכונים בכרטיס ״המתכונים שלי״ נשארת תקינה במצב fresh
- [ ] 6+ בדיקות חדשות עוברות.

---

### T4 — Stage placeholder routes + guards

**Goal:** ראוטים דינמיים `/bake/stage/[n]` ו-`/bake/done` שמציגים placeholder ובעלי לוגיקת guard: בלי active bake → ניתוב ל-`/`; כשמספר השלב לא תואם → ניתוב לשלב הנכון.

**Files likely touched:**
- `app/bake/stage/[n]/page.tsx` (new)
- `app/bake/done/page.tsx` (new)
- `components/bake/bake-stage-stub-screen.tsx` (new) + test

**Test strategy:**
- RTL: רנדור placeholder ״שלב N — בקרוב״ עם הכפתור־חזרה.
- RTL: כשאין active bake (mock storage ריק) → `router.replace("/")` נקרא.
- RTL: כש-`currentStage` שונה מה-`n` ב-URL → `router.replace("/bake/stage/{currentStage}")`.
- ראוטים סטטיים: 12 שלבים אמורים להיווצר; mockup ל-stage 1, 4, 12.

**Depends on:** T1.

**Done when:**
- [ ] `/bake/stage/[n]` קיים, מקבל את `n` כפרמטר, ממיר ל-number
- [ ] `BakeStageStubScreen` מציג ״שלב {n} — בקרוב״ + לינק ״חזרה למסך הבית״ (לא Button — `Link` כדי שיעבוד גם אם JS נופל)
- [ ] guard: אם אין active bake → `router.replace("/")` באפקט הראשון
- [ ] guard: אם יש active bake וש`activeBake.currentStage !== n` → `router.replace("/bake/stage/${currentStage}")`
- [ ] `/bake/done` קיים גם, ממליץ אם `currentStage === 12`
- [ ] בדיקה ידנית: התחל בייק → מנווט ל-stage 1 → ה-placeholder מופיע; reload → אותו דבר; לחץ ״חזרה למסך הבית״ → ResumeCard נראה
- [ ] 5+ בדיקות חדשות עוברות.

---

### T5 — Polish + audit + integrative QA

**Goal:** קוד נקי, אין בעיות RTL, type-check + lint + build נקיים; הזרימה המלאה נבדקת ב-Playwright (`scripts/probe-bake-flow.mjs`).

**Files likely touched:**
- `scripts/probe-bake-flow.mjs` (חדש — מצויד את הבאגים)
- כל קבצי 02 לבדיקת RTL/lint/types

**Test strategy:**
- `rtl-check` skill — מצופה 0 ממצאים
- `npm run lint` + `npm run type-check` + `npm run build` — נקיים
- Playwright probe על הזרימה: home → התחל אפייה → chooser → tap preset → /bake/stage/1; back → home → ResumeCard; resume → /bake/stage/1; abandon → home fresh; refresh המסך באמצע → אותו state

**Depends on:** T1, T2, T3, T4.

**Done when:**
- [ ] `rtl-check` returns 0 findings
- [ ] `npm run type-check` clean
- [ ] `npm run lint` clean (no warnings, no errors)
- [ ] `npm run build` clean
- [ ] `scripts/probe-bake-flow.mjs` עובר על הזרימה הסטנדרטית בלי שגיאות
- [ ] בדיקת ידנית מהירה ב-dev: התחלת בייק שורדת רענון

---

## Build Order

```
T1 (Storage + hook + dialog)
  ↓
T2 (Chooser) ──┐
T3 (Home resume) ──┴── (parallel ok — both depend only on T1)
  ↓
T4 (Stage placeholder)
  ↓
T5 (Polish)
```

T2 ו-T3 מקבילים — שניהם תלויים רק ב-T1. T4 צריך את T2 ל-flow completeness (chooser → stage), אבל טכנית גם תלוי רק ב-T1.

## Risks

1. **HomeScreen flicker בין loading ל-active** — אם `useActiveBake` מאחר לטעון, ייתכן flash של CTAs לפני הופעת ResumeCard. פתרון: state initial = `{ status: "loading" }`, לא מציגים שום משהו עד שהbool ידוע. או SSR pass + הידרציה (פחות שווה).

2. **localStorage רץ ב-server** — useActiveBake מנסה לקרוא localStorage. ב-SSR זה לא קיים. הפתרון הסטנדרטי: לקרוא רק ב-useEffect (לא ב-useState init), שיש לנו דוגמה ב-recipe-list-screen.tsx.

3. **קונפליקטים על ה-AbandonBakeDialog** — הוא משמש גם בChooser (T2) וגם ב-Home (T3). מאחר ש-T1 מספק אותו כרכיב חיצוני, אין כפילות.

4. **ראוט guard race** — אם יש active bake, אבל `useActiveBake` עדיין loading כשמסך השלב נטען, ה-guard יפעיל redirect מוקדם מדי. הפתרון: לבדוק `if (loading) return;` לפני ה-redirect, ולהציג spinner קצר.

5. **תוכן השלבים** — מפתה ״לעשות עוד קצת״ ב-02. המשמעת: אם משהו דורש לדעת אם השלב הוא תצפית או טיימר → זה 03.
