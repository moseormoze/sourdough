# Tasks: בונה מתכון (Recipe Builder)

13 משימות, כל אחת PR נפרד. בנויות לפי תלות — T1 ראשון, T13 אחרון.

## Task List

### T1 — Scaffold + design tokens
**Goal:** Next.js 15 app רץ ב-`npm run dev`, RTL מותקן, Rubik + JetBrains Mono נטענים, Lucide זמין, טוקני המערכת מ-handoff מחוברים (לא להמציא tokens חדשים).
**Files likely touched:** `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.js`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx` (placeholder)
**Test strategy:**
- בדיקה ידנית: `npm run dev` עובד, `<html dir="rtl">` במקור, Rubik + JetBrains Mono טעונים, אייקון Lucide מ-test מוצג נכון.
- TypeScript strict עובד (build נקי).
**Depends on:** none
**Done when:**
- [ ] `npm run build` ו-`npm run dev` ירוקים
- [ ] `app/layout.tsx` עם `<html lang="he" dir="rtl">`
- [ ] Rubik 400/500/600/700/800 + JetBrains Mono 400/500/600 נטענים (Google Fonts, preconnect)
- [ ] Tailwind מוגדר על-ידי מיזוג `theme.extend` מ-[`specs/design/tailwind.config.js`](../../design/tailwind.config.js)
- [ ] `app/globals.css` מייבא את [`specs/design/tokens.css`](../../design/tokens.css) (או מעתיק את תוכנו לכאן, בלי לשנות ערכים)
- [ ] משתני ה-tokens מ-handoff זמינים: `--bg`, `--bg-2`, `--paper`, `--line`, `--ink`, `--ink-2`, `--accent`, `--accent-bg`, `--sage`, `--sage-bg`, `--warn`, `--warn-bg`, `--danger`, `--danger-bg`, ועוד (ראה `tokens.css`)
- [ ] Utility class `.num` (number isolation) זמין גלובלית
- [ ] press-feedback (`scale(0.965)` על `button, [role="button"]`) פעיל מ-`tokens.css`
- [ ] `prefers-reduced-motion: reduce` מבטל transitions (כבר ב-`tokens.css`)

---

### T2 — Recipe domain model + storage layer
**Goal:** מודל `Recipe` עם Zod schema, ו-storage module שיודע list/get/save/delete עם בדיקות מלאות.
**Files likely touched:** `lib/types/recipe.ts`, `lib/storage/recipes.ts`, `lib/storage/recipes.test.ts`
**Test strategy:** Vitest — מבדיק save→list→get→delete על mock של localStorage. בדיקות לגזירת נתונים פגומים (corrupted JSON, סכימה לא חוקית).
**Depends on:** T1
**Done when:**
- [ ] `Recipe` type מוגדר עם `id`, `name`, `flour: {white, wholeWheat, rye, other}`, `hydration`, `salt`, `levain`, `kitchenTemp`, `inclusions: Array<{name, amountGrams}>`, `createdAt`, `updatedAt`
- [ ] Zod schema מאמת את כל הטווחים מה-brief (קמחים = 100%, hydration 50-100%, salt 0-5%, levain 0-40%, temp 10-40°C)
- [ ] `listRecipes()` — מחזיר מיון לפי `updatedAt` יורד, מסנן corrupted entries
- [ ] `getRecipe(id)` / `saveRecipe(r)` / `deleteRecipe(id)` — כולם בדוקים
- [ ] storage key: `sourdough:v1:recipes`
- [ ] בדיקות עוברות: 8+ unit tests

---

### T3 — UI primitives (Toast, Dialog, form fields)
**Goal:** רכיבים בסיסיים שאחרים יבנו עליהם — `Toast`, `Dialog`, `TextInput`, `NumberInput`, `FormSection`, `ValidationMessage`.
**Files likely touched:** `components/ui/toast.tsx`, `components/ui/dialog.tsx`, `components/ui/text-input.tsx`, `components/ui/number-input.tsx`, `components/ui/form-section.tsx`, `components/ui/validation-message.tsx`, `lib/strings.ts` (התחלה)
**Test strategy:** React Testing Library — render + interaction:
- Toast: מופיע, נסגר אוטומטית ב-2400ms, action button פועל, replace-not-stack
- Dialog: פותח/סוגר, escape, click-outside, focus trap
- Inputs: `dir="auto"` בטקסט, `dir="ltr"` במספרים, ולידציה מציגה ValidationMessage
**Depends on:** T1
**Done when:**
- [ ] Toast לפי `ui-playbook` §9 + spec ב-[`specs/design/components.md`](../../design/components.md#toast) (enter 250ms ease-out, exit 200ms ease-in, default 2400ms, replace-don't-stack, bottom inset)
- [ ] Dialog לוגי: כותרת + תיאור + actions, focus trap, RTL-safe. בסיס משותף עם BottomSheet הרחב מ-handoff.
- [ ] Button עם variants `primary`/`accent`/`soft`/`ghost`/`warn` ו-sizes `md`/`sm` (לפי [`specs/design/components.md`](../../design/components.md#button))
- [ ] כל ה-inputs עם logical CSS בלבד, ולידציה אחרי blur+invalid (לא חוסם הקלדה)
- [ ] `lib/strings.ts` קיים עם כל המחרוזות מ-design.md (Locale section) — לפחות אלה הרלוונטיות לרכיבים האלה
- [ ] בדיקות עוברות

---

### T4 — HomeScreen + BakeStubScreen + routing
**Goal:** מסך הבית קיים עם שני CTAs פעילים, ניווט עובד, stub מצב-אפייה זמין.
**Files likely touched:** `app/page.tsx`, `app/bake/new/page.tsx`, `app/recipes/page.tsx` (placeholder ל-T5), `components/home/home-cta.tsx`, `components/home/home-screen.tsx`, `components/bake/bake-stub-screen.tsx`
**Test strategy:**
- RTL test: HomeScreen מציג שני CTAs, ספירה נראית רק אם > 0
- Navigation test (Playwright או RTL routing test): לחיצה על ״התחל אפייה״ → `/bake/new`; ״המתכונים שלי״ → `/recipes`
- State machine: HomeCta press → scale 0.985 + bg ink-06 (לפי `ui-playbook` §2, גודל קלף)
**Depends on:** T1, T2 (כדי לקרוא ספירה), T3
**Done when:**
- [ ] HomeScreen renders עם כותרת ״כיכר״ + ״מה אופים היום?״ + 2 CTAs
- [ ] ״התחל אפייה״ מנווט ל-`/bake/new` שמציג ״מצב אפייה — בקרוב״ + back
- [ ] ״המתכונים שלי״ מנווט ל-`/recipes` (יישאר ריק עד T5)
- [ ] ספירת מתכונים נקראת מ-storage (T2)
- [ ] State machine של press נבדק: scale ב-pressdown, נמחק ב-pointermove > 5px, fires onClick רק ב-pointerup ללא drag

---

### T5 — RecipeListScreen + EmptyRecipesState (ללא items עדיין)
**Goal:** מסך רשימה מציג empty state כשאין מתכונים, שלד-רשימה כשיש, כפתור ״+ מתכון חדש״ עובד ומנווט לגלריית presets.
**Files likely touched:** `app/recipes/page.tsx`, `app/recipes/new/page.tsx` (placeholder ל-T6), `components/recipes/recipe-list-screen.tsx`, `components/recipes/empty-recipes-state.tsx`
**Test strategy:** RTL — render + navigation. אין items עדיין; T5 בודק רק את ה-shell + empty path.
**Depends on:** T2, T3, T4
**Done when:**
- [ ] רשימה ריקה → EmptyRecipesState עם 🍞 + כותרת + תיאור + כפתור גדול
- [ ] רשימה עם נתון → כותרת + כפתור ״+ מתכון חדש״ inline בכותרת (לא FAB)
- [ ] לחיצה על ״+ מתכון חדש״ → `/recipes/new`
- [ ] State machine של press על הכפתור נבדק

---

### T6 — PresetGalleryScreen + 6 presets
**Goal:** מסך בחירת preset מציג 6 קלפים ויזואליים + קישור ״התחל מאפס״, לחיצה מובילה לטופס עם payload.
**Files likely touched:** `app/recipes/new/page.tsx`, `app/recipes/new/[preset]/page.tsx` (אם נצרך) או query param, `components/presets/preset-gallery-screen.tsx`, `components/presets/preset-card.tsx`, `lib/presets.ts`
**Test strategy:** RTL — render 6 קלפים, לחיצה מנווטת לטופס עם הנתון הנכון, State machine של PresetCard press.
**Depends on:** T1, T3
**Done when:**
- [ ] `lib/presets.ts` מכיל 6 presets לפי design.md (כפרי קלאסי, 70% מלא, שיפון 50%, לבן בסיסי, מלא 100%, כפרי קל למתחילים)
- [ ] PresetGalleryScreen מציג גריד 2×3 (mobile) של PresetCard
- [ ] כל קלף מציג שם + תיאור קצר + ערכי-מפתח
- [ ] לחיצה על קלף → ניווט לטופס (preset כ-state או query param)
- [ ] ״התחל מאפס״ → ניווט לטופס בלי payload
- [ ] State machine של PresetCard press נבדק

---

### T7 — Recipe form (UI + validation, ללא שמירה)
**Goal:** טופס מתכון מלא עם כל השדות, ולידציה חיה אחרי-touch, מחוון סכום-קמחים חי, אבל ללא שמירה עדיין.
**Files likely touched:** `app/recipes/new/page.tsx`, `app/recipes/[id]/edit/page.tsx`, `components/recipes/recipe-form-screen.tsx`, `components/recipes/flour-breakdown-input.tsx`, `components/recipes/percent-input.tsx`, `components/recipes/temp-input.tsx`, `lib/strings.ts` (השלמה)
**Test strategy:** RTL — form state, validation per field (touched-only), live flour sum indicator, mixed-direction rendering של מספרים ב-RTL.
**Depends on:** T3, T6
**Done when:**
- [ ] טופס מציג: שם, FlourBreakdownInput (4 שדות + סכום-חי), hydration, salt, levain, kitchenTemp
- [ ] ולידציה לפי הטווחים ב-brief, מציג ValidationMessage רק אחרי שהשדה נגעו בו
- [ ] FlourBreakdownInput מציג ״סה״כ: X%״ או ״סה״כ: X% · חסר Y%״ בלייב (לא רק על submit)
- [ ] מספרים עטופים `<span dir="ltr">` בתוך טקסט עברי (לפי design.md mixed-direction)
- [ ] קבלת preset payload (מ-T6) ממלאה את השדות
- [ ] בדיקות לכל כלל ולידציה (5-7 tests)

---

### T8 — Smart hints (HintChip + lookup)
**Goal:** מנגנון ההצעות החכמות — HintChip מופיע ליד hydration/salt/levain כשהמומלץ ≠ הנוכחי. אופציה ב׳ בלבד (non-intrusive). לחיצה מאמצת, שינוי ידני מסיר.
**Files likely touched:** `lib/recommendations.ts`, `lib/recommendations.test.ts`, `components/recipes/hint-chip.tsx`, `components/recipes/percent-input-with-hint.tsx` (החלפת PercentInput במסלול הנכון)
**Test strategy:**
- Unit: טבלת lookup מחזירה המלצות נכונות לכל תרחיש מ-design.md
- Component: chip מופיע מתי שצריך, נעלם אחרי accept, נעלם אחרי שינוי ידני, **אינו דורס אוטומטית**
- State machine: chip press → highlight animation על השדה → fade-out
**Depends on:** T7
**Done when:**
- [ ] `recommendations.ts` עם פונקציה `recommendFor(flour)` → `{hydration, salt, levain}` לפי הטבלה ב-design.md
- [ ] HintChip מופיע *רק* כש-`|current - recommended| > threshold` (sane default ~2%)
- [ ] לחיצה על chip → animation highlight על השדה (200ms ease-out → ease-in) + ערך משתנה + chip נעלם (200ms fade-out)
- [ ] שינוי ידני של השדה לערך שונה ממומלץ → chip מתעדכן או נשאר; שינוי ידני לערך קרוב למומלץ → chip נעלם
- [ ] **אסור** auto-fill — וידוא דרך בדיקה ייעודית
- [ ] Touch target 44px (`::before` overlay)
- [ ] State machine נבדק

---

### T9 — InclusionsSection (add/remove rows)
**Goal:** סקציית תוספות אופציונלית בטופס. הוסף/הסר שורות, ולידציה לכל שורה.
**Files likely touched:** `components/recipes/inclusions-section.tsx`, `components/recipes/inclusion-row.tsx`
**Test strategy:** RTL — add row → empty row אומרת focus בשם, remove row → fade-out, ולידציה (שם לא ריק, כמות חיובית).
**Depends on:** T7
**Done when:**
- [ ] סקציה collapsed כשאין שורות (״תוספות (אופציונלי)״ + ״+ הוסף תוספת״ קטן)
- [ ] הוספת שורה — slide-in מלמטה 250ms ease-out + auto-focus על השם
- [ ] הסרת שורה — fade-out + collapse 200ms ease-in, ללא דיאלוג אישור
- [ ] ולידציה לכל שורה: שם לא ריק, כמות חיובית בגרמים
- [ ] State of inclusions נשמר בטופס (לא נאבד בין שינויי שדות אחרים)

---

### T10 — Save / Edit / Delete-from-form
**Goal:** הטופס מתחבר ל-storage. שמירה יוצרת או מעדכנת, מחיקה מהטופס פותחת דיאלוג ומוחקת.
**Files likely touched:** `app/recipes/new/page.tsx`, `app/recipes/[id]/edit/page.tsx`, `components/recipes/recipe-form-screen.tsx` (חיווט), `components/recipes/delete-confirm-dialog.tsx`
**Test strategy:** RTL + storage mock — save inserts/updates, delete confirms + executes, ״לאבד שינויים?״ מוצג רק אחרי dirty + cancel, toast הצלחה מופיע.
**Depends on:** T2, T7, T8, T9
**Done when:**
- [ ] ״שמור״ במצב create → `saveRecipe` (insert) + ניווט ל-`/recipes` + toast הצלחה
- [ ] ״שמור״ במצב edit → `saveRecipe` (update) + ניווט + toast
- [ ] ״מחק מתכון״ פותח DeleteConfirmDialog → אישור → `deleteRecipe` + ניווט + toast
- [ ] cancel/back כשהטופס dirty → ״לאבד שינויים?״ דיאלוג
- [ ] שמירת < 200ms → אין מצב ״שומר…״ (כדי למנוע פלאש)
- [ ] שגיאת storage → toast ״לא הצלחנו לשמור — נסה שוב״, נשארים בטופס

---

### T11 — RecipeListItem + tap-to-edit
**Goal:** הרשימה מציגה מתכונים אמיתיים מ-storage, ממוינים, ניתן להקיש לעריכה.
**Files likely touched:** `components/recipes/recipe-list-item.tsx`, `components/recipes/recipe-list-screen.tsx` (חיווט)
**Test strategy:** RTL — render רשימה ממומסכת מ-storage, סדר נכון, tap מנווט עם id נכון, press state machine.
**Depends on:** T2, T5, T10
**Done when:**
- [ ] קריאה מ-`listRecipes()` (ממוינים `updatedAt` יורד)
- [ ] כל item מציג שם + סיכום-שורה (״70% מלא · 75% הידרציה · 3 תוספות״)
- [ ] tap על item → ניווט ל-`/recipes/[id]/edit`
- [ ] State machine press לפי playbook §1-2 (scale 0.965, bg ink-06, clear on drag > 5px)

---

### T12 — Swipe-to-delete + undo toast
**Goal:** swipe ימינה (RTL) על item ברשימה מציג מצב מחיקה עם undo. הגסטה המלאה לפי `ui-playbook` §3 + §11.
**Files likely touched:** `components/recipes/recipe-list-item.tsx` (הרחבה), `components/recipes/swipe-controller.tsx` (אם נצרך הפרדה), Toast החיווט מ-T3
**Test strategy:**
- Playwright (פעם ראשונה בפרויקט) — gesture state machine, rubber-band thresholds, velocity-snap, undo flow
- Unit: snap logic, threshold values, RTL coordinate handling
**Depends on:** T11, T3
**Done when:**
- [ ] State machine: Idle → Press → Drag → Release → Snap → Idle (לפי §1)
- [ ] Rubber-band: 0-120px 1:1, 120-180px resistance 0.3, >180 hard cap (לפי §3)
- [ ] Visual commit signal: bg red-500 → red-600 בחציית 120px
- [ ] Velocity-snap: `v > 0.5px/ms` או `distance > 60px` → snap ל-120; אחרת snap ל-0
- [ ] Spring על release: 250ms `cubic-bezier(0.34, 1.56, 0.64, 1)`
- [ ] Commit → row collapse 200ms ease-in + toast עם ״בטל״
- [ ] Toast 2400ms → מחיקה סופית; tap ״בטל״ בתוך החלון → restore
- [ ] בדיקת RTL: swipe positive X מגלה אזור משמאל (לפי §11) — אין any special-case JS לכיוון
- [ ] בדיקת state machine מלאה

---

### T13 — Polish + accessibility + RTL audit + reduced motion
**Goal:** סיבוב פוליש שמכסה את ה-gaps המוכרים מ-`ui-playbook` הרלוונטיים, וידוא RTL מלא, type-check ו-lint נקיים, accessibility בסיסי.
**Files likely touched:** `app/globals.css` (prefers-reduced-motion), כל הקבצים שמשתמשים ב-transitions
**Test strategy:**
- ידני + RTL automated: skill `rtl-check` רץ נקי
- `prefers-reduced-motion: reduce` → transitions קצרות או מבוטלות
- Lighthouse / axe: a11y בסיסי (focus indicators, contrast, labels)
**Depends on:** T1-T12 (כל הפיצ׳ר)
**Done when:**
- [ ] כל transition של 250ms+ עוטף `@media (prefers-reduced-motion: reduce)` עם duration קצר (50ms) או none
- [ ] `rtl-check` skill מחזיר 0 ממצאים
- [ ] `npm run type-check` נקי
- [ ] `npm run lint` נקי
- [ ] כל אינטראקציה ≥44×44px (audit ידני)
- [ ] aria-labels על אייקונים-בלבד (delete, add, close)
- [ ] focus indicators ב-keyboard navigation
- [ ] `npm run build` נקי

---

## Build Order

```
T1 (Scaffold)
  ↓
