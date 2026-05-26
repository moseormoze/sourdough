# Feature: bake-quantities

## Problem

ההוראות של 03-bake-stages לא יכולות להציג כמויות קונקרטיות (״ערבבו 33g סטארטר עם 33g מים״), כי ה-`Recipe` schema שומר רק יחסים באחוזים — אין שדה של ״גודל בייק״. כתוצאה מכך ה-״מה לעשות״ נשאר עמום (״לפי הכמות במתכון״), והבייקר המתחיל לא יכול להפעיל את האפליקציה אוטונומית באמצע השלב. צריך לעגן את המתכון לגודל מספרי ולמלא את הצעדים במספרים אמיתיים.

## User Story

כבייקר מתחיל באמצע שלב 1 / 2 / 3, אני רוצה לראות בתוך ההוראה את הכמות המדויקת לערבב (״ערבבו 33g סטארטר עם 33g מים ו-33g קמח״), בלי לחזור למתכון, ובלי לחשב לבד מאחוזים — כך אני יכול לבצע כל שלב בעיניים על המשימה, לא על מתמטיקה.

## Scope — What's In

### שדה חדש ב-Recipe schema
- `flourWeightGrams: z.number().int().min(100).max(1500).default(500)`
- ערך default: **500g קמח** (יוצר כ-1kg בצק — ככר בינונית).
- מיגרציה: מתכונים קיימים ב-localStorage מקבלים default אוטומטית דרך Zod. בייקים פעילים שכבר מצביעים על מתכון קיים ימשיכו לעבוד.

### עדכון Recipe form (01-recipe-builder)
- שדה חדש בטופס: ״משקל קמח״ (גרמים), עם hint דו-שורתי:
  - ״500g · ככר בינונית (~1kg בצק)״
  - ״750g · ככר גדולה (~1.5kg בצק)״
- הולידציה זהה ל-schema (100–1500g, integer).
- שיוך בעורך הקיים: למקם **לפני** hydration/salt/levain בסקציית ״פרמטרי הככר״ (חלק מההחלטה הראשונה — ״כמה לחם״).

### Helper מתמטי: `computeBakeQuantities(recipe)`
- מודול חדש: `lib/bake-math.ts` (או דומה — לטכ-ליד להחליט על שם).
- חתימה:
  ```ts
  type BakeQuantities = {
    totalFlourGrams: number;
    totalWaterGrams: number;
    saltGrams: number;
    levainTotalGrams: number;
    levainBuild: { starterGrams: number; waterGrams: number; flourGrams: number };
    mixAdditions: { flourGrams: number; waterGrams: number; saltReserveWaterGrams: number };
  };
  function computeBakeQuantities(recipe: Recipe): BakeQuantities;
  ```
- **הנחות מקובעות ב-MVP**:
  - סטארטר ב-100% הידרציה (1:1 קמח:מים).
  - בניית שאור ב-1:1:1 (starter:water:flour) — כלומר השאור הסופי מורכב מ-⅓ סטארטר, ⅓ מים, ⅓ קמח (בהינתן השאור כמסה סופית).
  - קונבנציית **Total Flour**: ה-100% (קמח) **כולל** את הקמח שבתוך השאור. השאור לא ״מעל״ ה-100% — חלק ממנו.
- **חישובים** (קמח הוא ה-anchor ישירות, אין חילוק):
  ```
  totalFlourGrams   = flourWeightGrams
  totalWaterGrams   = flourWeightGrams * hydration / 100
  saltGrams         = flourWeightGrams * salt / 100
  levainTotalGrams  = flourWeightGrams * levain / 100

  // שאור 1:1:1
  levainBuild.starterGrams = levainTotalGrams / 3
  levainBuild.waterGrams   = levainTotalGrams / 3
  levainBuild.flourGrams   = levainTotalGrams / 3

  // הוספות בלישה: סך פחות מה שכבר בשאור
  // הסטארטר עצמו 100% hydration → ⅓ נחשב כקמח, ⅔ של כמות הסטארטר נחשבים כמים? לא —
  // ב-1:1:1, levainBuild.starterGrams כבר *מסה* של סטארטר, שמורכב מ-½ מים ו-½ קמח.
  // אז אם נשבר אותו: contributedFlour = levainBuild.starterGrams/2; contributedWater = levainBuild.starterGrams/2.
  // הקמח של השאור הכולל = levainBuild.flourGrams + (levainBuild.starterGrams/2)
  // המים של השאור הכוללים = levainBuild.waterGrams + (levainBuild.starterGrams/2)

  mixAdditions.flourGrams = totalFlourGrams - (levainBuild.flourGrams + levainBuild.starterGrams/2)
  mixAdditions.waterGrams = totalWaterGrams - (levainBuild.waterGrams + levainBuild.starterGrams/2) - saltReserveWaterGrams
  mixAdditions.saltReserveWaterGrams = 20   // קבוע (~2 כפות)
  ```
