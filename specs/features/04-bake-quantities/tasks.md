# Tasks: bake-quantities

4 משימות. T1+T2 יכולות להיות פרללי לוגית (אין תלות הדדית), אבל סדר ה-PR נוח שיהיה T1 לפני T2 כי T2 צורך את Recipe מעודכן.

## Task List

### T1 — Recipe schema + form field

**Goal:** הוספת `flourWeightGrams` ל-`Recipe`, מיגרציה שקופה למתכונים קיימים, ושדה ״משקל קמח״ בטופס המתכון.

**Files likely touched:**
- `lib/types/recipe.ts` (extend RecipeSchema + RecipeInputSchema)
- `lib/types/recipe.test.ts` (חדש או extend — מיגרציה default)
- `components/recipes/recipe-form-screen.tsx` (state + validation + submit)
- `components/recipes/recipe-form-screen.test.tsx` (extend — שדה חדש)
- `components/recipes/flour-weight-input.tsx` (חדש)
- `components/recipes/flour-weight-input.test.tsx` (חדש)
- `lib/strings.ts` (label + hints + error)
- `components/ui/number-input.tsx` (אופציונלי — הוספת `unit?: string` prop)

**Decision needed in T1:** `NumberInput` suffix — האם להוסיף `unit?: string` ל-`NumberInput` הקיים, או ליצור wrapper נפרד. **המלצה**: להוסיף `unit?` ל-`NumberInput` (קיים, פשוט, low-risk). אם משבר ב-existing tests — לחזור ל-wrapper.

**Test strategy:**
- Unit: `RecipeSchema.parse({...legacyRecipeWithoutFlourWeight})` → `flourWeightGrams === 500`
- Unit: `RecipeSchema.parse({...validRecipe, flourWeightGrams: 50})` → throws (below min)
- Unit: `RecipeSchema.parse({...validRecipe, flourWeightGrams: 2000})` → throws (above max)
- Unit: `RecipeSchema.parse({...validRecipe, flourWeightGrams: 500.5})` → throws (not integer)
- RTL: `FlourWeightInput` מציג label עברי, value, hint דו-שורתי, suffix "g"
- RTL: error message מופיע על out-of-range
- RTL: ב-`RecipeFormScreen`, השדה מופיע **לפני** hydration (DOM order assertion)
- RTL: שמירה דרך הטופס שולחת `flourWeightGrams` במה שמועבר ל-handler
- RTL: עריכת מתכון קיים (בלי flourWeight) מתחילה עם 500 ב-input

**Depends on:** —

**Done when:**
- [ ] `RecipeSchema` כולל `flourWeightGrams: z.number().int().min(100).max(1500).default(500)`
- [ ] מתכונים קיימים ב-localStorage נטענים עם default בלי שגיאה
- [ ] `FlourWeightInput` קיים, משתמש ב-`NumberInput` (עם או בלי `unit` prop)
- [ ] `RecipeFormScreen` מציג את השדה לפני hydration, מנהל state, ולידציה, ושומר
- [ ] `lib/strings.ts` כולל את המחרוזות העבריות: label ״משקל קמח״, שני hints, שתי הודעות שגיאה
- [ ] בדיקות 10+ ירוקות; type-check + lint + build נקיים

---

### T2 — `computeBakeQuantities` math helper

**Goal:** מודול pure-function שמחשב את כל המספרים מ-Recipe.

**Files likely touched:**
- `lib/bake-math.ts` (חדש)
- `lib/bake-math.test.ts` (חדש — 10+ בדיקות)

**Test strategy:**
- Snapshot של 5 מתכונים מייצגים:
  - Country (500g, 75% hyd, 2% salt, 20% lev)
  - Whole Wheat (500g, 80% hyd, 2.2% salt, 25% lev)
  - Rye (500g, 70% hyd, 2.5% salt, 15% lev)
  - High hydration (500g, 90% hyd, 2% salt, 20% lev)
  - Lean baguette (500g, 65% hyd, 2% salt, 10% lev)
- Edge: `levain === 0` → `levainTotalGrams=0, levainBuild.*=0, mixAdditions.flourGrams === totalFlourGrams`
- Edge: `flourWeightGrams === 100` (min) → all values integers, none negative
- Edge: `flourWeightGrams === 1500` (max) → all values integers
- Invariant: `mixAdditions.flourGrams + (levainBuild.flourGrams + levainBuild.starterGrams/2)` ≈ `totalFlourGrams` (±1g for rounding)
- Invariant: `mixAdditions.waterGrams + (levainBuild.waterGrams + levainBuild.starterGrams/2) + saltReserveWaterGrams` ≈ `totalWaterGrams` (±1g)
- Edge: `saltReserveWaterGrams` תמיד 20 (קבוע)

