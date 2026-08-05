# Design: פיילוט רידזיין לבחירת בייק/מתכון

## Design Goal

חוזה המוצר נעול ב־[brief](./brief.md). הבוחר ממשיך את הקנבס של הבית לתוך מסלול
התחלת האפייה: קנבס אווירתי אחד, משטחי בחירה glass, וללא מוקד charcoal — charcoal
מסמן ״את״ הפעולה הראשית היחידה, ובמסך שכולו בחירה שוות־מעמד אין כזו. אין ייבוא
של רכיבי שלב (header, timeline, טיימר, שכבות הדרכה).

## Screens Affected

- `/bake/new`: כל המצבים — loading, ‏presets בלבד, presets + מתכונים שמורים,
  דיאלוג החלפה.
- `ReplaceBakeDialog` שנפתח מהמסך: appearance מקומי בלבד.
- `FeedbackFab`: ללא שינוי; המסך רק שומר לו מרווח תחתון.

## Canvas and Surface Contract

- אותם ערכי קנבס של הבית, לרציפות המסלול בית→בוחר:
  `linear-gradient(160deg, #FFF8F1 0%, #FFDDBD 22%, #F7F0E7 55%, #DDEDF2 100%)`,
  scoped ל־root של המסך (`isolate`, ‏`overflow-x-clip`). רוחב `max-w-md`; gutter
  ‏20px ו־16px עד 340px; למעלה `safe-area + 20px`; padding תחתון
  `calc(9.25rem + env(safe-area-inset-bottom))` כך שהשורה האחרונה נגללת אל מעל
  ה־FAB.
- מתכון ה־glass זהה לזה של הבית (גבול `paper/60`, מילוי fallback כמעט אטום
  `#FFF8F1/95`, ‏blur מתון על `paper/35`, צל חום חלש). האם הערכים משוכפלים
  מקומית או מחולצים ל־primitive משותף — הכרעת Tech Lead; זהו המסך השני שמוכיח
  את ה־API, והחילוץ מותר אם הוא זהה בפועל.
- אין משטח charcoal באף מצב של המסך. orange נשאר accent בלבד — אייקונים, focus
  ותג; לעולם לא משטח גדול.
- inset הוא שינוי טון בתוך משטח (אריח placeholder לתמונה), לא כרטיס אטום מקונן.

## Composition

### Header

- פעולת החזרה הקיימת (ghost, ‏ChevronRight במירור אוטומטי, ״חזרה״) — יעד 44px
  לפחות, focus ring מותאם לקרקע הקנבס. `router.back()` נשמר.
- H1 ״בייק חדש״ נשאר ה־H1 הנראה היחיד.

### Loading

- `<main aria-busy="true">` כל עוד המתכונים או `activeBake` לא נפתרו (שתי
  קריאות localStorage שנפתרות ב־effect הראשון — בדרך כלל פריים אחד).
- placeholders דוממים `aria-hidden` במתכון ה־glass, מקרבים את הגאומטריה הפתורה:
  בלוק קבוצת שורות ובלוק גריד. ללא טקסט, ללא shimmer, ללא button semantics.
- החלפה אטומית אחת למצב הפתור; fade ‏120–200ms; ‏reduced motion — מיידי.
- מאחר שהכרטיסים אינם קיימים לפני ההכרעה, אין מסלול שבו בחירה מקדימה את
  מצב `activeBake` — עקיפת הדיאלוג נסגרת מבנית.

### Resolved — עם מתכונים שמורים

```text
Header + ‏H1 ״בייק חדש״
┌────────────────────────┐
│ שם המתכון        [שלי] │
│ שורת סיכום              │
├────────────────────────┤  glass group — שורות מלאות
│ שם המתכון        [שלי] │
│ שורת סיכום              │
└────────────────────────┘
‏H2 ״איזה סוג לחם?״
┌─────────┐ ┌─────────┐
│  צילום   │ │  צילום   │
│ שם       │ │ שם       │   גריד presets בשתי עמודות
│ סיכום    │ │ סיכום    │
└─────────┘ └─────────┘
```