- **עיגול**: כל ערך מוחזר כ-integer (Math.round). הסטייה הקטנה (1–2g סך הכל) מקובלת בבייק ביתי.
- **בדיקות יחידה** מקיפות: לפחות 5 מתכונים מייצגים (Country 75% / Whole Wheat / Rye / 80% / 65%) עם snapshots למספרים. בדיקות סוף-קצה (min/max flourWeight, levain=0).

### Templating בהוראות (03-bake-stages)
- `lib/data/stages.ts`: ה-`StageTodo.steps` הופך מ-`string[]` ל-`string[]` (לא משתנה במבנה!) — placeholder syntax יושב בתוך המחרוזות עצמן.
- **שלבים שמוטמעים**:
  - **שלב 1** (בניית שאור): סטארטר, מים-לשאור, קמח-לשאור.
  - **שלב 2** (אוטוליזה): סך הקמח, רוב המים (= mixAdditions.waterGrams).
  - **שלב 3** (לישה): מלח, שאור (כבר נבנה — מסה סופית = levainTotalGrams), מים שמורים (saltReserveWaterGrams).
- **שלבים 4–11**: ללא placeholders — הטקסט הקיים נשאר כפי שהוא.
- **רינדור**: `InstructionCard` יקבל `quantities?: BakeQuantities` כ-prop נוסף. אם לא הועבר, יציג את הטקסט כמו שהוא (fallback). אם הועבר, יחליף את ה-placeholders. **המספרים יודגשו** (font-semibold).
- **דוגמת טקסט בשלב 1** אחרי templating (Recipe: 500g קמח, 75% hyd, 2% salt, 20% lev):
  > 1. השתמשו בסטארטר שכבר עבר האכלה והוא בשיא…
  > 2. במכל נקי שקלו **33g מים**, וערבבו עם **33g סטארטר** עד שהוא מתפזר לגמרי.
  > 3. הוסיפו **33g קמח**. ערבבו…

### עדכון `StageScreen`
- מקבל `activeBake` שכולל `recipe`. חישוב `quantities = computeBakeQuantities(activeBake.recipe)` נעשה פעם אחת ברמת ה-screen.
- מעבירה את `quantities` ל-`InstructionCard`.
- **ביצועים**: החישוב טריוויאלי. אין צורך ב-memoization.

### Tests
- Unit על `computeBakeQuantities` — 5+ מתכונים מייצגים.
- Unit על recipe schema migration (מתכון ישן בלי `flourWeightGrams` נטען כ-500g).
- RTL על Recipe form — שדה חדש מופיע, נשמר, וולידציה עובדת.
- RTL על InstructionCard — placeholder substitution: עם `quantities` המספרים מוצגים מודגשים; בלי `quantities` הטקסט מציג את הטקסט הגולמי ללא placeholders שבורים.
- Integration: פתיחת בייק עם מתכון flourWeight=500 → stage 1 → המספרים הנכונים מופיעים.
- Playwright probe: extended לבדוק שמספרים מופיעים בשלבים 1–3.

## Out of Scope

- **Override של flourWeightGrams בפתיחת בייק** — בייק תמיד משתמש ב-`recipe.flourWeightGrams` של המתכון. רוצה גדלים שונים? מתכונים נפרדים. נדחה לעתיד אם משתמשים יבקשו.
- **בחירה של הידרציית סטארטר** — מקובע 100% ב-MVP. סטארטרים ב-50%/166% לא נתמכים בחישוב, אבל המשתמש יכול עדיין לבצע ידנית — ההנחה מצוינת ב-UI של שלב 1.
- **בחירה של יחס בניית שאור** (1:2:2, 1:5:5) — מקובע 1:1:1 ב-MVP.
- **כרטיס סיכום ״הבייק שלך במספרים״** במסך השלב — לא ב-MVP. המספרים יושבים בתוך ההוראות עצמן. אם נראה ש-UX דורש מבט-על — feature נפרד.
- **תיקון inclusions לסקיילינג אוטומטי** — inclusions נשארים בגרמים מוחלטים. כש-flourWeight מוגדר ברמת המתכון בלבד, אין scenario שדורש סקיילינג. נדחה.
- **טופסי advanced/expert** עם הסבר על Total Flour vs Flour Added — מקובע Total Flour, ההסבר ב-FAQ עתידי.
- **שינוי טקסטים של שלבים 4–11** — נשארים כפי שהם (פרוצדורליים בלבד).
- **בחירת שיטת אפייה** (סיר ברזל יצוק / אבן אפייה / תבנית) — היום שלבים 9–11 hardcoded לסיר. שינוי זה יטופל בפיצ׳ר נפרד `05-baking-method`. ב-04 רק נוודא שה-hint של flourWeight לא מזכיר סיר ספציפי.

