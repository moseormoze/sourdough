# Design: baking-method

## Screens Affected

| מסך | שינוי |
|---|---|
| `/bake/new` (chooser) | סלקטור שיטה מעל רשת ה-recipe/preset cards |
| `/bake/stage/9` | תוכן מותנה בשיטה (חימום, זמנים, טכניקה) + אזהרת קערה ל-`tray-with-bowl` |
| `/bake/stage/10` | תוכן מותנה בשיטה (טעינת בצק, יצירת אדים) |
| `/bake/stage/11` | תוכן מותנה בשיטה (הסרת כיסוי/אדים) |
| `/bake/stage/1–8, 12` | **ללא שינוי** |

ה-`Recipe`, ה-`RecipeForm`, וכל לוגיקת ה-bake-quantities של 04 לא משתנים.

## Components

**חדשים:**

| Component | תפקיד | חתימה |
|---|---|---|
| `BakingMethodSelector` | סלקטור עם 3 cards אנכיים, רדיו-בהיר. כל card עם title + description + state נבחר. | `({ value, onChange })` |
| `SafetyWarning` | סקציית אזהרה עם `AlertTriangle` + טקסט. רקע `bg-danger-bg`, border `border-danger`. | `({ children })` |

**Modified:**

| Component | שינוי |
|---|---|
| `ActiveBakeSchema` | מקבל `bakingMethod: z.enum([...]).default('dutch-oven')` |
| `ChooserScreen` | מוסיף state ל-method, מציג BakingMethodSelector מעל הקארדים, מעביר ל-`createActiveBake({ recipe, bakingMethod })` |
| `useActiveBake.create` (או equivalent) | מקבל `bakingMethod` ב-input |
| `StageScreen` | קורא `activeBake.bakingMethod` בשלבים 9-11; resolve-מ-Stage את הגרסה המתאימה לפני render |
| `Stage` interface | מקבל `byMethod?: Record<BakingMethod, StageContent>` (ראה למטה) |

**Reused:**
- `Button`, `useRouter`, כל רכיבי 03 (StageHeader, Briefing, InstructionCard, ChecklistReference, OptionalTimer)

## Data Structure — `byMethod` on Stage

המבנה: שדה אופציונלי על `Stage`, מכיל תוכן מלא לכל שיטה. אין merge / fallback / inheritance:

```ts
type BakingMethod = 'dutch-oven' | 'stone-with-steam' | 'tray-with-bowl';

interface StageMethodContent {
  briefing: StageBriefing;
  todo: StageTodo;
  checks?: string[];
  durationLabel?: string;
  warning?: string;  // טקסט אזהרה (רק tray-with-bowl בשלב 9)
}

interface Stage {
  // ...existing fields...
  byMethod?: Record<BakingMethod, StageMethodContent>;
}
```

**רציונל**: 3 שיטות × 3 שלבים = 9 בלוקים של תוכן. שכפול מלא קל יותר לתחזוקה ממיזוג override על base. אין סיכון של ״שכחתי לעקוף את השדה X״ — כל שיטה מציגה את התוכן שלה במלואו.

**ב-StageScreen**:
```ts
const stageContent = stage.byMethod?.[activeBake.bakingMethod] ?? {
  briefing: stage.briefing,
  todo: stage.todo,
  checks: stage.checks,
};
// ... render stageContent.briefing, stageContent.todo, etc.
```

שלבים 1-8 ו-12 לא מגדירים `byMethod` → ה-fallback מחזיר את ה-content הבסיסי.

## BakingMethodSelector — UX

**Layout**: 3 cards אנכיים, אחד מעל השני. כל card click-able, מסומן בעיגול (radio dot) + רקע מעודן כשנבחר.

```
┌──────────────────────────────────────────────┐
│ ⦿  סיר ברזל יצוק                              │
│    הסטנדרט. סיר עם מכסה, 24-28 ס״מ.           │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│ ○  אבן/פלדת אפייה + תבנית אדים                │
│    אבן או פלדה לוהטת, מים רותחים בתבנית        │
│    נפרדת לאדים.                              │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│ ○  תבנית + קערה הפוכה                         │
│    תבנית רגילה + קערת מתכת/קרמיקה הפוכה        │
│    (לא זכוכית רגילה, לא פלסטיק).              │
└──────────────────────────────────────────────┘
```

