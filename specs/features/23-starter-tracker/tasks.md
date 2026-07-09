# Tasks: מעקב סטארטר (Starter Tracker)

## Task List

### T1 — Supabase Setup: Schema, Client, Docs
**Goal:** התשתית הטכנית — הכנסת Supabase לפרויקט לראשונה (מוקדם מ-Phase 4 המתוכנן ב-launch-plan, ללא auth), טבלת `feedings`, RLS מתירני (לא אכיפת-זהות אמיתית — ראה Risks), client singleton, ותיעוד ההחלטה במסמכי ה-context.

**Files likely touched:**
- `supabase/schema.sql` — חדש: טבלת `feedings` (`id uuid pk`, `email text not null`, `ratio smallint not null check (ratio between 1 and 5)`, `starter_grams int null`, `flour_grams int null`, `water_grams int null`, `fed_at timestamptz not null`, `created_at timestamptz default now()`); RLS מופעל, policy מתירנית (סינון לפי email קורה בצד אפליקציה, לא ב-DB)
- `lib/supabase/client.ts` — חדש: יוצר client יחיד מ-`@supabase/supabase-js` עם env vars
- `lib/supabase/client.test.ts` — חדש
- `.env.example` — חדש/עדכון: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `package.json` — הוספת `@supabase/supabase-js`
- `context/tech-stack.md` — עדכון שורת ה-persistence: Supabase נכנס לפיצ'ר הזה בלבד (לא MVP-רחב), `localStorage` נשאר ברירת המחדל לכל השאר
- `context/launch-plan.md` — הערת status מתעדכנת: Supabase הוכנס מוקדם, מצומצם ל-`feedings` בלבד, בלי auth ובלי migration כללי — Phase 4 עדיין המועד ל-auth+migration מלאים

**Test strategy:**
- `lib/supabase/client.ts`: זורק שגיאה ברורה כש-env vars חסרים (mock `process.env`); מחזיר instance תקין כשקיימים; singleton — קריאה חוזרת לא יוצרת client נוסף

**Depends on:** —

**Done when:**
- [ ] Tests written and passing
- [ ] טבלת `feedings` נוצרה בפרויקט Supabase בפועל (הרצה ידנית של `schema.sql` — צעד חד-פעמי מחוץ ללולאת הטסטים)
- [ ] `context/tech-stack.md` ו-`context/launch-plan.md` משקפים את הכניסה המצומצמת של Supabase
- [ ] אין `any`

---

### T2 — Feeding Data Layer: CRUD + Validation
**Goal:** שכבת הדאטה — פונקציות CRUD מול Supabase (מסוננות לפי אימייל מ-`lib/identity/storage.ts`) וולידציה של טופס הזנה.

**Files likely touched:**
- `lib/types/feeding.ts` — חדש: טיפוס `Feeding` (`id, email, ratio: FeedRatio, starterGrams?, flourGrams?, waterGrams?, fedAt`)
- `lib/storage/feedings.ts` — חדש: `listFeedings(email)`, `createFeeding(input)`, `updateFeeding(id, input)`, `deleteFeeding(id)` — עוטף `lib/supabase/client.ts`
- `lib/storage/feedings.test.ts` — חדש
- `lib/validate-feeding.ts` — חדש: `FeedingFormValues`, `emptyFeedingFormValues()`, `validateFeeding()`, `hasAnyError()` (בהשראת `lib/validate-recipe.ts`)
- `lib/validate-feeding.test.ts` — חדש

**Test strategy:**
- CRUD: mock ל-`@supabase/supabase-js`; `listFeedings` קורא עם `.eq('email', ...)`; `create`/`update`/`delete` שולחים payload נכון; שגיאת רשת מוחזרת/נזרקת בצורה עקבית (לא בולעת שקטה)
- ולידציה: יחס חסר → שגיאה; תאריך חסר → שגיאה; גרמים/שעה חסרים → **אין** שגיאה (אופציונליים); גרם שלילי → שגיאה

**Depends on:** T1

