# Tasks: קמח כוסמין + עיצוב מחדש של הפריסטים

> כל טאסק = ענף + טסט נכשל ראשון + PR אחד. כל PR משאיר build ירוק (`npm test` + `tsc`).

## Task List

### T1 — מודל נתונים + מיגרציה
**Goal:** הוספת `speltWhite` + `speltWhole` לכל שכבת הנתונים, תוך שמירת תאימות-לאחור עם מתכונים שמורים. הפריסטים הקיימים ממשיכים לקמפל.
**Files likely touched:**
- `lib/types/recipe.ts` — `FlourSchema`: הוסף `speltWhite`/`speltWhole` עם `.min(0).max(100).default(0)`; השאר `other` עם `.default(0)`; עדכן את ה-`refine` כך שהסכום מתייחס לכל חמשת השדות + `other`.
- `lib/validate-recipe.ts` — `RecipeFormValues.flour` (הוסף שני שדות `number | ""`), `emptyRecipeFormValues`, `flourTotal` (כלול את שני השדות).
- מיפויי preset→form / recipe→form (ב-`recipe-form-screen` / `app/recipes/new/[preset]/page.tsx` או mapper ייעודי) — לשאת את שני השדות.
**Test strategy (unit):**
- Zod מנתח מתכון ישן `{white, wholeWheat, rye, other:0}` ללא שגיאה (spelt → 0 ב-default).
- Zod מנתח מתכון חדש עם spelt; refine נכשל כשהסכום ≠ 100 על פני 5 השדות.
- `flourTotal` סוכם את 5 השדות נכון.
- **קריטי:** ודא ש-`z.input` משאיר את שדות ה-spelt **אופציונליים** (בגלל `.default`), אחרת `presets.ts` הקיים לא יקמפל.
**Depends on:** none
**Done when:**
- [ ] Tests written and passing
- [ ] `tsc` נקי, כולל `presets.ts` הישן (טרם השינוי שלו ב-T5)
- [ ] מתכון שמור v1 קיים נטען ב-app ללא שגיאת ולידציה

### T2 — מנוע ההמלצות: כללי כוסמין
**Goal:** `recommendFor` מחזיר ערכי כוסמין מותאמים, בסדר נכון מול הכללים הקיימים.
**Files likely touched:** `lib/recommendations.ts`, `lib/recommendations.test.ts`
**Test strategy (unit):** לפי טבלת ה-Design —
- `speltWhole ≥ 30` → `{76, 2.2, 18}`; גבול: 29 → לא נתפס, 30 → נתפס.
- `speltWhite ≥ 50` → `{73, 2.0, 18}`.
- **`white:50 / speltWhole:50` → כלל הכוסמין, לא `white ≥ 50`** (AC מהבריף).
- כללי הלבן/מלא/שיפון הקיימים לא נשברו (regression).
**Depends on:** T1 (טיפוס `Flour`)
**Done when:**
- [ ] Tests written and passing
- [ ] סדר הכללים: spelt → white≥80 → wholeWheat≥50 → rye≥30 → white≥50 → default

### T3 — מחרוזות (i18n)
**Goal:** תוויות עבריות לשדות החדשים, דרך `lib/strings.ts` בלבד.
**Files likely touched:** `lib/strings.ts`
- `form.flourSpeltWhite = "כוסמין לבן"`, `form.flourSpeltWhole = "כוסמין מלא"`
- `bake.flourTypeLabels.speltWhite = "קמח כוסמין לבן"`, `...speltWhole = "קמח כוסמין מלא"`
- הסר `flourOther` / `flourTypeLabels.other` רק אם אין יותר רפרנסים (אחרת השאר יתום ותעד).
**Test strategy:** אין טסט ייעודי (קבועים) — נצרך ע״י טסטי T4/T5.
**Depends on:** none
**Done when:**
- [ ] המחרוזות קיימות, אין מחרוזת מקודדת בקומפוננטה
- [ ] `rtl-check` עובר

### T4 — בונה הקמחים: 5 שדות
**Goal:** `FlourBreakdownInput` מציג 5 שדות בעלי שם, ללא "אחר".
**Files likely touched:** `components/recipes/flour-breakdown-input.tsx`, `components/recipes/flour-breakdown-input.test.tsx`
- `KEYS = ["white","wholeWheat","rye","speltWhite","speltWhole"]`; `LABEL` עם spelt, ללא `other`.
**Test strategy (component/RTL):**
- מרנדר בדיוק 5 שדות בסדר הנכון; אין שדה "אחר".
- שינוי ערך spelt משתקף בסכום ובהודעת ✓/danger.
- בדיקה ויזואלית ב-375px ש"כוסמין לבן" לא גולש ב-grid דו-טורי (אם כן — fallback לטור יחיד; תעד).
**Depends on:** T1, T3
**Done when:**
- [ ] Tests written and passing
- [ ] אין הפרת logical-properties (`rtl-check`)

