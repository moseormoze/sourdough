# Design: קמח כוסמין + עיצוב מחדש של הפריסטים

## Screens Affected
- **בונה המתכון** (`recipe-form-screen` → `FlourBreakdownInput`): 4 שדות → 5 שדות. שדה "אחר" יורד.
- **גלריית פריסטים** (`preset-gallery-screen` + `chooser-screen` → `PresetCard`): 6 → 7 כרטיסים, 3 חדשים + סיכום קמח שיודע להציג כוסמין.
- **אישור בייק / כמויות** (כל מקום שמציג flour breakdown דרך `flourTypeLabels`): מקבל שתי תוויות חדשות.

---

## Components

- **Modified: `FlourBreakdownInput`** (`components/recipes/flour-breakdown-input.tsx`)
  - `KEYS` → `["white", "wholeWheat", "rye", "speltWhite", "speltWhole"]` (הסרת `other`).
  - `LABEL` מקבל `speltWhite`/`speltWhole`, מאבד `other`.
  - **פריסה:** נשאר `grid grid-cols-2 gap-3`. 5 שדות = 3 שורות, הפריט החמישי (כוסמין מלא) יושב לבד בשורה האחרונה (בתחילת השורה ב-RTL). זו הסטייה הוויזואלית היחידה — מקובלת ועקבית עם הדפוס הקיים. אין שינוי ב-`NumberInput`, בלוגיקת הסכום, או בהודעות הוולידציה.
  - *חלופה שנדחית:* קיבוץ ל-"חיטה / מיוחדים" עם כותרות-משנה. יפה פדגוגית אבל מוסיף chrome — נדחה לעת עתה.
  - props ללא שינוי (`value`/`onChange`/`onBlurField`/`error`) — ה-`Flour` type מתעדכן מהסכמה.

- **Modified: `PresetCard`** (`components/presets/preset-card.tsx`)
  - `formatFlourSummary` מתרחב: מוסיף `speltWhite` → `"% כוסמין לבן"` ו-`speltWhole` → `"% כוסמין מלא"`. סדר התצוגה: לבן · מלא · שיפון · כוסמין לבן · כוסמין מלא (רק שדות > 0). אין שינוי באינטראקציה.

- **Reused (ללא שינוי):** `NumberInput`, `ValidationMessage`, `preset-gallery-screen`, `chooser-screen` (רנדור דרך `PRESETS` — מתעדכן אוטומטית), `BottomSheet`.

- **Data (לא קומפוננטה, אבל הליבה):** `lib/presets.ts` (7 פריסטים), `lib/recommendations.ts` (כללי כוסמין), `lib/strings.ts` (תוויות), `lib/types/recipe.ts` + `lib/validate-recipe.ts` (סכמה).

---

## User Flow
1. היוזר נכנס לבונה המתכון (חדש או עריכה) או לגלריית הפריסטים.
2. **מסלול פריסט:** בוחר כרטיס (למשל "50% כוסמין מלא") → ערכי הקמח/הידרציה/שאור נטענים לטופס → רואה את סיכום הקמח על הכרטיס כולל הכוסמין.
3. **מסלול ידני:** בבונה הקמחים מקליד אחוזים בחמשת השדות → הסכום מתעדכן (✓ ב-100) → המלצות הידרציה/שאור/מלח מתעדכנות לפי `recommendFor` (כולל כללי הכוסמין החדשים).
4. שומר. מתכון ישן עם `other: 0` נטען ללא שגיאה.

---

## States
- **Loading:** ללא שינוי — הפריסטים סטטיים, התמונות עם `next/image`.
- **Empty:** סכום קמח 0 — הודעת `flourSumShort` הקיימת ("חסר X%"). ללא שינוי.
- **Error:** סכום ≠ 100 — `ValidationMessage` + צבע `danger`. הסכום מחושב כעת על 5 שדות (+`other` ב-default 0). ללא שינוי ויזואלי.
- **Success:** סכום = 100 — `text-sage-2` + ✓. ללא שינוי.

---

## Interaction Specs
- **State machine:** ללא חדש. שדות הקמח = `NumberInput` הקיים (press/stepper). כרטיסי פריסט = מכונת המצבים הקיימת ב-`PresetCard`: `Idle → PointerDown(press, scale 0.97) → PointerMove(>5px → cancel) → PointerUp(select)`.
- **Press feedback:** `.pressable` הקיים — `scale(0.965)` / `fast 120ms`. כרטיסים: `scale-[0.97]` + `shadow-none`.
- **Gestures:** ללא. `DRAG_CANCEL_THRESHOLD_PX = 5` נשמר.
- **Animation curves:** ללא חדש (ui-playbook §5).
- **Touch targets:** `NumberInput` ו-`PresetCard` כבר ≥44px. השורה החמישית לא משנה זאת.
- **סיכום playbook:** אין רכיב אינטראקטיבי חדש — רק שדה נוסף וכרטיסים נוספים על דפוסים קיימים. סיכון playbook נמוך.

---

## Optimistic / Sync Notes
לא רלוונטי — הכל מקומי (localStorage), אין רשת. מיגרציה היא קריאה בלבד: `other` עם `.default(0)` ב-Zod → מתכונים ישנים נקראים תקין.

---

## Locale / Direction Notes

**Final copy (עברית — נעול):**

תוויות בונה הקמחים (`strings.form`):
| מפתח | ערך |
|---|---|
| `flourSpeltWhite` | `"כוסמין לבן"` |
| `flourSpeltWhole` | `"כוסמין מלא"` |

תוויות ארוכות (`strings.bake.flourTypeLabels`, לתצוגת breakdown):
| מפתח | ערך |
|---|---|
| `speltWhite` | `"קמח כוסמין לבן"` |
| `speltWhole` | `"קמח כוסמין מלא"` |

