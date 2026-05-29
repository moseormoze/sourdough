# Tasks: Scheduled Bake

## Task List

---

### T1 — חילוץ `useDateTimePicker` hook

**Goal:**
הלוגיקה של day pills + hour stepper קיימת היום ב-`starter-schedule-step.tsx`. `BakeSchedulerSheet` צריך את אותה לוגיקה. חילוץ ל-hook נמנע כפילות ומאפשר שימוש חוזר.

**Files likely touched:**
- `lib/hooks/use-date-time-picker.ts` — חדש
- `components/bake/starter-schedule-step.tsx` — ישתמש ב-hook במקום בלוגיקה ישירה

**Hook API:**
```typescript
useDateTimePicker({ minReadyAt: Date; now: Date })
// → { availableDays, dayIdx, selectedDay, effectiveHour, minHour,
//     handleDaySelect, adjustHour, targetAt, isValid, totalProcessHours }
```

**Test strategy:**
הtests הקיימים של `starter-schedule-step.test.tsx` (9 tests) חייבים לעבור ללא שינוי אחרי ה-refactor. אין צורך בtests חדשים — ה-hook מכוסה דרכם.

**Depends on:** —

**Done when:**
- [ ] Tests written and passing
- [ ] `starter-schedule-step.tsx` משתמש ב-hook, ה-9 tests הקיימים עוברים
- [ ] `use-date-time-picker.ts` מיוצא ומוכן לשימוש חוזר

---

### T2 — `StarterToggle` component

**Goal:**
Segmented control עברי "כן" / "לא" עם §1 state machine (isPressed per option) ו-§2 press feedback. ניתן לשימוש חוזר בכל מקום שצריך binary toggle עם שתי אפשרויות.

**Files likely touched:**
- `components/bake/starter-toggle.tsx` — חדש
- `components/bake/starter-toggle.test.tsx` — חדש

**Props:**
```typescript
interface StarterToggleProps {
  value: boolean; // true = "כן"
  onChange: (value: boolean) => void;
  label: string;  // "הסטארטר כבר בשיא?"
}
```

**Interaction specs:**
- isPressed per option — clear on pointerup
- scale(0.965) + ink-06 bg, 120ms ease-out
- Active option: bg-ink text-paper; Inactive: bg-paper text-ink-2 border-line
- RTL: "כן" מימין, "לא" משמאל
- Touch target ≥44px height

**Test strategy:**
- מרנדר עם label
- לחיצה על "לא" קוראת onChange(false)
- לחיצה על "כן" קוראת onChange(true)
- הoption הנכון מסומן כ-active

**Depends on:** —

**Done when:**
- [ ] Tests written and passing
- [ ] Press feedback עובד (isPressed state)
- [ ] RTL תקין

---

### T3 — `BakeTimeline` component

**Goal:**
תצוגת ציר הזמן עם שורות action ויעד סיום. מציג שעות ותאריכים ספציפיים (לא relative). שתי וריאציות: עם/בלי שורת האכלת סטארטר.

**Files likely touched:**
- `components/bake/bake-timeline.tsx` — חדש
- `components/bake/bake-timeline.test.tsx` — חדש

**Props:**
```typescript
interface BakeTimelineProps {
  feedAt?: Date;       // undefined = starter already ready
  bakeStartAt: Date;   // = levainStart = targetAt - bakeDurationSecs
  breadReadyAt: Date;  // = targetAt
  now: Date;
}
```

**Rendering rules:**
- `feedAt` קיים → שורה 1: "האכלת סטארטר" + day label + time
- תמיד → שורה 2 (או 1 אם אין feed): "התחל לאפות" + day label + time
- תמיד → קו מפריד + "לחם מוכן ✓" + day label + time
- Day labels: היום/מחר/מחרתיים → shorthand; אחר → DAY_FMT
- Day label מוצג רק אם שונה מהשורה הקודמת (או תמיד — לבחינה ב-engineer)
- Times: `dir="ltr"` span, font-mono