### T5 — פריסטים + סיכום קמח בכרטיס
**Goal:** 7 פריסטים לפי טבלת ה-Design; כרטיס שמציג כוסמין.
**Files likely touched:** `lib/presets.ts`, `lib/presets.test.ts`, `components/presets/preset-card.tsx` (`formatFlourSummary`), `components/presets/preset-card.test.tsx`, `components/presets/preset-gallery-screen.test.tsx`, `components/bake/chooser-screen.test.tsx`
- 7 פריסטים (ids: `country`, `white`, `spelt-white`, `country-rye`, `wheat70`, `spelt50`, `rye50`), הסרת `whole100`, ערכים נעולים מה-Design.
- `PresetTone`: הוסף `"spelt"`; הסר `"wholedark"` (לא בשימוש אחרי הסרת whole100) — אם אינו נדרש במקום אחר.
- `formatFlourSummary`: הוסף `speltWhite`/`speltWhole` בסדר התצוגה.
**Test strategy (unit/component):**
- `PRESETS` באורך 7; קבוצת ה-ids תואמת; כל פריסט סוכם ל-100; `getPreset` עובד; `whole100` מחזיר null.
- `formatFlourSummary` כולל "כוסמין לבן"/"כוסמין מלא" כשרלוונטי.
- גלריה/chooser מרנדרים 7 כרטיסים; `PRESETS[0]` נשאר `country`.
- **לא** לכתוב טסט ש"אין hint" עבור `spelt-white` — הרמז ב-70% מכוון (ראה Design).
**Depends on:** T1 (טיפוס `RecipeInput`)
**Done when:**
- [ ] Tests written and passing
- [ ] שדות `image` מצביעים על קבצים אמיתיים (יושלמו ב-T6)

### T6 — תמונות פריסט חדשות
**Goal:** 3 תמונות חדשות בסגנון הקיים; ניקוי `wholedark.png`.
**Files likely touched:** `public/presets/spelt-white.png`, `public/presets/country-rye.png`, `public/presets/spelt50.png`; מחיקת `public/presets/wholedark.png`.
**Test strategy:** ויזואלי/ידני — הגלריה מרנדרת את 3 הכרטיסים החדשים עם תמונה (לא placeholder). אפשר `nb2-prompt` להפקה בסגנון.
**Depends on:** T5 (שמות הקבצים)
**Done when:**
- [ ] 3 הקבצים קיימים ונטענים בגלריה
- [ ] בדיקה ויזואלית ב-375px

## Build Order
T1 → T2 → T3 → T4 → T5 → T6
*(T2 ו-T3 אינם תלויים זה בזה; T4 ו-T5 שניהם תלויים ב-T1/T3 וניתנים למקבול.)*

## Risks
- **מיגרציה / קומפילציה:** שדות ה-spelt **חייבים** `.default(0)` כדי ש-(א) מתכונים ישנים יינתחו, ו-(ב) `z.input` ישאיר אותם אופציונליים כך ש-`presets.ts` הישן יקמפל בין T1 ל-T5. זו נקודת הכשל הסבירה ביותר.
- **סכום ולידציה:** גם `refine` (Zod) וגם `flourTotal` (form) חייבים לכלול את כל 5 השדות + `other`. אם אחד מהם מפגר — מתכונים תקפים ייחסמו או להפך.
- **הסרת `whole100`:** בטוחה למתכונים שמורים — ה-id משמש רק לחיפוש תמונה ב-`app/bake/plan/page.tsx` ונופל בחן. הנתיב `app/recipes/new/whole100` יחזיר 404 (מקובל).
- **`tone`:** grep לא מצא שימוש מחוץ ל-`presets.ts`. אמת לפני מחיקת `wholedark`/הוספת `spelt` שאין switch סגנון שנשבר.
- **RTL:** "כוסמין לבן" ארוך יותר מ"לבן" — אמת ב-375px שאין גלישה ב-grid דו-טורי (T4).
- **תמונות (T6):** חוסם merge, לא פיתוח. T1–T5 ניתנים למיזוג מאחורי flag רק אם התמונות מוכנות, אחרת T6 הוא תנאי-סף ל-merge של הפיצ׳ר.
