# Design: מעקב סטארטר (Starter Tracker)

## Screens Affected
- **Home** (`components/home/home-screen.tsx`): CTA שלישי — "מעקב סטארטר" (`HomeCta variant="secondary"`, אייקון `Sprout`) → `/starter`
- **New `/starter`**: מסך רשימה + נקודת כניסה (`StarterTrackerScreen`)
- **New `/starter/new`**: הוספת האכלה (`FeedingFormScreen`, מצב הוספה)
- **New `/starter/[id]/edit`**: עריכת האכלה קיימת (`FeedingFormScreen`, מצב עריכה)

## Components

- **New**: `StarterTrackerScreen` (`components/starter/starter-tracker-screen.tsx`) — מבנה זהה ל-`RecipeListScreen`: מצבי loading/empty/loaded, רשימת `FeedingListItem`, כפתור "+ האכלה חדשה"
- **New**: `EmptyFeedingsState` (`components/starter/empty-feedings-state.tsx`) — מבנה זהה ל-`EmptyRecipesState`
- **New**: `FeedingListItem` (`components/starter/feeding-list-item.tsx`) — שורה לחיצה בלבד (**ללא swipe** — ראה נימוק למטה), מציגה יחס + תאריך/שעה + סיכום גרמים אם קיים; לחיצה → `/starter/[id]/edit`
- **New**: `FeedingFormScreen` (`components/starter/feeding-form-screen.tsx`) — מבנה זהה ל-`RecipeFormScreen`. Props: `{ initialValues?: FeedingFormValues; feedingId?: string }`
- **New**: `FeedingGramsInput` (`components/starter/feeding-grams-input.tsx`) — שלושה `NumberInput` אופציונליים (סטארטר/קמח/מים בגרמים); בלי ולידציית-סכום (בשונה מ-`FlourBreakdownInput` — גרמים לא צריכים להסתכם ל-100)
- **New**: `DeleteFeedingDialog` (`components/starter/delete-feeding-dialog.tsx`) — זהה במבנה ל-`DeleteConfirmDialog`, ממוקד להאכלות
- **Reused as-is**: `RatioControl` (`components/bake/ratio-control.tsx`) — ה-picker הקיים 1:1:1…1:5:5 שנבנה לצורך אחר (feed ratio של תזמון בייק) ומתאים כמעט מילה-במילה לשדה היחס כאן; `FormSection`, `Button`, `ValidationMessage`, `DiscardChangesDialog`, `Dialog`, `useToast`
- **Modified**: `TextInput` (`components/ui/text-input.tsx`) — הרחבת `type` מ-`"text" | "email"` ל-`"text" | "email" | "date" | "time"`; כש-`type` הוא `date`/`time` ברירת המחדל ל-`dir` היא `"ltr"` (קלט לוח-שנה/שעון תמיד LTR, גם בהקשר RTL — כמו שדה האימייל ב-`WelcomeGate`)

---

## User Flow

1. בית → "מעקב סטארטר" → `/starter`
2. **אין רשומות**: `EmptyFeedingsState` — "עדיין לא תיעדת האכלות" + CTA "+ האכלה ראשונה" → `/starter/new`
3. **יש רשומות**: רשימה מהחדש לישן; כל שורה מציגה יחס + תאריך/שעה + (אם יש) גרמים; כפתור "+ האכלה חדשה" למעלה
4. הקשה על שורה → `/starter/[id]/edit` עם הערכים הקיימים טעונים
5. **טופס** (הוספה/עריכה), בסדר הזה:
   - `RatioControl` — **חובה**
   - `FeedingGramsInput` תחת כותרת-משנה "פירוט במשקל (לא חובה)" — **אופציונלי**
   - תאריך — **חובה**, ברירת מחדל היום
   - שעה — **אופציונלי**, ברירת מחדל "עכשיו", ניתנת לעריכה להזנה למפרע
6. שמירה → toast הצלחה מיידי → חזרה ל-`/starter` (הרשימה מתעדכנת)
7. **עריכה בלבד**: כפתור "מחק" (ghost/warn) בתחתית הטופס → `DeleteFeedingDialog` → אישור → מחיקה + toast + חזרה ל-`/starter`
8. יציאה מהטופס כשיש שינויים שלא נשמרו → `DiscardChangesDialog` (זהה לרסיפיז, ללא שינוי)

---

## States