**Depends on:** T1 (consumes `Recipe.flourWeightGrams`)

**Done when:**
- [ ] `lib/bake-math.ts` exports `computeBakeQuantities(recipe: Recipe): BakeQuantities`
- [ ] `BakeQuantities` type מיוצא ומשמש בקוד אחר
- [ ] כל הערכים integers; אין NaN/Infinity על קלטים legal
- [ ] Snapshot tests עוברים, edge cases ירוקים
- [ ] Invariants (קמח/מים מאוזנים) מוודאים מתמטית
- [ ] בדיקות 10+ ירוקות

---

### T3 — InstructionCard placeholder substitution + stages 1-3 templating

**Goal:** `InstructionCard` תומך ב-`quantities` prop וממיר placeholders. שלבים 1-3 ב-`stages.ts` מקבלים placeholder tokens בטקסט.

**Files likely touched:**
- `components/bake/instruction-card.tsx` (extend — `quantities` prop, substitution logic)
- `components/bake/instruction-card.test.tsx` (extend — substitution + fallback + bold)
- `lib/data/stages.ts` (mod — placeholders ב-todo.steps של שלבים 1-3)
- `lib/data/stages.test.ts` (extend — verify placeholder tokens present in 1-3, absent in 4-12)

**Test strategy:**
- RTL: `<InstructionCard steps={["שקלו {starterGrams} סטארטר"]} quantities={mockQuantities} />` → text contains "33g" inside `<strong>` with `font-semibold` class
- RTL: בלי `quantities` → "שקלו {starterGrams} סטארטר" מוצג כפי שהוא (visible-broken, אין crash)
- RTL: token לא מוכר `{foo}` → נשאר כפי שהוא; ב-test environment בודקים שאין crash
- Unit: כל placeholder שמופיע ב-stages.ts 1-3 חייב להיות ב-list ה-tokens הנתמכים (test יסרוק את ה-data)
- Unit: שלבים 4-12 בלי placeholders (no `{...}` patterns ב-todo.steps)

**Depends on:** T1, T2

**Done when:**
- [ ] `InstructionCard` מקבל `quantities?: BakeQuantities`
- [ ] Placeholders מסוג `{tokenName}` מוחלפים ב-`<strong className="font-semibold">{value}g</strong>` (JSX, לא innerHTML)
- [ ] שלב 1, step 2 כולל `{levainWaterGrams}` ו-`{starterGrams}`; step 3 כולל `{levainFlourGrams}`
- [ ] שלב 2 כולל `{totalFlourGrams}` ו-`{autolyseWaterGrams}` ב-steps המתאימים
- [ ] שלב 3 כולל `{saltGrams}`, `{levainTotalGrams}`, `{saltReserveWaterGrams}` ב-steps המתאימים
- [ ] שלבים 4-12 בלי placeholders — הטקסט זהה למצב הקודם
- [ ] בדיקות 12+ ירוקות

---

### T4 — Wire StageScreen + Stage 1 disclosures + Playwright probe

**Goal:** ה-`StageScreen` מחשב כמויות ומעביר ל-`InstructionCard`. שלב 1 מציג שני ה-disclosures (chip + הערה). Playwright probe מאמת end-to-end.

**Files likely touched:**
- `components/bake/stage-screen.tsx` (mod — compute quantities, pass to InstructionCard, render disclosures on stage 1)
- `components/bake/stage-screen.test.tsx` (extend — stage 1 mentions 33g; stage 2/3 mention correct numbers; stage 4-12 unchanged)
- `components/bake/briefing.tsx` (mod — מקבל optional `disclosure?: string` prop להוספת chip ההנחה)
- `components/bake/briefing.test.tsx` (extend — disclosure rendering)
- `lib/data/stages.ts` (mod — stage 1 gets a `briefingDisclosure?` field + the Total Flour note in `todo`? לבדוק במימוש איך הכי נוח)
- `lib/strings.ts` (additions — disclosure copy)
- `scripts/probe-bake-flow.mjs` (extend — verify "33g" appears in stage 1, totalFlour number appears in stage 2)

