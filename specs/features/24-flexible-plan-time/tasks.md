# Tasks: Feature 24 — Flexible Plan Time

Each task = one PR-sized unit, starts with a failing test. Shipped on one feature
branch `feature/24-flexible-plan-time` (two commits, one PR) — end-to-end delivery
authorized by the user (2026-07-24, one-time).

## T1 — Past-time + exact-minute picker (hook + planner)
**Goal:** מצב "להתחיל" מקבל חלון עבר 24 ש׳; לחיצה על ה-center מזינה שעה מדויקת לדקה
בשני המצבים; התצוגה עוברת ל-HH:MM.
**Files:** `lib/hooks/use-date-time-picker.ts` (+test), `components/bake/bake-planner-screen.tsx` (+test), `lib/strings.ts`.
**Test strategy (first):**
- hook: `allowPast` מוסיף ימי-עבר עד `now−24h`; `!allowPast` ⇒ רשימת ימים/floor זהים להיום;
  `setExactTime(h,m)` משתקף ב-`targetAt`; `adjustHour` משמר דקה; `isValid` מול `floorAt`.
- planner: center הוא `input[type=time]`; שינויו קורא `setExactTime` ומנקה preset; במצב start
  אפשר שעה שעברה; במצב end ה-floor העתידי נשמר; התצוגה HH:MM.
**Done when:**
- [x] hook: `allowPast`, דקות, `setExactTime`, `timeLabel` — 10 בדיקות עוברות. (chose `startOfDay(now)` floor, לא חלון 24 ש׳ — ראו design.)
- [x] planner: `allowPast = direction==="start"`; time input עם press feedback (§2) ו-44px (§10); hint עבר. 32 בדיקות עוברות.
- [x] `buildTargetDate` תואם-אחורה (דקות ברירת-מחדל 0); קוראים קיימים לא נשברים.
- [x] כל בדיקות הפלאנר + hook עוברות; `tsc` נקי; RTL לוגי בלבד; מאומת בדפדפן (05:00 עבר + 15:34 דקות).

## T2 — Elapsed steps marked done in the timeline
**Goal:** שלב שזמנו עבר (`startAt < now`) מוצג כ״בוצע" (node מלא, טקסט ink-3, ✓) במקום עתידי.
**Files:** `components/bake/bake-timeline.tsx` (+test).
**Test strategy (first):** בהינתן steps עם `startAt` בעבר ו-`now` אחרי — הצומת/טקסט מקבלים סימון
"בוצע"; שלב עתידי ללא הסימון; `ready` לא מושפע.
**Done when:**
- [x] סימון elapsed סטטי (node מלא ink-3 + טקסט ink-3 + ✓); `ready` נשאר accent (לא elapsed).
- [x] 12 בדיקות timeline עוברות; `tsc` נקי; RTL לוגי בלבד; מאומת בדפדפן (build/mix/bulk מסומנים בוצע).
