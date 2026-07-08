# Tasks: Open Beta Onboarding

## Task List

### T1 — Identity Layer: storage + identify + session recording
**Goal:** שכבת הזהות כולה — אחסון מקומי עם Zod, עטיפת `posthog.identify`, הדלקת הקלטות למזוהים בלבד, וטיפוס אירוע `identify_completed`.

**Files likely touched:**
- `lib/identity/storage.ts` — חדש: schema (`{ name, email, identifiedAt }`), key `sourdough:v1:identity`, read/write
- `lib/identity/storage.test.ts` — חדש
- `lib/analytics/posthog-client.ts` — `identifyUser(email, { name })`: normalize (trim + lowercase לאימייל) → `posthog.identify` → `posthog.startSessionRecording()`
- `lib/analytics/posthog-client.test.ts` — עדכון/חדש
- `lib/analytics/events.ts` — `identify_completed`

**Test strategy:**
- storage: roundtrip תקין; JSON מקולקל / schema לא תקין → `null` (לא זריקה); key מדויק
- `identifyUser`: mock `posthog-js` — נקרא עם אימייל מנורמל כ-distinct id ו-`name` כ-property; `startSessionRecording` נקרא אחרי identify; לא קורס כשלא initialized
- נרמול: `" Moozly5@Gmail.com "` → `"moozly5@gmail.com"` (אחרת אותו אדם מתפצל לשניים)

**Depends on:** —

**Done when:**
- [ ] Tests written and passing
- [ ] `identifyUser` מנרמל אימייל לפני identify וכתיבה ל-storage
- [ ] הקלטת סשן מודלקת רק אחרי identify — אנונימיים לא מוקלטים
- [ ] קריאה חוזרת ל-`identifyUser` עם אותו אימייל אידמפוטנטית

---

### T2 — WelcomeGate: מסך היכרות + חיבור ל-Providers
**Goal:** שער הזיהוי החד־פעמי — UI מלא, ולידציה, שמירה + identify + אירוע, re-identify שקט בכל טעינה למי שכבר מזוהה.

**Files likely touched:**
- `components/onboarding/welcome-gate.tsx` — חדש
- `components/onboarding/welcome-gate.test.tsx` — חדש
- `components/providers.tsx` — עטיפת children ב-gate
- `lib/strings.ts` — `welcome.*`, `validation.emailInvalid`
- `tailwind.config.ts` + `specs/design/tokens.css` — token חדש `z-gate: 60`

**Test strategy:**
- אין זהות → הגייט מרונדר ותוכן האפליקציה לא נגיש
- שם ריק / אימייל לא תקין → CTA disabled; `ValidationMessage` מופיע רק אחרי blur ראשון
- submit תקין → זהות נכתבת ל-storage, `identifyUser` נקרא, `identify_completed` נורה, הגייט נעלם
- זהות קיימת → הגייט לא מרונדר ו-`identifyUser` נקרא מחדש (re-identify שקט, מכסה כשל רשת קודם)
- SSR/first-paint: לפני שהבדיקה הסינכרונית של localStorage רצה — מרונדר כיסוי `bg` אטום, לא האפליקציה (אין הבזק)

**Depends on:** T1

**Done when:**
- [ ] Tests written and passing
- [ ] כל הקופי מ-`strings.welcome`, ולידציית אימייל דרך `strings.validation.emailInvalid`
- [ ] CTA בגובה 56px, שדות ≥48px, `.pressable` על CTA
- [ ] יציאת הגייט: fade 200ms ease-in, cleanup מלא של ה-state
- [ ] `dir="auto"` על השדות; אימייל עם `type="email" inputMode="email"`
- [ ] הגייט מופיע גם ב-standalone כשההקשר לא מזוהה (AC מה-brief)

---

### T3 — Install Environment: זיהוי סביבה + hook + דגלים
**Goal:** התשתית הלוגית של ההתקנה — פונקציית סביבה טהורה, hook שתופס `beforeinstallprompt`/`appinstalled`, דגלי storage, וטיפוסי אירועי ההתקנה.

**Files likely touched:**
- `lib/install/environment.ts` — חדש: `getInstallEnvironment(deps): "standalone" | "fb-in-app" | "ios" | "android-promptable" | "none"` — מקבל `{ userAgent, isStandalone, promptCaptured }` כפרמטרים
- `lib/install/environment.test.ts` — חדש
- `lib/install/use-install-prompt.ts` — חדש: hook — `preventDefault` + שמירת האירוע, האזנה ל-`appinstalled` → דגל + `install_completed`
- `lib/install/storage.ts` — חדש: דגלים `sourdough:v1:install-banner-dismissed`, `sourdough:v1:installed`
- `lib/analytics/events.ts` — `install_banner_shown`, `install_prompt_shown`, `install_completed`, `install_banner_dismissed` (עם `variant`)

**Test strategy:**
- טבלת UA: `FBAN`/`FBAV` → fb-in-app; `Instagram` → fb-in-app; iPhone Safari → ios; Android Chrome + promptCaptured → android-promptable; Android בלי prompt → none; desktop → none
- standalone גובר על הכל (גם ב-fb UA תיאורטי)
- hook: dispatch של `beforeinstallprompt` סינתטי → `preventDefault` נקרא והאירוע נשמר; `appinstalled` → דגל נכתב + track
- דגלים: roundtrip + keys מדויקים

