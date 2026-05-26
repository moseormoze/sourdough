# Design: bake-quantities

## Screens Affected

| מסך | שינוי |
|---|---|
| `/recipes/new`, `/recipes/[id]/edit` | שדה חדש ״משקל קמח״ ב-**ראש** סקציית פרמטרי הככר |
| `/bake/stage/1` | מספרים קונקרטיים בהוראות (סטארטר/מים/קמח לשאור) + chip ״הנחה: סטארטר 100% הידרציה״ + הערה אינלין על קונבנציית Total Flour |
| `/bake/stage/2` | מספרים קונקרטיים בהוראות (סך קמח, רוב המים) |
| `/bake/stage/3` | מספרים קונקרטיים בהוראות (מלח, שאור, מים-שמורים) |
| `/bake/stage/4–12` | **ללא שינוי ויזואלי** — פרוצדורליים בלבד |

הראוטים, ה-guards, וה-flow של 02 + 03 לא משתנים. רק תוכן ההוראות והטופס.

## Components

**חדשים:**

| Component | תפקיד | חתימה |
|---|---|---|
| `FlourWeightInput` | קלט גרמים (integer) + hint דו-שורתי | `({ value, onChange, onBlur, error })` — wrapper דק סביב `NumberInput` הקיים עם hint מובנה |

**Modified:**

| Component | שינוי |
|---|---|
| `InstructionCard` | מקבל `quantities?: BakeQuantities`; אם הועבר — מבצע placeholder substitution על כל step ועוטף את המספר ב-`<strong class="font-semibold">…g</strong>` |
| `StageScreen` | מחשב `quantities = computeBakeQuantities(activeBake.recipe)` פעם אחת ומעביר ל-`InstructionCard`. בשלב 1 בנוסף מציג chip ההנחה + הערת Total Flour |
| `RecipeFormScreen` | מוסיף שדה ״משקל קמח״ ב-**ראש** סקציית hydration/salt/levain, ל-state, ל-validation, ול-submit |
| `RecipeSchema` | מקבל שדה `flourWeightGrams: z.number().int().min(100).max(1500).default(500)` |

**Reused:**
- `NumberInput`, `FormSection`, `HintChip`, `Button`
- `useActiveBake`, `useRouter`
- כל רכיבי 03 (StageHeader, ProgressStrip, Briefing, ChecklistReference, FoldDots, OptionalTimer, StickyActions)

**מודול חדש (לא רכיב):**
- `lib/bake-math.ts` — `computeBakeQuantities(recipe: Recipe): BakeQuantities` (פירוט החתימה ב-brief)

## Placeholder Syntax — Stage Instructions

**הצורה:** `{tokenName}` בתוך מחרוזת step.

**Tokens נתמכים** (flat, ממופים ישירות ל-`BakeQuantities`):

| Token | מקור ב-BakeQuantities | שלב |
|---|---|---|
| `{starterGrams}` | `levainBuild.starterGrams` | 1 |
| `{levainWaterGrams}` | `levainBuild.waterGrams` | 1 |
| `{levainFlourGrams}` | `levainBuild.flourGrams` | 1 |
| `{totalFlourGrams}` | `totalFlourGrams` | 2 |
| `{autolyseWaterGrams}` | `mixAdditions.waterGrams` (= total − levain − reserve) | 2 |
| `{levainTotalGrams}` | `levainTotalGrams` | 3 |
| `{saltGrams}` | `saltGrams` | 3 |
| `{saltReserveWaterGrams}` | `mixAdditions.saltReserveWaterGrams` (קבוע ~20g) | 3 |

**Substitution:** ב-`InstructionCard`, כל step נסרק עם regex `/\{(\w+)\}/g`. כל match מוחלף ב-`<strong class="font-semibold text-ink">{n}g</strong>` (JSX, לא HTML — שומר על XSS-safety).

**Fallback:** אם `quantities` לא הועבר (למשל ב-Storybook או בטעות), Tokens יוצגו כפי שהם (`{starterGrams}`). זה visible-broken בכוונה — קל לזהות באג. **לא** משאירים placeholder ריק או "—".

