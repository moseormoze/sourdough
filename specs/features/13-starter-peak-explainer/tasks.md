# Tasks: Starter Peak Explainer (Feature 13)

> **סטטוס:** Tech Lead — מאושר לבנייה
> **Design:** `specs/features/13-starter-peak-explainer/design.md` ✓

---

## T1 — `BottomSheet` primitive

**Branch:** `feature/13-starter-peak-explainer` (כבר פתוח)
**Files:**
- `components/ui/bottom-sheet.tsx` — new
- `components/ui/bottom-sheet.test.tsx` — new

**Goal:** פּרימיטיב גנרי לשימוש חוזר. Props: `open`, `size?: "peek"|"full"`, `title?`, `onClose`, `children`.

**Acceptance:**
- [ ] peek = 56svh, full = 88svh
- [ ] Scrim: `rgba(31,26,20,0.45)` + `backdrop-blur-[2px]`, z-sheet (50)
- [ ] Drag-handle: 36×4px pill, מעלה `bg-line`, מגיב ל-drag
- [ ] Spring enter 300ms, ease-in exit 200ms
- [ ] Dismiss: drag ≥80px OR velocity >0.5px/ms → `onClose()`
- [ ] Snap-back: spring 250ms אם <80px ו-velocity ≤0.5
- [ ] Escape → `onClose()`
- [ ] Tap scrim → `onClose()`
- [ ] Focus trap (Tab/Shift+Tab), focus חוזר לטריגר בסגירה
- [ ] `prefers-reduced-motion`: opacity-only 150ms, ללא translateY
- [ ] Body scroll lock while mounted
- [ ] כל הבדיקות עוברות

**Tests cover:** open/close state, scrim click, Escape, focus trap, peek vs full class.

---

## T2 — Comparison image asset

**Branch:** `feature/13-starter-peak-explainer`
**Files:** `public/stages/starter-peak-comparison.jpg` — new

**Goal:** תמונת השוואה 3-פריים (שטוח → בשיא → קרס), prompt מוכן ב-`design.md`.

**Steps:**
1. הרץ `/nb2-prompt` עם ה-prompt מ-design.md
2. קבל אישור ויזואלי מהמשתמש
3. שמור ב-`public/stages/starter-peak-comparison.jpg`

**Acceptance:**
- [ ] תמונה קיימת ב-`public/stages/`
- [ ] פורמט JPG, ~900×300px (יחס 3:1)
- [ ] תוויות עבריות: "לפני" / "בשיא" / "אחרי"

**Depends on:** nothing (מקבילי ל-T1)

---

## T3 — `StarterPeakSheet` + wire into `StarterToggle`

**Branch:** `feature/13-starter-peak-explainer`
**Files:**
- `components/bake/starter-peak-sheet.tsx` — new
- `components/bake/starter-toggle.tsx` — modified (trigger + state)
- `lib/strings.ts` — modified (8 keys חדשים ב-`starterGate`)

**Goal:** טריגר "מה זה בשיא?" ב-label row של StarterToggle, פותח StarterPeakSheet שיושבת על BottomSheet.

**Acceptance:**
- [ ] Chip "מה זה בשיא?" גלוי ב-label row, גובה ויזואלי ~32px
- [ ] Touch target 44×44px דרך `::before` overlay
- [ ] `active:scale-[0.97]` על ה-chip
- [ ] Chip opens sheet, scrim/drag/Escape סוגרים
- [ ] StarterPeakSheet: תמונת השוואה (180px) + 4 סימנים
- [ ] כל copy בעברית דרך `strings.starterGate.*`
- [ ] `bake-planner-screen.tsx` ללא שינוי
- [ ] RTL: chip מופיע משמאל ל-label (אחרי בסדר DOM, לפני בקריאה RTL)

**Depends on:** T1 (BottomSheet), T2 (תמונה)

---

## סדר ביצוע

```
T1 (BottomSheet) ─┐
T2 (image)       ─┴─→ T3 (wire) → PR → Review
```

T1 ו-T2 מקבילות. T3 רק אחרי שניהם.
