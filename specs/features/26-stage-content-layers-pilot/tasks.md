# Tasks: פיילוט שכבות תוכן — אוטוליזה

כל משימה היא PR נפרד. לפני מימוש כל משימה יוצרים branch חדש וכותבים בדיקה
נכשלת שמוכיחה את החוזה של אותה משימה.

## Task List

### T1 — יישור גרירת `BottomSheet` ל-UI Playbook

**Goal:** לתקן את מכניקת גרירת הידית ב-primitive המשותף: סף תנועה, rubber-band,
תקרה חזותית, סגירה לפי מרחק/מהירות ו-cleanup מלא — בלי לשנות API, גובה או דרכי
סגירה קיימות.

**Branch:** `codex/feature/26-stage-content-layers-pilot/T1-bottom-sheet-gesture`

**Files likely touched:**
- `components/ui/bottom-sheet.tsx`
- `components/ui/bottom-sheet.test.tsx`
- אופציונלי, אם הפיזיקה מופרדת לפונקציות טהורות:
  `components/ui/bottom-sheet-physics.ts` + test

**Test strategy:** Vitest + React Testing Library. להתחיל בבדיקות נכשלות שמוכיחות:
- תנועה עד 80px מוצגת 1:1.
- מעבר ל-80px מקבל resistance ‏0.3 ואינו עובר offset חזותי של 140px.
- מרחק אצבע גולמי ≥80px סוגר; גרירה קצרה ומהירה מעל 0.5px/ms סוגרת.
- גרירה קצרה ואיטית עושה snap-back ואינה קוראת `onClose`.
- `pointercancel` לעולם אינו סוגר ומאפס offset/flags.
- הידית נשארת יעד מגע בגובה 44px לפחות.
- Escape, ‏scrim, focus trap, החזרת focus ו-`prefers-reduced-motion` ממשיכים לעבור
  בבדיקות הקיימות.

**Depends on:** אין.

**Done when:**
- [x] branch נוצר לפני השינוי הראשון.
- [x] בדיקות המחווה החדשות נכתבו ונכשלו לפני המימוש.
- [x] state machine הוא `Idle → HandlePress → Drag → Dismiss|SnapBack → Idle` וכל
  ה-state מתנקה גם ב-cancel וב-unmount.
- [x] אין Framer Motion או dependency חדש; הפיזיקה היא CSS + pointer events.
- [x] כל בדיקות `BottomSheet` עוברות.
- [x] `npm run type-check` עובר.

### T2 — המסלול הראשי המזוקק של אוטוליזה

**Goal:** להחליף בשלב 2 את הקופי הראשי בפסקת מטרה קצרה, חמש פעולות, שלושה סימני המשך
ומשפט מעבר; להסיר את הפניית תמונת ה-AI; להציג את הטיימר הקיים ל-45 דקות; ולהוסיף
את הרחבות הרינדור הקטנות שנדרשות בלי לשנות את יתר השלבים.

**Branch:** `codex/feature/26-stage-content-layers-pilot/T2-autolyse-main-path`

**Files likely touched:**
- `lib/data/stages.ts`
- `lib/data/stages.test.ts`
- `components/bake/briefing.tsx`
- `components/bake/briefing.test.tsx`
- `components/bake/checklist-reference.tsx`
- `components/bake/checklist-reference.test.tsx`
- `components/bake/stage-screen.tsx`
- `components/bake/stage-screen.test.tsx`

**Test strategy:** חוזי data + component/integration tests. להתחיל בבדיקות נכשלות
שמוכיחות:
- שלב 2 מכיל בדיוק 0 takeaways, ‏5 פעולות, 3 סימנים ומשפט מעבר לא-ריק.
- הקופי הוא הקופי הסופי מ-`design.md`, כולל טוקני הכמויות הקיימים.
- `Briefing` ללא takeaways אינו מרנדר `<ul>` או רווח ריק; שלב 1 עדיין מרנדר את
  רשימת ה-takeaways הקיימת.
- `ChecklistReference` מציג transition רק כשה-prop קיים ונשאר לא-אינטראקטיבי.
- `/stages/2-autolyse.png` אינו קיים עוד בנתוני שלב 2 ואינו מרונדר במסך.
- שלב 2 מציג את `OptionalTimer` הקיים עם ברירת מחדל של 45 דקות; שלב 3 נשאר ללא
  טיימר עצמאי.
- שלב 1 שומר את התוכן והמבנה הקיימים; בשלב 3 משתנה רק ניסוח שקילת יתרת המים.

**Depends on:** T1 (ה-branch מתחיל מהמצב שאחרי מיזוג T1; אין תלות פונקציונלית).

**Done when:**
- [x] branch נוצר לפני השינוי הראשון.
- [x] בדיקות המסלול הראשי נכתבו ונכשלו לפני המימוש.
- [x] כל הקופי נשמר ב-`lib/data/stages.ts`, לא hard-coded ב-JSX.
- [x] מנוע התזמון והאומדן של 45 דקות אינם משתנים.
- [x] הקובץ `public/stages/2-autolyse.png` אינו חייב להימחק; הוא פשוט אינו מיוחס
  או מרונדר בפיילוט.