**Token לא מוכר:** נשאר כפי שהוא בטקסט. נרשם `console.warn` ב-dev (לא ב-prod). אין fallback אחר.

## Visual Treatment — Numbers in Instructions

- מספר תוך-טקסט נעטף ב-`<strong>` עם `font-semibold` (לא `font-bold` — מספיק להבליט בלי לצעוק)
- צבע: `text-ink` (אותו צבע כמו שאר הטקסט — ההדגשה היא במשקל, לא בצבע)
- ה-`g` (יחידה) נשאר באותה עטיפת `<strong>` — נראה כיחידה אחת (`33g`, לא `33 g`)
- מספרים תמיד באנגלית/לטיני (אין המרה ל-״שלושים ושלושה״). דו-כיווניות מטופלת אוטומטית ע״י Unicode bidi באמצע משפט עברי

**דוגמה רנדורית בשלב 1, step 2** (Recipe: 500g קמח, 75% hyd, 2% salt, 20% lev):
> במכל נקי שקלו **33g מים**, וערבבו עם **33g סטארטר** עד שהוא מתפזר לגמרי במים.

## Stage 1 — Disclosures (Assumptions)

שני גילויים סמויים חייבים להופיע בשלב 1 — הם משפיעים על נכונות המספרים:

### Chip ״הנחה: סטארטר 100% הידרציה״
- מיקום: בתוך ה-`Briefing` card, מתחת ל-`takeaways`, כפסקה דקה (לא ״תיבה״ נוספת)
- צבע: `text-ink-2 text-small`
- אייקון אופציונלי: `Info` (lucide), 16px, `start` aligned

### Note ״הקמח של השאור כלול בתוך 100% הקמח״
- מיקום: **בתוך** ה-`InstructionCard` של שלב 1, אחרי ה-tip (אם יש)
- צבע: `text-ink-2 text-small italic`, ללא רקע
- prefix: ״הערה: …״

**שלבים 2–12 לא מציגים את ה-disclosures האלה** — הם רלוונטיים רק לשלב 1 כי הוא היחיד שהם משפיעים עליו אקטיבית.

## Recipe Form — New Field

**מיקום בטופס:** סקציית ״פרמטרי הככר״ (בה יושבים hydration / salt / levain). **השדה הראשון בסקציה** — לפני hydration. רציונל: ״כמה קמח״ הוא ההחלטה הראשונה, שאר האחוזים מתקנפגים מעליו.

**Layout:**
```
┌──────────────────────────────────────────┐
│ פרמטרי הככר                              │
│                                          │
│ משקל קמח              [  500  ]  g       │
│ 500g · ככר בינונית (~1kg בצק)             │
│ 750g · ככר גדולה (~1.5kg בצק)              │
│                                          │
│ הידרציה               [  75  ]  %        │
│ …                                        │
└──────────────────────────────────────────┘
```

**Component:** `FlourWeightInput` עוטף את `NumberInput` הקיים, מוסיף:
- `label`: ״משקל קמח״
- `suffix`: ״g״ (טקסטואלי בתוך ה-input, מקביל ל-`%` ב-PercentInputWithHint)
- `recommended` / `hint`: שתי שורות hint דרך `HintChip` הקיים
- `min={100} max={1500}`, integer, error on out-of-range
- default ב-form state: `500`

**ולידציה:**
- Out-of-range: ״משקל קמח חייב להיות בין 100g ל-1500g״
- Non-integer / negative / empty: ״הכנס משקל קמח בגרמים (100–1500)״

**Migration:** מתכון ישן ב-localStorage נטען דרך Zod עם `.default(500)`. אין צורך בלוגיקה ידנית במקום אחר — ה-storage layer קורא `RecipeSchema.parse(raw)` ומקבל את ה-default בחינם.

**Hint vessel-agnostic:** ה-hint לא מזכיר ״סיר 24 ס״מ״ או כל כלי אפייה אחר. הסיבה — שיטת אפייה תהיה שדה נפרד ב-`05-baking-method`.

## User Flow