- **Loading (רשימה)**: spinner מרכזי (אותו visual טבעת-מסתובבת כמו ב-`Button loading` — לא component חדש). זו הפעם הראשונה בפרויקט עם תלות רשת אמיתית לפני הצגת תוכן, אז spinner אמיתי הוא נכון כאן (בשונה מ-`WelcomeGate`/`InstallBanner` שבהם אין spinner בכלל כי localStorage סינכרוני)
- **Empty**: `EmptyFeedingsState`
- **Error (טעינת רשימה נכשלה)**: הודעה + כפתור "נסה שוב" בתוך המסך עצמו (לא toast — כשל טעינה חוסם את כל התוכן העיקרי, זה לא אירוע חולף)
- **Success (שמירה/מחיקה)**: toast לפי §9 — "ההאכלה נשמרה" / "ההאכלה נמחקה", 2400ms

---

## Interaction Specs

- **State machine**: tap בלבד — `Idle → isPressed → Release` (§1). **אין swipe-to-delete** בפיצ'ר הזה
- **Press feedback**: `.pressable` על כל שורה/כפתור (§2)
- **Gestures**: אין gesture חדש
- **Animation curves**: כניסת/יציאת דיאלוג — קיים ב-`Dialog`; toast — §9 הקיים ללא שינוי
- **Touch targets**: שורות רשימה ≥44px; שדות טופס ≥48px; CTA ≥56px (כמו `RecipeFormScreen`)

### למה לא swipe-to-delete כמו במתכונים?
ה-Brief דורש **"מחיקה עם אישור מפורש, לא במחיקה בלחיצה אחת"**. swipe + undo-toast (הדפוס ב-`RecipeListItem`) הוא בפועל "מחק-קודם, בטל-אם-תרצה" — לא אישור מפורש *לפני* המחיקה. כדי לעמוד בדרישה במדויק, הפיצ'ר משתמש בדפוס השני שכבר חי באפליקציה: כניסה למסך עריכה ייעודי + כפתור "מחק" + דיאלוג אישור (בדיוק `RecipeFormScreen`/`DeleteConfirmDialog`). זו לא אי-עקביות מקרית — שני הדפוסים כבר קיימים זה לצד זה בקוד: הרשימה = swipe, מסך עריכה בודד = דיאלוג.

---

## Optimistic / Sync Notes

- **שמירה (יצירה/עריכה)**: אופטימי — הטופס סוגר ומציג toast הצלחה מיד; הכתיבה ל-Supabase רצה ברקע (§6). כשל רשת → toast שגיאה שנשאר עד סגירה ידנית (§9 — שגיאות לא נעלמות לבד), המשתמש חוזר לטופס עם הערכים שמורים (לא אובדים)
- **מחיקה**: אחרי אישור בדיאלוג — אופטימי (השורה נעלמת מהרשימה מיד + toast), קריאת המחיקה ל-Supabase ברקע. כשל → rollback: השורה חוזרת לרשימה + toast שגיאה (§6, §Known Gap 3)
- **טעינת הרשימה**: **לא** אופטימי — תלות רשת אמיתית ראשונה בפרויקט, לכן spinner אמיתי (ראה States)
- **אין realtime subscription / רב-מכשירי בסקופ ה-MVP** (משתמש יחיד). השלב השלישי של §6 ("realtime מאשר/מתקן") נדחה ל-v2; רענון בפועל קורה בחזרה למסך

---

## Locale / Direction Notes

- מחרוזות חדשות תחת `strings.starterTracker.*` — namespace נפרד מ-`strings.bake.starterGate` הקיים כדי למנוע בלבול
- שדות תאריך/שעה: `dir="ltr"` (כמו שדה האימייל ב-`WelcomeGate`) — קלט לוח-שנה/שעון תמיד LTR גם במסך RTL
- `RatioControl`: כבר `dir="ltr"` על כל כפתור, ללא שינוי
- גרמים: `NumberInput` כבר מטפל ב-`.num`/`dir="ltr"`, ללא שינוי
- אייקון `Sprout` (Lucide) — סימטרי, לא דורש מירור

---

## Design System Impact

- Namespace מחרוזות חדש: `strings.starterTracker`
- הרחבה קטנה ל-`TextInput`: `type: "date" | "time"` (לא token/pattern חדש)
- אין צבעים/tokens/רכיבי-על חדשים

## Open Questions
<Should be empty before Tech Lead phase.>