**Styling**:
- `rounded-2xl bg-paper shadow-sm border border-line` (אם לא נבחר)
- `border-accent ring-2 ring-accent/20 bg-accent-bg/30` (אם נבחר)
- Title: `text-heading text-ink`
- Description: `text-small text-ink-2 mt-1 leading-relaxed`
- Radio dot: `Circle`/`CircleDot` (lucide), 20px, `start` aligned, צבע accent כשנבחר, line כשלא

**Touch target**: כל ה-card לחיץ (≥44px בכל מקרה).

**Accessibility**: `role="radiogroup"` על המכל, `role="radio" aria-checked` על כל card.

## ChooserScreen Integration

הוספה לתחילת המסך, מעל ה-cards הקיימים:

```
┌──────────────────────────────────────┐
│ ← בית                                 │
│                                      │
│ באיזה כלי תאפה?                       │
│                                      │
│ [BakingMethodSelector — 3 cards]     │
│                                      │
│ בחר מתכון:                            │
│ [recipe/preset cards grid]           │
│                                      │
└──────────────────────────────────────┘
```

- ה-`BakingMethodSelector` מנהל state מקומי ב-`ChooserScreen`.
- Default state: `'dutch-oven'`.
- בלחיצה על recipe/preset: `createActiveBake({ recipe, bakingMethod })`.

## Stage 9–11 — תוכן מותנה

### שלב 9 (חימום)

**סיר ברזל יצוק** (current — נשאר ב-`byMethod['dutch-oven']`):
- durationLabel: ״45 דקות חימום״
- todo: 250°C, סיר עם מכסה בפנים, 45 דק׳.

**אבן/פלדת אפייה + תבנית אדים**:
- durationLabel: ״60 דקות חימום״
- todo:
  1. הניחו את האבן/פלדה במרכז התנור (מסילה אמצעית).
  2. הניחו תבנית אפייה רדודה ריקה במסילה התחתונה — בשבילה האדים.
  3. חממו 250°C למשך 60 דקות. האבן צריכה להיות לוהטת לחלוטין.
  4. בזמן ההמתנה: הכינו קומקום עם מים רותחים, וקרש אפייה (peel) מקומח קלות.
- tip: אבן קרה = לחם דחוס. 60 דק׳ זה לא מוגזם — האבן צריכה לאגור מסה תרמית.

**תבנית + קערה הפוכה**:
- durationLabel: ״30 דקות חימום״
- warning: ⚠️ ודאו שהקערה עמידה לחום של 250°C. **מתכת** (קערת ערבוב נירוסטה) או **קרמיקה** עוברות. **זכוכית רגילה תיסדק. פלסטיק יימס.**
- todo:
  1. הניחו את התבנית במרכז התנור.
  2. הניחו את הקערה הפוכה (פתח כלפי מטה) על התבנית.
  3. חממו 250°C למשך 30 דקות. הזמן קצר יותר כי המסה התרמית קטנה יותר.
  4. הכינו כפפות תנור עבות — תרימו קערה לוהטת.

### שלב 10 (אפייה מכוסה)

**סיר**:
- todo: הוצאת בצק, חריצה, העברה לסיר, מכסים.

**אבן+אדים**:
- todo:
  1. הוציאו את סלסלת ההתפחה. הפכו על קרש אפייה מקומח.
  2. חרצו את הבצק בסכין חדה (העדיפו תנועה אחת, החזיקו זווית 30°).
  3. בזריזות: פתחו את התנור, החליקו את הבצק על האבן.
  4. שפכו 1/2 כוס מים רותחים לתבנית האדים. **סגרו את התנור מיד.**
  5. אל תפתחו את התנור ב-20 דקות הבאות — האדים חיוניים ל-oven spring.
- tip: עבדו מהר. כל שנייה שהתנור פתוח האדים בורחים.

**תבנית+קערה**:
- todo:
  1. הוציאו את סלסלת ההתפחה. הפכו על נייר אפייה.
  2. חרצו את הבצק בסכין חדה.
  3. בזריזות ובכפפות עבות: הרימו את הקערה הלוהטת ושימו בצד על משטח עמיד.
  4. החליקו את הבצק עם נייר האפייה לתבנית.
  5. כסו מיד עם הקערה הלוהטת. סגרו את התנור.

### שלב 11 (אפייה לא מכוסה)

**סיר**:
- todo: הסרת מכסה, המשך אפייה 25-30 דק׳.

**אבן+אדים**:
- todo:
  1. אחרי 20 דקות עם אדים, פתחו את התנור בזהירות.
  2. הוציאו את תבנית האדים. המים אמורים להיות אדויים — אם נשאר מעט, יציאת התבנית עוצרת את האדים.
  3. סגרו את התנור, המשיכו אפייה 25-30 דק׳ עד צבע זהוב-עמוק.
