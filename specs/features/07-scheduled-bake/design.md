# Design: Scheduled Bake

## Screens Affected

- `chooser-screen.tsx`: אחרי בחירת מתכון → פותח `BakeSchedulerSheet` במקום `BakeConfirmSheet`
- `BakeConfirmSheet`: נשאר בקוד אבל לא בשימוש עוד; נמחק אחרי ה-feature משתחרר ועובר QA
- חדש: `BakeSchedulerSheet` — bottom sheet שמחליף את ה-confirm sheet

## Components

### New
- `BakeSchedulerSheet` — המסך המרכזי. bottom sheet, מקבל `recipe`, `imageUrl`, `onConfirm(recipe, method)`, `onClose`.
- `BakeTimeline` — תצוגת ציר הזמן (1–2 שורות + יעד). מקבל `feedAt?: Date`, `bakeStartAt: Date`, `breadReadyAt: Date`, `now: Date`. מרנדר שורות שונות לפי `feedAt`.
- `StarterToggle` — segmented control עברי "כן" / "לא" עם §1 state machine.

### Reused
- `TempInput` — קיים, ללא שינוי
- `BakingMethodSelector` — קיים, ללא שינוי
- לוגיקת day pills + hour stepper — מועברת ל-hook ייעודי `useDateTimePicker` (מחלצים מ-`starter-schedule-step.tsx`)
- `calculateFeedingWindow`, `calculateMinReadyAt`, `bakeDurationSecs` מ-`lib/bake-timing.ts`

### Modified
- `chooser-screen.tsx`: `handleSelect` פותח `BakeSchedulerSheet` במקום `BakeConfirmSheet`

## User Flow

```
בחירת מתכון (chooser)
  ↓
BakeSchedulerSheet נפתח (bottom sheet, spring entrance §4)
  ↓
[ברירת מחדל: הסטארטר מוכן = כן, יעד = הכי מוקדם אפשרי]
  ↓
אופה בוחר סטטוס סטארטר → minimum time מתעדכן
אופה בוחר יום + שעה → timeline מתעדכן (§8 animation)
אופה משנה טמפ׳ → timeline מתעדכן
  ↓
אופה בוחר שיטת אפייה
  ↓
"התחל בייק" → saveActiveBake + navigate /bake/stage/1
```

## Layout — BakeSchedulerSheet (מלמעלה למטה)

```
┌─────────────────────────────────────┐
│         ▬  (drag handle)            │
│                                     │
│  [תמונה קטנה]  כפרי קלאסי          │  ← recipe header
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  הסטארטר כבר בשיא?                 │
│  [ כן ●  |  לא  ]                  │  ← StarterToggle
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  מתי הלחם צריך להיות מוכן?         │
│  בייק מחמצת לוקח כ-X שעות          │  ← context line
│                                     │
│  [מחרתיים] [יום ב'] [יום ג'] ...   │  ← day pills
│          הכי מוקדם ↑               │
│                                     │
│  [  +   |    08:00    |   -  ]      │  ← hour stepper
│                                     │
│  טמפ׳ מטבח  [ + | 25°C | - ]       │  ← TempInput
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [BakeTimeline]                     │  ← timeline card
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  באיזה כלי תאפה?                   │
│  [BakingMethodSelector]             │
│                                     │
│  [ התחל בייק ]                     │  ← CTA
└─────────────────────────────────────┘
```

## BakeTimeline — שתי וריאציות

### כשהסטארטר לא מוכן (2 שורות + יעד)
```
האכלת סטארטר    יום ד׳   21:00
התחל לאפות      יום ה׳   08:00
──────────────────────────────
לחם מוכן  ✓     יום ו׳   10:30
```

### כשהסטארטר מוכן (שורה אחת + יעד)
```
התחל לאפות      יום ה׳   08:00
──────────────────────────────
לחם מוכן  ✓     יום ו׳   10:30
```

### חישוב הערכים
- `bakeStartAt` = `levainStart` = `targetAt - bakeDurationSecs(temp)`
- `feedAt` = midpoint של feedStart/feedEnd מ-`calculateFeedingWindow` (רק אם starter לא מוכן)
- `breadReadyAt` = `targetAt` (מה שהאופה בחר)

### Day labels
- היום, מחר, מחרתיים → Hebrew shorthand
- יתר → `DAY_FMT` (שם יום + תאריך)
- אם feedAt ו-bakeStartAt ביום שונה — מוצג label לכל שורה

## States

- **Initial**: starterReady=true, dayIdx=0 (earliest), hour=minHour, temp=25
- **Starter toggle**: שינוי starterReady → recalculate minReadyAt → reset dayIdx=0, hour=minHour החדש
- **Day/hour change**: recalculate timeline → §8 animate times (crossfade 200ms ease-in-out)
- **Temp change**: recalculate minReadyAt + timeline → same animation
- **Invalid** (לפני minimum): CTA מושבת, alert text
- **Valid**: CTA פעיל

## Interaction Specs