**Animation (§8):**
- כשה-props משתנים, הcomponent מרנדר עם fade (נעשה ע"י key prop ב-parent, לא בתוך הcomponent עצמו)

**Test strategy:**
- renders עם feedAt → מציג "האכלת סטארטר"
- renders בלי feedAt → לא מציג "האכלת סטארטר"
- מציג "לחם מוכן" תמיד
- day labels נכונים (היום/מחר/מחרתיים)

**Depends on:** —

**Done when:**
- [ ] Tests written and passing
- [ ] שתי וריאציות מרנדרות נכון
- [ ] RTL תקין

---

### T4 — `BakeSchedulerSheet` — המסך המרכזי

**Goal:**
Bottom sheet שמחליף את `BakeConfirmSheet`. משלב את כל החלקים: StarterToggle, useDateTimePicker, BakeTimeline, BakingMethodSelector, TempInput. מנהל את כל ה-state ומחשב את הtimeline.

**Files likely touched:**
- `components/bake/bake-scheduler-sheet.tsx` — חדש
- `components/bake/bake-scheduler-sheet.test.tsx` — חדש
- `lib/strings.ts` — הוספת section `bakeScheduler`

**Props:**
```typescript
interface BakeSchedulerSheetProps {
  recipe: Recipe;
  imageUrl?: string;
  onConfirm: (recipe: Recipe, bakingMethod: BakingMethod) => void;
  onClose: () => void;
}
```
(שים לב: ללא `onEdit` — הbutton ערוך מתכון לא עובר לScheduler)

**State:**
```typescript
starterReady: boolean     // default: true
dayIdx / hour / temp      // via useDateTimePicker
bakingMethod: BakingMethod  // default: "closed-vessel"
```

**Derived:**
```typescript
minReadyAt = calculateMinReadyAt(temp, now)
// כש-starterReady=false, minReadyAt כולל peakSecs
// כש-starterReady=true, minReadyAt = now + bakeDurationSecs
```

**Strings חדשים ב-`bakeScheduler`:**
```typescript
starterLabel: "הסטארטר כבר בשיא?"
starterYes: "כן"
starterNo: "לא"
timelineLabel_feed: "האכלת סטארטר"
timelineLabel_start: "התחל לאפות"
timelineLabel_done: "לחם מוכן"
startButton: "התחל בייק"
```
(שאר הstrings — scheduleReadyLabel, schedulePillEarliest, scheduleContextLine — נלקחים מ-`starterGate` הקיים)

**Sheet mechanics:**
- כניסה: `translateY(100%) → 0`, spring `cubic-bezier(0.34,1.56,0.64,1)` 300ms
- Backdrop: bg-ink/40 + blur, click לסגור
- Escape key לסגור
- Focus trap (sheetRef.current?.focus())
- max-h-[92dvh] overflow-y-auto כמו confirm sheet הקיים

**Timeline animation (§8):**
- `key={targetAt.getTime()}` על `BakeTimeline` → React re-mounts → `animate-in fade-in` CSS class נותן fade

**Test strategy:**
- מרנדר ופותח sheet
- toggle "לא" → minimum time עולה
- בחירת יום ושעה → timeline מתעדכן
- לחיצה על "התחל בייק" → onConfirm נקרא עם method נכון
- Escape → onClose
- backdrop click → onClose
- closed-vessel ברירת מחדל

**Depends on:** T1, T2, T3

**Done when:**
- [ ] Tests written and passing
- [ ] כל ה-states עובדים
- [ ] RTL תקין, touch targets ≥44px

---

### T5 — חיבור ל-chooser + מחיקת BakeConfirmSheet

**Goal:**
מחבר את הscreenflow החדש: chooser → BakeSchedulerSheet. מוחק את BakeConfirmSheet ואת כל הreferences אליו.

**Files likely touched:**
- `components/bake/chooser-screen.tsx` — מחליף `BakeConfirmSheet` ב-`BakeSchedulerSheet`, מסיר import של `onEdit`
- `components/bake/chooser-screen.test.tsx` — מעדכן tests שבדקו confirm sheet
- `components/bake/bake-confirm-sheet.tsx` — נמחק
- `components/bake/starter-gate-step.tsx` + `chooser-screen.tsx` — מסיר step="scheduling" / "gate" flow אם נותר dead code

**שינויים ב-chooser-screen:**
- `handleSelect` פותח `BakeSchedulerSheet` במקום `BakeConfirmSheet`
- `handleEdit` — מוסר (לא קיים בscheduler)
- State `confirmingRecipe` → נשאר (עדיין שומר את המתכון שממתין לconfirm)

**שים לב:** ה-gate step ("הסטארטר בשיא?") ב-`chooser-screen.tsx` נשאר בינתיים — BakeSchedulerSheet מכיל את ה-toggle בפנים, אבל ה-gate step קיים גם בflow הנפרד. זה יידרש cleanup בfeature עתידי (discovery 05).

**Test strategy:**
- כל 17 ה-tests הקיימים של chooser-screen עוברים (או מתעדכנים)
- test חדש: לאחר בחירת מתכון, `BakeSchedulerSheet` מוצג (לא `BakeConfirmSheet`)

**Depends on:** T4

**Done when:**
- [ ] Tests written and passing
- [ ] `bake-confirm-sheet.tsx` נמחק
- [ ] `npx vitest run` עובר (כל ה-suite)

---

## Build Order

```
T1 ──┐
T2 ──┼──► T4 ──► T5
T3 ──┘
```

T1, T2, T3 — עצמאיים, אפשר לעבוד עליהם בסדר כלשהו.
T4 — מחכה ל-T1+T2+T3.
T5 — מחכה ל-T4.

## Risks

- **`calculateMinReadyAt` עם `starterReady=true`**: הפונקציה הקיימת מניחה שהסטארטר צריך להיאכל. כש-starterReady=true, ה-minimum הוא `now + bakeDurationSecs` בלי peakSecs. צריך לוודא שהחישוב נכון או להוסיף פרמטר ל-`calculateMinReadyAt`.
- **כפל שמות**: `BakeTimeline` קיים גם ב-`bake-confirm-sheet.tsx` (internal component). עם מחיקת ה-confirm sheet ב-T5 הבעיה נעלמת — אבל T3 ו-T4 צריכים לרוץ לפני T5.
- **chooser-screen tests**: 17 tests כרגע בוחנים את הconfirm sheet. חלקם יצטרכו שינוי ב-T5 — לתעד מה משתנה ולא למחוק coverage.
