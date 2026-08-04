# Design: פיילוט רידזיין למסך הבית

## Design Goal

חוזה המוצר נעול ב־[brief](./brief.md). העיצוב מחזיר אופה להקשר שמור בלי להפוך
את Home למסך שלב: קנבס אווירתי אחד, מוקד charcoal אחד וניווט משני שקט. הוא אינו
מסיק מוכנות, דחיפות או המלצה ואינו מעתיק timeline, עשן, squiggle או שכבות הדרכה
ממסכי הבייק.

## Screens Affected

- `/`: loading, ‏fresh ו־active/resume.
- `InstallGuideSheet` שנפתח מ־Home: appearance מקומי בלבד.
- `StopBakeDialog` שנפתח מ־Home: appearance מקומי בלבד.
- `FeedbackFab`: ללא רידזיין; Home רק משאיר לו מרווח.

## Canvas and Surface Contract

- `HomeScreen` הוא root מבודד וגליל עם קנבס מקומי:
  `linear-gradient(160deg, #FFF8F1 0%, #FFDDBD 22%, #F7F0E7 55%, #DDEDF2 100%)`.
  הגרדיאנט ממשיך דרך תוכן ארוך ו־safe area; הוא אינו נמצא בתוך כרטיס רגיל.
- רוחב התוכן נשאר `max-w-md`. gutter הוא 20px ב־375px ו־16px עד 340px.
- למעלה נשמרים `safe-area + 20px`. padding התוכן התחתון הוא לפחות
  `calc(9.25rem + env(safe-area-inset-bottom))`: 148px בגודל טקסט בסיסי, והוא
  גדל יחד עם הטקסט כדי להשאיר את היעד האחרון מעל ה־FAB גם ב־200%. אין sticky
  action.
- משטח רגיל: glass בהיר ושקוף, גבול לבן עדין, blur מתון וצל חום חלש. fallback
  ללא `backdrop-filter` משתמש במילוי בהיר כמעט אטום ושומר ניגודיות.
- inset הוא שינוי טון בתוך אותו משטח, ללא shadow ורדיוס מתחרה.
- charcoal הוא `#292A28`, לא שחור טהור. הוא מופיע פעם אחת בלבד בכל מצב resolved;
  loading אינו מציג charcoal מפני שאין בו פעולה.
- orange נשאר `--accent` הקיים. הוא משמש אייקון, progress ו־focus; מילוי CTA
  כתום מותר רק לפעולת ההתקנה הקיימת ואינו יוצר מוקד שני לצד ה־charcoal.

## Composition

### Shared Header

- header משתמש באותו brand anchor בכל המצבים: `/logo.svg` ללא שינוי asset.
- H1 יחיד ונגיש מכיל את `home.wordmark`; תמונת הלוגו דקורטיבית עם `alt=""`.
- הלוגו מוצג ב־96×96px בכל viewport ומצב, עם aspect ratio מקורי; אין קפיצה
  מהענף הקיים של 180px לענף 96px.
- `home.subtitle` מופיע רק ב־fresh. אין ברכה, eyebrow או קופי חדש.
- logo anchor נשאר קבוע. אין מקום ריק שמור ל־subtitle ב־loading/active; תוספת
  השורה אחרי resolution ל־fresh רשאית להזיז רק את התוכן שמתחת ל־header.

### Loading

```text
Header קבוע
┌────────────────────────┐
│ placeholder של המוקד   │  inert / glass-neutral
└────────────────────────┘
┌────────────────────────┐
│ placeholder של הניווט  │  inert / glass-neutral
└────────────────────────┘
```

- `<main aria-busy="true">`; אין CTA, ‏InstallBanner או טקסט טעינה ב־DOM.
- placeholders הם `aria-hidden`, ללא button semantics, charcoal או shimmer.
- ה־placeholder שומר גאומטריה קבועה כל עוד המידע unresolved. אחרי resolution כל
  התוכן מתחלף פעם אחת ב־fresh או active; שינוי גובה neutral→resolved מותר, אך
  מיקום הלוגו אינו זז ולעולם לא מוצגים קודם controls של fresh.
- מותר fade של 120–200ms בלבד. ב־reduced motion ההחלפה מיידית.

### Fresh

```text
Header + "מה אופים היום?"
┌────────────────────────┐
│  [אייקון] התחל אפייה   │  charcoal — המוקד היחיד
└────────────────────────┘
┌────────────────────────┐
│  מתכונים           N   │
├────────────────────────┤  glass group
│  מעקב סטארטר            │
└────────────────────────┘
[InstallBanner, אם eligible]
```

