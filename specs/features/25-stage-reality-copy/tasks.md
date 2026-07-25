# Tasks: Feature 25 — Stage Reality Copy

Delivery: branch `feature/25-stage-reality-copy`, PR אחד. Scope אושר מילולית
(2026-07-24, "תקן את הכל חוץ מהתמונה"); merge ממתין לאישור אילון כרגיל.

## T1 — Reality-aligned stage copy (stages 3, 4, 6)
**Goal:** רף שלב 3 = אחידות + סימון-וכיסוי; נפח באלק נמדד מ"שסימנתם בסוף הלישה";
hints אנגליים 3+6; תפר 6→7 מפנה קדימה. הכול לפי טבלאות ה-design.
**Files:** `lib/data/stages.ts`, `lib/data/stages.test.ts`.
**Test strategy (first):** היפוך חוזה ה-windowpane הישן + בלוק חוזים חדש
(discovery 20) — נכשלים לפני, עוברים אחרי.
**Done when:**
- [x] כל חוזי הבדיקות החדשים עוברים (8 חדשים + היפוך חוזה windowpane); suite מלא ירוק (897).
- [x] `tsc` נקי; אין שינוי UI/מנוע; `imageUrl` של שלב 3 לא נגעו בו.
- [x] אומת בדפדפן (mobile): שלב 3 — hint, צעדים 5–6, טיפ וצ׳קים חדשים, בלי windowpane; שלב 6 — hint ומצביע התפר. אפס שגיאות קונסול.
