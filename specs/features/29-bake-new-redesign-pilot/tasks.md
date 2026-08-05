# Tasks: פיילוט רידזיין לבחירת בייק/מתכון

## Task List

### T1 — תשתית ambient משותפת ושם ניטרלי ל־Dialog

**Goal:** לחלץ את מתכוני ה־class המשוכפלים של הקנבס וה־glass לקבועים משותפים,
ולשנות את שם ה־appearance ‏"home" של `Dialog` לשם ניטרלי (״ambient״) — refactor
טהור עם אפס שינוי חזותי בבית ובכל מסך אחר. זהו המסך השני שמוכיח API משותף,
ולכן החילוץ מותר לפי Discovery 22; מחלצים קבועי class בלבד, לא רכיב חדש.

**Files likely touched:**

- `components/ui/ambient.ts` (חדש — קבועי canvas/glass) + tests
- `components/ui/dialog.tsx` + tests (rename ‏"home" → ‏"ambient")
- `components/bake/stop-bake-dialog.tsx` + tests (העברת השם החדש)
- `components/home/home-screen.tsx`, `home-nav-group.tsx`,
  `home-loading-state.tsx` + tests (צריכת הקבועים)

**Test strategy:**

- בדיקות שוויון: מחרוזות ה־class שהרכיבים מרנדרים זהות לפני ואחרי החילוץ
  (canvas root, ‏glass group, ‏placeholders).
- בדיקות ה־default/appearance הקיימות של `Dialog` ו־`StopBakeDialog` עוברות
  עם השם החדש; `appearance="default"` נשאר בלתי משתנה.
- אין שינוי DOM, קופי, route או storage; type-check מוודא שאין שימוש שנשכח
  בערך הישן.

**Depends on:** None

**Done when:**

- [ ] נכתבו בדיקות נכשלות לפני המימוש והן עוברות.
- [ ] פלט ה־class של כל רכיבי הבית זהה byte-for-byte לפני ואחרי.
- [ ] הערך "home" אינו קיים עוד ב־`Dialog`; ‏`BottomSheet` לא נגעו בו.
- [ ] unit tests, type-check, lint, ‏RTL scan ו־production build עוברים.

### T2 — רידזיין הבוחר המלא ו־QA מרונדר

**Goal:** לממש כיחידה אחת את כל `design.md`: שער loading אטומי (שסוגר מבנית את
עקיפת דיאלוג ההחלפה), שורות המתכונים השמורים מעל ה־presets, אריחי preset על
קנבס ambient, בידוד `.num`, מרווח FAB, ‏appearance ל־`ReplaceBakeDialog`,
חוזי press ונגישות, ו־QA מרונדר. המשימה גדולה במכוון מכלל ה־200 LOC — פיצול
הקומפוזיציה ייצר מצבי ביניים ו־PRs קוסמטיים, כתקדים Feature 28 T2.

**Files likely touched:**

- `components/bake/chooser-screen.tsx` + tests
- `components/bake/chooser-card.tsx` + tests (אריח preset מחודש)
- רכיב מקומי חדש לשורת מתכון שמור + tests
- רכיב מקומי חדש ל־loading placeholders + tests
- `components/bake/replace-bake-dialog.tsx` + tests (העברת appearance)
- `lib/strings.ts` — ללא מחרוזות חדשות; רק אם נדרש aria קיים ממוחזר

**Test strategy:**

- מתחילים בבדיקות נכשלות: ב־loading יש `aria-busy` ואפס כרטיסים אינטראקטיביים;
  אחרי resolution מוצג בדיוק מצב אחד; `{bakeLoading && null}` המת מוסר.
- עקיפת הדיאלוג: עם `activeBake` seeded, כל בחירה — כולל מוקדם ככל האפשר —
  פותחת את `ReplaceBakeDialog`; אישור מבצע abandon → savePendingRecipe →
  ניווט; ביטול משאיר הכול ומחזיר focus לכרטיס המפעיל. אין אירוע analytics
  חדש (ברירת המחדל שאושרה בעיצוב).
- סדר DOM: שורות ״שלי״ לפני H2 ״איזה סוג לחם?״ לפני אריחי presets; שם נגיש
  `שם (שלי)`; רשימות `ul > li > button`; ‏Enter/Space מפעילים.
- בידוד מספרים: כל מקטע מספרי בסיכום עטוף `span[dir="ltr"].num`; המפריד ״·״
  בחוץ; מילות הסיכום ללא שינוי.
- חוזה press: ‏isPressed ב־120ms, ביטול בתנועה >5px, דיכוי click ‏200ms,
  cleanup ב־unmount, ‏reduced motion ללא transform עם משוב צבע.
- snapshot מחרוזות: אין מפתח חדש ב־`lib/strings.ts`; הקופי הקיים verbatim.
- QA מרונדר לפי `design.md`: ‏375×812, ‏320px, ‏200% text; loading, ‏presets
  בלבד, שמור אחד, הרבה שמורים, שם ארוך, סיכום ארוך, דיאלוג פתוח, placeholder
  תמונה, קצה גלילה מעל FAB; keyboard, ‏reduced motion, ללא `backdrop-filter`;
  אין pop-in, אין overflow, ניגודיות בשני אזורי הקנבס.

**Depends on:** T1 merged

**Done when:**

- [ ] נכתבו בדיקות נכשלות לפני המימוש והן עוברות.
- [ ] הקומפוזיציה והאינטראקציות תואמות במלואן ל־`design.md`.
- [ ] אין קופי חדש; ״שלי״ הוא זיהוי הקבוצה; כותרת מדור נכנסת רק אם תסופק.
- [ ] אין שינוי route, ‏storage, ‏schema או אירועי analytics.
- [ ] unit tests, type-check, lint, ‏RTL scan ו־production build עוברים.
- [ ] כל ה־QA המרונדר מתועד; מקור ובדיקות בלבד אינם אישור ויזואלי.

## Build Order

T1 → merge משתמש → T2

## Copy Gate

אין `COPY_TBD` בקומפוזיציית ברירת המחדל. השדרוג היחיד החסום-קופי הוא כותרת
מדור לקבוצת המתכונים השמורים; אם המשתמש יספק אותה (או יאשר שימוש חוזר
ב־`home.myRecipes`), התג ״שלי״ בשורות מוסר באותה משימה. כל צורך קופי אחר עוצר
את T2 ומדווח למשתמש עם component, ‏slot, מטרת תוכן ומגבלת אורך.

## Risks

- ה־rename וחילוץ הקבועים נוגעים ברכיבי בית ממוזגים; בדיקות שוויון class
  ו־snapshot קיימות הן החסם לרגרסיה חזותית.
- פיתוי להרחיב את החילוץ לרכיב `AmbientPage`/`GlassCard` — מחלצים קבועים
  בלבד; רכיב משותף יישקל רק אחרי מסך שלישי.
- ביטול `min-h`/`line-clamp` משנה את גובהי הגריד; יישור פר-שורה נבדק מרונדר
  ב־320px וב־200% text.
- היפוך הסדר (שמורים ראשונים) ישבור בדיקות סדר קיימות — לעדכן אותן במכוון,
  לא להתאים את המימוש לבדיקה הישנה.
- תמונות ה־presets יורדות מתחת לקפל כשיש שמורים; התנהגות הטעינה של `next/image`
  נשארת ברירת מחדל ואין הוספת `priority`.
- ה־blur והגרדיאנט מסתירים בעיות ניגודיות; QA מרונדר הוא ה־gate.
