# Design: טיימר אחד

מקורות: [`brief.md`](./brief.md) · כרטיס ה־DS ״טיימר — מוקטן ופתוח״ ·
[`language.md`](../30-redesign-rollout/language.md) ·
[`ui-playbook.md`](../../../ui-playbook.md) ·
[`context/design-system.md`](../../../context/design-system.md)

## ההחלטה המרכזית — הכיוון מתהפך

הברנץ׳ הישן של feature 27 תכנן **למחוק את `AutolyseTimer`** ולהשאיר את
‏`OptionalTimer`. בדיקת הקוד מראה שזה הכיוון ההפוך מהנכון:

| | `AutolyseTimer` (שלב 2) | `OptionalTimer` (3 קריאות) |
|---|---|---|
| משטח | כרטיס `rounded-[2rem]`, ‏charcoal בריצה / glass ב־idle+סיום | פיל אחד, בלי charcoal |
| ערך | ‏`font-mono text-display-lg tabular-nums` | ‏`text-lg` בתוך פיל |
| בקרות | עגולות `size-11` (44px), פעולה ראשית + עריכה | אייקונים קטנים בשורה |
| בחירת זמן | ‏`BottomSheet` + `DurationWheel` | אין — מתחיל בזמן קבוע |
| עריכה בזמן ריצה | **קיימת** ‏(`openEdit` + `saveRemainingTime`) | אין |
| ‏a11y | ‏`role="status"` + `aria-live="polite"` | אין הכרזה |

**כרטיס ה־DS תואם את `AutolyseTimer`, לא את `OptionalTimer`** — הוא כמעט בוודאות
נגזר ממנו. לכן: **מקדמים את שלב 2 לרכיב המשותף ומוציאים את `OptionalTimer`
משימוש.** ‏`OptionalTimer` הוא הצורה שלפני הרידזיין.

**מה זה חוסך:** הצורה, הגלגל, ה־sheet, ההכרזות, יעדי המגע ומיתוג charcoal/glass
כבר קיימים ונבדקים. העבודה היא הכללה + התנהגות הניווט, לא בנייה מאפס. **וזה גם
מסביר למה חשוב לא למחוק:** מחיקת `AutolyseTimer` הייתה מוחקת את עריכת הזמן בזמן
ריצה — היכולת שהמשתמש אישר ב־2026-08-06.

## Screens Affected

- **מסך שלב** ‏(`/bake/stage/[n]`) — שלב שנושא טיימר מציג את הכרטיס המלא; שלב
  שרק מציצים בו מציג את השורה הנוסעת. ניווט מפריד התחייבות מהצצה.
- **שלב 2 (אוטוליזה)** — התוכן לא נוגע; הקונכייה נעשית משותפת.
- **שלבים 1, 4, 7, 8, 9, 10, 11** — עוברים מ־`OptionalTimer` לכרטיס המשותף.
- **מסך הבית** — ‏`HomeBakeStatusView` מציג את אותה צורה, תצוגה בלבד.

## Components

### New

- **`BakeTimer`** — הרכיב המשותף היחיד, שלוש וריאציות:

  ```ts
  interface BakeTimerProps {
    durationSeconds: number;
    startedAt: number | null;        // epoch ms של המקטע הנוכחי
    elapsedSeconds: number;
    options: readonly TimerOption[]; // עצירות הגלגל — רשימת השלב
    copy: TimerCopySlots;            // idleHint/setupHint פר־שלב
    variant: "stage" | "travelling" | "status";
    stageLabel?: string;             // ל־travelling: איזה שלב מחזיק אותו
    onStart?: (seconds: number) => void;
    onPause?: () => void;
    onResume?: () => void;
    onReset?: () => void;
    onSetRemaining?: (seconds: number) => void;
  }

  interface TimerOption { seconds: number; recommended?: boolean }
  ```

  | variant | משטח | בקרות | איפה |
  |---|---|---|---|
  | `stage` | כרטיס hero — charcoal בריצה, glass ב־idle/סיום | הכול: start, ‏pause/resume, ‏reset, ‏edit | השלב שמחזיק את הטיימר |
  | `travelling` | שורה charcoal **דקה** — לא hero | ‏pause/resume בלבד | שלב שמציצים בו |
  | `status` | כמו היום בבית (כהה, בלי כרטיס) | **אין** | מסך הבית |