T2 (Storage) ────┐
  ↓              │
T3 (UI primitives) ─┐
  ↓              │  │
T4 (Home + Stub) ◄──┘
  ↓
T5 (List shell + empty)
  ↓
T6 (Preset gallery)
  ↓
T7 (Form UI + validation)
  ↓
T8 (Smart hints)    ◄──┐
  ↓                    │
T9 (Inclusions)        │
  ↓                    │
T10 (Save/Edit/Delete) │
  ↓                    │
T11 (List items)       │
  ↓                    │
T12 (Swipe-to-delete)  │
  ↓                    │
T13 (Polish + a11y) ───┘
```

תלות זרימה: לוגית-זמנית הזרימה היא לינארית, אבל ב-T3/T4 יש שני נתיבים מקבילים אפשריים אם רוצים לפצל לעבודה מקבילית — מי שמתחיל T4 צריך כבר את T2 ו-T3.

## Risks

1. **RTL gesture coordinates** — Playbook §11 אומר ״אל תעשה special-case JS לכיוון״, אבל בפועל ב-T12 יש פיתוי לבדוק `dir`. **רמז**: כל החישוב נשאר על קואורדינטות פייסיוויות; CSS מסדר את ההיפוך הוויזואלי.
2. **`localStorage` quota / errors** — נדיר אבל אפשרי. ב-T2 חשוב לתפוס QuotaExceededError ולהציג toast במקום לקרוס.
3. **Rubik + JetBrains Mono במספרים ב-Hebrew typography** — לפעמים מספרים מוצגים עם spacing מוזר ב-RTL paragraphs. השימוש ב-`.num` utility (מ-`tokens.css`) חובה בכל מספר בתוך טקסט עברי. T7 צריך לבדוק על מכשיר אמיתי, לא רק desktop.
4. **PresetCard "ויזואלי-בולט"** — design.md הגדיר ״לא רשימת טקסט פשוטה״. ב-T6, אם אין זמן לאיורים אמיתיים, להשתמש באייקוני Lucide גדולים + רקעים צבעוניים שונים. לא להציג סתם רשימה של שמות.
5. **Hint accept animation** — T8 ה-״highlight״ צריך להיות עדין מאוד. ירוק בהיר ל-200ms זה יותר מדי אם זה הצבע הנכון. תיכון: bg fade עדין של ה-input box.
6. **Test coverage לטופס** — T7 ול-T10 הם החלק העמוס ביותר בבדיקות. תוכנן ~15-20 unit tests משולבים.
7. **Type strict mode על Zod** — Zod default מוציא טיפוסים שעלולים להיות `unknown | undefined`. T2 צריך לוודא ש-`safeParse` מטופל נכון ולא דורש cast.
