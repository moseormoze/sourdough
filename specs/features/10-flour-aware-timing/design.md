# Design: זמנים-מודעי-קמח

> **החלטת ארכיטקטורה — הוכרעה:** נבחר **מנוע-תסיסה אחד** כמקור-אמת יחיד. כל שלב
> מצהיר על ה-`kind` שלו, ומשך = `base × מכפלת המודיפיירים שחלים על אותו kind`.
> קמח אינו מוזרם ידנית ל-6 פונקציות — הוא שדה ב-`FermentationParams` שזורם דרך
> המנוע, ומודיפייר הקמח חל סלקטיבית על שלבי התסיסה בלבד. מכוון ל-`bake-timing.ts`
> שאחרי Feature 09 (schedule-flexibility). **הבנייה בפועל אחרי ש-09 נחת ב-main.**

## Screens Affected
אין שינוי ויזואלי — הפיצ׳ר **שקוף**. משתנים רק הזמנים המחושבים בכל מסך שמציג לוח-זמנים.
- **מסך תכנון האפייה** (`bake-planner-screen` + `bake-timeline`): הזמן המוצע, ברירת-המחדל של ה-anchor, ושורות ציר-הזמן (bulk/levain).
- **חלון ההאכלה** (`calculateFeedingWindow`): נגזר מ-`levainStart`, מתקצר בהתאם.
- כל קריאה ל-`calculateMinReadyAt` / `earliestReadyAt`.

---

## הארכיטקטורה — מנוע מאוחד

### 1. שלב מצהיר על ה-kind שלו
מחליף את הדגל הבוליאני `tempAdjust` בדגם kind מפורש:
```ts
type StageKind = "fermentation" | "fixed" | "starter";
interface StageDef { key: BakeStepKey; baseSecs: number; kind: StageKind; }
```
- `fermentation` → `levain`, `bulk` (מקבלים טמפ׳ **וגם** קמח)
- `fixed` → `mix`, `shape`, `retard`, `preheat`, `bake` (אף מודיפייר; `retard` ערכו מה-input)
- `starter` → ציר נפרד לשיא הסטארטר (טמפ׳ **בלבד**, ללא קמח-המתכון)

### 2. מודיפיירים — אובייקטים שמצהירים על אילו kinds הם חלים
```ts
interface Modifier { appliesTo: StageKind[]; factor: (p: FermentationParams) => number; }

const Q10: Modifier = {
  appliesTo: ["fermentation", "starter"],          // טמפ׳ חל גם על הסטארטר
  factor: (p) => Math.pow(2, (BASE_TEMP_C - p.kitchenTempC) / 10),
};
const FLOUR: Modifier = {
  appliesTo: ["fermentation"],                      // ← לא starter! קמח-המתכון לא נוגע בתרבית
  factor: (p) => (p.flour ? flourFactor(p.flour) : 1.0),  // ניטרלי אם חסר
};
```
זה מקיים: per-stage (`appliesTo`), כפלי-אורתוגונלי (מכפלה), סטארטר ללא-קמח, ברירת-מחדל ניטרלית.

### 3. משך = base × מכפלת המודיפיירים החלים; שלבים ביולוגיים מחזירים טווח
```ts
interface StageDuration { estimateSecs: number; lowSecs: number; highSecs: number; }

function stageDuration(stage: StageDef, p: FermentationParams): StageDuration {
  if (stage.key === "retard") return exact(p.retardSecs ?? RETARD_DEFAULT_SECS);
  const product = MODIFIERS
    .filter((m) => m.appliesTo.includes(stage.kind))
    .reduce((acc, m) => acc * m.factor(p), 1);
  const est = Math.round(stage.baseSecs * product);
  return stage.kind === "fixed"
    ? { estimateSecs: est, lowSecs: est, highSecs: est }
    : { estimateSecs: est, lowSecs: Math.round(est * 0.8), highSecs: est };
}
```
הטווח (`~0.8×–1.0×`) עובר מה-UI אל המנוע — `BakeStep` יקבל `lowSecs/highSecs`, ו-`durationRangeLabel` רק מעצב מהם.