- **State machine §1**: StarterToggle — `isPressed` per option, clear on release
- **Press feedback §2**: day pills scale(0.965) + ink-06 bg, 120ms ease-out; CTA scale(0.97), 120ms
- **Sheet entrance §4**: translateY(100%) → translateY(0), spring `cubic-bezier(0.34, 1.56, 0.64, 1)` 300ms
- **Timeline update §5/§8**: כשהזמנים משתנים — fade out (100ms ease-in) → recalculate → fade in (150ms ease-out); לא layout shift
- **Touch targets §10**: כל כפתור ≥44px height; stepper buttons min-w-touch min-h-touch
- **Drag-to-dismiss**: sheet נסגר ב-swipe down מעל 80px + velocity > 0.3px/ms; snap back עם spring אם לא הגיע ל-threshold

## Optimistic / Sync Notes

`saveActiveBake` הוא synchronous localStorage — אין network. לכן אין צורך ב-optimistic pattern. navigation מיידית אחרי save.

## Locale / Direction Notes

- כל הטקסטים דרך `strings.ts` — אין hard-coded עברית בcomponent
- Day pills: RTL — גלילה מימין לשמאל, ה-pill הראשון מימין
- Timeline: labels בצד ימין, שעות בצד שמאל (RTL natural), times ב-`dir="ltr"` span
- StarterToggle: "כן" בצד ימין (default/primary option), "לא" בצד שמאל

## Design System Impact

- `BakeTimeline` — component חדש וניתן לשימוש חוזר (גם ב-discovery 05)
- `StarterToggle` — segmented control חדש; pattern יתווסף ל-design system אם משמש עוד
- `useDateTimePicker` — hook חדש, מחלץ לוגיקה כפולה מ-`starter-schedule-step.tsx`

## Open Questions

_ריק לפני Tech Lead phase._

---

## Iteration v2 — אחרי QA על ה-sheet (2026-05-29)

ביקורת UX של המשתמש על ה-bottom sheet הובילה לארבעה שינויים. שלושה מומשו; הרביעי (גמישות זמנים) נפתח כ-Discovery נפרד.

### 1. Container: bottom sheet → מסך מלא
ה-sheet רץ ב-92dvh עם 5 סקשנים — חרג מהתבנית (`design-system`: sheet = peek 56% / full 88% לתשובה מהירה או העמקה אחת). הוחלף ב**מסך מלא** עם route ייעודי.

- **חדש**: `app/bake/plan/page.tsx` — route; קורא recipe מ-`pending-plan` (sessionStorage), בורא bake ב-confirm, מנווט ל-`/bake/feed` או `/bake/stage/1`; אם אין pending recipe → redirect ל-`/bake/new`.
- **חדש**: `lib/storage/pending-plan.ts` — handoff חולף (sessionStorage) של ה-`Recipe` הנבחר מה-chooser למסך התכנון. Zod-validated.
- **חדש**: `BakePlannerScreen` — מחליף את `BakeSchedulerSheet` (נמחק). props: `recipe`, `imageUrl?`, `onConfirm(recipe, method, feedAt?, peakAt?)`, `onBack`. sticky footer CTA.
- **שונה**: `chooser-screen.tsx` — `handleSelect` שומר pending recipe + `router.push("/bake/plan")` במקום לרנדר sheet inline. זרימת "החלף בייק" נשארת ב-chooser.

### 2. שדה טמפרטורה → שאלה + hint עונתי
"טמפ׳ מטבח" → **"מה הטמפרטורה בחלל?"** + hint: "חורף 20–24° · קיץ 24–27°".

### 3. ציר זמן: תהליך מלא inline + הפרדת אפייה + צינון מחוץ ליעד
- **כותרת סקשן**: "ציר הזמן של הבייק" + "מתי להתחיל כל שלב".
- ה-timeline מציג עכשיו את **כל השלבים** inline (לא 4 שורות בלבד) — כל שלב עם המשך. חימום התנור (+כלי), הכנסת הבצק, ולחם מוכן הם **שורות נפרדות**.
- **צינון יצא מ"לחם מוכן"**: "לחם מוכן" = יציאה מהתנור. הצינון (~שעה) הוא טיפ נגרר, לא חלק מזמן היעד.
- **מנוע** (`lib/bake-timing.ts`): הוסר `calculateBakeTimeline`/`BakeTimelinePoints`. נוסף `calculateBakeSteps(target, temp, starterReady): BakeStep[]` — רשימת שלבים מסודרת (`feed?`, `levain`, `mix`, `bulk`, `shapeRetard`, `preheat`, `bake`, `ready`) עם `startAt` + `durationSecs`. `bakeDurationSecs` כבר לא כולל צינון. נוסף `COOL_RECOMMENDATION_SECS` + `durationLabel`.
- **`BakeTimeline`** נבנה מחדש: props `steps: BakeStep[]`, `now: Date`. שורה לכל שלב + טיפ צינון.

### 4. גמישות זמנים בעולם האמיתי — Discovery נפרד
המשתמש העלה שלעיתים שלבים נופלים באמצע הלילה ושיש גמישות טבעית בזמנים. נפתח כ-Discovery doc נפרד (לא מומש כאן).
