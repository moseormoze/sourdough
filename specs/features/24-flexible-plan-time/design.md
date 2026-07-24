# Design: Feature 24 — Flexible Plan Time

## Resolved decisions (Discovery gate)
- **עבר רק ב"להתחיל".** מצב "לסיים" שומר על ה-floor העתידי (שעת סיום בעבר בלתי-אפשרית).
- **עבר = מתחילת היום (00:00).** ה-floor במצב עבר יורד ל-`startOfDay(now)` — כל שעה מוקדמת יותר
  היום נבחרת. יום 0 נשאר "היום" (בלי היפוך אינדקסים / churn בבדיקות). תיארוך לאתמול = follow-up.
- **דקות בשני המצבים.** לחיצה על ה-center → הזנת שעה מדויקת.
- **הזנה מדויקת = `<input type="time">` נייטיב.** אפס bundle (tech-stack §constraints — בלי ספריות),
  דקות בחינם, בורר נייטיב במובייל, RTL-safe (תוכן ה-field הוא HH:MM ב-LTR, כמו שאר ה-`.num`).
  נשקל stepper-דקות/wheel ידני — נדחה: יותר קוד/בדיקות, ופחות תואם ל"להקליד 15:34".
- **walkthrough חי לא משתנה** (ראו brief — Out).

## Screens / files affected
- [`lib/hooks/use-date-time-picker.ts`](../../../lib/hooks/use-date-time-picker.ts) — `allowPast`, floor, דקות.
- [`components/bake/bake-planner-screen.tsx`](../../../components/bake/bake-planner-screen.tsx) — center הופך ל-time input; `allowPast` לפי כיוון; תצוגת HH:MM.
- [`components/bake/bake-timeline.tsx`](../../../components/bake/bake-timeline.tsx) — סימון שלב שחלף.
- [`lib/strings.ts`](../../../lib/strings.ts) — aria-label + hint עבר (start mode).
- ללא שינוי: מנוע הזמנים, presets, יחסי שאור.

## Hook — API additions

```
useDateTimePicker({ minReadyAt, now, allowPast=false })
```

- `floorAt = allowPast ? startOfDay(now) : minReadyAt`.
  כל ריצוף היום/שעה וה-`isValid` עוברים מ-`minReadyAt` ל-`floorAt`.
  (`allowPast=false` ⇒ `floorAt === minReadyAt` ⇒ התנהגות "לסיים" זהה להיום. `allowPast` ⇒
  `startOfDay(now)` ⇒ יום 0 עדיין "היום", אבל `minHour` שלו = 0 ⇒ שעות מוקדמות היום נפתחות.)
- `availableDays = getAvailableDays(floorAt, 8)` — יום 0 = היום (כמו היום), 8 ימים קדימה.
- **דקות:** state `minute`; `targetAt = buildTargetDate(day, hour, minute)`.
  - `buildTargetDate(day, hour, minute=0)` — פרמטר דקות חדש (ברירת מחדל 0 → קורא קיים לא נשבר).
  - `setExactTime(hour, minute)` — קובע שעה+דקה, clamp ל-`[floorAt, MAX]`.
  - `adjustHour(±1)` — משמר את הדקה.
  - חושף `effectiveMinute` ו-`timeLabel` (`"HH:MM"`).
- ברירת-מחדל התחלתית ב-`allowPast`: `hour/minute` מ-`now` (נקרא כ״עכשיו", האופה מזיז אחורה).
  ב-`!allowPast`: כמו היום (floor hour, minute 0).

## Planner — the picker row

היום: `[− | HH:00 | +]`. אחרי:

```
[ − ]   [  HH:MM  ]   [ + ]
          ↑ input type=time (natively opens picker; free minutes)
```

- `allowPast = direction === "start"` מוזרם ל-hook. `handleDirection` מנקה preset כרגיל.
- ה-center: `<input type="time" value={timeLabel} onChange=…>` מעוצב כמו התצוגה
  (`font-mono text-body-lg text-ink text-center bg-transparent`, `dir="ltr"`), ממלא את הרוחב.
  onChange → `setExactTime` (מנקה preset).
- ± נשארים ל-nudge שעה; disabled logic לפי `floorAt`/`MAX_HOUR` (שעה בלבד — הדקה נשמרת).
- תצוגה: `HH:MM` (לא עוד `:00`).
- **hint עבר** (רק start): שורת `text-tiny text-ink-3` — "אפשר לבחור גם שעה שכבר עברה, אם התחלתם קודם".

**ui-playbook applied:**
- §10 touch target: ה-center ≥44px (קיים `min-h-touch`); ± כבר `min-h/w-touch`.
- §2 press feedback: לחיצה על ה-center → `scale(0.985)` 120ms ease-out (משטח גדול). על wrapper, כי input נייטיב.
- §8 micro-interaction: feedback = עדכון ה-label; cleanup = איפוס `isPressed`; אין loading (מקומי/סינכרוני).
- §1: tap בלבד (פותח picker) → `isPressed` בלבד, אין drag/spring.
- §5: מעברי צבע/scale ≤120ms. אין מעבר מעל 250ms ⇒ אין נגיעת `prefers-reduced-motion`.

## Timeline — elapsed step

שלב עם `step.startAt < now` (ולא `ready`) = **בוצע**:
- node: מלא `bg-ink-3` (במקום border ריק).
- טקסט label + שעה: `text-ink-3` (מושתק).
- prefix ✓ קטן על ה-label (כמו ל-`ready`, בגוון ink-3).
- סטטי — אין אנימציה (§8: feedback ויזואלי, אין gesture). קו הרכבת ללא שינוי.

## States
- **start, ברירת מחדל:** floor = now−24h, שעה=עכשיו, hint עבר גלוי, דקות פעילות.
- **start, שעת עבר נבחרה:** `isValid` כל עוד `targetAt ≥ now−24h`; שלבים שחלפו = בוצע בציר.
- **end:** ללא שינוי חוץ מדקות; אין hint עבר; floor עתידי נשמר.
- **`!isValid`:** הודעת `tooSoon` כמו היום.

## Design system impact
אין tokens חדשים. משתמש ב-`ink-3`, `accent`, `line`, `min-h-touch` קיימים. אין spring.

## Open questions
אין — כל ההחלטות נסגרו בגייט ה-Discovery.