**Depends on:** —

**Done when:**
- [ ] Tests written and passing
- [ ] `getInstallEnvironment` טהורה — אפס גישה ל-`window` בתוכה
- [ ] הצהרת טיפוס מקומית ל-`BeforeInstallPromptEvent` (לא קיים ב-lib של TS), בלי `any`

---

### T4 — InstallBanner + InstallGuideSheet + שילוב בבית
**Goal:** ה-UI של ההתקנה — כרטיס עם שלושה וריאנטים, sheet הדרכה ל-iOS, ושילוב במסך הבית עם כללי ההצגה/העלמה.

**Files likely touched:**
- `components/onboarding/install-banner.tsx` — חדש
- `components/onboarding/install-banner.test.tsx` — חדש
- `components/onboarding/install-guide-sheet.tsx` — חדש (+ test)
- `components/home/home-screen.tsx` — `<InstallBanner />` מתחת ל-CTAs, מוסתר כשיש בייק פעיל
- `lib/strings.ts` — `install.*`

**Test strategy:**
- רינדור וריאנט לפי סביבה (mock ל-environment/hook): android → כפתור "התקנה"; ios → "איך מתקינים?"; fb-in-app → הנחיה בלי כפתור
- android: לחיצה → `prompt()` על האירוע השמור + `install_prompt_shown`; `appinstalled` בזמן שהבאנר גלוי → הבאנר יוצא
- ios: לחיצה → ה-sheet נפתח (peek) + `install_prompt_shown`
- dismiss: X → דגל נכתב + `install_banner_dismissed` + יציאה (fade+collapse 200ms); רינדור מחדש → לא מופיע
- לא מרונדר: standalone / dismissed / installed / none / בייק פעיל
- `install_banner_shown` נורה פעם אחת לרינדור ראשון עם ה-variant הנכון

**Depends on:** T3

**Done when:**
- [ ] Tests written and passing
- [ ] X בתוך מטרה 44×44px; כפתורי הבאנר ≥44px; `.pressable` על כולם
- [ ] וריאנט פייסבוק ללא כפתור — הנחיית ⋯ בלבד
- [ ] כל הקופי מ-`strings.install`; RTL תקין (logical properties בלבד)
- [ ] הבאנר לא מוצג לצד `ResumeBanner`

---

### T5 — PNG Icons + Manifest + Metadata
**Goal:** אייקוני התקנה אמיתיים — ארבעה PNG מיוצאים מ-`icon.svg`, עדכון manifest ו-layout.

**Files likely touched:**
- `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png`, `public/apple-touch-icon.png` — חדשים (מיוצרים בסקריפט חד־פעמי עם `sharp` כ-devDependency או `npx`, ה-PNG נכנסים ל-git)
- `public/manifest.json` — מערך icons חדש: `any` (192/512) נפרד מ-`maskable` (512)
- `app/layout.tsx` — `icons.apple: "/apple-touch-icon.png"`, `icons.icon` נשאר SVG לטאב הדפדפן

**Test strategy:**
- טסט קטן שקורא את `public/manifest.json`: parse תקין, כל רשומת icon מפנה לקובץ קיים, קיימות רשומות 192+512 `any` ו-512 `maskable`, אין רשומה משולבת `"any maskable"`
- ידני (לא אוטומטי): התקנה על אנדרואיד ו-iOS — האייקון נראה נכון, maskable לא נחתך (בדיקה ב-maskable.app)

**Depends on:** —

**Done when:**
- [ ] Tests written and passing
- [ ] `apple-touch-icon.png` עם רקע `#F8F5EE` אטום (בלי שקיפות)
- [ ] maskable עם הלוגו ב-safe-zone של 80%
- [ ] סקריפט הייצוא לא נכנס ל-dependencies של runtime

---

## Build Order

```
T1 → T2          (זהות)
T3 → T4          (התקנה)
T5               (עצמאי)
```

שלושה מסלולים מקבילים; אין תלות בין המסלולים. סדר מומלץ אם עובדים סדרתית: T1 → T2 → T3 → T4 → T5.

## Risks

- **`beforeinstallprompt` הוא Chromium-only ולא קיים ב-jsdom** — הטסטים משתמשים ב-CustomEvent סינתטי; הטיפוס מוצהר מקומית. בדיקת אמת רק על מכשיר אנדרואיד
- **UA sniffing שביר** — פייסבוק משנה מחרוזות UA מדי פעם; `FBAN`/`FBAV`/`Instagram` נכונים להיום. הפונקציה הטהורה מרכזת את זה במקום אחד
- **`navigator.standalone` לא סטנדרטי** (iOS בלבד) — דורש הרחבת טיפוס, בלי `any`
- **הבזק גייט ב-hydration**: localStorage לא קיים ב-SSR — חובה לרנדר כיסוי אטום עד הבדיקה במאונט, אחרת האפליקציה מהבהבת מתחת לגייט (מכוסה בטסט ב-T2)
- **אימייל כ-distinct id בלי נרמול מפצל אנשים** — הנרמול חובה ב-T1 לפני כל identify
- **רסטריזציה של SVG** דורשת כלי (sharp/resvg) — סקריפט dev חד־פעמי, לא תלות ריצה
- **Free tier הקלטות**: 5k/חודש — מעל ומעבר לבטא של עשרות משתמשים
