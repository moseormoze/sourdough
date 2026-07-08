# Design: Open Beta Onboarding

## Screens Affected

- **גלובלי (כל המסכים)**: `WelcomeGate` — שכבת היכרות חד־פעמית שמכסה את האפליקציה עד לזיהוי. נטענת דרך `Providers` ב-`layout.tsx`
- **Home** (`components/home/home-screen.tsx`): `InstallBanner` מתחת לשני ה-CTAs
- **`app/layout.tsx`**: עדכון `metadata.icons` ל-PNG
- **`public/manifest.json`**: עדכון מערך האייקונים

## Components

- **New**: `WelcomeGate` (`components/onboarding/welcome-gate.tsx`) — מסך היכרות מלא; מרונדר רק כשאין זהות שמורה. ללא props (קורא/כותב storage בעצמו)
- **New**: `InstallBanner` (`components/onboarding/install-banner.tsx`) — כרטיס התקנה עם שלושה וריאנטים לפי סביבה. ללא props
- **New**: `InstallGuideSheet` (`components/onboarding/install-guide-sheet.tsx`) — שלבי התקנה ל-iOS בתוך BottomSheet. Props: `{ open: boolean; onClose: () => void }`
- **New (util)**: `lib/install/environment.ts` — `getInstallEnvironment(): "standalone" | "fb-in-app" | "ios" | "android-promptable" | "none"` — פונקציה טהורה עם הזרקת UA/matchMedia לבדיקות
- **New (util)**: `lib/identity/storage.ts` — קריאה/כתיבה של זהות עם Zod, key: `sourdough:v1:identity` (`{ name, email, identifiedAt }`)
- **Reused**: `TextInput`, `ValidationMessage`, `Button`, `BottomSheet` (peek 56%)
- **Modified**: `lib/analytics/posthog-client.ts` — פונקציה חדשה `identifyUser(email, { name })` העוטפת `posthog.identify()`
- **Modified**: `lib/analytics/events.ts` — אירועים חדשים (ראה Analytics)
- **Modified**: `components/home/home-screen.tsx` — הוספת `<InstallBanner />` מתחת ל-CTAs

---

## User Flow

### זרימה ראשית (ביקור ראשון מהפוסט בפייסבוק)

1. משתמש פותח את הלינק → `WelcomeGate` מכסה את המסך: לוגו, "נעים להכיר", שם + אימייל, שורת שקיפות, CTA
2. ממלא שם ואימייל תקין → CTA נדלק → לחיצה: שמירה ל-localStorage + `posthog.identify(email, { name })` + אירוע `identify_completed` → הגייט מתפוגג (200ms) → מסך הבית
3. במסך הבית מופיע `InstallBanner` לפי סביבה:
   - **דפדפן פייסבוק/אינסטגרם**: "אתם בדפדפן של פייסבוק — פתחו בדפדפן הרגיל (⋯ ← פתיחה בדפדפן חיצוני)" — הנחיה בלבד, אין כפתור (אי אפשר לברוח מה-WebView תוכנתית)
   - **אנדרואיד (נתפס `beforeinstallprompt`)**: טקסט ערך + כפתור "התקנה" → דיאלוג מערכתי
   - **iOS (לא standalone)**: טקסט ערך + כפתור "איך מתקינים?" → `InstallGuideSheet` עם 3 שלבים מאוירים
4. התקנה הושלמה (`appinstalled` / פתיחה במצב standalone) → הבאנר לא מרונדר יותר
5. סגירה ב-X → נשמר דגל, הבאנר לא חוזר לעולם

### קצוות

- **פתיחת האפליקציה המותקנת ב-iOS** (localStorage נפרד): `WelcomeGate` מופיע שוב — המשתמש ממלא שוב, וה-identify עם אותו אימייל מאחד את שתי הפרסונות ב-PostHog. באנר ההתקנה לא מופיע (standalone)
- **בייק פעיל בבית**: הבאנר מוצג רק כשאין `ResumeBanner` (לא מתחרים על תשומת לב באמצע בייק)
- **דסקטופ / דפדפן ללא נתיב התקנה** (`"none"`): לא מוצג באנר

---

## States