(`flourOther` / `flourTypeLabels.other` יורדים מהשימוש ב-UI; ניתן להשאיר את המחרוזת ביתומה או למחוק — החלטת Tech Lead.)

- **Mixed-direction:** אחוזים נשארים ב-`<span dir="ltr" className="num">75%</span>`. שמות הקמח עברית טהורה — אין בעיה.
- **Mirrored elements:** אין חדשים.
- **Edge case:** סיכום הקמח על הכרטיס עלול להתארך עם 2 סוגי כוסמין (`line-clamp` קיים על ה-blurb, אבל שורת הסיכום `text-tiny` בשורה אחת — בפועל פריסט לא יציג יותר מ-2-3 סוגים, אז לא צפוי גלישה).

---

## Decisions locked in Design

### כללי המלצה (`recommendFor`) — סדר חדש (first-match)
מוסיפים את כללי הכוסמין **בראש**, לפני כללי הלבן/מלא:

| # | תנאי | hydration | salt | levain |
|---|---|---|---|---|
| 1 | `speltWhole >= 30` | 76 | 2.2 | 18 |
| 2 | `speltWhite >= 50` | 73 | 2.0 | 18 |
| 3 | `white >= 80` | 72 | 2.0 | 20 |
| 4 | `wholeWheat >= 50` | 80 | 2.2 | 22 |
| 5 | `rye >= 30` | 78 | 2.2 | 25 |
| 6 | `white >= 50` | 75 | 2.0 | 20 |
| 7 | default | 75 | 2.0 | 20 |

הנמקה: כוסמין מלא — הידרציה נמוכה מחיטה מלאה (76 מול 80) כי הוא סופג מהר אך לא מחזיק; שאור נמוך (18) לריסון תסיסה מהירה; מלח 2.2 כבלם עדין. כוסמין לבן — קרוב ללבן (73) עם שאור נמוך. **כלל הכוסמין מקדים את `white >= 50`**, כך ש-50/50 לבן+כוסמין נתפס נכון (AC בבריף).

### פריסטים — 7, ערכים נעולים

| # (סדר בגלריה) | id | שם | tone | flour | hyd | salt | levain | תמונה |
|---|---|---|---|---|---|---|---|---|
| 1 | `country` | כפרי קלאסי | country | 80 לבן / 20 מלא | 75 | 2.0 | 20 | קיים |
| 2 | `white` | לבן בסיסי | white | 100 לבן | 72 | 2.0 | 20 | קיים |
| 3 | `spelt-white` | כוסמין לבן רך | beginner | 60 לבן / 40 כוסמין לבן | 70 | 2.0 | 18 | **חדש** |
| 4 | `country-rye` | כפרי שיפון | rye | 80 לבן / 20 שיפון | 75 | 2.0 | 20 | **חדש** |
| 5 | `wheat70` | 70% מלא | wheat | 30 לבן / 70 מלא | 78 | 2.2 | 22 | קיים |
| 6 | `spelt50` | 50% כוסמין מלא | spelt | 50 לבן / 50 כוסמין מלא | 76 | 2.2 | 18 | **חדש** |
| 7 | `rye50` | 50% שיפון | rye | 50 לבן / 50 שיפון | 78 | 2.2 | 25 | קיים |

- **יורד:** `whole100` ("מלא 100%"). ה-tone `wholedark` הופך ללא-בשימוש (Tech Lead: למחוק מ-`PresetTone` או להשאיר).
- **tone חדש:** `spelt`. (grep לא מצא שימוש ב-`tone` מחוץ ל-`presets.ts` — לאמת ב-Tech Lead שזה לא שובר סגנון.)
- **הסדר בגלריה** קל→מתקדם, אבל `country` נשאר ראשון (טסטים מתייחסים ל-`PRESETS[0]`).

**Blurbs (נעול):**
- כוסמין לבן רך: `"עדין וסלחני — טעם כוסמין רך והידרציה נמוכה. פתיחה מצוינת."`
- כפרי שיפון: `"כפרי עם נגיעת שיפון — טעם עמוק יותר, נשאר סלחני."`
- 50% כוסמין מלא: `"ארומה אגוזית-מתקתקה של כוסמין, מאוזנת עם קמח לבן."`

**תמונות חדשות (3):** `/presets/spelt-white.png`, `/presets/country-rye.png`, `/presets/spelt50.png`. מקור — להפיק בסגנון הפריסטים הקיימים (אפשר `nb2-prompt`). עד שיופקו — placeholder לא חוסם פיתוח אבל חוסם merge (AC: "תמונה תקפה לכל פריסט").

### מתח מוּדע: פריסט המתחילים מול ה-hint
"כוסמין לבן רך" ב-70% הידרציה, אך `recommendFor` עבורו (speltWhite=40 → כלל 6, `white>=50`) ממליץ 75% → `hintFor` (סף 2) יראה רמז "75%". זו התנגשות מכוונת: הפריסט סלחני בכוונה מתחת להמלצה. הרמז עדין (לא שגיאה), היוזר בחר במפורש פריסט מתחילים. **החלטה: משאירים.** לא מסבכים את `recommendFor` עם "כוונת מתחיל".

---

## Design System Impact
אין טוקנים או קומפוננטות חדשות. תוספת ערך אחד ל-union הקיים `PresetTone` (`"spelt"`). שאר השינויים = נתונים ומחרוזות.

## Open Questions
אין. (מחיקת `wholedark`/`flourOther` היתומים ומיקום מחרוזת `flourTypeLabels` הם פרטי מימוש ל-Tech Lead, לא החלטות מוצר.)
