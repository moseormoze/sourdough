# Tasks: baking-method

5 משימות. T1+T2 פרללי לוגית (אין תלות), אבל סדר ה-PR נוח: T1 → T2 → T3 → T4 → T5.

## Task List

### T1 — ActiveBake schema + types + create flow

**Goal:** הוספת `bakingMethod` ל-`ActiveBake`, מיגרציה שקופה לבייקים קיימים, והעברת ה-method ל-`createActiveBake` API.

**Files likely touched:**
- `lib/types/active-bake.ts` (extend ActiveBakeSchema)
- `lib/types/active-bake.test.ts` (חדש או extend — מיגרציה default)
- `lib/types/baking-method.ts` (חדש — BakingMethod type + constants)
- `lib/hooks/use-active-bake.ts` (extend `start`/`create` API)
- `lib/hooks/use-active-bake.test.tsx` (extend)
- `lib/strings.ts` (additions: method names + descriptions + safety warning)

**Test strategy:**
- Unit: `ActiveBakeSchema.parse(legacyBakeWithoutMethod)` → `bakingMethod === 'dutch-oven'`
- Unit: `ActiveBakeSchema.parse({...valid, bakingMethod: 'stone-with-steam'})` → preserved
- Unit: `ActiveBakeSchema.parse({...valid, bakingMethod: 'invalid'})` → throws
- RTL/hook: `useActiveBake.start({recipe, bakingMethod})` יוצר ActiveBake עם השדה
- RTL/hook: `start({recipe})` (בלי bakingMethod) → ברירת מחדל `dutch-oven`

**Depends on:** —

**Done when:**
- [ ] `ActiveBakeSchema` כולל `bakingMethod: z.enum(['dutch-oven', 'stone-with-steam', 'tray-with-bowl']).default('dutch-oven')`
- [ ] בייקים קיימים ב-localStorage נטענים עם default בלי שגיאה
- [ ] `BakingMethod` type + `BAKING_METHODS` constant מיוצאים ממודול ייעודי
- [ ] `useActiveBake.start` (או equivalent) מקבל `bakingMethod` ושומר אותו
- [ ] `lib/strings.ts` כולל את המחרוזות העבריות: שמות 3 השיטות, תיאורים קצרים, אזהרת בטיחות
- [ ] בדיקות 8+ ירוקות; type-check + lint + build נקיים

---

### T2 — BakingMethodSelector component

**Goal:** רכיב מבודד, 3 cards אנכיים, סטטיק/רדיו, accessible.

**Files likely touched:**
- `components/bake/baking-method-selector.tsx` (חדש)
- `components/bake/baking-method-selector.test.tsx` (חדש)

**Test strategy:**
- RTL: מציג 3 cards עם titles + descriptions בעברית
- RTL: card הראשון (dutch-oven) מסומן כ-default כשלא מעביר value
- RTL: כשנותנים `value='stone-with-steam'`, ה-card השני מסומן (aria-checked)
- RTL: לחיצה על card שלא נבחר → onChange נקרא עם המפתח החדש
- RTL: לחיצה על card שכבר נבחר → onChange נקרא איתו (idempotent, אבל לא חובה — design call)
- RTL: `role="radiogroup"` על המכל, `role="radio"` על כל card
- RTL: touch target ≥44px (כל ה-card)

**Depends on:** T1 (consumes BakingMethod type)

**Done when:**
- [ ] `BakingMethodSelector` קיים, חתימה `({ value, onChange })`
- [ ] 3 cards אנכיים, default selection visible
- [ ] aria-checked נכון, role="radiogroup"/"radio", title/description בעברית
- [ ] עיצוב נבחר: `border-accent ring-2 ring-accent/20 bg-accent-bg/30`; לא-נבחר: `border-line bg-paper`
- [ ] בדיקות 7+ ירוקות

---

### T3 — Wire selector into ChooserScreen + create active bake with method

**Goal:** ChooserScreen מציג את ה-selector מעל ה-cards. בחירת recipe יוצרת ActiveBake עם ה-method הנבחר.