- tip: בלי האדים בשלב הזה — הקרום בונה את הצבע והפריכות.

**תבנית+קערה**:
- todo:
  1. אחרי 20 דקות עם הקערה, פתחו את התנור.
  2. בכפפות עבות: הרימו את הקערה הלוהטת והניחו בצד. **זהירות מהקיטור** — הוא לוהט.
  3. סגרו את התנור, המשיכו אפייה 25-30 דק׳.

## Warning Component

```tsx
interface SafetyWarningProps {
  children: ReactNode;
}

function SafetyWarning({ children }: SafetyWarningProps) {
  return (
    <section
      role="alert"
      className="rounded-2xl bg-danger-bg border border-danger p-4 flex items-start gap-3"
    >
      <AlertTriangle size={20} className="text-danger shrink-0 mt-0.5" aria-hidden />
      <div className="text-body text-ink leading-relaxed">{children}</div>
    </section>
  );
}
```

**מיקום ברינדור**: בתוך `StageScreen`, מעל ה-Briefing, רק אם `stageContent.warning` קיים.

## User Flow

```
─── start bake with method ─────────────
/bake/new → ChooserScreen
  ├─ state: bakingMethod = 'dutch-oven' (default)
  ├─ user (optionally) picks different method via BakingMethodSelector
  ├─ user clicks a recipe card
  │     ↓
  │  createActiveBake({ recipe, bakingMethod }) → ActiveBake stored
  │     ↓
  │  router.push("/bake/stage/1")

─── stage 1–8 ─────────────────────────
unchanged from 04

─── stage 9 (preheat) ────────────────
StageScreen reads activeBake.bakingMethod
  ├─ stageContent = stage.byMethod[method]
  ├─ Render Briefing(stageContent.briefing)
  ├─ if stageContent.warning → render SafetyWarning above briefing
  ├─ Render InstructionCard(stageContent.todo)
  └─ Render ChecklistReference(stageContent.checks)

─── stage 10, 11 ──────────────────────
same pattern: method-specific content

─── stage 12 ──────────────────────────
unchanged
```

## Edge Cases

| Case | Behavior |
|---|---|
| ActiveBake ישן (לפני 05) בלי `bakingMethod` | Zod default → `'dutch-oven'`. נטען בשקט. |
| בייק פעיל באמצע השלב — מעבר ל-05 בקוד | ה-bakingMethod מתקבל default `'dutch-oven'`, וזה תואם את ההוראות הישנות שכבר היו hardcoded. אין שבירה. |
| `byMethod` חסר לשלב 9-11 (באג נתונים) | StageScreen falls back ל-content הבסיסי (אותו fallback של שאר השלבים). הטסט יזעק על השלב הספציפי. |
| משתמש פתח 2 בייקים במקביל | לא רלוונטי — האפליקציה תומכת בבייק פעיל אחד בלבד (`02-bake-session-shell`). |
| שינוי method באמצע בייק | לא נתמך ב-MVP. אין UI. אם הקוד נתקל ב-method שונה, פשוט מציג את הגרסה החדשה. |

## Out of Design Scope

- שינוי method באמצע בייק — UI/UX של ״שנה שיטה״
- מערכת תמונות (`imageUrl`) ב-stages — פיצ׳ר נפרד
- היסטוריית בייקים עם method (יומן) — feature 06
- אזהרות לציוד אחר (״סיר חייב להיות עמיד״, ״אבן יבשה״) — לא ב-MVP
- שמירת method כ-default user-preference (״תמיד אני אופה בסיר״) — לא ב-MVP

## Open Design Questions

1. **`Recipe.bakingMethod`?** — האם להוסיף שדה preferred method ל-Recipe (לא חובה, רק פרסונליזציה)? **המלצה**: לא ל-MVP. הוספה עתידית קלה אם פידבק יראה צורך.
2. **`BakingMethodSelector` icons?** — האם להוסיף אייקון פר card (Cooking Pot / Layers / Square)? **המלצה**: לעכשיו לא — שלוש cards עם title + description קריאים מספיק.
3. **Warning placement בשלב 9** — מעל Briefing (current proposal) או בתוך הסקציית Briefing (פחות בולט)? **המלצה**: מעל Briefing, כי זה אזהרה פיזית בטיחותית — אסור להתפספס.