**Done when:**
- [ ] Tests written and passing
- [ ] כל query מסונן לפי האימייל הנוכחי מ-`lib/identity/storage.ts`
- [ ] אין `any`

---

### T3 — Form Inputs: תאריך/שעה + FeedingGramsInput
**Goal:** רכיבי הקלט הבסיסיים לטופס — הרחבת `TextInput` לתאריך/שעה, ורכיב גרמים חדש. עצמאי מ-Supabase, ניתן לבנות במקביל ל-T1/T2.

**Files likely touched:**
- `components/ui/text-input.tsx` — עדכון: `type` מורחב ל-`"text" | "email" | "date" | "time"`; ברירת מחדל `dir="ltr"` כש-`type` הוא `date`/`time` (ניתנת לדריסה)
- `components/ui/text-input.test.tsx` — עדכון
- `components/starter/feeding-grams-input.tsx` — חדש: שלושה `NumberInput` אופציונליים (סטארטר/קמח/מים בגרמים), בלי ולידציית-סכום
- `components/starter/feeding-grams-input.test.tsx` — חדש

**Test strategy:**
- `TextInput`: `type="date"`/`"time"` מרונדר עם `dir="ltr"` כברירת מחדל, ניתן לדריסה; **רגרסיה**: שדה האימייל ב-`WelcomeGate` ושדה השם ב-recipes ממשיכים לעבוד ללא שינוי התנהגות
- `FeedingGramsInput`: עדכון שדה בודד לא נוגע באחרים; ערכים ריקים תקינים (לא חוסמים); טאצ'-טרגטים ≥44px; אין `ml-`/`mr-`/`left-`/`right-`

**Depends on:** —

**Done when:**
- [ ] Tests written and passing
- [ ] אין רגרסיה בצרכני `TextInput` הקיימים
- [ ] RTL — logical properties בלבד

---

### T4 — FeedingFormScreen: הוספה/עריכה/מחיקה
**Goal:** מסך הטופס המלא — `RatioControl` (קיים) + `FeedingGramsInput` (T3) + תאריך/שעה (T3) + ולידציה ו-CRUD (T2), עם דיאלוגי discard ומחיקה.

**Files likely touched:**
- `components/starter/feeding-form-screen.tsx` — חדש
- `components/starter/feeding-form-screen.test.tsx` — חדש
- `components/starter/delete-feeding-dialog.tsx` — חדש (בהשראת `delete-confirm-dialog.tsx`)
- `components/starter/delete-feeding-dialog.test.tsx` — חדש
- `app/starter/new/page.tsx` — חדש
- `app/starter/[id]/edit/page.tsx` — חדש
- `lib/strings.ts` — `starterTracker.form.*`, `starterTracker.deleteDialog.*`

**Test strategy:**
- שמירה חסומה בלי יחס/תאריך; שמירה עם גרמים/שעה ריקים עוברת
- שמירה מצליחה: toast הצלחה מיידי (אופטימי) + ניווט ל-`/starter`
- שמירה נכשלת: toast שגיאה נשאר עד סגירה ידנית, הערכים בטופס לא אובדים
- מצב עריכה בלבד: כפתור "מחק" מופיע → `DeleteFeedingDialog` → אישור → toast + ניווט; ביטול → נשאר בטופס
- יציאה עם שינויים לא-שמורים → `DiscardChangesDialog`

**Depends on:** T2, T3

**Done when:**
- [ ] Tests written and passing
- [ ] כל הקופי מ-`strings.starterTracker`
- [ ] CTA ≥56px, שדות ≥48px, `.pressable` בכל אלמנט לחיץ
- [ ] מחיקה עוברת אך ורק דרך `DeleteFeedingDialog` — אין swipe

---

### T5 — StarterTrackerScreen: רשימה, ריק, שגיאה
**Goal:** מסך הרשימה — spinner טעינה אמיתי, מצב ריק, מצב שגיאה+נסה-שוב, רשימת `FeedingListItem`.