- `HomeCta variant="focus"` הוא `Link` מלא ורחב על משטח charcoal, מינימום 88px,
  וכל המשטח לחיץ
  ל־`/bake/new`. הוא מכיל רק את האייקון והקופי הקיימים.
- `HomeNavGroup` הוא container glass אחד עם שתי שורות מלאות, לא שני כרטיסים
  מתחרים. כל שורה מינימום 64px ומופרדת ב־divider עדין.
- אייקון נמצא ב־logical start, התווית אחריו והמונה ב־logical end. מונה `0` אינו
  מוצג; מספר חיובי מבודד ב־LTR.
- `InstallBanner appearance="home"` מופיע אחרי הניווט ורק לפי eligibility קיים.
  הוא חלש מהניווט; ב־320px וב־200% הטקסט וה־CTA נערמים במקום להידחס.

### Active / Resume

```text
Header קומפקטי
┌────────────────────────┐
│ ממשיכים           4/12 │
│ שם המתכון               │  charcoal — המוקד היחיד
│ שם השלב                 │
│ ┌────────────────────┐ │
│ │ timer OR folds     │ │  quiet inset; optional
│ └────────────────────┘ │
│ ── ── ── ── ·· ·· ··  │  12-stage progress
│ [        המשך         ] │  light primary control
│       סיים בייק         │  quiet ≥44px control
└────────────────────────┘
┌────────────────────────┐
│ אפייה חדשה              │
├────────────────────────┤
│ המתכונים שלי        N  │  glass group
├────────────────────────┤
│ מעקב סטארטר             │
└────────────────────────┘
```

- `ResumeBanner` הוא container עם שתי פעולות נפרדות; הכרטיס
  כולו אינו button.
- אזור הזהות מציג את `resumeBannerLabel`, שם המתכון המלא ללא truncate, שם השלב
  מתוך `STAGES` ו־`currentStage/12` מבודד.
- status inset אופציונלי מציג בדיוק אות אחד לפי חוזה ה־status שבהמשך. הוא אינו
  כרטיס נוסף ואינו אינטראקטיבי.
- progress של 12 השלבים נשאר `progressbar` דק ולא לחיץ. אין פתיחת timeline.
- ״המשך״ הוא שליטה בהירה מלאה בתוך ה־charcoal. ״סיים בייק״ שקט ונפרד; שניהם
  44px לפחות. הם נערמים גם במסך רחב כדי לשמור היררכיה יציבה.
- `HomeNavGroup` כולל שלוש שורות: אפייה חדשה, מתכונים וסטארטר. אפייה חדשה רק
  מנווטת; היא אינה מוחקת את הבייק.
- `InstallBanner` אינו מופיע במצב active.

## Active Status Contract

```ts
type HomeBakeStatus =
  | { kind: "timer"; phase: "running" | "paused" | "finished";
      secondsLeft: number; formattedTime: string }
  | { kind: "folds"; current: number; total: number }
  | { kind: "none" };
```

קדימות דטרמיניסטית:

1. טיימר מוצג רק אם התחיל, הושהה או הסתיים; timer idle אינו status.
2. טיימר גובר על קיפולים כאשר שניהם קיימים.
3. בלי טיימר, stage בעל `subSteps` מציג current/total; התצוגה נחתכת לטווח
   `0...total` בלי לשנות storage או schema.
4. אחרת `none`; לא שומרים מקום ריק ולא ממציאים חיווי.

Timer inset מציג אייקון, תווית running/paused/finished קיימת וזמן tabular ב־LTR.
הוא read-only: אין pause, edit, reset, ring, squiggle או smoke. השעון הנראה מתעדכן
פעם בשנייה כשהוא running, אך אינו `aria-live`; רק שינוי phase מוכרז בנימוס.
ה־countdown נמצא מחוץ ל־live region. node נפרד של phase בלבד משתמש ב־
`aria-live="polite"` ומתעדכן רק כשה־phase משתנה.

Fold inset משתמש בדיוק בקופי הקיים במסך השלב — `current / total קיפולים בוצעו`
— וב־`total` נקודות progress דקורטיביות עם `aria-hidden`. יחידת current/total
הטקסטואלית היא הסמנטיקה הנגישה היחידה; אין הכרזה כפולה או משפט הסבר חדש.

טיימר כשיר רק כאשר הוא אינו idle ולשלב הנוכחי יש duration שניתן לפתור: שלב 1
מתוך temperature/feed ratio; שלב 2 מתוך הערך השמור או ברירת המחדל; שלב bulk/timer
מתוך stage או `byMethod`. שדות טיימר תועים בשלב ללא duration אינם מוצגים.

