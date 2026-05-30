# Tasks: Starter Peak Explainer

> **סטטוס:** ממתין לאישור Design לפני פירוק למשימות. אל תמלא לפני אישור.

## Task List (draft — to be finalized by Tech Lead)

### T1 — `BottomSheet` primitive (reusable)
**Goal:** פּרימיטיב bottom sheet גנרי: peek 56%, scrim + blur, tap-to-close, drag-handle, spring entrance, focus trap, `prefers-reduced-motion`.
**Files:** `components/ui/bottom-sheet.tsx`, `components/ui/bottom-sheet.test.tsx`
**Test strategy:** state machine — open/close, tap-scrim, drag-dismiss, Escape, focus return.

### T2 — Comparison asset
**Goal:** ייצור תמונת השוואה 3-פריים (שטוח → בשיא → קרס) + `alt` עברי, הוספה ל-`public/stages/`.
**Depends on:** nothing (מקבילי ל-T1).

### T3 — Trigger + wire into StarterToggle
**Goal:** טריגר הסבר ליד ה-label (44px target) שפותח את ה-`BottomSheet` עם התוכן (תמונה + צ׳קליסט). מחרוזות ב-`lib/strings.ts`.
**Files:** `components/bake/starter-toggle.tsx`, `lib/strings.ts`
**Depends on:** T1, T2.

<Tech Lead מסיים פירוק ואישור.>
