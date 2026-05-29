# Feature: Scheduled Bake

## Problem

האפליקציה מניחה שהאופה מוכן להתחיל עכשיו — הסטארטר בשיא, מתחילים, רואים "כ-24 שעות" ולא יודעים מתי הלחם יהיה מוכן. אבל אופים חושבים הפוך: "אני רוצה לחם לארוחת הבוקר של שבת ב-09:00 — מה אני צריך לעשות ומתי?" אין כיום שום מסך שעונה על השאלה הזו. התוצאה: האופה מחשב בעצמו, מתבלבל, ומפספס תזמונים. בנוסף, מסך "תכנון הסטארטר" שנבנה ב-feature 06 הוכיח שהלוגיקה של חישוב לאחור עובדת — אבל הוא מסתיים ב-dead end ולא מוביל לשום מקום.

## User Story

כאופה, אני רוצה לבחור מתי הלחם יהיה מוכן, כך שהאפליקציה תגיד לי בדיוק מתי לבצע כל שלב — האכלת הסטארטר, תחילת השאור, קיפולים, עיצוב, אפייה — לפי לוח זמן ספציפי עם תאריכים ושעות.

## Scope — What's In

- מסך "מתכנן הבייק" שמחליף את ה-confirm sheet הנוכחי
- בחירת יום ושעה ליעד "מתי הלחם מוכן"
- שאלת "הסטארטר מוכן?" — toggle פשוט שמשפיע על חישוב ה-minimum time
- ציר זמן מלא עם שעות ותאריכים ספציפיים לכל שלב (לא relative "כ-12 שעות")
- זמנים מחושבים לפי Q10 (טמפרטורת מטבח)
- CTA: "התחל בייק" — מתחיל מיד מהשלב הנכון לפי התזמון

## Out of Scope

- "שמור תוכנית" / upcoming bakes שנשמרים בלי להתחיל — feature נפרד
- Push notifications / reminders — תלוי תשתית, feature נפרד
- שינוי ה-stage screen עצמו (הזמנים בתוך ה-stages נשארים relative בשלב זה)
- Starter כ-stage 0 בתוך ה-active bake (discovery 05 — feature נפרד)

## Acceptance Criteria

- [ ] אחרי בחירת מתכון, המשתמש רואה תמיד את מסך מתכנן הבייק (לא confirm sheet ישן)
- [ ] המסך מאפשר בחירת יום ושעה ליעד הלחם
- [ ] המסך מכיל toggle "הסטארטר מוכן?" שמשפיע על ה-minimum time
- [ ] ציר הזמן מציג שעות ותאריכים ספציפיים לכל שלב מרכזי
- [ ] לחיצה על "התחל בייק" מתחילה active bake כרגיל
- [ ] הזמנים משתנים אוטומטית בעת שינוי טמפרטורה
- [ ] כל הטקסטים עברית RTL תקין

## Dependencies

- Depends on: Feature 06 (starter-readiness-gate) — הלוגיקה של `calculateFeedingWindow`, `calculateMinReadyAt`, `bakeDurationSecs` קיימת ומשמשת כבסיס
- Depends on: Feature 03 (bake-stages) — מבנה השלבים הקיים, `STAGES` data
- Replaces: `BakeConfirmSheet` component (או מתרחב ממנו)
- Blocks: Discovery 05 (starter-as-stage-zero) — תלוי באיך scheduled bake מתממש

## Open Questions

_ריק לפני Design phase._