כדי למנוע סטייה בין Home למסכי השלבים, נדרש seam טהור משותף:

```ts
type TimerRounding = "ceil" | "floor";
type ResolvedStageTimer = { durationSeconds: number; rounding: TimerRounding };

deriveTimerSnapshot(input: {
  durationSeconds: number;
  startedAt: number | null;
  elapsedSeconds: number;
  nowMs: number;
}): { phase: "idle" | "running" | "paused" | "finished"; secondsLeft: number };

resolveCurrentStageTimer(activeBake: ActiveBake, stage: Stage): ResolvedStageTimer | null;
formatTimerTime(secondsLeft: number, durationSeconds: number,
  rounding: TimerRounding): string;
```

Autolyse שומר `ceil`; ‏OptionalTimer שומר `floor`. Home משתמש בחוזה התצוגה של
השלב הנוכחי. החילוץ אינו משנה appearance, copy או boundary behavior ומקבל בדיקות
רגרסיה עבור `AutolyseTimer`, ‏`OptionalTimer` ו־`StageScreen`.

## Components

- **Modified `HomeScreen`** — hydration gate, recipe count, status/clock
  orchestration, canvas מקומי, routing, stop state ו־analytics-before-abandon.
- **Modified `HomeCta`** — presentations מקומיים `focus` ו־`nav-row`; שומר את
  routes, count ו־`usePressActivation`:

```ts
interface HomeCtaProps {
  href: string;
  icon: ReactNode;
  label: string;
  count?: number;
  variant: "focus" | "nav-row";
}

interface HomeNavGroupProps { children: ReactNode }
interface HomeLoadingStateProps {}
```
- **Modified `ResumeBanner`** — presentation model במקום תלות ב־router וב־
  `ActiveBake` מלא:

```ts
interface ResumeBannerProps {
  recipeName: string;
  stage: { number: number; total: number; name: string };
  status: HomeBakeStatus;
  continueHref: string;
  onStopRequest: () => void;
}
```

- **New local `HomeLoadingState`** — placeholders מקומיים, ללא skeleton system.
- **New local `HomeNavGroup`** — קיבוץ שורות הניווט; אינו design-system primitive.
- **New local `HomeBakeStatusView`** — seam נפרד ל־a11y ולבדיקות;
  `status: Exclude<HomeBakeStatus, { kind: "none" }>`; stateless וללא interval או copy.
- **Modified `InstallBanner` / `InstallGuideSheet`** — `appearance="home"`; default
  נשאר זהה. `BottomSheet variant="home"` חדש משנה appearance בלבד; `size="peek"`
  נשאר בגובה ובהתנהגות הקיימים ואינו תלוי ב־variant של Feature 26.
- **Modified `StopBakeDialog`** — `appearance="home"`; default נשאר זהה.
- **Reused** — `usePressActivation`, ‏`STAGES`, progress semantics, icons, strings,
  `Dialog`, ‏`BottomSheet` וחוזי install הקיימים.
- **Unchanged** — `FeedbackFab`, ‏`FeedbackSheet`, ‏`WelcomeGate`, ה־logo asset,
  יעדיו של הניווט ומסכי הבייק עצמם. החריג התשתיתי היחיד הוא חילוץ חישוב הטיימר
  ושימוש בו ב־`AutolyseTimer`, ‏`OptionalTimer` ו־`StageScreen`, עם output חזותי
  וקופי זהים לפני ואחרי.

## User Flows

### Open Home

1. הקנבס וה־header נטענים; Home ממתין גם ל־active bake וגם למונה המתכונים.
2. בזמן ההכרעה מוצג Loading inert בלבד.
3. לאחר ההכרעה מוצג fresh או active במעבר אטומי.

### Fresh Navigation and Install

1. המוקד פותח `/bake/new`; שורות הניווט פותחות `/recipes` ו־`/starter`.
2. Android install מפעיל prompt קיים; iOS פותח guide; Facebook מציג הנחיה בלבד.
3. dismiss שומר flag ורושם analytics לפני fade+collapse. סגירת guide אינה dismiss.

### Resume and Stop