- **`TimerProgress`** — פס התקדמות אמיתי, מחליף את `TimerSignal`. גובה 3px,
  מסילה `bg-paper/20`, מילוי **`bg-paper` מונוכרום** (הכרעת ה־orange, ב׳),
  לפי `secondsLeft / durationSeconds`. **בלי spring** (‏ui-playbook §4: לא
  לקפיץ progress bars) — הרוחב מתעדכן בשנייה.

- **`CommitWhileRunningDialog`** — על `Dialog` הקיים ב־ambient (שעשה opt-in
  ב־#98). מציג את הזמן שנותר; ביטול משמר טיימר **ושלב**.

### Modified

> **⚠️ בוטל 2026-08-06 (המשתמש).** ההגבלה לעצירות מוגדרות **מבוטלת**: הגלגל נשאר
> **שתי עמודות גלילה חופשיות — שעות ודקות — והדקות מדויקות (0–59)**. אין רשימת
> אפשרויות ואין הגבלת טווח. ההנמקה שלמטה הייתה המלצה שלי, לא דרישה מהקוד, והיא
> לקחה שליטה מהאופה בלי צורך אמיתי. מיושם ב־PR #107; ‏#106 נסגר.

- **`DurationWheel`** — נשאר **עמודה כפולה חופשית**; הדקות עוברות מצעדי 5
  ל**כל דקה (0–59)**. נשאר: זכוכית, פס מרכזי מודגש, דהייה למעלה/למטה,
  ‏`role="listbox"`/`role="option"`/`aria-selected`, ‏`snap-y snap-mandatory`,
  שורות 56px, ‏`motion-reduce`. יוצא: פיצול שעות/דקות, המפריד `:`, וה־`testid`
  הקשור לאוטוליזה. הערכים נשארים `dir="ltr"`.
- **`HomeBakeStatusView`** — מציג `BakeTimer variant="status"`.
- **`stage-screen.tsx`** — מפריד התחייבות מהצצה; מרנדר את הווריאנט הנכון.
- **`use-active-bake.ts`** — ‏`advanceTo` מתפצלת (ראה User Flow).

### Removed

- **`OptionalTimer`** ושלוש הקריאות אליו.
- **`TimerSignal`** (ה־SVG הדקורטיבי) — מוחלף ב־`TimerProgress`.
- **`AutolyseTimer`** כשם — נעשה `BakeTimer`. הכללה, לא מחיקת התנהגות.

## User Flow

### פיצול `advanceTo` — לב הפיצ׳ר

```
היום:   advanceTo(n)  →  currentStage=n  +  איפוס שלושת שדות הטיימר
        משמשת גם ל״הבא״ (stage-screen:126) וגם ל״חזרה״ (:140)  ⇒  אובדן שקט

חדש:    commitTo(n)   →  currentStage=n  +  סיום הטיימר   ["ההמתנה נגמרה"]
        viewStage(n)  →  ניווט תצוגה בלבד  +  הטיימר ממשיך  ["הצצה"]
```

`viewStage` אינו נוגע ב־`timerStartedAt` / `timerElapsedSeconds` /
‏`timerDurationSeconds`. **מי מחזיק את הטיימר** נגזר ממי שהתחיל אותו ולא
מ־`currentStage`, ולכן `resolveCurrentStageTimer` צריך להשתחרר מהתנאי
‏`stage.n !== activeBake.currentStage` — שדה מחזיק מפורש או נגזרת, החלטת
Tech Lead.

### התחייבות קדימה

```
טיימר רץ?
├─ לא / נגמר  →  commitTo(n+1)                       [בלי דיאלוג]
└─ כן         →  CommitWhileRunningDialog
                 ├─ אישור  →  commitTo(n+1)
                 └─ ביטול  →  נשאר בשלב, הטיימר ממשיך
```

### הצצה

```
viewStage(m)  →  השלב m מוצג
              →  BakeTimer variant="travelling" עם הטיימר של השלב המחזיק
              →  אין start / reset / edit מכאן  (מונע גניבת הסלוט היחיד)
              →  חזרה לשלב המחזיק  →  variant="stage", הזמן רציף
```

## States

- **Loading** — אין מצב חדש; הטיימר נגזר מ־`activeBake` שכבר נטען. לפני
  שה־bake הוכרע לא מרנדרים טיימר, כדי שלא תהיה קפיצה.
- **Idle** — כרטיס glass: אייקון באריח, כותרת, ‏`idleHint` פר־שלב, כפתור
  ‏`inset` ברוחב מלא שפותח את הגלגל.
- **Running** — כרטיס charcoal: זמן `display-lg` mono, ‏`TimerProgress`,
  ‏pause + edit.
- **Paused** — זהה, ‏play במקום pause, הפס קפוא.
- **Finished** — כרטיס glass ב־sage (כמו היום): ״הסתיים״, ‏reset + edit.
- **Travelling** — שורה charcoal דקה: תווית השלב המחזיק, זמן mono קטן יותר,
  ‏pause/resume. **אינה מוצגת** כשאין טיימר רץ.
- **Status (בית)** — כמו היום, בלי בקרות.

## Interaction Specs

- **מכונת מצבים (§1)** — הבקרות העגולות משתמשות ב־`pressable` הקיים
  ‏(`isPressed`). הגלגל הוא scroll-snap ולא drag ידני, ולכן `isDragging` אינו
  חל — **אבל יש פער אמיתי:** האפשרויות הן `<button>` ובמקביל יש `onScroll` עם
  settle של 100ms, כך שהקשה מיד אחרי גלילה יכולה לבחור ערך שגוי. **דרוש guard
  בנוסח `justFinishedScroll`** (המקבילה ל־`justFinishedDrag`, ‏200ms).
- **‏Press (§2)** — 120ms ease-out; ‏`scale(0.97)` לכפתורים עגולים.
- **עקומות (§5)** — כניסת ה־sheet 250ms spring; ‏press 120ms;
  ‏`TimerProgress` **לא** spring (§4).
- **יעדי מגע (§10)** — בקרות `size-11` = 44px ✓; שורות הגלגל 56px ✓; השורה
  הנוסעת שומרת 44px לכפתור ה־pause שלה.
- **‏Carry-over (§8)** — *loading*: אין (מקומי ומיידי); *feedback*: הופעת השורה
  הנוסעת בהצצה והפס שמתקדם; *cleanup*: השורה נעלמת בסיום או באיפוס, ודגלי
  press מתאפסים.
- **‏reduced motion (Known Gap #2)** — הגלגל כבר `motion-reduce:transition-none`;
  להחיל גם על ה־sheet ועל הפס.
- **‏RTL (§11)** — הזמן והערכים `dir="ltr"` בתוך `.num`; תוויות עבריות;
  properties לוגיים בלבד; אין אייקון כיווני חדש.

## Optimistic / Sync Notes

לא חל — הכול מקומי ‏(`localStorage`), בלי רשת ובלי סנכרון: אין spinner ואין
rollback. **תאימות לאחור:** בייק שבו `timerDurationSeconds` חסר או `null` נטען
כמו היום, בלי מיגרציה.

## Locale / Direction Notes

### קופי קיים שנשמר כלשונו (שינוי שם מפתח בלבד)

מ־`strings.bake.autolyseTimer.*` ל־namespace גנרי: ‏`heading`, ‏`setupTitle`,
‏`editTitle`, ‏`editHint`, ‏`start`, ‏`saveTime`, ‏`timeRemaining`, ‏`edit`,
‏`pause`, ‏`resume`, ‏`reset`, ‏`running`/`paused`/`finished`.

### קופי חדש — `COPY_TBD — user`

1. **`idleHint` פר־שלב.** הקיים אוטוליזה־ספציפי (״אחרי שכל הקמח רטוב והקערה
   מכוסה…״) ואינו מכליל. **תוכן:** מה מצדיק טיימר בשלב, ומה קורה בסופו.
   **אורך:** 1–2 שורות. שלבים: 1, 4, 7, 8, 9, 10, 11.
2. **`setupHint` פר־שלב.** הקיים אומר ״בדרך כלל מומלץ 30–60 דקות״ — נכון
   לאוטוליזה בלבד. **תוכן:** למה הטווח, ומה ברירת המחדל המומלצת.
3. **דיאלוג התחייבות בזמן ריצה** — חדש לגמרי: כותרת; משפט שמשלב את הזמן שנותר;
   תווית אישור; תווית ביטול. **מטרה:** להבהיר שממשיכים לפני שההמתנה נגמרה, בלי
   להאשים. **אילוץ:** הזמן מבודד כיוונית בתוך משפט עברי.
4. **תווית השלב בשורה הנוסעת** — למשל ״הטיימר של <שלב>״. **אילוץ:** נכנס
   לשורה אחת ב־320px.
5. **מנסח אפשרות אחד לגלגל** שמכסה דקות ושעות (מחליף
   ‏`durationOption`/`hoursOption`): ‏״45 דקות״ מול ״12 שעות״.
6. **‏`recommended`** — איך מסומנת ברירת המחדל בגלגל (הישן השתמש ב״מומלץ״).

**הועלה למשתמש במפורש:** כן — הרשימה הזו, בתשובה של 2026-08-06.

### מספרים בכיוון מעורב

הזמן ‏(`04:45`), התוויות ‏(`45 דקות`), והזמן בתוך משפט הדיאלוג — כולם `.num`
עם `dir="ltr"`.

## Design System Impact

1. **כרטיס הטיימר חסר לגמרי ב־`ds/build.mjs`.** הכרטיס קיים בפרויקט ״כיכר —
   שפת העיצוב״, אבל למחולל יש רק caption שמזכיר טיימר על charcoal. זו סטייה
   מכלל ״מפרט + מחולל + sync באותו PR״. **הפיצ׳ר מוסיף את הכרטיס למחולל**
   (מוקטן, פתוח, וארבעת המצבים) ומריץ DesignSync.
2. **למילון אין שורות טיימר** — יש שורה ל־`BakeTimeline` בלבד. נוספות שורות:
   כרטיס הטיימר (4 מצבים), השורה הנוסעת, הגלגל, ופס ההתקדמות.
3. **‏`TimerProgress` הוא פריט מילון חדש** — פס התקדמות על charcoal.

## הכרעת ה־orange — **אפשרות ב׳, אושרה 2026-08-06**

**פס ההתקדמות מונוכרום** ‏(`bg-paper/20` מסילה, ‏`bg-paper` מילוי) ונקודת
״עכשיו/מוכן״ בציר הזמן **שומרת את ה־orange היחיד במסך**. אין תנאי חוצה־רכיבים,
ואין שינוי ב־`BakeTimeline`. **כרטיס ה־DS צריך תיקון** — הפס הכתום שבו אינו
החוזה; התיקון נכנס עם הוספת הכרטיס למחולל.

השיקול המקורי, לתיעוד:

**מי מקבל את ה־orange היחיד במסך שלב שבו טיימר רץ?**

‏`language.md` part ג: ‏״מותר: נקודת ׳עכשיו/חי׳ **אחת למסך** (ציר זמן,
progress, טבעת טיימר עתידית)״. כרטיס ה־DS מראה **פס התקדמות כתום**; באותו מסך
נמצא גם ציר הזמן, שהמילון הקצה לו ״נקודת ׳עכשיו/מוכן׳ אחת orange״. שניהם
מתחרים על אותו תקן, ורק אחד מותר.

| | א׳ — הטיימר מקבל | ב׳ — ציר הזמן שומר (**מומלץ**) |
|---|---|---|
| בזמן שטיימר רץ | פס כתום; נקודת הציר יורדת למונוכרום | פס `bg-paper` מונוכרום; הנקודה נשארת כתומה |
| כשאין טיימר | הנקודה חוזרת לכתום | ללא שינוי |
| נאמנות לכרטיס | גבוהה | הכרטיס צריך תיקון |
| עלות | תנאי בשני רכיבים | אין תנאי |

**המלצה — ב׳.** ה־charcoal עצמו כבר אומר ״זה מה שקורה עכשיו״, ולכן הפס לא צריך
צבע כדי להיקרא; נקודת הציר כבר בפרודקשן ומתועדת במילון; וכל תנאי חוצה־רכיבים
הוא בדיוק סוג הכלאיים שהמילון בא למנוע. אם בוחרים א׳ — הכרטיס נשאר כפי שהוא,
ויש לתעד את הורדת נקודת הציר במילון באותו PR.

*(‏`TimerSignal` הנוכחי כבר תיעד את ההיגיון של ב׳: ״מונוכרום על charcoal —
הצבע החי היחיד במסך הוא נקודת ההתקדמות״.)*