- **המתכונים השמורים ראשונים.** אופה חוזר בוחר כמעט תמיד את המתכון שלו;
  ה־presets הם מסלול הארכיטיפים. היום המתכונים האישיים נספחים אחרי שבעת
  ה־presets מתחת לקפל — הסדר מתהפך.
- קבוצת ״שלי״: container glass אחד בתבנית קבוצת הניווט של הבית — שורות מלאות
  מופרדות ב־divider עדין, כל שורה כפתור יחיד בגובה 64px לפחות: שם
  (text-heading), שורת הסיכום מתחתיו (text-small, ‏ink-2) ותג ״שלי״ הקיים
  ב־logical end. התג אינו אינטראקטיבי.
- לקבוצה אין כותרת מדור כברירת מחדל — השורות מזוהות בתג ״שלי״ הקיים, ללא קופי
  חדש, כנדרש ב־brief. מסלול שדרוג: אם תסופק כותרת מדור
  (`COPY_TBD — user/Gemini`), התג בשורות מיותר ויוסר; הקומפוזיציה הזו חסומה
  עד אספקת הכותרת.
- גריד ה־presets: ‏H2 הקיים ״איזה סוג לחם?״ עומד בראשו (היום הוא מכסה גם את
  כרטיסי ״שלי״; מעתה הוא מכסה את ה־presets בלבד). שתי עמודות, אריח glass:
  אזור צילום 4/3 בראש הכרטיס, ומתחתיו שם + סיכום. שבעה presets — האחרון נשאר
  ברוחב חצי טבעי, ללא מתיחה.
- ביטול ה־hack ‏`min-h-[2.9em]` וה־`line-clamp-2`: אין truncate או clamp; טקסט
  נשבר חופשי עם `overflow-wrap:anywhere`, ושורות הגריד משתוות גובה בכל שורה
  מכוח ה־grid עצמו.
- כשל טעינת תמונה או preset ללא תמונה: אריח ה־Wheat הקיים כ־inset טון בתוך
  ה־glass, ‏`aria-hidden`.

### Resolved — presets בלבד

- קבוצת ״שלי״ נעדרת מבנית — אין empty state ואין קופי; H2 והגריד מיד אחרי
  ה־H1.

### Replace dialog

- טריגר: בחירה כלשהי כאשר קיים `activeBake` (שכבר הוכרע בהכרח).
- `ReplaceBakeDialog` מקבל העברת `appearance` אל מנגנון ה־appearance הקיים של
  `Dialog` מ־Feature 28 (פאנל glass בהיר, scrim ‏`ink/35` + blur). האם ערך
  ה־appearance ‏"home" מקבל שם ניטרלי (rename טהור, אפס שינוי חזותי בבית) —
  הכרעת Tech Lead.
- כל מחרוזות הדיאלוג הקיימות נשמרות כלשונן: `replaceTitle`,
  ‏`replaceDescription(name)`, ‏confirm בווריאנט warn, ‏cancel בווריאנט ghost.
- **עובדה אנליטית:** מסלול ההחלפה הקיים אינו רושם אירוע (בניגוד ל־stop של
  הבית שרושם `bake_abandoned` לפני `abandon()`). העיצוב אינו מוסיף אירוע —
  תוספת כזו היא שינוי analytics מחוץ ל־brief; הפער הוצף למשתמש בשער העיצוב,
  וברירת המחדל היא התנהגות קיימת.

## Selection Contract

```text
Idle → Press → (תנועה >5px? ביטול + דיכוי click ‏200ms) → Release →
  activeBake קיים  → פתיחת ReplaceBakeDialog (ללא mutation)
  אין בייק פעיל     → savePendingRecipe → ניווט ל־/bake/plan
Dialog: Cancel/Escape/backdrop → סגירה ללא mutation, ‏focus חוזר לכרטיס המפעיל
Dialog: Confirm → abandon → savePendingRecipe → ניווט ל־/bake/plan
```

