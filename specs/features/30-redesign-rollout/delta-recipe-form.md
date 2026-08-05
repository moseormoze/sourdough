# דלתא: טופס המתכון — ‏`/recipes/new/[preset]` ו־`/recipes/[id]/edit`

שפה ויזואלית בלבד. אפס שינוי בוולידציה, אחסון, סכימה, קופי, analytics, סדר
ה־DOM, ‏roles, ‏aria או התנהגות focus/מקלדת. כל המחרוזות בעברית זהות בייט־לבייט.

**תיקון נתיבים:** המסך אינו יושב על `/recipes/new` (שם יושבת גלריית ה־presets)
אלא על `/recipes/new/[preset]` ‏(למשל `/recipes/new/scratch`) ועל
`/recipes/[id]/edit`. שני הנתיבים מרנדרים את אותו `RecipeFormScreen`.

## קומפוזיציה

- **קנבס**: ‏`RecipeFormScreen` נעטף ב־`AMBIENT_CANVAS` ‏full-bleed; ‏`<main>`
  הופך לעמודת התוכן לפי חוזה ה־carry-over ‏(`max-w-md`, ‏`isolate`,
  ‏`overflow-x-clip`, ‏gutter ‏20px / ‏16px עד 340px, ‏`safe-area + 20px` למעלה).
- **קיבוץ glass**: הטופס מתחלק לחמישה כרטיסי `AMBIENT_GLASS` ‏(`p-5`, ‏`p-4` עד
  340px, מרווח `gap-4`) לפי גבולות ה־`FormSection` הקיימים:
  (1) שם המתכון, (2) פירוט קמחים, (3) משקל קמח + הידרציה + הערת הקמח + מלח +
  שאור, (4) טמפ׳ מטבח, (5) תוספות.
  ה־`FormSection` הקיים פוצל לשניים כדי שהטמפרטורה תקבל כרטיס משלה (כמו
  במתכנן) — פיצול מכולה בלבד, סדר השדות ב־DOM לא זז.
- **כותרת ההקשר** (חזרה + ‏H1 עם שם המתכון) נשארת על הקנבס, מחוץ לזכוכית.
- **footer דביק** לפי תבנית המתכנן: ‏`bg-[#FFF8F1]/90` עם ‏`paper/60` ‏+ blur
  כשנתמך, גבול עליון `ink/[0.06]`, ‏`pb-[max(1.25rem,env(safe-area-inset-bottom))]`.
  קבוצת הפעולות הקיימת עוברת לתוכו כמות שהיא — שורת ״שמור/ביטול״ ומתחתיה
  ״מחק מתכון״ במצב עריכה — כך שסדר ה־DOM נשמר.

## הכרעות דלתא

- **ה־CTA ״שמור״ הוא charcoal**: ‏`variant="accent"` ⇒ `variant="primary"`
  ‏(`AMBIENT_CHARCOAL` + צל charcoal) ו־`flex-1` כדי שיהיה עוגן המסך.
  ״ביטול״ נשאר ghost; ״מחק מתכון״ נשאר ghost ב־`danger` (סטטוס, לא accent).
- **כל השדות עברו ל־inset** ‏(`appearance="inset"`, opt-in — ברירת המחדל של
  ‏`NumberInput`/`TextInput` נשארת outline למסכים שטרם הומרו): שם המתכון,
  חמשת שדות הקמח, משקל קמח, הידרציה/מלח/שאור, טמפ׳ מטבח, ושדות שורת התוספת.
  הערכים mono ‏`text-lg` ממורכזים, השגיאה ‏ring ‏`danger/40` בלי מסגרת.
- **אפס orange על המסך.** שני המקורות היחידים חוסלו לפי המילון (חלק ד):
  צ׳יפ ההמלצה (`HintChip`) הפך לפיל טון `bg-ink/[0.04]` — הכרעה לפי דקדוק,
  כי הוא **אינפורמטיבי ולא בחירה**, ולכן אינו מקבל היפוך טונאלי; והבהוב
  אישור ההמלצה עבר מ־`ring-accent/30` ל־`ring-ink/20`.
- **שורת התוספת אינה יושבת על מנגנון swipe** (יש לה כפתור מחיקה מפורש), ולכן
  אינה צריכה משטח אטום כמו שורות רשימת המתכונים: היא אריח טון
  ‏`bg-ink/[0.04]` ‏`rounded-2xl` בלי גבול, והשדות בתוכו frosted ‏`bg-paper/70`
  — שתי קומות טון שנקראות ברור אחת מעל השנייה.
- **כפתור ״הוסף תוספת״** עבר מ־`bg-bg-2` לפיל inset ‏`bg-paper/70` ‏+ `pressable`.
- **דיאלוגים** (מחיקה, ביטול שינויים) קיבלו את ה־`appearance="ambient"` הקיים.
  אפס שינוי קופי או פעולות.
- **גריד הקמחים יורד לעמודה אחת מתחת ל־340px** ‏(`max-[340px]:grid-cols-1`).
  בשתי עמודות ב־320px כפתורי ה־± של הסטפר גלשו מחוץ לפיל (ובפרודקשן גם גרמו
  לגלישה אופקית של 2px בעמוד). זו הכרעת קומפוזיציה, לא שינוי מילון.

## אימות מרונדר

`specs/features/30-redesign-rollout/qa/recipe-form/` — ‏before מפרודקשן
‏(`sourdough-chi.vercel.app`), ‏after מ־`localhost:3013`:

| מצב | לפני | אחרי |
|---|---|---|
| ‏375 ראש המסך | `before-top.png` | `after-top.png` |
| ‏375 עמוד מלא | `before-full.png` | `after-full.png` |
| ‏375 אמצע / תחתית (גלילה) | `before-mid.png` / `before-bottom.png` | `after-mid.png` / `after-bottom.png` |
| ‏320 | `before-320.png`, `before-320-top.png` | `after-320.png`, `after-320-top.png` |
| שגיאות ולידציה (הצפה בלחיצת ״שמור״) | `before-error.png`, `before-error-top.png` | `after-error.png`, `after-error-top.png` |
| מצב עריכה (מתכון זרוע) | `before-edit-*.png` | `after-edit-top.png`, `after-edit-full.png`, `after-edit-bottom.png` |
| צ׳יפ המלצה בשפה החדשה | — | `after-hint-chip.png` |

- אפס גלישה אופקית ב־375 וב־320 (בפרודקשן היו 322px ב־320 — תוקן).
- אפס שגיאות קונסולה בכל המצבים.

## פערים

- **ה־FAB של הפידבק** ‏(`fixed bottom-[88px] start-4`) חופף לקצה ה־CTA בפוטר
  הדביק — בדיוק כמו במתכנן שכבר מוזג (ראו `qa/after-top.png` של הדלתא ההיא).
  רכיב גלובלי; התיקון שייך ל־PR שממיר את ה־FAB, לא לכאן.
- ב־`after-full.png` הפוטר הדביק מצולם באמצע הפריים — ארטיפקט של צילום
  ‏fullPage מול `position: sticky`. לכן צורפו גם צילומי viewport מגוללים.
- גלריית ה־presets ב־`/recipes/new` עדיין בשפה הישנה — היא מסך רשימה ושייכת
  לשלב 3 ברולאאוט.
