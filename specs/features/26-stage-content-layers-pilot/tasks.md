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
- [ ] branch נוצר לפני השינוי הראשון.
- [ ] בדיקות המחווה החדשות נכתבו ונכשלו לפני המימוש.
- [ ] state machine הוא `Idle → HandlePress → Drag → Dismiss|SnapBack → Idle` וכל
  ה-state מתנקה גם ב-cancel וב-unmount.
- [ ] אין Framer Motion או dependency חדש; הפיזיקה היא CSS + pointer events.
- [ ] כל בדיקות `BottomSheet` עוברות.
- [ ] `npm run type-check` עובר.

### T2 — המסלול הראשי המזוקק של אוטוליזה

**Goal:** להחליף בשלב 2 את הקופי הראשי במטרה אחת, ארבע פעולות, שלושה סימני המשך
ומשפט מעבר; להסיר את הפניית תמונת ה-AI; ולהוסיף את שתי הרחבות הרינדור הקטנות
שנדרשות בלי לשנות את יתר השלבים.

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
- שלב 2 מכיל בדיוק 0 takeaways, ‏4 פעולות, 3 סימנים ומשפט מעבר לא-ריק.
- הקופי הוא הקופי הסופי מ-`design.md`, כולל טוקני הכמויות הקיימים.
- `Briefing` ללא takeaways אינו מרנדר `<ul>` או רווח ריק; שלב 1 עדיין מרנדר את
  רשימת ה-takeaways הקיימת.
- `ChecklistReference` מציג transition רק כשה-prop קיים ונשאר לא-אינטראקטיבי.
- `/stages/2-autolyse.png` אינו קיים עוד בנתוני שלב 2 ואינו מרונדר במסך.
- שלבים 1 ו-3 שומרים את התוכן והמבנה הקיימים.

**Depends on:** T1 (ה-branch מתחיל מהמצב שאחרי מיזוג T1; אין תלות פונקציונלית).

**Done when:**
- [ ] branch נוצר לפני השינוי הראשון.
- [ ] בדיקות המסלול הראשי נכתבו ונכשלו לפני המימוש.
- [ ] כל הקופי נשמר ב-`lib/data/stages.ts`, לא hard-coded ב-JSX.
- [ ] מנוע התזמון והאומדן של 45 דקות אינם משתנים.
- [ ] הקובץ `public/stages/2-autolyse.png` אינו חייב להימחק; הוא פשוט אינו מיוחס
  או מרונדר בפיילוט.
- [ ] הבדיקות הממוקדות עוברות ו-`npm run type-check` עובר.

### T3 — מודל ותוכן ההעמקה

**Goal:** להוסיף מודל תוכן סטטי ורב-שלבי לשימוש עתידי, אך לאכלס אותו רק לשלב 2
עם חמשת מקטעי ההעמקה, חמש השאלות ושני תרחישי החילוץ שאושרו.

**Branch:** `codex/feature/26-stage-content-layers-pilot/T3-stage-knowledge-data`

**Files likely touched:**
- `lib/data/stage-knowledge.ts`
- `lib/data/stage-knowledge.test.ts`
- `lib/strings.ts`
- `lib/strings.test.ts`

**Test strategy:** unit/data-contract tests. להתחיל בבדיקות נכשלות שמוכיחות:
- `getStageKnowledge(2)` מחזיר תוכן ויתר המספרים מחזירים `null`.
- יש בדיוק 5 מקטעי learn, ‏5 FAQs ו-2 תרחישי troubleshooting.
- לכל מקטע יש heading/body, לכל FAQ שאלה/תשובה ולכל תרחיש signs/actions לא-ריקים.
- בכל תרחיש יש לפחות צעד קונקרטי אחד; אין placeholder או מחרוזת ריקה.
- labels, descriptions וכותרות ה-Sheet נמצאים ב-`lib/strings.ts` ולא ברכיבי JSX.
- טקסטי החובה: ״בלי שאור ומלח״, מגבלת הציפייה לחלקות/בועות, אי-הוספת קמח
  ופעולת המעבר המיידית קיימים בחוזי התוכן.

**Depends on:** T2.

**Done when:**
- [ ] branch נוצר לפני השינוי הראשון.
- [ ] חוזי התוכן נכתבו ונכשלו לפני הוספת הנתונים.
- [ ] ה-types הם strict וללא `any`; המפות הן `readonly`/`as const` היכן שמתאים.
- [ ] אין content מתקדם לשלבים שאינם 2.
- [ ] הקופי תואם ל-`design.md` ואינו מוסיף טענות מדעיות חדשות.
- [ ] הבדיקות הממוקדות עוברות ו-`npm run type-check` עובר.