**Decision in T4:** איך לפזר את ה-disclosures מבחינת data flow:
- Option A: hardcoded ב-StageScreen ל-stage 1 בלבד
- Option B: data-driven — stages.ts מציין מה ה-disclosure (יותר extensible)
- **המלצה**: Option B — הופך את הקוד data-driven ותומך בעתיד ב-disclosures על stages אחרים

**Test strategy:**
- RTL: `<StageScreen stageData={stages[0]} activeBake={fakeBake} />` → ה-card מציג "33g" מודגש בתוך ההוראות
- RTL: stage 1 — chip "סטארטר 100% הידרציה" מופיע ב-Briefing
- RTL: stage 1 — הערת "הקמח של השאור כלול ב-100%" מופיעה (במקום שנבחר במימוש)
- RTL: stage 2 — "500g" (totalFlour) ו-mix water מופיעים
- RTL: stage 3 — salt + levain + reserve water מספרים מופיעים
- RTL: stage 4 (bulk) — הטקסט זהה לקודם, אין placeholders שנשארו
- Playwright: התחל בייק → stage 1 → טקסט מכיל "33g" → next → stage 2 → טקסט מכיל "500g" → next → ... עד stage 12

**Depends on:** T3

**Done when:**
- [ ] `StageScreen` מחשב `quantities = computeBakeQuantities(activeBake.recipe)`
- [ ] `<InstructionCard quantities={quantities} ... />` מועבר
- [ ] שלב 1 מציג את שני ה-disclosures (chip + הערה)
- [ ] שלבים 2-3 מציגים מספרים נכונים
- [ ] שלבים 4-12 לא משתנים ויזואלית
- [ ] Playwright probe extended ומעבר
- [ ] `npm run type-check` clean, `npm run lint` clean, `npm run build` clean
- [ ] `rtl-check` returns 0 findings
- [ ] בדיקות 15+ ירוקות
- [ ] סך הכל 300+ tests passing (היה 288 לפני 04)

---

## Build Order

```
T1 (schema + form)
  ↓
T2 (bake-math helper)
  ↓
T3 (InstructionCard + stages content)
  ↓
T4 (StageScreen wire + disclosures + probe)
```

T1+T2 לא תלויים זה בזה לוגית, אבל סדר ה-PRs מומלץ T1 לפני T2 כי T2 מצפה ל-`Recipe.flourWeightGrams` כשדה קיים בטיפוס.

## Risks

1. **Migration של activeBake קיים** — אם המשתמש פתח בייק לפני 04, ה-`recipe` המוטמע ב-`ActiveBake` חסר `flourWeightGrams`. Zod's `default()` ברמת `RecipeSchema` אמור לטפל אוטומטית כאשר `ActiveBakeSchema` מבצע `RecipeSchema.parse` על השדה המוטמע. **חובה לוודא במבחן**.

2. **Rounding sums** — `Math.round` על כל ערך בנפרד יכול ליצור סכומים לא-מאוזנים (33+33+33=99, לא 100). זה **acceptable** ב-MVP — סטייה של 1-2g בבייק ביתי לא משנה. הטסטים מאמתים `±1g`.

3. **Token לא מוכר ב-stages.ts** — אם ב-T3 נשתל `{wrongName}` בטעות, ה-substitution ישאיר את ה-token כפי שהוא. הטסט שסורק את stages.ts בודק שכל ה-tokens שמופיעים שייכים לרשימה הסגורה.

4. **NumberInput suffix prop** — אם הוספת `unit?: string` שוברת tests של מקומות שמשתמשים ב-NumberInput בלי unit, נצטרך לחזור ל-wrapper. **mitigation**: ה-prop optional עם default undefined, פלוס בדיקה שכל הקריאות הקיימות עוברות.

5. **שלב 1 צפיפות** — Briefing chip + InstructionCard tip + InstructionCard הערת Total Flour — שלוש הערות במסך אחד עלולות להיות עמוסות. **mitigation**: לאחר T4 לבדוק חזותית באפליקציה האמיתית; אם עמוס — נאחד או נעביר חלק ל-FAQ.

6. **שיטת אפייה (סיר/אבן)** — מחוץ ל-scope. הטקסט של שלבים 9-11 ממשיך להזכיר ״סיר ברזל יצוק״. זה **expected** עד `05-baking-method`.
