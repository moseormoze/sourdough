# Discovery 15 — In-App Feedback

**Status:** Closed  
**Date:** 2026-05-31

## הרעיון

משתמשי beta יוכלו לשלוח פידבק ישירות מתוך האפליקציה — בלי לצאת, בלי לפתוח מייל. כפתור floating קבוע מאפשר גישה מכל מסך.

## בעיה שנפתרת

בשלב ה-beta, הצמד הכי חשוב הוא feedback loop מהיר. כשמשתמש נתקל בבאג או יש לו הצעה — הוא לרוב לא ישלח מייל בנפרד. הורדת הפריקשן מגדילה את כמות ה-insights שמגיעים.

## החלטות Discovery

### UX
- **Floating button** — עגול, bottom-start, נגיש מכל מסך
- **Sheet / Dialog** — נפתח מעל המסך הנוכחי (לא navigation)
- **שדות:** סוג פידבק (בחירה) + שם (אופציונלי) + תיאור (חובה) + תמונה (אופציונלי)
- **סוגי פידבק:** באג | הצעה לפיצ׳ר | שאלה | אחר

### תמונה
- בחירה מגלריה בלבד (לא מצלמה, לא screenshot API)
- דחיסה בצד הלקוח: Canvas → JPEG 70% @ max 1024px → ~150–300KB
- מוטמעת כ-base64 בגוף המייל

### Backend
- Next.js API route (`/api/feedback`)
- Resend לשליחת המייל (free tier, כבר מתוכנן ב-launch-plan)
- זהו ה-backend הראשון בפרויקט — API route בלבד, אין DB

### Out of Scope
- Storage מלא (Supabase) — נדחה
- Screenshot אוטומטי של המסך — נדחה
- ניהול פידבקים בממשק — נדחה
- Rate limiting / anti-spam — נדחה ל-v2

## Stack שנכנס

| שכבה | טכנולוגיה |
|---|---|
| Email | Resend (`resend` npm package) |
| API | Next.js App Router route handler |
| Image | Canvas API (client-side compression) |

## סיכום

פיצ׳ר קטן, ערך גבוה לבטא. הוספת Resend היא ה-side effect הכי משמעותי — אבל מתוכנן ממילא.
