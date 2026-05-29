# Tasks: Starter Readiness Gate

## Task List

### T1 — calculateFeedingWindow utility
**Goal:** פונקציה טהורה שמקבלת זמן מוכנות הלחם + טמפ׳ ומחזירה חלון האכלה + חלון שיא.
**Files:** `lib/bake-timing.ts`, `lib/bake-timing.test.ts`
**Test strategy:** unit tests — ערכים ידועים ב-25°C, edge cases קיץ/חורף, ו-calculateMinReadyAt
**Depends on:** nothing
**Done when:**
- [ ] Tests written and passing
- [ ] `FeedingWindow` type exported
- [ ] `calculateFeedingWindow(targetReadyAt, kitchenTempC)` exported
- [ ] `calculateMinReadyAt(kitchenTempC, now?)` exported

### T2 — Strings for starter gate
**Goal:** כל מחרוזות עברית של הפיצ׳ר ב-strings.ts — ללא hard-code בקומפוננטים.
**Files:** `lib/strings.ts`
**Test strategy:** אין (נבדק ב-T3/T4 כ-snapshot)
**Depends on:** nothing
**Done when:**
- [ ] `strings.starterGate` section added

### T3 — StarterGateStep component
**Goal:** מסך השאלה "יש לך סטארטר בשיא?" עם כרטיס חינוכי + שני כפתורי CTA.
**Files:** `components/bake/starter-gate-step.tsx`, `.test.tsx`
**Test strategy:** renders correctly, onReady/onNotReady called on click, press feedback class present
**Depends on:** T2
**Done when:**
- [ ] Tests written and passing
- [ ] Press feedback (§2 playbook) — scale(0.965), 120ms
- [ ] כפתורים ≥ 56px גובה
- [ ] תמונה `/stages/1-levain.png` בכרטיס החינוכי

### T4 — StarterScheduleStep component
**Goal:** מסך התכנון — day picker, hour stepper, TempInput, FeedingWindowCard.
**Files:** `components/bake/starter-schedule-step.tsx`, `.test.tsx`
**Test strategy:** חישוב מחדש על שינוי טמפ׳, כפתור "הבנתי" מושבת כשהזמן לא תקין, FeedingWindowCard מוצג
**Depends on:** T1, T2
**Done when:**
- [ ] Tests written and passing
- [ ] Day pills + hour stepper functional
- [ ] TempInput הקיים משולב, default 25
- [ ] FeedingWindowCard מציג טווחים (לא נקודות בודדות)
- [ ] כפתור "הבנתי" מושבת כשהזמן מתחת למינימום
- [ ] כל תאריכים דרך `Intl` עם `he-IL`

### T5 — Wire into ChooserScreen
**Goal:** הוספת `step: 'gate' | 'scheduling' | 'choosing'` ל-ChooserScreen.
**Files:** `components/bake/chooser-screen.tsx`, `chooser-screen.test.tsx`
**Test strategy:** initial state = gate, "כן" → choosing, "לא" → scheduling, "הבנתי" → router.back()
**Depends on:** T3, T4
**Done when:**
- [ ] Tests written and passing
- [ ] Initial step הוא תמיד 'gate'
- [ ] מסלול "כן" לא שובר את זרימת הבייק הקיימת (regression test)

## Build Order
T1 → T2 → T3 → T4 → T5

## Risks
- Day/hour picker: מחזור תאריכים מעבר לחצות עשוי לבלבל אם max_hour < min_hour ביום הראשון — לטפל ב-T4
- `adjustDurationSeconds` משתמש ב-BASE_TEMP_C=24; starter peak calibrated ב-25°C — documented ב-T1