**Files likely touched:**
- `components/starter/starter-tracker-screen.tsx` — חדש
- `components/starter/starter-tracker-screen.test.tsx` — חדש
- `components/starter/empty-feedings-state.tsx` — חדש (בהשראת `empty-recipes-state.tsx`)
- `components/starter/empty-feedings-state.test.tsx` — חדש
- `components/starter/feeding-list-item.tsx` — חדש (לחיצה בלבד, ללא swipe)
- `components/starter/feeding-list-item.test.tsx` — חדש
- `app/starter/page.tsx` — חדש
- `lib/strings.ts` — `starterTracker.list.*`, `starterTracker.empty.*`

**Test strategy:**
- טעינה: spinner מוצג, לא רשימה/ריק
- 0 רשומות: `EmptyFeedingsState`
- N רשומות: ממוינות מהחדש לישן; כל שורה מציגה יחס + תאריך/שעה + גרמים אם קיימים
- שגיאת טעינה: הודעה + "נסה שוב" מפעיל fetch מחדש
- הקשה על שורה מנווטת ל-`/starter/[id]/edit` עם ה-id הנכון
- טאצ'-טרגטים ≥44px

**Depends on:** T2

**Done when:**
- [ ] Tests written and passing
- [ ] מיון מהחדש לישן
- [ ] כל הקופי מ-`strings.starterTracker`

---

### T6 — Home Integration
**Goal:** חיבור `/starter` למסך הבית כ-CTA שלישי.

**Files likely touched:**
- `components/home/home-screen.tsx` — עדכון: `HomeCta` שלישי, אייקון `Sprout`, `variant="secondary"`
- `components/home/home-screen.test.tsx` — עדכון
- `lib/strings.ts` — `home.starterTracker`

**Test strategy:**
- ה-CTA מופיע גם עם בייק פעיל וגם בלעדיו; קישור נכון ל-`/starter`; `.pressable`, טאצ'-טרגט תקין

**Depends on:** T5

**Done when:**
- [ ] Tests written and passing
- [ ] אין רגרסיה בטסטים הקיימים של `home-screen`

---

## Build Order

```
T1 → T2 → T4 ┐
        └→ T5 ┴→ T6
T3 (עצמאי, נדרש רק לפני T4)
```

מסלול מומלץ סדרתי: T1 → T2 → T3 → T4 → T5 → T6. T3 יכול לרוץ במקביל ל-T1/T2 אם עובדים על כמה חזיתות.

## Risks

- **RLS לא אוכף זהות אמיתית**: בלי Supabase Auth, אין `auth.uid()` לבדוק מולו — ה-policy מתירנית וה-סינון-לפי-email קורה רק בצד הלקוח. מבחינה טכנית לקוח זדוני עם ה-anon key יכול לשלוח email אחר ולקרוא רשומות שלא שלו. מקובל למשתמש יחיד ב-beta (הוחלט ב-Brief), **לא** בטוח ברגע שיהיו כמה משתמשים — זו החלטה מודעת, לא ברירת מחדל שנשכחה
- **תלות רשת ראשונה בפרויקט**: אין offline queue (מחוץ לסקופ), אין realtime sync — אם המשתמש בלי רשת, מסך הרשימה נכשל בטעינה ופעולות שמירה/מחיקה נכשלות בלי מנגנון תור-לרשת
- **קלטי תאריך/שעה נייטיביים**: מתרנדרים אחרת בין iOS Safari (wheel picker) ל-Chrome (calendar UI) — לבדוק ויזואלית בשני הדפדפנים, אין polyfill
- **`TextInput` הוא רכיב משותף קיים** (משמש כבר ב-`WelcomeGate` ובטופס המתכונים) — ההרחבה ל-date/time חייבת טסט רגרסיה מפורש (מכוסה ב-T3), לא רק טסטים חדשים
- **הקמת Supabase היא צעד ידני** (יצירת פרויקט, הרצת `schema.sql`, env vars) — מחוץ ללולאת ה-CI/טסטים האוטומטית; המהנדס שמבצע את T1 צריך לבצע את זה בפועל לפני שהתכונה עובדת end-to-end מול דאטה אמיתי (הטסטים עצמם עובדים מול mock)
