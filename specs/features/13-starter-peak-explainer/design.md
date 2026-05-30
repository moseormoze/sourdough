# Design: Starter Peak Explainer

> **סטטוס:** ממתין לאישור Brief לפני כניסה לשלב Designer. אל תמלא לפני אישור.

## Screens Affected

- **Bake Planner** ([`bake-planner-screen.tsx`](../../../components/bake/bake-planner-screen.tsx)) — ללא שינוי מבני; הטריגר מתווסף בתוך רכיב הטוגל
- **StarterToggle** ([`starter-toggle.tsx`](../../../components/bake/starter-toggle.tsx)) — מתווסף טריגר הסבר ליד ה-label

## Components

- `BottomSheet` (חדש, `components/ui/`) — פּרימיטיב גנרי לשימוש חוזר
- טריגר הסבר (chip/אייקון) — בתוך `StarterToggle`
- תוכן ה-sheet — תמונת השוואה + צ׳קליסט

<פרטי peek height, spring values, focus trap, ו-prompt הוויזואל ימולאו בשלב Designer.>