- [x] הטיימר הקיים מרונדר בשלב 2 עם 45 דקות ומחובר לפעולות הטיימר של הבייק.
- [x] הבדיקות הממוקדות עוברות ו-`npm run type-check` עובר.

### T3 — שכבת הידע המלאה וחיבור לשלב 2

**Goal:** לספק vertical slice שלם לשכבת הידע: מודל ותוכן סטטיים לשלב 2, כרטיס
שלוש הכניסות, שלושת מצבי ה-`BottomSheet` והחיבור למסך האוטוליזה — בלי לחשוף את
הארכיטקטורה בשלבים אחרים ובלי לשנות את מצב הבייק.

**Branch:** `codex/feature/26-stage-content-layers-pilot/T3-stage-knowledge-pilot`

**Files likely touched:**
- `lib/data/stage-knowledge.ts` + test
- `lib/strings.ts` + test
- `components/bake/stage-knowledge-hub.tsx` + test
- `components/bake/stage-knowledge-sheet.tsx` + test
- `components/bake/stage-screen.tsx` + test

**Test strategy:** חוזי data, בדיקות רכיבים ובדיקות אינטגרציה. להתחיל בבדיקות
נכשלות שמוכיחות:
- רק `getStageKnowledge(2)` מחזיר תוכן: 5 מקטעי learn, ‏6 FAQs ו-2 תרחישי חילוץ
  מלאים, עם הקופי הסופי והפעולות שאושרו.
- ה-Hub מציג שלושה `<button>` נגישים; tap/מקלדת פותחים פעם אחת, בעוד תנועה מעל
  5px, ‏cancel או blur מנקים press ואינם פותחים.
- כל שורה היא יעד של 56px לפחות עם press feedback, ‏focus-visible ו-RTL לוגי.
- ה-Sheet מציג kind יחיד בכל פעם בגובה full, ללא אקורדיונים, media או dialog
  מקונן; הטווחים המספריים נשמרים ב-LTR.
- רק שלב 2 מציג Hub; פתיחה וסגירה מחזירות focus לטריגר, שומרות את התוכן בזמן
  exit ואינן משנות `activeBake`, ‏`currentStage`, טיימרים או פעולות ניווט.
- שלבים 1 ו-3–12 אינם מציגים את שכבת הידע; המדיה והתוכן שלהם נשארים ללא שינוי.

**Depends on:** T2.

**Done when:**
- [ ] branch נוצר לפני השינוי הראשון וכל שכבה מתחילה בחוזה נכשל רלוונטי.
- [ ] ה-types strict וללא `any`; כל התוכן וה-labels מגיעים מ-data/strings.
- [ ] state machine של ה-Hub הוא `Idle → Press → Open|Cancel → Idle`, ללא
  double-fire אחרי גלילת touch.
- [ ] יש `role="dialog"` אחד בלבד; ה-Sheet נשאר mounted ב-200ms של ה-exit ומחזיר
  focus לטריגר הנכון.
- [ ] אין fetch, loading, mutation, toast, autoplay, תמונה או סרטון בפיילוט.
- [ ] בדיקת 375px מאשרת שאין גלישה או הסתרה מתחת לפעולות הדביקות וכל יעד מגע
  עומד במינימום 44px.
- [ ] `rtl-check`, ‏`npm test`, ‏`npm run type-check` ו-`npm run lint` עוברים.

## Build Order

```text
T1 BottomSheet gesture
  ↓
T2 main path
  ↓
T3 knowledge layer — data + Hub + Sheet + integration
```

סדר העבודה וה-PRs: `T1 → T2 → T3`.

## Project Precondition

**הושלם לפני T1:** `context/mission.md` הוחלף במסמך שאושר על-ידי המשתמש, ולכן
חסם ה-pre-Discovery הוסר.

## Risks

- **השפעה רוחבית של T1:** שינוי ה-rubber-band חל על כל צרכני `BottomSheet`.
  נדרשת הרצת כל בדיקות ה-primitive והצרכנים הקיימים, לא רק בדיקות הפיילוט.
- **double-fire ב-touch:** שורת Hub שמטפלת גם ב-pointer events וגם ב-click עלולה
  לפתוח פעמיים. T3 חייבת להוכיח suppression אחרי scroll ופתיחה יחידה אחרי tap.
- **focus אחרי exit:** איפוס מוקדם של `activeKnowledgeKind` יפרק את התוכן לפני
  אנימציית הסגירה ויכול לשבור החזרת focus. T3 בודקת את חלון ה-200ms.
- **mixed direction:** טווחים מספריים בתוך פסקאות עבריות עלולים להתהפך. T3
  עוטף ובודק אותם במפורש.
- **זחילת מדיה:** אין להוסיף ״רק בינתיים״ תמונה או סרטון שלא עברו את תנאי
  הרישיון והדיוק שב-`design.md`.
- **חריגת scope:** אין לשנות שלבים אחרים, את מנגנון התזמון, ה-autoplay הכללי של
  `StageMedia` או את מודל החילוץ של שלבים 4–7.