## Acceptance Criteria

- [ ] `Recipe` schema מכיל `flourWeightGrams: z.number().int().min(100).max(1500).default(500)`
- [ ] Recipe form מציג שדה ״משקל קמח״ עם hint דו-שורתי בעברית; ולידציה (100–1500) עובדת ומציגה הודעת שגיאה
- [ ] השדה מופיע **לפני** hydration בסקציית פרמטרי הככר
- [ ] מתכון ישן ב-localStorage (לפני 04) נטען עם `flourWeightGrams = 500` בלי שגיאה
- [ ] `computeBakeQuantities` קיים, מחזיר BakeQuantities עם כל השדות; כל הערכים integers
- [ ] בדיקה: Recipe (flour=500g, hyd=75%, salt=2%, lev=20%) → totalFlour=500, totalWater=375, salt=10, levainTotal=100, levainBuild.{starter,water,flour}=33 each
- [ ] בדיקה edge: Recipe עם `levain=0` → `levainTotalGrams=0`, `levainBuild.*=0` בלי division-by-zero
- [ ] `InstructionCard` תומך ב-prop `quantities?: BakeQuantities`; placeholders מסוג `{flourGrams}` מוחלפים במספר בפורמט `{n}g`, עטוף ב-`<strong>` עם font-semibold
- [ ] שלב 1 — placeholder substitution: ההוראה מציגה את גרמי הסטארטר/מים/קמח לבניית השאור עם ערכים מהמתכון הנוכחי
- [ ] שלב 2 — placeholder substitution: סך הקמח ומים-לאוטוליזה מוצגים
- [ ] שלב 3 — placeholder substitution: גרמי המלח, כמות השאור הסופית, ומים שמורים
- [ ] שלב 1 כולל הערה מפורשת ״הנחה: סטארטר ב-100% הידרציה״
- [ ] שלבים 4–11 לא משתנים — אין placeholders, הטקסט זהה לסטטוס הנוכחי
- [ ] טקסט ההסבר ״הקמח של השאור כלול ב-100%״ מופיע איפשהו ב-UI (שלב 1 או FAQ — לעיצוב לבחור)
- [ ] hint של flourWeight לא מזכיר סיר ספציפי (vessel-agnostic)
- [ ] בייק פעיל שנפתח עם המתכון המעודכן מציג את המספרים הנכונים מיד; reload ממשיך להציג נכון
- [ ] טסטים: lint, type-check, build, 290+ unit/RTL tests passing, Playwright probe extended ומעבר
- [ ] כל הטקסטים בעברית; CSS לוגי בלבד; touch targets ≥44px; rtl-check 0 findings

## Dependencies

- **Depends on**: `01-recipe-builder` (קיים — שדה נוסף בטופס הקיים), `03-bake-stages` (קיים — InstructionCard ו-StageScreen להרחיב)
- **Blocks**: `05-baking-method` (חדש — שיטת אפייה לשלבים 9–11), `06-bake-done` (יומן בייק — נדחה מ-04 בגלל הוספת 05)

## Revision History

- **2026-05-26**: השדה שונה מ-`doughWeightGrams` (default 900g) ל-`flourWeightGrams` (default 500g) — החלטה של המשתמש. רציונל: ״משקל לחם סופי לא אומר כלום״, וגם המתמטיקה יותר נקייה (קמח הוא ה-anchor הטבעי ב-baker's percentages).
- **2026-05-26**: שיטת אפייה נוצאת מ-scope של 04, נכנסת ל-`05-baking-method` חדש.

## Open Questions

(אין. כל מה שדרוש לעיצוב נסגר.)
