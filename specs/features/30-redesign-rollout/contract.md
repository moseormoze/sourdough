# Feature 30 — רולאאוט הרידזיין (חוזה מתגלגל)

## הבעיה

השפה הוויזואלית של הרידזיין הוכחה ואושרה בשני מסכים — הבית (Feature 28) והבוחר
`/bake/new` (Feature 29) — ושניהם חיים בפרודקשן. שאר המסכים עדיין בשפה הישנה,
והמעבר ביניהם שובר את הרציפות. הרצת צינור מלא (Discovery→Brief→Design→Tasks)
פר־מסך אינה מוסיפה החלטת מוצר חדשה — השפה כבר נעולה — ורק מייקרת כל מסך.

## התהליך (אושר על ידי המשתמש 2026-08-05, Issue #93)

- תיקיית פיצ׳ר מתגלגלת אחת: `specs/features/30-redesign-rollout/` — החוזה הזה
  + פתק דלתא קצר פר־מסך (`delta-<route>.md`).
- **PR אחד פר־מסך, מבוסס על `main`, הוא שער האישור היחיד** — עם צילומי
  לפני/אחרי מרונדרים בגוף ה־PR.
- רצפות איכות ללא שינוי: בדיקה נכשלת תחילה, בדיקות יחידה + type-check + lint +
  סריקת RTL + build פרודקשן, QA מרונדר, אין קופי חדש בלי אישור המשתמש.
- כל דבר שדורש החלטת מוצר אמיתית (קופי חדש, שינוי זרימה/אחסון/analytics)
  חוזר לצינור המלא.

## חוזה ה־carry-over

מקורות הסמכות לשפה — אין לחזור עליהם כאן, רק להצביע:

- **קנבס, glass, שורות וקבוצות**: `specs/features/28-home-redesign-pilot/design.md`
- **המשך הקנבס למסך שני, גריד אריחים, כללי דיאלוג**: `specs/features/29-bake-new-redesign-pilot/design.md`
- **מתכוני מחלקות משותפים**: `components/ui/ambient.ts` — ‏`AMBIENT_CANVAS`,
  ‏`AMBIENT_GLASS`. קבועים בלבד; רכיב משותף נשקל רק אחרי מסך שלישי שמוכיח צורך.

עקרונות מחייבים בכל מסך ברולאאוט:

- קנבס ambient ב־full-bleed; עמודת תוכן `max-w-md` ממורכזת, ‏`isolate`,
  ‏`overflow-x-clip`; ‏gutter ‏20px (16px עד 340px); למעלה `safe-area + 20px`.
- משטחי תוכן הם glass לפי המתכון המשותף; inset הוא שינוי טון בתוך משטח, לא
  כרטיס אטום מקונן.
- **charcoal מסמן את הפעולה הראשית היחידה של המסך** — ואין שני; orange הוא
  accent בלבד (אייקונים, focus, תגים) — לעולם לא משטח גדול.
- חוזי interaction לפי `ui-playbook.md`: ‏press ‏120ms ease-out, יעדי מגע ≥44px,
  ‏reduced motion מכבד, cleanup לכל טיימר.
- RTL: ‏logical properties בלבד; בידוד מספרים `<span dir="ltr" class="num">`;
  ניגודיות ≥4.5:1 בשני אזורי הגרדיאנט וב־fallback ללא `backdrop-filter`.

## סדר הרולאאוט (Discovery 22)

1. ‏`/bake/new` — ✅ Feature 29
2. **טפסים ומתכנן** — ‏`/bake/plan` (PR ראשון, ‏[delta](./delta-bake-plan.md)) + טופס המתכון
3. רשימות + מצבי loading/empty/error
4. מעטפת מסך השלב (bake-stage shell)
5. פר־שלב