### 4. חוזה ה-input — קמח-מוכן כבר ב-T1
```ts
interface FermentationParams {
  kitchenTempC: number;
  starterReady: boolean;
  retardSecs?: number;
  flour?: Flour;          // אופציונלי → ניטרלי. T2 מחווט מ-recipe.flour.
}
```

### 5. מקור-אמת יחיד — ביטול הכפילות
- `levainStart` מחושב **פעם אחת**; `calculateFeedingWindow` נגזר ממנו (לא מחשב מחדש).
- שיא הסטארטר מחושב **פעם אחת** (שלב ה-`starter`); `starterPeakSecs` לא משוכפל inline.
- `earliestReadyAt`, `calculateBakeSteps`, feeding-window — כולם קוראים מאותו מנוע.

---

## המדע של הקמח (נעול — נכנס כ-`flourFactor` בתוך מודיפייר FLOUR)

```
flourFactor      = 1 − cappedShortening
cappedShortening = min(0.20, Σ_i  fraction_i × shortening_i)
fraction_i       = flour[i] / 100
```
חל רק על שלבי `fermentation` (levain, bulk). אותו factor לשניהם.

### ערכי `shortening_i` (נעול)
| קמח | `shortening_i` | נימוק |
|---|---|---|
| `white` | 0.00 | בסיס |
| `speltWhite` | 0.05 | מנופה, קרוב ללבן |
| `wholeWheat` | 0.18 | סובין מלא → יותר אנזימים/חיידקים |
| `speltWhole` | 0.18 | דומה למלא |
| `rye` | 0.25 | פעילות אנזימטית הגבוהה ביותר |
| `other` | 0.00 | legacy ניטרלי |

### דוגמאות (אימות)
| תערובת | `flourFactor` |
|---|---|
| 100% לבן | **1.00** |
| 100% שיפון | **0.80** (חתך) |
| 100% מלא | **0.82** |
| 70 לבן / 30 שיפון | **0.925** |
| 50 לבן / 50 כוסמין מלא (spelt50) | **0.91** |
| 80 לבן / 20 שיפון (country-rye) | **0.95** |
| 30 לבן / 70 מלא (wheat70) | **0.874** |
| 60 לבן / 40 כוסמין לבן (spelt-white) | **0.98** |

החתך (0.20) נכנס רק בתערובות שיפון/מלא גבוהות מאוד.

---

## Backward Compatibility
- מודיפיירים חסרי-input → `1.0`. קמח אופציונלי → ניטרלי. קריאות/בייקים ישנים זהים.
- מתכוני Feature 08 נושאים תמיד את שדות הקמח (spelt ב-0) → `flourFactor` תמיד מחושב.
- שיא הסטארטר לעולם לא מקבל את מודיפייר הקמח (`appliesTo` לא כולל `starter`).
- **T1 משמר-התנהגות:** רק Q10 רשום כמודיפייר → פלט זהה למצב היום (507 הבדיקות עוברות ללא שינוי).

## States / Interaction / Locale
ללא חדש — שינוי חישוב בלבד. סיכון playbook: אפס. ללא מחרוזות/כיווניות חדשות.

## Decisions locked
- דגם `StageKind` מחליף את `tempAdjust`; מודיפיירים עם `appliesTo`; משך = `base × Π(modifiers)`.
- טווח עובר אל המנוע (`lowSecs/highSecs` ב-`BakeStep`).
- מדע הקמח (`shortening_i`, חתך 0.20, אותו factor ל-levain+bulk) — נעול.
- חוזה `FermentationParams` נושא `flour?` כבר ב-T1 (ניטרלי), כדי ש-T2 לא ידרוש שינוי חוזה.

## Open Questions
אין.