### T4 — כרטיס `StageKnowledgeHub`

**Goal:** לבנות את כרטיס הכניסה היחיד עם שלוש שורות נגישות, משוב לחיצה מלא
והגנה מפני פתיחה מקרית בזמן גלילת המסך.

**Branch:** `codex/feature/26-stage-content-layers-pilot/T4-knowledge-hub`

**Files likely touched:**
- `components/bake/stage-knowledge-hub.tsx`
- `components/bake/stage-knowledge-hub.test.tsx`

**Test strategy:** React Testing Library עם state-machine tests. להתחיל בבדיקות
נכשלות שמוכיחות:
- מרונדר heading ושלושה `<button>` עם label/description הנכונים.
- pointer press רגיל קורא `onOpen` פעם אחת עם ה-kind הנכון.
- תנועה מעל 5px לפני release מבטלת press וה-click שאחריו ואינה פותחת.
- `pointercancel`, ‏blur ו-unmount מנקים `isPressed` ואינם משאירים transform.
- הפעלת מקלדת Enter/Space פותחת פעם אחת ולא נפגעת מהגנת pointer.
- כל שורה היא target בגובה 56px לפחות, עם focus-visible ו-press feedback
  `scale(0.965)` / 120ms; reduced motion אינו תלוי באנימציית JS.
- האייקונים מסומנים `aria-hidden` ואין מחרוזת אנגלית hard-coded.

**Depends on:** T3.

**Done when:**
- [ ] branch נוצר לפני השינוי הראשון.
- [ ] בדיקות `Idle → Press → Release/Open|Cancel → Idle` נכשלו לפני המימוש.
- [ ] גלילת touch אינה מפעילה קטגוריה בטעות ואין double-fire של pointer + click.
- [ ] נעשה שימוש במאפייני CSS לוגיים בלבד וביעדי מגע לפי §10.
- [ ] בדיקות הרכיב עוברות ו-`npm run type-check` עובר.

### T5 — `StageKnowledgeSheet` ושלושת סוגי התוכן

**Goal:** לרנדר learn, ‏FAQ ו-troubleshooting בתוך אותו `BottomSheet` מלא, ללא
אקורדיונים או overlays נוספים, עם RTL תקין למספרים וטווחים.

**Branch:** `codex/feature/26-stage-content-layers-pilot/T5-knowledge-sheet`

**Files likely touched:**
- `components/bake/stage-knowledge-sheet.tsx`
- `components/bake/stage-knowledge-sheet.test.tsx`
- אופציונלי: helper מקומי קטן לרינדור טווחים מספריים ב-LTR

**Test strategy:** component tests. להתחיל בבדיקות נכשלות שמוכיחות:
- `kind="learn"` מציג פתיח וחמישה מקטעים בלבד.
- `kind="faq"` מציג את כל חמש השאלות והתשובות יחד, ללא disclosure נוסף.
- `kind="troubleshooting"` מציג שני כרטיסים עם ״מה רואים״ ו״מה עושים עכשיו״
  ורשימות צעדים ממוספרות.
- כל kind משתמש ב-`BottomSheet size="full"` ובכותרת העברית הנכונה.
- קיים `role="dialog"` אחד בלבד ואין dialog/Sheet מקונן.
- הטווחים `30–60` ו-`5–10` מרונדרים בתוך `dir="ltr"` עם `num`.
- כפתור הסגירה קורא `onClose`; focus trap, Escape ו-reduced motion מכוסים
  בבדיקות ה-primitive מ-T1 ולא משוכפלים כאן.

**Depends on:** T1, T3.

**Done when:**
- [ ] branch נוצר לפני השינוי הראשון.
- [ ] בדיקות שלושת מצבי הרינדור נכשלו לפני המימוש.
- [ ] כל התוכן מגיע מה-data/strings ואינו hard-coded ברכיב.
- [ ] אין fetch, loading state, autoplay, תמונה או video iframe.
- [ ] בדיקות הרכיב עוברות ו-`npm run type-check` עובר.

### T6 — חיבור הפיילוט לשלב 2 ורגרסיית RTL