```
─── recipe edit ────────────────────────
/recipes/new (or /edit)
  ├─ User fills name, flour, flourWeightGrams (default=500)
  ├─ User adjusts hydration/salt/levain
  ├─ Save → RecipeSchema.parse → localStorage
  └─ flourWeightGrams stored alongside

─── bake start ─────────────────────────
User picks recipe → "התחל בייק"
  ├─ ActiveBake created with embedded recipe (already includes flourWeightGrams)
  └─ router.push("/bake/stage/1")

─── stage render (1, 2, 3) ─────────────
/bake/stage/{n} render
  ├─ StageScreen({ stageData, activeBake })
  ├─ quantities = computeBakeQuantities(activeBake.recipe)
  ├─ <InstructionCard steps={…} quantities={quantities} />
  │     └─ each step: substitute {tokenName} → <strong>{value}g</strong>
  └─ stage 1 also renders disclosures

─── stage render (4–12) ────────────────
Same as before — quantities passed but no tokens to substitute, no visual change.
```

## Edge Cases

| Case | Behavior |
|---|---|
| `levain === 0` | `levainTotalGrams=0`, `levainBuild.*=0`. שלב 1 עדיין רץ אבל מספרים יוצאים 0g. **decision**: זה גרוע UX אבל נכון מבחינה מתמטית. נוסיף בעתיד early-return של ״אין שאור — דלגו לשלב 2״, לא ב-MVP |
| `flourWeightGrams === 100` (min) | חישובים יוצרים מספרים קטנים. levain=20% → 20g שאור → 6.67g per component → 7g כל אחד. Acceptable |
| `flourWeightGrams === 1500` (max) | מספרים סבירים גם בקצה העליון. הולידציה מונעת חריגה |
| Recipe ישן ב-localStorage | Zod default מטפל. אין warning, אין modal — נטען בשקט עם 500g |
| ActiveBake שנפתח לפני 04 | ה-`recipe` המוטמע בתוך ה-ActiveBake הוא snapshot. אם הוא חסר `flourWeightGrams` → schema parse עם default 500. רץ בשקט. **חשוב**: ActiveBake schema צריך לעדכן את הגרסה המוטמעת של Recipe גם הוא דרך Zod |
| `hydration + salt + levain > 100` (תיאורטית) | מתמטית legal, פיזית מאוד נדיר. החישוב עובד. **לא נוסיף** ולידציה חוצה-שדות ב-MVP |
| placeholder לא מוכר בטקסט | נשאר כפי שהוא + `console.warn` ב-dev בלבד |
| חישוב סוטה ב-1-2g (rounding) | Acceptable. בבייק ביתי לא משנה |

## Out of Design Scope

- כרטיס ״הבייק שלך במספרים״ במסך השלב (mini summary) — brief אמר ״not in MVP״
- הצגת המספרים גם בכרטיס ה-Briefing (היום רק ב-todo) — לא נדרש
- אנימציית הדגשה על המספרים בעת load — `font-semibold` מספיק
- בחירת יחס בניית שאור / הידרציית סטארטר ב-UI — מקובע ב-MVP, ההנחות מופיעות כ-disclosures
- שיטת אפייה (סיר/אבן/תבנית) — `05-baking-method`

## Open Design Questions

1. **NumberInput suffix support** — אם הרכיב הקיים לא תומך ב-suffix טקסטואלי בתוך ה-field (כמו ש-PercentInputWithHint תומך ב-`%`), צריך להוסיף `unit` prop. **לטכ-ליד להחליט** בין:
   - הוספת `unit?: string` ל-`NumberInput` (משפיעה על שאר השימושים — סיכון רגרסיה נמוך)
   - יצירת `GramsInput` ייעודי (DRY נמוך אבל בטוח)
2. **המקום של ה-disclosure של ״הקמח של השאור כלול ב-100%״** — בתוך InstructionCard (כפי שהומלץ כאן) או בתוך Briefing? המלצה למימוש: InstructionCard, כי שם המשתמש קורא ופועל. אם בפועל יראה עמוס, נעביר ל-Briefing
