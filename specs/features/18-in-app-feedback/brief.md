# Feature: In-App Feedback

## Problem
משתמשי בטא נתקלים בבאגים ויש להם הצעות, אבל הפריקשן של לצאת מהאפליקציה ולשלוח מייל בנפרד גורם לרוב הפידבק להיעלם. ככל שהמחסום נמוך יותר — כך מגיעים יותר insights שמאפשרים לשפר את המוצר מהר.

## User Story
As a beta user, I want to send feedback from within the app, so that I can report a bug or suggest a feature without losing my baking context.

## Scope — What's In
- Floating button נגיש מכל מסך — מיקום קבוע bottom-start, קטן ולא פולשני
- Sheet שנפתח מעל המסך הנוכחי
- בחירת סוג פידבק: באג / הצעה לפיצ׳ר / שאלה / אחר
- שדה שם (אופציונלי)
- שדה תיאור (חובה)
- העלאת תמונה מגלריה (אופציונלי) — דחיסה client-side לפני שליחה
- שליחה למייל של המפתח דרך Resend API route

## Out of Scope
- Screenshot אוטומטי של המסך
- ניהול פידבקים בממשק admin
- אחסון פידבקים ב-DB (Supabase)
- Rate limiting / anti-spam
- צילום מצלמה ישיר

## Acceptance Criteria
- [ ] לחיצה על הכפתור פותחת sheet מכל מסך באפליקציה
- [ ] לא ניתן לשלוח ללא תיאור (ולידציה)
- [ ] תמונה נדחסת ל-max 1024px / JPEG 70% לפני שליחה
- [ ] מייל מגיע ל-eilon@mycache.ai עם כל השדות + תמונה מוטמעת
- [ ] state מלא: idle → sending → success / error עם פידבק ויזואלי למשתמש
- [ ] הכפתור לא מפריע ל-CTAs הראשיים — מיקום ו-z-index נבדקים על כל המסכים הקיימים
- [ ] הכפתור נגיש מכל מסך ללא יוצא מן הכלל
- [ ] עברית / RTL תקין

## Dependencies
- Depends on: Resend account + API key (env var `RESEND_API_KEY`)
- Blocks: —

## Open Questions
<Should be empty before Design phase.>