**Files likely touched:**
- `components/bake/chooser-screen.tsx` (mod — state + selector + pass to start)
- `components/bake/chooser-screen.test.tsx` (extend)

**Test strategy:**
- RTL: ChooserScreen מציג את `BakingMethodSelector` מעל הקארדים
- RTL: state מתחיל ב-`dutch-oven`; שינוי ב-selector מעדכן state
- RTL: לחיצה על recipe/preset יוצרת ActiveBake עם ה-`bakingMethod` הנוכחי
- RTL: לחיצה על recipe/preset בלי לבחור method → method = 'dutch-oven'

**Depends on:** T1, T2

**Done when:**
- [ ] ChooserScreen מציג את הסלקטור מעל ה-cards (DOM order assertion)
- [ ] State של method נשמר בעמוד; בחירה בוערכת לפני יצירת בייק
- [ ] `useActiveBake.start({ recipe, bakingMethod })` נקרא עם הערך הנכון
- [ ] בדיקות 5+ ירוקות

---

### T4 — Stage 9-11 content variants + Stage type extension + StageScreen wiring

**Goal:** `stages.ts` מקבל `byMethod` בשלבים 9-11. StageScreen קורא את ה-method מ-ActiveBake ובוחר את הגרסה הנכונה. שלבים 1-8 ו-12 ללא שינוי.

**Files likely touched:**
- `lib/data/stages.ts` (mod — שלבים 9, 10, 11 מקבלים `byMethod`)
- `lib/data/stages.test.ts` (extend)
- `components/bake/stage-screen.tsx` (mod — resolve method, render correct content)
- `components/bake/stage-screen.test.tsx` (extend — variants)

**Test strategy:**
- Unit: getStage(9).byMethod כולל 3 מפתחות (dutch-oven, stone-with-steam, tray-with-bowl); כל אחד עם briefing + todo
- Unit: getStage(10) ו-getStage(11) דומה
- Unit: שלבים 1-8 ו-12 לא מגדירים `byMethod` (`undefined`)
- RTL: StageScreen בשלב 9 עם method='stone-with-steam' → טקסט todo מזכיר ״אבן״ ו-״60 דקות״, לא ״סיר״
- RTL: StageScreen בשלב 9 עם method='tray-with-bowl' → טקסט todo מזכיר ״תבנית״ ו-״30 דקות״, לא ״סיר״
- RTL: StageScreen בשלב 9 עם method='dutch-oven' → המקור (״סיר״, ״45 דקות״)
- RTL: שלב 10 ו-11 דומה (variants לכל שיטה)
- RTL: שלבים 1, 4, 12 — ללא שינוי בין methods

**Depends on:** T1

**Done when:**
- [ ] `Stage.byMethod?: Record<BakingMethod, StageMethodContent>` מוסף ל-type
- [ ] שלבים 9, 10, 11 ב-`stages.ts` כוללים `byMethod` עם 3 וריאנטים מלאים בעברית
- [ ] שלבים 1-8 ו-12 לא משתנים
- [ ] StageScreen קורא `activeBake.bakingMethod`, מבצע resolve, מציג את הגרסה הנכונה
- [ ] בדיקות 10+ ירוקות

---

### T5 — Safety warning component + stage 9 warning for tray + Playwright probe

**Goal:** רכיב `SafetyWarning` חדש. ב-`tray-with-bowl` שלב 9 כולל `warning` שמתורגם להופעת הרכיב. Playwright probe מאמת end-to-end.

**Files likely touched:**
- `components/bake/safety-warning.tsx` (חדש)
- `components/bake/safety-warning.test.tsx` (חדש)
- `lib/data/stages.ts` (mod — stage 9 tray-with-bowl variant מקבל `warning` text)
- `components/bake/stage-screen.tsx` (mod — מציג SafetyWarning מעל Briefing אם stageContent.warning קיים)
- `components/bake/stage-screen.test.tsx` (extend)
- `scripts/probe-bake-flow.mjs` (extend — flow עם method=stone-with-steam או tray-with-bowl)