- הכרטיסים הם buttons (לבחירה יש side effect ושער דיאלוג — לא ניווט טהור),
  מופעלים ב־Enter/Space.
- זרימת confirm זהה להיום; אין toast, אין optimistic state, אין rollback —
  מסך המתכנן הוא האישור.

## Interaction Specs

- **State machine**: ‏`usePressActivation` בכל הכרטיסים —
  `Idle → Press → Move? → Release/Cancel → Activate → Cleanup → Idle`;
  ביטול ב־blur/unmount; דיכוי click פיזי 200ms אחרי drag.
- **Press feedback** (120ms ‏ease-out): שורות מלאות `scale(.985)` +
  ‏`bg-ink/[0.05]` (זהה לשורות הבית); אריחי preset ‏`scale(.97)` + השטחת צל;
  כפתורי header ודיאלוג לפי ה־Button הקיים. reduced motion מבטל transform
  ומשאיר שינוי צבע/גבול.
- **Gestures**: אין drag או swipe במסך.
- **Animation curves**: ‏press ‏120ms ease-out; כניסת/יציאת dialog לפי חוזה
  ה־Dialog הקיים (יציאה 200ms fade, מיידית ב־reduced motion). ללא spring —
  אין snap-back במסך.
- **Touch targets**: שורות ≥64px; אריחים הרבה מעל 44px; חזרה ופעולות דיאלוג
  ≥44px.

## Loading, Feedback and Cleanup

- טיימרים של press suppression מתנקים ב־unmount; אין intervals במסך.
- הדיאלוג נועל focus כשהוא פתוח, משחרר scroll ומחזיר focus בביטול; אחרי
  confirm המסך עוזב בניווט ולא נשאר state יתום.
- כל שינוי UI כולל מצב התחלתי, משוב נראה ונתיב cleanup לפי ה־playbook.

## Responsive, RTL and Accessibility

- עמודה אחת ב־375×812; עד 340px: ‏gutter ‏16px, ‏gap גריד 12px, ‏padding אריח
  מצטמצם ל־p-3. הגריד נשאר שתי עמודות בכל הרוחבים.
- ב־200% text אין truncate/clamp; שמות וסיכומים גדלים אנכית והכרטיסים איתם.
- סדר DOM/focus: חזרה → H1 → שורות ״שלי״ → H2 → אריחי presets; ה־FAB אחרון.
  אין `order` חזותי סותר.
- Headings: ‏H1 ״בייק חדש״; H2 ״איזה סוג לחם?״. קבוצת ״שלי״ יושבת בין H1 ל־H2
  ללא כותרת; השם הנגיש של כל שורה הוא `שם (שלי)` כמו היום, כך שההקשר נשמר גם
  בלי כותרת.
- שתי הקבוצות הן רשימות (`ul > li > button`) עם `aria-label` קבוצתי מהמחרוזות
  הקיימות של המסך.
- **בידוד מספרים**: כל מקטע מספרי בסיכום עטוף
  `<span dir="ltr" className="num">70%</span>` — היחידה בתוך ה־span, המפריד
  ״·״ מחוץ לו, ומילות הסיכום ללא שינוי. חל על שורות ״שלי״ ועל אריחי presets.
- צילומים דקורטיביים `alt=""`; אריח placeholder ‏`aria-hidden`; אייקונים
  דקורטיביים `aria-hidden`; מירור נשען על RTL בלבד.
- focus ring מותאם לקרקע glass (ink-2, ‏inset בשורות) ללא offset קרם אטום מעל
  הגרדיאנט; טקסט ≥4.5:1 ו־non-text חיוני ≥3:1 בשני אזורי הגרדיאנט וב־fallback,
  כולל תג ״שלי״ (ink/85 על paper).
