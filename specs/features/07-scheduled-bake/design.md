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