1. ״המשך״ פותח `/bake/stage/{currentStage}`.
2. ״אפייה חדשה״ פותח `/bake/new` בלי mutation; אישור ההחלפה נשאר downstream.
3. ״סיים בייק״ פותח dialog ושומר את trigger לצורך focus return.
4. Cancel/Escape/backdrop סוגרים ללא mutation ומחזירים focus לטריגר.
5. Confirm רושם `bake_abandoned`, מוחק את הבייק, סוגר ועובר ל־fresh. מאחר
   שהטריגר נעלם, Home משתמש ב־ref ומעביר focus לפעולת ״התחל אפייה״ אחרי render.

## State Matrix

| State | Focal content | Status | Secondary content |
|---|---|---|---|
| Loading | neutral placeholder | none | inert placeholder |
| Fresh, 0 recipes | start bake | none | recipes without 0; starter |
| Fresh, N recipes | start bake | none | recipes with N; starter |
| Fresh + install | start bake | none | nav + eligible install variant |
| Fresh, install hidden | start bake | none | dismissed/installed banner absent |
| Fresh, install leaving | start bake | none | 200ms collapse, then absent |
| Active, no signal | active bake | omitted | new bake; recipes; starter |
| Active, running | active bake | timer + live visible time | same nav |
| Active, paused | active bake | timer + frozen time | same nav |
| Active, finished | active bake | timer finished + `00:00` | same nav |
| Active, sub-step | active bake | current/total folds | same nav |
| Stop dialog | light Home-local dialog | background remains mounted | focus trapped |
| Install guide | ambient Home-local sheet | n/a | focus trapped |

אין error surface חדש: אין network fetch ב־Home, והתנהגות storage פגום נשארת כפי
שהיא. Data recovery הוגדר מחוץ לסקופ ואינו מוסווה כהודעת שגיאה חדשה.

## Interaction Specs

### Navigation, Continue and Stop

`Idle → Press → Move? → Release/Cancel → Navigate|Open → Cleanup → Idle`

- pointer down: ‏`isPressed=true`.
- תנועה מעל 5px, ‏pointer cancel/leave, blur או unmount מבטלים press ומדכאים את
  ה־click הפיזי ל־200ms.
- `HomeCta`, שורות ניווט ו״המשך״ הם `Link`/anchor ומופעלים ב־Enter. ״סיים בייק״,
  התקנה ופעולות overlay הם buttons ומופעלים ב־Enter/Space. release תקין מוביל
  ל־native click יחיד לפי הסמנטיקה; אין `button + router.push` עבור ניווט.
- משוב 120ms `ease-out`: משטח רחב `scale(.985)`, שורה/כפתור `.965–.97`, יחד עם
  שינוי צבע או גבול. reduced motion מבטל transform אך שומר שינוי צבע/גבול.
- אין drag או swipe ב־Home.

### Install Banner

ה־state הקיים `mounted → visible → leaving → gone` נשמר. יציאה היא opacity +
height במשך 200ms `ease-in`, עם cleanup לטיימר. ב־reduced motion ההיעלמות מיידית
או opacity קצר בלבד. analytics ו־installed/dismissed flags אינם משתנים.

### Install Guide Sheet

חוזה ה־BottomSheet הקיים נשמר: drag מתחיל אחרי 5px; dismiss ב־80px או velocity
מעל `0.5px/ms`; אחרת snap-back של 250ms עם spring. Escape, scrim ו־close סוגרים,
focus חוזר לטריגר ו־body/drag state מתנקים. reduced motion משתמש ב־opacity בלבד.

### Stop Dialog

`Closed → Trigger press → Open → Cancel|Confirm → Leaving → Closed`. אין
optimistic state או toast: Cancel אינו משנה דבר; Confirm משנה atomically ל־fresh.
יציאה בווריאנט Home שומרת content mounted עד 200ms לצורך fade ואז מנקה state;
ב־reduced motion היא מיידית. אין spring; focus trapped כשהוא פתוח.

## Loading, Feedback and Cleanup

- interval של Home קיים רק לטיימר running, נעצר ב־finished וב־unmount ואינו
  נוצר לטיימר paused.
- כל press suppression timer מתנקה ב־unmount.
- overlays משאירים את Home mounted; טיימר running ממשיך לחשב wall time.
- Sheet מנקה drag, timers ו־scroll lock; dialog/sheet מחזירים focus בביטול.
- כל שינוי UI בפיילוט כולל state התחלתי, משוב נראה ונתיב cleanup לפי ה־playbook.

## Local Overlay Appearance

- **Stop dialog:** light glass panel מעל scrim/blur הקיים; אין charcoal נוסף או
  קופי חדש. confirm שומר danger/warn semantics ו־cancel משני. ב־320px/200% הפעולות
  נערמות והפאנל גולל בתוך viewport אם צריך.