### WelcomeGate
- **Hidden**: קיימת זהות ב-storage → לא מרונדר (הבדיקה סינכרונית במאונט הראשון; עד אז מרונדר כיסוי `bg` אטום — למנוע הבזק של האפליקציה מתחת)
- **Empty / Partial**: CTA disabled; ולידציה נצבעת רק אחרי blur ראשון של שדה (לא להעניש תוך כדי הקלדה)
- **Valid**: CTA נדלק (accent)
- **Submitted**: שמירה + identify הם סינכרוניים/fire-and-forget — אין spinner ואין המתנה לרשת (§6: המשתמש לא מחכה לרשת בנתיב שמח). הגייט מתפוגג opacity→0 ב-200ms ease-in ומתפרק
- **Error**: רק ולידציית קלט (שם ריק / אימייל לא תקין) דרך `ValidationMessage`. אין מצב שגיאת רשת — identify שנופל לא חוסם את המשתמש

### InstallBanner
- **Hidden**: standalone / דגל installed / דגל dismissed / סביבה "none" / יש בייק פעיל
- **Visible**: אחד משלושת הווריאנטים
- **Dismissing**: fade + collapse גובה, 200ms ease-in → כתיבת דגל → cleanup מלא (§8)
- **Installed בזמן אמת**: אירוע `appinstalled` בזמן שהבאנר מוצג → אותה יציאה כמו dismiss

---

## פריסה — WelcomeGate

מסך מלא על `bg` (קרם), ממורכז, `z-gate` מעל הכל:

```
─────────────────────────────
        [לוגו כיכר 120px]

        נעים להכיר 👋
   עוד רגע אופים. ספרו לנו
        רק מי אתם:

   שם פרטי
   [______________________]

   אימייל
   [______________________]

   נשתמש בזה רק כדי להבין איך
   אופים עם כיכר ולעדכן אתכם
   על שיפורים. בלי ספאם.

   [    מתחילים לאפות 🍞   ]   ← accent, full-width, 56px
─────────────────────────────
```

- שדות: `TextInput` קיים, `dir="auto"`, אימייל עם `type="email" inputMode="email"` (תוכן לטיני מתיישר LTR אוטומטית)
- שורת השקיפות: `text-sm text-ink-3`
- אין כפתור דילוג — שדה חובה בהחלטת מוצר (brief)

## פריסה — InstallBanner

כרטיס `paper` עם `border-line`, מתחת ל-CTAs:

```
─────────────────────────────
 [X]                    [🏠⬇]
 כיכר על מסך הבית
 כמו אפליקציה אמיתית — והבייקים
 והמתכונים שלכם נשמרים לאורך זמן.
 [ התקנה ]        ← אנדרואיד: מפעיל דיאלוג
                  ← iOS: "איך מתקינים?" → sheet
─────────────────────────────
```

וריאנט פייסבוק (ללא כפתור):

```
─────────────────────────────
 [X]                     [🧭]
 אתם בדפדפן של פייסבוק
 כדי להתקין את כיכר פתחו בדפדפן
 הרגיל: תפריט ⋯ למעלה ← ״פתיחה
 בדפדפן חיצוני״
─────────────────────────────
```

**InstallGuideSheet** (iOS, peek 56%): שלושה שלבים ממוספרים —
1. אייקון `Share` (Lucide) — "לחצו על כפתור השיתוף בסרגל הדפדפן"
2. אייקון `SquarePlus` — "גללו ובחרו ״הוסף למסך הבית״"
3. אייקון `Check` — "אישור — וכיכר מחכה לכם במסך הבית"

הערת סביבה: ב-iOS 16.4+ גם כרום/פיירפוקס מציעים "הוסף למסך הבית" מתפריט השיתוף — אותן הנחיות תקפות, לא מפצלים וריאנט.

---

## Interaction Specs

