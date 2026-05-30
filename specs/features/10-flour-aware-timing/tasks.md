# Tasks: זמנים-מודעי-קמח

> כל טאסק = ענף + טסט נכשל ראשון + PR אחד.
> **תלות:** נבנה מעל Feature 09 (schedule-flexibility, PR #23). T1 מתחיל מעל ה-tip
> של 09; כש-09 נחת ב-main, מבצעים rebase.

## Task List

### T1 — איחוד המנוע (משמר-התנהגות, טמפ׳-בלבד)
**Goal:** לבנות מחדש את `lib/bake-timing.ts` סביב דגם stage-kind + מודיפיירים, **בלי לשנות פלט**. רק Q10 רשום כמודיפייר. מבטל את הכפילות (`levainStart` יחיד, `starterPeakSecs` יחיד).
**Files likely touched:** `lib/bake-timing.ts`, `lib/bake-timing.test.ts`, `components/bake/bake-timeline.tsx` (קריאת `lowSecs/highSecs` מ-`BakeStep` במקום `durationRangeLabel` על אומדן).
**Test strategy:** רשת-הביטחון היא 507 הבדיקות הקיימות — **חייבות לעבור ללא שינוי**. בנוסף: טסטים שמוודאים `kind` נכון לכל שלב, ש-`stageDuration` של שלב `fixed` מחזיר טווח-אפס, ושל ביולוגי מחזיר `[0.8×, 1×]`, ושהמודיפיירים חלים סלקטיבית (starter מקבל Q10 ולא קמח).
**Depends on:** Feature 09 (#23) ב-main.
**Done when:**
- [ ] `StageKind` + `Modifier` (עם `appliesTo`) + `FermentationParams` (כולל `flour?` ניטרלי).
- [ ] `stageDuration` = `base × Π(modifiers)`, מחזיר `{estimate, low, high}`.
- [ ] `BakeStep` נושא `lowSecs/highSecs`; `bake-timeline` קורא מהם.
- [ ] `calculateFeedingWindow` נגזר מ-`levainStart` היחיד; `starterPeakSecs` לא משוכפל.
- [ ] כל 507 הבדיקות עוברות; פלט זהה להיום; `tsc` נקי.

### T2 — מודיפייר הקמח (flour-aware בפועל)
**Goal:** להוסיף את מודיפייר `FLOUR` (`appliesTo: ["fermentation"]`) ואת `flourFactor(flour)` לפי המדע הנעול, ולחווט את `recipe.flour` ל-`FermentationParams` בכל הצרכנים.
**Files likely touched:** `lib/bake-timing.ts` (`flourFactor` + רישום המודיפייר), `components/bake/bake-planner-screen.tsx` (העברת `recipe.flour`), `lib/bake-timing.test.ts`.
**Test strategy:** טסט נכשל ראשון — מתכון 100% שיפון מציג bulk+levain קצרים מ-100% לבן באותה טמפ׳. טבלת ה-`flourFactor` (כל קמח), חתך 0.20 (100% שיפון → 0.80), רגרסיה: 100% לבן זהה ל-T1, ושיא-הסטארטר לא משתנה עם הקמח.
**Depends on:** T1.
**Done when:**
- [ ] `flourFactor` תואם את טבלת ה-Design + חתך 0.20.
- [ ] קמח-מתכון משפיע על `levain`+`bulk` בלבד, לא על `starter` ולא על שלבים קבועים.
- [ ] מסך התכנון מעביר `recipe.flour`; AC: שיפון/מלא מציג זמנים קצרים יותר במסך התכנון ובחלון ההאכלה.
- [ ] רגרסיה: לבן 100% זהה ל-T1; `npm test` ירוק; אין `any`.

## Build Order
T1 → T2

## Risks
- **T1 משמר-התנהגות אך נוגע בליבה** — הסיכון העיקרי הוא רגרסיה שקטה. מיטיגציה: 507 הבדיקות + אימות מספרי שהפלט זהה לפני/אחרי.
- **תלות ב-#23** — קונפליקט אם בונים מעל main ישן. מיטיגציה: ענף מעל ה-tip של 09 + rebase לאחר מיזוג.