- הדיאלוג: focus trap, ‏Escape/backdrop סוגרים, החזרת focus לטריגר.

## State Matrix

| State | Content | Notes |
|---|---|---|
| Loading | ‏placeholders דוממים | `aria-busy`; ללא controls |
| Presets בלבד | H1 → H2 → גריד | אין קבוצת ״שלי״, אין empty state |
| עם מתכונים שמורים | H1 → שורות ״שלי״ → H2 → גריד | שמורים ראשונים |
| דיאלוג החלפה פתוח | dialog מעל המסך | רקע mounted; focus trapped |
| תמונה כשלה | אריח Wheat ‏inset | פר-כרטיס |

אין error surface חדש: קריאות localStorage בלבד, והתנהגות אחסון פגום נשארת
כפי שהיא (מחוץ לסקופ, כמו בבית).

## Copy and Content

- כל הקופי הקיים נשמר כלשונו: ״בייק חדש״, ״איזה סוג לחם?״, ״שלי״, ״חזרה״,
  מחרוזות דיאלוג ההחלפה, שמות ה־presets ומילות הסיכום (״לבן״, ״מלא״, ״שיפון״,
  ״כוסמין״, ״הידרציה״).
- הקומפוזיציה של ברירת המחדל אינה דורשת קופי חדש; ל־loading אין טקסט
  (`aria-busy` בלבד).
- שדרוג אופציונלי חסום-קופי: כותרת מדור לקבוצת המתכונים השמורים —
  `COPY_TBD — user/Gemini`. מטרת תוכן: שם־עצם קצר (≤20 תווים) שמזהה את קבוצת
  המתכונים של המשתמש; קיימת מחרוזת קנונית `home.myRecipes` (״המתכונים שלי״)
  שאפשר לאשר לשימוש חוזר כלשונה. עד הכרעה — התג ״שלי״ הוא הזיהוי.
- Copy request surfaced to user: כן — כותרת המדור האופציונלית בלבד; אין
  דרישות קופי נוספות.

## Design System Impact

- העיצוב אינו מוסיף token או primitive גלובלי. ערכי canvas/glass קיימים כעת
  בשני מסכים — הכרעת חילוץ מול שכפול מקומי עוברת ל־Tech Lead, וכך גם rename
  ניטרלי לערך ה־appearance של Dialog.
- carry-over מאושר: קנבס ambient, קבוצות ושורות glass, רדיוסים גדולים,
  spacing נדיב, אייקוני קו, orange מרוסן וחוזי interaction.
- נגנז במסך זה: סגנון ה־paper האטום של `ChooserCard`, ‏hack הגובה של הסיכום
  ו־`line-clamp-2`.
- אין שינוי ל־`html/body`, לברירות המחדל של `Button`/`Dialog`/`FeedbackFab`
  או למסכי היעד.

## Rendered Verification

- viewports: ‏375×812, ‏320px ו־200% text.
- states: ‏loading; presets בלבד; מתכון שמור אחד; הרבה מתכונים שמורים
  (גלילה); שם ארוך ללא רווחים; סיכום ארוך; דיאלוג החלפה פתוח; placeholder של
  תמונה; קצה הגלילה מעל ה־FAB.
- modes: ‏keyboard focus, ‏reduced motion, ללא `backdrop-filter`.
- בודקים: היעדר overflow אופקי; היעדר pop-in (עם מתכונים seeded הם מופיעים
  בפריים הפתור הראשון); עם `activeBake` seeded אין frame שבו בחירה עוקפת את
  הדיאלוג; בידוד `.num` נכון ב־RTL; ניגודיות בשני אזורי הקנבס; החזרת focus
  מהדיאלוג. מקור ובדיקות בלבד אינם אישור ויזואלי.

## Open Questions

אין.
