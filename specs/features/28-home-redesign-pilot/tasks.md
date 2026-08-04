# Tasks: פיילוט רידזיין למסך הבית

## Task List

### T1 — סטטוס בייק וטיימר קנוני

**Goal:** ליצור seam טהור ומשותף לחישוב מצב/זמן הטיימר ולבנות presentation model
של `timer | folds | none` עבור Home, ללא שינוי חזותי או התנהגות במסכי הבייק.

**Files likely touched:**

- `lib/bake-timer.ts` + tests
- `lib/home-bake-status.ts` + tests
- `components/bake/autolyse-timer.tsx` + tests
- `components/bake/optional-timer.tsx` + tests
- `components/bake/stage-screen.tsx` + tests
- `lib/strings.ts` + tests

**Test strategy:**

- מתחילים בבדיקות נכשלות ל־idle/running/paused/finished עם `nowMs` קבוע.
- מכסים `ceil` באוטוליזה ו־`floor` ב־OptionalTimer בגבולות שנייה.
- מכסים duration של שלב 1, אוטוליזה שמורה/default, ‏stage/`byMethod` וללא timer.
- מכסים timer-over-folds, ‏fold clamp ו־`none` בלי signal תקף.
- בדיקות הרגרסיה הקיימות מוכיחות שאין שינוי בטקסט, זמן, appearance או lifecycle
  של `AutolyseTimer`, ‏`OptionalTimer` ו־`StageScreen`.

**Depends on:** None

**Done when:**

- [x] נכתבו בדיקות נכשלות לפני המימוש והן עוברות.
- [x] Home ומסך השלב יכולים לצרוך אותו snapshot ללא שכפול חישוב.
- [x] מפתחות timer כלליים ממחזרים את הקופי הקיים; אין קופי חדש.
- [x] אין שינוי schema, storage key, route או פלט חזותי קיים.
- [x] unit tests, type-check, lint, ‏RTL scan ו־production build עוברים.

### T2 — רידזיין Home מלא ו־QA מרונדר

**Goal:** ליישם כיחידה חזותית אחת את loading, ‏fresh ו־active/resume, כולל ניווט,
סטטוס read-only, install guide ו־stop dialog מקומיים, press states ו־QA. המשימה
גדולה במכוון כדי שכל הרידזיין ייבדק ב־PR אחד ולא יתפצל ל־PRs קוסמטיים.

**Files likely touched:**

- `components/home/home-screen.tsx` + tests
- `components/home/home-cta.tsx` + tests
- `components/home/resume-banner.tsx` + tests
- רכיבי Home מקומיים חדשים + tests לפי הצורך
- `components/onboarding/install-banner.tsx` + tests
- `components/onboarding/install-guide-sheet.tsx` + tests
- `components/bake/stop-bake-dialog.tsx` + tests
- `components/ui/bottom-sheet.tsx` / `dialog.tsx` + בדיקות default/home variant
- `lib/strings.ts` + tests לצנטרול נוסח הקיפולים הקיים בלבד

**Test strategy:**

- מתחילים בבדיקות נכשלות: loading ללא fresh CTA/install; resolved fresh/active
  יחיד; routes/count; status none/running/paused/finished/folds וקדימות timer.
- ניווטים הם links; עצירה/התקנה buttons. מכסים tap, keyboard, תנועה מעל 5px,
  pointer cancel/blur cleanup ו־reduced-motion feedback שאינו transform.
- מכסים H1 יחיד, logo דקורטיבי, progress semantics, numeric RTL isolation,
  countdown מחוץ ל־live region ושם ארוך ללא רווחים.
- מכסים Stop cancel→focus trigger, confirm→analytics-before-delete→focus start;
  install eligibility/dismiss/appinstalled; ו־home variant בלי שינוי default.
- QA בדפדפן ב־375×812, ‏320px ו־200% text לכל state matrix; keyboard,
  reduced motion, fallback ללא blur, no-flash seeded active bake, FAB/safe-area,
  overflow/contrast וצילומי מסך מרונדרים.

**Depends on:** T1 merged

**Done when:**

- [x] נכתבו בדיקות נכשלות לפני המימוש והן עוברות.
- [x] הקומפוזיציה והאינטראקציות תואמות במלואן ל־`design.md`.
- [x] אין קופי חדש; נוסח הקיפולים הקיים נשמר verbatim ומרוכז ב־i18n.
- [x] default appearances מחוץ ל־Home ומסכי היעד נשארים ללא שינוי.
- [x] unit tests, type-check, lint, RTL scan ו־production build עוברים.
- [x] כל ה־QA המרונדר מתועד; מקור ובדיקות בלבד אינם מספיקים.

**Verification — 2026-08-04:**

- ‏100 קובצי test ו־1,015 בדיקות עברו; גם `type-check`, ‏lint ו־production build.
- סריקת RTL: קבצי T2 נקיים ממאפייני CSS פיזיים ומקופי אנגלי קשיח; ה־root נשאר
  `dir="rtl"`. הממצאים הכיווניים הקיימים מחוץ להיקף T2 לא שונו.
- QA בדפדפן עבר ל־fresh ול־active ב־375×812 וב־320px, כולל טיימר אמיתי,
  stop dialog, focus return, ניווטים, no-flash, ללא overflow וללא התנגשות FAB.
- ב־200% טקסט ה־padding התחתון הסקלאבילי השאיר 121px בין השורה האחרונה ל־FAB.
  loading, ‏paused, ‏finished ו־folds מכוסים גם בבדיקות רינדור וסמנטיקה ממוקדות.
- וריאנט iOS של כרטיס ההתקנה וה־Home sheet נבדקו מרונדרים; default/home,
  reduced motion, dismiss כפול ו־blur fallback מכוסים בבדיקות רכיב.
- במהלך המסלול האמיתי נמצא ותוקן forwarding של `MouseEvent` אל `startTimer`;
  בדיקת רגרסיה מאשרת שהטיימר נקרא ללא ארגומנט אירוע ואין עוד שגיאת serialization.

## Build Order

T1 → merge משתמש → T2

## Copy Gate

אין `COPY_TBD`. כל הקופי ממוחזר verbatim. כל צורך חדש עוצר את T2 ומדווח למשתמש
עם component, slot, מטרת התוכן ומגבלת האורך.

## Risks

- חילוץ helper עלול לשנות בטעות rounding או duration; בדיקות boundary ורגרסיה
  חוסמות זאת.
- T2 רחב מהכלל המנחה של 200 LOC, אך פיצול הקומפוזיציה מה־overlays ייצור מצבי
  ביניים ו־PRs קוסמטיים. הוא נשאר PR אחד עם test seams פנימיים ברורים.
- `Dialog` ו־`BottomSheet` משותפים; כל שינוי דורש variant מפורש ובדיקת default.
- blur וגרדיאנט יכולים להסתיר בעיות contrast/overflow; QA מרונדר הוא gate.
