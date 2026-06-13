# Tasks: Feature 19 — Manual-First Planner

Each task = one PR-sized unit, starts with a failing test + new branch.

## Task List

### T1 — Manual-first planner (presets become a seed row) ✅
**Goal:** הסרת ה-state machine `ScheduleMode`/`PresetCard`; הכוונון הידני גלוי תמיד; הפריסטים הופכים לשורת chips שמזריקה ערכים ומסומנת עד שינוי ידני.
**Files touched:** `components/bake/bake-planner-screen.tsx`, `components/bake/bake-planner-screen.test.tsx`, `lib/strings.ts` (`presetRowLabel`).
**Test strategy:** rewrite ל-`bake-planner-screen.test.tsx` — פקדים גלויים כברירת מחדל, אין card "לכוונן בעצמי", chip מזריק+מסומן, שינוי ידני (יום/יחס) מנקה סימון, CTA פעיל כש-`isValid`, retard עבר ל-sheet, `onConfirm` זהה.
**Done when:**
- [x] אין `ScheduleMode`/`PresetCard`; `selectedPreset: PresetKey | null` בלבד.
- [x] פריסט כופה `direction = "end"`, מזריק יום/שעה/retard/יחס, מסומן עד שינוי ידני.
- [x] CTA פעיל כש-`isValid`; `CompactBakeSummary` גלוי תמיד; ציר מלא + עריכת retard ב-sheet.
- [x] 27 בדיקות הפלאנר עוברות; 204 בדיקות bake עוברות; `tsc` נקי לקבצים שנגעו; RTL לוגי בלבד.