**Test strategy:**
- RTL: SafetyWarning מציג AlertTriangle + טקסט, role="alert", danger styling
- RTL: StageScreen בשלב 9 עם tray-with-bowl → SafetyWarning מופיע מעל Briefing (DOM order)
- RTL: StageScreen בשלב 9 עם dutch-oven או stone-with-steam → SafetyWarning **לא** מופיע
- RTL: SafetyWarning לא מופיע בשלבים אחרים (גם אם warning מוגדר בנתונים — בעצם, stages אחרים לא יגדירו warning)
- Playwright: 
  - בחירת method=tray-with-bowl ב-chooser
  - התקדמות עד שלב 9 → אזהרה נראית
  - שלב 9 todo מזכיר ״תבנית״

**Depends on:** T1, T2, T3, T4

**Done when:**
- [ ] `SafetyWarning` קיים, role="alert", AlertTriangle icon, danger styling
- [ ] שלב 9 tray-with-bowl variant ב-stages.ts כולל `warning`
- [ ] StageScreen מציג את SafetyWarning בראש המסך כשיש warning
- [ ] Playwright probe extended ומעבר
- [ ] `npm run type-check` clean, `npm run lint` clean, `npm run build` clean
- [ ] `rtl-check` returns 0 findings
- [ ] בדיקות 7+ ירוקות
- [ ] סך הכל 385+ tests passing (היה 356 לפני 05)

---

## Build Order

```
T1 (schema + create flow)
  ├─► T2 (selector component)
  │     ↓
  └─► T3 (wire into chooser) ◄────────┐
                                       │
T1 ──► T4 (stages 9-11 variants + StageScreen wiring)
                                       │
                                       ▼
                                  T5 (warning + probe)
```

T2 ו-T3 תלויים ב-T1. T4 גם תלוי ב-T1. T5 תלוי בכולם (אינטגרציה).

T2 ו-T4 יכולים להיות במקביל אחרי T1. סדר ה-PR שאני מציע: **T1 → T2 → T3 → T4 → T5** ליניארי.

## Risks

1. **Migration של ActiveBake קיים** — בייק שנפתח לפני 05 חסר `bakingMethod`. Zod default אמור לטפל אוטומטית, אבל יש לוודא בטסט שה-localStorage-loaded bake לא זורק שגיאה.

2. **Content overlap בין שיטות** — הוראות לשלוש שיטות בשלבים 9-11 = הרבה טקסט. סיכון של אי-עקביות (זמן בשיטה אחת נכון, בשיטה אחרת לא). **mitigation**: טבלת השוואה ב-brief; review של ה-content לפני merge.

3. **UX ה-chooser עם הסלקטור נוסף** — המסך הופך לארוך. ב-mobile 375px יכול להיות שצריך גלילה. **mitigation**: ב-T3 לוודא שמשתמשים רואים את ה-cards בלי להחמיץ את הסלקטור. אם עמוס — אפשר לעטוף את הסלקטור ב-collapse פתוח-by-default.

4. **Warning component ייחודי לפיצ׳ר זה** — האם יש שימוש עתידי? לא ברור. **decision**: נבנה כללית (`<SafetyWarning>{children}</SafetyWarning>`), נשתמש רק כאן ב-MVP. אם יוסיפו אזהרות אחרות בעתיד — קל לעשות reuse.

5. **שינוי method באמצע בייק** — out of scope. אם יתברר בהמשך שמשתמשים צריכים את זה, נוסיף ב-feature נפרד. כרגע: אם הקוד מקבל method חדש על ActiveBake קיים, פשוט מציג את הגרסה החדשה (אין warning).

6. **Stage 4 (bulk) ב-bake שהתחיל בשיטה אחרת** — לא רלוונטי. השיטה משפיעה רק על 9-11. בדיקות RTL/Playwright מאמתות.
