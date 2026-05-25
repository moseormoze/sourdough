# Feature: bake-session-shell

## Problem

המתכונים שנוצרו ב-01 הם תיק שאין מה לעשות איתו. ״התחל אפייה״ הוא stub. בלי skeleton של בייק־סשן — בחירת מתכון, התמדה של ״איפה אני״ ב-localStorage, וזרימה בין שלבים — אי-אפשר להוסיף תוכן בייק אמיתי (03). הפיצ׳ר הזה הוא ה-״צינור״ של המסע, ללא תוכן השלבים עצמם.

## User Story

כאופה, אני רוצה ללחוץ על ״התחל אפייה״, לבחור מתכון או preset, ולהיכנס למסך השלב הראשון; כאשר אסגור את האפליקציה ואחזור שעה אחרי, אני רוצה לראות במסך הבית את הסטטוס ״ממשיכים את הבייק שלך — שלב X״ ולחזור בדיוק לאיפה שעצרתי.

## Scope — What's In

### בחירת מתכון לפתיחת בייק (Chooser)
- מסך חדש ב-`/bake/new` (מחליף את ה-stub) שמציג בגריד אחד את **6 הפריסטים** וגם את **המתכונים השמורים** של המשתמש
- כל קלף מציין באופן ויזואלי את סוגו (preset / שלי) — תג ״שלי״ למתכוני המשתמש (תואם להנדאוף §1)
- לחיצה על קלף → יוצר active bake חדש עם snapshot של אותו מתכון, ומנווט ל-stage 1 (placeholder ב-02)
- אם אין מתכונים שמורים בכלל — רק 6 פריסטים, ועדיין עובד

### Active Bake state model
- מבנה ב-`lib/types/active-bake.ts`:
  ```ts
  ActiveBake = {
    id: string;
    recipe: Recipe;            // snapshot, לא ref — שינויים במתכון לא משפיעים על בייק פעיל
    startedAt: number;          // epoch ms
    currentStage: number;       // 1..12
    stageStartedAt: number;     // epoch ms
    observationChecks: Record<number, Record<string, boolean>>;  // לתצפית, ימולא ב-03
  }
  ```
- **מתכון אחד פעיל בלבד** בכל זמן. אם המשתמש מנסה להתחיל בייק חדש כשיש פעיל — דיאלוג ״לוותר על הבייק הנוכחי?״
- אחסון: `localStorage` key `sourdough:v1:active-bake`. שכבת CRUD ב-`lib/storage/active-bake.ts` עם Zod כמו ב-recipes
- מתעדכן על כל מעבר שלב (ב-03), אבל ב-02 רק על יצירת בייק

### Home — מצב Resume
- כשמסך הבית טוען ויש active bake → במקום שני ה-CTAs הרגילים, מציג כרטיס ״ממשיכים את הבייק שלך״ שמכיל:
  - שם המתכון של הבייק
  - שם השלב הנוכחי (placeholder ב-02 — ב-03 יתבסס על שמות השלבים)
  - הערכת זמן שנותר (אם רלוונטי — דחוי ל-03)
  - CTA ראשי: ״המשך לבייק״ → מנווט לשלב הנוכחי
  - CTA משני קטן: ״ביטול בייק״ → דיאלוג אישור → מוחק active bake → חוזר למצב רגיל
- אם אין active bake → מסך הבית הקיים נשאר כמות שהוא (משולש: ״התחל אפייה״ + ״המתכונים שלי״)

### Stage routes (placeholders ב-02)
- ראוט `/bake/stage/[n]` עם `n` שהוא מספר השלב 1..12 (וגם `/bake/done` ל-12)
- מציג placeholder: ״שלב N — בקרוב״ + כפתור ״חזרה למסך הבית״. נמלא ב-03.
- ה-route file קורא את ה-active bake וווידא ש-`currentStage` תואם ל-`n` — אם לא, מפנה לשלב הנוכחי
- הגנה: אם אין active bake בכלל ונכנסים ל-route → redirect ל-`/`

### Tests
- בדיקות יחידה ל-`lib/storage/active-bake.ts` (save/load/clear, schema validation)
- בדיקות UI לבחירה (chooser רנדור 6+N קלפים, לחיצה יוצרת active bake)
- בדיקות UI לבית במצב resume (כרטיס מופיע, ביטול עובד)
- בדיקות ראוטים (placeholder מציג, redirect כשאין active bake)

## Out of Scope

- **תוכן השלבים** — מה כתוב בכל שלב, צ׳ק־ליסטים, טיימרים, מדיה, FoldDots, briefing/expand/video card. כל זה ב-03
- **השלב המיוחד 4 (תסיסה ראשונית) עם sub-steps** — ב-03
- **מסכים שאינם דרך bake-session** — sheet cheat, glossary, וכו׳ — דחוי
- **שיתוף / push notifications / multi-user** — לפי Discovery, לא ב-MVP
- **history של בייקים שהושלמו** — נדחה לאחרי 04
- **ארכיון** או ״השלב הקודם״ במהלך בייק פעיל — דחוי
- **photo upload** במסך completion — דחוי
- **שינוי מתכון תוך כדי בייק** — Out of Scope לחלוטין; snapshot ה-recipe ב-active bake בכוונה

## Acceptance Criteria

- [ ] לחיצה על ״התחל אפייה״ → מסך chooser עם 6 פריסטים + כל המתכונים השמורים. תג ״שלי״ על מתכוני משתמש
- [ ] לחיצה על קלף (preset או מתכון) → יוצר active bake עם snapshot של אותו מתכון + מנווט ל-`/bake/stage/1`
- [ ] active bake נשמר ל-`localStorage` תחת `sourdough:v1:active-bake`
- [ ] active bake שורד reload של הדפדפן
- [ ] כשיש active bake, פתיחת הבית מציגה כרטיס resume במקום שני ה-CTAs הרגילים; כשאין — חוזר למצב הרגיל
- [ ] כפתור ״ביטול בייק״ מציג דיאלוג; אישור → active bake נמחק → בית חוזר למצב רגיל
- [ ] ניסיון להתחיל בייק חדש בזמן שיש פעיל → דיאלוג ״לוותר על הבייק הנוכחי?״; אישור → מוחק את הישן ויוצר חדש
- [ ] כניסה ל-`/bake/stage/N` כשאין active bake → redirect ל-`/`
- [ ] כניסה ל-`/bake/stage/N` כשה-`currentStage` שונה מ-`N` → redirect ל-`/bake/stage/{currentStage}`
- [ ] כל המסכים בעברית עם RTL תקין; CSS לוגי בלבד; touch targets ≥44px
- [ ] בדיקות יחידה ל-storage layer + 5-7 בדיקות UI לכרטיסי resume + chooser

## Dependencies

- **Depends on**: 01-recipe-builder (קיים) — משתמש ב-`Recipe` schema, `listRecipes()`, ובמודל ה-`Preset`.
- **Blocks**: 03-bake-stages — מבלי ש-Active Bake state model קיים, אי אפשר לרנדר שלבים אמיתיים.

## Open Questions

(אין. כל מה שדרוש לעבור לעיצוב נסגר.)
