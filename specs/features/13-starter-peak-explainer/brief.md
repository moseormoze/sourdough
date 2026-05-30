# Feature: Starter Peak Explainer

## Problem
במסך תכנון הבייק שואלים "הסטארטר שלך בשיא?" עם טוגל כן/לא — אבל בייקרים מתחילים לא תמיד יודעים מה "בשיא" אומר, ואין שום הסבר ליד הטוגל. התוצאה: ניחוש, או תשובה שגויה שמובילה לחישוב תזמון מוטעה. אנחנו רוצים הסבר קצר, אלגנטי ועל-פי-דרישה — בלי להעמיס טקסט קבוע על המסך.

## User Story
As a beginner home baker, I want a quick on-demand explanation of what a "starter at peak" looks like, so that I can answer the readiness question honestly instead of guessing.

## Scope — What's In
- **טריגר inline** צמוד ל-label של הטוגל ([`starter-toggle.tsx`](../../../components/bake/starter-toggle.tsx)): chip קטן ("מה זה בשיא?") עם יעד מגע 44px (overlay `::before`, בדומה ל-[`hint-chip.tsx`](../../../components/recipes/hint-chip.tsx))
- **פּרימיטיב `BottomSheet` חדש לשימוש חוזר** ([`components/ui/bottom-sheet.tsx`](../../../components/ui/bottom-sheet.tsx)): גובה peek 56%, scrim `rgba(31,26,20,0.45)` + 2px blur, tap-to-close, drag-handle, כניסה spring כלפי מעלה (לפי [`ui-playbook.md`](../../../ui-playbook.md) §4-5), כיבוד `prefers-reduced-motion`
- **תוכן ה-sheet:** תמונת השוואה 3-פריים (שטוח → בשיא → קרס) + צ׳קליסט קצר: הוכפל בנפח, מלא בועות, ריח חמצמץ-מתוק, עובר מבחן ציפה (float test)
- **ייצור תמונת ההשוואה** (Nano Banana) + הוספה ל-`public/stages/` עם `alt` בעברית
- כל המחרוזות ב-[`lib/strings.ts`](../../../lib/strings.ts) תחת `bakeScheduler`/מפתח חדש

## Out of Scope
- שינוי מסך השער ([`starter-gate-step.tsx`](../../../components/bake/starter-gate-step.tsx)) — ה-blurb הקבוע שלו נשאר (יתואם בנפרד אם בכלל)
- `Term` chip גנרי inline בתוך משפטים (פּרימיטיב נפרד — backlog)
- הסברי-בתוך-הסבר מקוננים (sheet בתוך sheet) למבחן ציפה — שורה אחת מספיקה ב-v1
- וידאו / גלריית reference מורחבת (v2)
- שימוש חוזר ב-`BottomSheet` למסכים אחרים בתוך הפיצ׳ר הזה (נבנה גנרי, אבל מחווט רק לטוגל כאן)

## Acceptance Criteria
- [ ] ליד הטוגל "הסטארטר שלך בשיא?" מופיע טריגר הסבר עם יעד מגע ≥44px
- [ ] לחיצה על הטריגר פותחת `BottomSheet` בגובה peek 56% עם spring כלפי מעלה
- [ ] ה-sheet נסגר ב-tap על ה-scrim, ב-drag-handle כלפי מטה, וב-Escape (מקלדת)
- [ ] ה-sheet מציג תמונת השוואה 3-פריים עם `alt` תיאורי בעברית + צ׳קליסט 4 הסימנים
- [ ] מבחן ציפה (float test) מוזכר בצ׳קליסט
- [ ] `prefers-reduced-motion` מבטל את אנימציית ה-spring (snap מיידי)
- [ ] focus trap בתוך ה-sheet; focus חוזר לטריגר בסגירה
- [ ] כל הטקסט בעברית, פריסה RTL, לוגיקל-פרופרטיז בלבד, ללא מחרוזות hard-coded באנגלית בקומפוננטים
- [ ] בדיקות: state machine של פתיחה/סגירה (tap-scrim, drag-dismiss, Escape) + רינדור התוכן

## Dependencies
- **New primitive:** `BottomSheet` — לא קיים בקוד (יש רק [`dialog.tsx`](../../../components/ui/dialog.tsx)). נבנה כחלק מהפיצ׳ר
- **Asset:** תמונת השוואה 3-פריים — לא קיימת, צריכה ייצור + אישור עיצובי (task נפרד כדי לא לחסום את ה-sheet)
- **Overlap risk:** פיצ׳ר 11 (`planning-ux-v2`) עורך כרגע את [`bake-planner-screen.tsx`](../../../components/bake/bake-planner-screen.tsx). מיטיגציה: לרכז את הטריגר בתוך [`starter-toggle.tsx`](../../../components/bake/starter-toggle.tsx) כדי שמסך התכנון לא ישתנה. עבודה ב-worktree מבודד מ-`main`
- **Blocks:** אין

## Open Questions
<Should be empty before Design phase. Items currently in discovery "עדיין פתוח" resolve in Design.>