**Goal:** לחבר Hub ו-Sheet למסך האוטוליזה בלבד, לשמר focus ו-state, ולהוכיח שכל
יתר מסכי השלבים נשארים ללא ארכיטקטורת התוכן החדשה.

**Branch:** `codex/feature/26-stage-content-layers-pilot/T6-stage-2-integration`

**Files likely touched:**
- `components/bake/stage-screen.tsx`
- `components/bake/stage-screen.test.tsx`
- `lib/strings.ts` / `lib/strings.test.ts` רק אם חיבור הרכיבים חושף label חסר

**Test strategy:** integration tests ב-React Testing Library + בדיקת RTL ידנית
ב-375px. להתחיל בבדיקות נכשלות שמוכיחות:
- שלב 2 מציג את heading ״עוד על האוטוליזה״ ושלוש כניסות; ה-Sheet סגור כברירת
  מחדל.
- כל כניסה פותחת את ה-kind הנכון בפעולה אחת; לא נפתח יותר מ-dialog אחד.
- סגירה ב-✕ וב-Escape מחזירה focus בדיוק לשורה שפתחה את ה-Sheet.
- פתיחה/סגירה אינה קוראת לאף API של `activeBake`, אינה משנה `currentStage`
  ואינה פוגעת בכפתורי ״חזרה״/״הבא״.
- שלבים 1 ו-3–12 אינם מציגים את heading של ה-Hub.
- שלב 2 אינו מרנדר `<img>` או `<iframe>`; יתר מדיית השלבים נשארת ללא שינוי.
- ה-Sheet שומר את התוכן בזמן exit ואינו מהבהב/נעלם לפני סיום 200ms.

**Depends on:** T2, T4, T5.

**Done when:**
- [ ] branch נוצר לפני השינוי הראשון.
- [ ] בדיקות האינטגרציה נכתבו ונכשלו לפני החיבור.
- [ ] `activeKnowledgeKind` נשמר בזמן exit ורק `knowledgeOpen` נסגר.
- [ ] אין שינוי ב-`activeBake` schema, ‏localStorage, timing או ניווט השלבים.
- [ ] בדיקת 375px מאשרת שאין גלישה, שהתוכן אינו מוסתר מתחת ל-sticky actions
  ושכל יעד מגע ≥44px.
- [ ] `rtl-check` עובר ללא physical CSS properties או מחרוזות JSX חדשות.
- [ ] `npm test` ו-`npm run type-check` עוברים במלואם.

## Build Order

```text
T1 BottomSheet gesture
  ↓
T2 main path
  ↓
T3 knowledge data
  ↓
T4 KnowledgeHub ─┐
                 ├→ T6 Stage 2 integration
T5 KnowledgeSheet┘
```

סדר העבודה וה-PRs: `T1 → T2 → T3 → T4 → T5 → T6`.

## Project Precondition

`context/mission.md` עדיין מסומן כ-Placeholder. לפי `AGENTS.md`, אסור להתחיל
כתיבת קוד מוצר כל עוד הוא לא הוחלף במסמך מאושר. אפשר לאשר את פירוק המשימות כעת,
אבל לפני branch של T1 נדרש לסגור את חסם ה-Discovery הפרויקטלי הזה.

## Risks

- **השפעה רוחבית של T1:** שינוי ה-rubber-band חל על כל צרכני `BottomSheet`.
  נדרשת הרצת כל בדיקות ה-primitive והצרכנים הקיימים, לא רק בדיקות הפיילוט.
- **double-fire ב-touch:** שורת Hub שמטפלת גם ב-pointer events וגם ב-click עלולה
  לפתוח פעמיים. T4 חייב להוכיח suppression אחרי scroll ופתיחה יחידה אחרי tap.
- **focus אחרי exit:** איפוס מוקדם של `activeKnowledgeKind` יפרק את התוכן לפני
  אנימציית הסגירה ויכול לשבור החזרת focus. T6 בודק את חלון ה-200ms.
- **mixed direction:** טווחים מספריים בתוך פסקאות עבריות עלולים להתהפך. T5
  עוטף ובודק אותם במפורש.
- **זחילת מדיה:** אין להוסיף ״רק בינתיים״ תמונה או סרטון שלא עברו את תנאי
  הרישיון והדיוק שב-`design.md`.
- **חריגת scope:** אין לשנות שלבים אחרים, את מנגנון התזמון, ה-autoplay הכללי של
  `StageMedia` או את מודל החילוץ של שלבים 4–7.