- **State machine**: אין drag בפיצ'ר. כפתורים: `Idle → isPressed → Release` (§1)
- **Press feedback**: `.pressable` הקיים — `scale(0.965)`, 120ms ease-out (§2). חל על CTA, "התקנה", "איך מתקינים?", X
- **Gestures**: רק אלה המובנים ב-`BottomSheet` הקיים — לא נוגעים
- **Animation curves** (§5): כניסת הגייט — ללא (הוא ה-first paint); יציאת גייט/באנר — 200ms ease-in (fade-out/dismissal); כניסת sheet — כבר מוגדר ב-BottomSheet (spring)
- **Touch targets** (§10): CTA 56px; שדות 48px; כפתור באנר ≥44px; X — אייקון 16px בתוך 44×44px
- **Carry-over** (§8): loading — אין (אופטימי); feedback — התפוגגות הגייט היא האישור, הבית הוא ה-reward; cleanup — דגלי storage נכתבים לפני האנימציה, ה-state מתפרק אחרי
- **`prefers-reduced-motion`**: כבר מטופל גלובלית ב-`tokens.css`

## Optimistic / Sync Notes

- `identify` הוא fire-and-forget: הזהות נשמרת קודם ב-localStorage (מקור האמת המקומי), האירוע ל-PostHog נורה ברקע. אין rollback — כשל רשת לא מונע שימוש באפליקציה; ה-identify יידלק בביקור הבא (בדיקה במאונט: יש זהות ב-storage אבל PostHog עדיין אנונימי → קריאה חוזרת ל-identify)

## Locale / Direction Notes

- כל המחרוזות ב-`lib/strings.ts` תחת keys חדשים: `welcome.*`, `install.*`
- קופי סופי (מופיע בפריסות למעלה); ולידציה: `validation.emailInvalid: "כתובת אימייל לא תקינה"` — חדש
- אימייל: תוכן LTR בתוך מסך RTL — `dir="auto"` על השדה פותר; placeholder בעברית מיושר ימין עד שמקלידים
- אייקונים: `Share`, `Check`, `X` — סימטריים; `SquarePlus` סימטרי. אין אייקונים דורשי מירור
- ה-⋯ בהנחיית פייסבוק — תו נייטרלי, אין בעיית כיווניות

## Assets — אייקוני PNG (מיוצאים מ-`public/icon.svg`)

| קובץ | גודל | הערות |
|---|---|---|
| `public/icon-192.png` | 192×192 | manifest, `purpose: "any"` |
| `public/icon-512.png` | 512×512 | manifest, `purpose: "any"` |
| `public/icon-maskable-512.png` | 512×512 | הלוגו בתוך safe-zone של 80% על רקע `#F8F5EE` מלא, `purpose: "maskable"` |
| `public/apple-touch-icon.png` | 180×180 | רקע `#F8F5EE` אטום (iOS לא תומך שקיפות — שקוף → רקע שחור) |

עדכונים: `manifest.json` — מחליפים את רשומת ה-SVG במערך הרשומות למעלה (מפרידים `any` מ-`maskable` — רשומה משולבת גורמת לקליפינג באנדרואיד); `layout.tsx` — `icons.apple: "/apple-touch-icon.png"`.

## Analytics

אירועים חדשים ב-`events.ts`:

| אירוע | props | מתי |
|---|---|---|
| `identify_completed` | `—` (הזהות עצמה ב-identify) | שליחת כרטיס ההיכרות |
| `install_banner_shown` | `variant: "android" \| "ios" \| "fb-in-app"` | רינדור ראשון של הבאנר בסשן |
| `install_prompt_shown` | `variant` | פתיחת הדיאלוג המערכתי / ה-guide sheet |
| `install_completed` | `—` | `appinstalled` |
| `install_banner_dismissed` | `variant` | לחיצה על X |

**הקלטות סשן (אושר בשער העיצוב)**: ההקלטה נשארת כבויה באתחול (`disable_session_recording: true`) ומודלקת עם `posthog.startSessionRecording()` רק אחרי identify — מקליטים אך ורק משתמשים מזוהים שמסרו אימייל. Free tier: 5k הקלטות/חודש.

## Design System Impact

- **Token חדש**: `z-gate` (מעל `z-sheet: 50`, למשל 60) — ב-`tailwind.config.ts` + `tokens.css`
- **מחרוזות חדשות**: `strings.welcome.*`, `strings.install.*`, `validation.emailInvalid`
- **תבנית חדשה**: "כרטיס באנר עם X" — וריאציה של ResumeBanner; לא רכיב design-system נפרד בשלב זה
- אין רכיבי UI-בסיס חדשים

## Open Questions

<Empty — resolved at design gate. Session recording decision moved to Analytics above.>
