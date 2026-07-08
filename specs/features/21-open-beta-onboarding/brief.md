# Feature: Open Beta Onboarding

## Problem
לפני הפוסט בקבוצות הפייסבוק (Phase 3) יש שני חסמים. הראשון: המשתמשים אנונימיים — PostHog עוקב אחרי `distinct_id` אבל אין שום דרך לדעת מי האנשים או ליצור איתם קשר, ו-auth מלא נפסל כי אין דאטה בצד שרת שמצדיק אותו. השני: התקנה למסך הבית היא תהליך ידני שאיש לא ינחש לבד — ומי שמגיע מהפוסט נוחת בדפדפן הפנימי של פייסבוק, שבו "הוסף למסך הבית" לא קיים בכלל. בלי הפיצ'ר הזה הבטא תניב משתמשים שאי אפשר לזהות, שרובם לא יתקינו, ושב-iOS עלולים לאבד את כל הדאטה שלהם (מחיקת localStorage אחרי 7 ימים ללא ביקור — ממנה אפליקציה מותקנת פטורה).

## User Story
As a baker arriving from a Facebook group post, I want to introduce myself once and install כיכר to my home screen with clear guidance, so that the app lives on my device like a real app and my bakes are never lost.

(וכבעל המוצר: so that I know who my beta users are and can follow their journeys in PostHog.)

## Scope — What's In
- **כרטיס היכרות חד־פעמי** בכניסה הראשונה, לפני שימוש באפליקציה: שם פרטי + אימייל (שניהם חובה, ולידציית אימייל בסיסית) + שורת שקיפות אחת על למה אוספים
- קריאה ל-`posthog.identify()` עם האימייל כ-distinct id והשם כ-property — כך זהות מ-Safari ומהאפליקציה המותקנת מתאחדת לאדם אחד ב-PostHog
- **אייקוני PNG**: 192/512 ל-manifest + `apple-touch-icon` בגודל 180px (מיוצאים מ-`icon.svg` הקיים)
- **אנדרואיד/כרום**: האזנה ל-`beforeinstallprompt` → כפתור "התקן את כיכר" שמפעיל את דיאלוג ההתקנה המערכתי
- **iOS ספארי**: באנר הנחיה — "⬆️ שיתוף ← הוסף למסך הבית" — מוצג מוקדם (בביקור הראשון, אחרי כרטיס ההיכרות), ניתן לסגירה עם שמירת הסגירה
- **דפדפן פנימי של פייסבוק/אינסטגרם** (UA: `FBAN`/`FBAV`/`Instagram`): באנר "פתח בדפדפן" עם הנחיה לתפריט ⋯, במקום UI התקנה שלא יעבוד שם
- **לוגיקת העלמה**: במצב standalone באנרי ההתקנה לא מרונדרים לעולם; באנדרואיד `appinstalled` נרשם כדגל; ב-iOS סגירה נשמרת ב-localStorage
- **מסגור ערך למשתמש** בקופי של הבאנר: ההתקנה שומרת על הבייקים והמתכונים (פטור ממחיקת 7 הימים של ספארי)
- אירועי PostHog לפאנל ההתקנה: `identify_completed`, `install_prompt_shown`, `install_completed`, `install_banner_dismissed`

## Out of Scope
- Supabase Auth / דאטה בצד שרת — נשאר ב-Phase 4 לפי launch-plan
- Service worker / offline support — לא נדרש להתקנה
- מיגרציית דאטה מספארי לאפליקציה המותקנת — בלתי אפשרי ב-iOS; הפתרון הוא לדחוף התקנה לפני שנצבר דאטה
- עמוד Privacy Policy מלא — פריט Phase 3 נפרד בצ'קליסט של launch-plan
- אימיילים יוצאים למשתמשים (re-engagement)

## Acceptance Criteria
- [ ] בכניסה ראשונה מוצג כרטיס היכרות; אי אפשר להמשיך בלי שם ואימייל תקין
- [ ] שליחה קוראת ל-`posthog.identify(email, { name })`; הכרטיס לא מוצג שוב באותו הקשר דפדפן
- [ ] המשתמש מופיע ב-PostHog עם שם ואימייל, מקושר לכל האירועים שלו
- [ ] אייקון מותקן נראה תקין: iOS (apple-touch-icon 180) ואנדרואיד (192/512 maskable)
- [ ] כרום־אנדרואיד: כפתור התקנה מופיע רק כש-`beforeinstallprompt` נורה; לחיצה פותחת את הדיאלוג המערכתי; אחרי התקנה הכפתור לא חוזר
- [ ] ספארי־iOS (לא standalone): באנר הנחיה מוצג; X סוגר ונשמר — לא מוצג שוב
- [ ] דפדפן פנימי של פייסבוק/אינסטגרם: מוצג באנר "פתח בדפדפן" בלבד, בלי UI התקנה
- [ ] במצב standalone שום באנר התקנה לא מרונדר; כרטיס ההיכרות עדיין מוצג אם ההקשר הזה טרם זוהה
- [ ] כל אירועי ה-PostHog של הפאנל נורים בנקודות הנכונות
- [ ] עברית / RTL תקין — logical properties בלבד, טאצ׳-טרגטים ≥ 44px

## Dependencies
- Depends on: PostHog מחובר (קיים, `lib/analytics/`); ייצוא PNG מ-`public/icon.svg`
- Blocks: Phase 3 — הפוסט בקבוצות הפייסבוק

## Open Questions
<Should be empty before Design phase.>