- **Install guide:** ה־sheet הוא קנבס ambient עצמאי; שלושת הצעדים הם רשימה אחת
  עם insets/dividers, לא שלושה paper cards. אין CTA חדש. ב־200% התוכן גולל בלי
  להסתיר close/drag affordance.
- שינוי appearance נעשה רק דרך prop מפורש; default render מחוץ ל־Home אינו משתנה.

## Responsive, RTL and Accessibility

- ב־375×812 כל האזורים נמצאים בעמודה אחת. גלילה מותרת; שום פעולה אינה מוסתרת
  על־ידי FAB או safe area.
- עד 340px: gutter 16px, gap בין אזורים 12px. אין רוחב קבוע; אייקונים `shrink-0`
  וטקסט/פעולות נערמים. אין scroll אופקי.
- ב־200% text אין truncate, clamp או max-height על תוכן חיוני. שם מתכון, שם שלב
  ופעולות גדלים אנכית. שמות ללא רווחים משתמשים ב־`overflow-wrap:anywhere` כדי
  שמחרוזת עברית/לטינית ארוכה לא תיצור overflow.
- סדר DOM/focus: H1/header → focal content and actions → nav → install → FAB.
  אין `order` חזותי שסותר אותו.
- היררכיית headings: H1 הוא שם האפליקציה; שם המתכון ב־active הוא H2.
  `InstallBanner appearance="home"` משתמש ב־H2 או בטקסט רגיל, לא H3 ללא H2.
- progress שלבים: `role="progressbar"`, ‏min 1, max 12, now current. progress
  קיפולים מקבל current/total semantics וטקסט, לא צבע בלבד.
- זמן ושלב מבודדים ב־`dir="ltr"` עם tabular numerals; הטקסט המקיף נשאר RTL.
- כל אייקון דקורטיבי `aria-hidden`; כיווניות נשענת על RTL ללא rotation ידני.
- focus ring נפרד לקרקע glass ול־charcoal ואינו משתמש ב־cream offset אטום מעל
  הגרדיאנט. text ≥4.5:1 ו־non-text essential ≥3:1 בשני אזורי הקנבס וב־fallback.

## Copy and Content

- כל הקופי הקיים נשמר ללא שינוי: Home, resume, stage names, timer states,
  install ו־stop.
- תוויות running/paused/finished עוברות או מקבלות alias תחת מפתחות timer כלליים
  ב־`strings.bake`; פלט האוטוליזה נשאר זהה ו־Home אינו תלוי namespace ייעודי לה.
- Fold status ממחזר בדיוק את `current / total קיפולים בוצעו` שכבר מופיע במסך
  התסיסה הראשונית; המימוש מרכז אותו ב־`lib/strings.ts` בלי לשנות את הניסוח.
- אין `COPY_TBD` שהעיצוב הנוכחי דורש. אם בהמשך יתווספו greeting, loading label,
  הסבר סטטוס, CTA או ניסוח קיפולים אחר, הם `COPY_TBD — user/Gemini` וחוסמים רק
  את אותו טקסט.

## Design System Impact

- לא מתווספים token או primitive גלובליים. ערכי canvas/glass/charcoal נשארים
  scoped ל־Home; חילוץ יישקל רק אחרי מסך שני.
- carry-over מאושר: canvas ambient, ‏glass/inset, רדיוסים גדולים, spacing,
  charcoal focus, orange restrained, line icons וחוזי interaction.
- bake-only נשאר בחוץ: stage header/timeline, timer signal, sticky navigation,
  instruction/depth/graph motifs.
- אין שינוי ל־`html/body`, לברירות מחדל של `Button`/`Dialog`/`BottomSheet`, ל־FAB,
  ללוגו או למסכי היעד.

## Rendered Verification

- viewports: ‏375×812, ‏320px ו־200% text.
- states: loading; fresh עם 0/N מתכונים; iOS/Android/Facebook install; dismissed,
  already-installed ו־`leaving → gone`; active
  ללא status, timer running/paused/finished, folds, timer+folds precedence ושם
  מתכון ארוך; stop dialog ו־install guide פתוחים.
- modes: keyboard focus, reduced motion, ללא `backdrop-filter`, warm/cool canvas.
- בודקים overflow, חיתוך, order, contrast, safe area, FAB collision, focus return,
  timer consistency והיעדר fresh→active flash. ברמת component, loading אינו
  חושף CTA/install; ב־browser עם active bake seeded לא מופיע frame שמכיל
  ״התחל אפייה״. מקור ובדיקות אינם אישור חזותי.

## Open Questions

אין.
