# Feature: In-Bake Timeline

## Problem
אפייה היא תהליך של 24–36+ שעות שהמשתמש נכנס ויוצא ממנו. כרגע אין שום דרך לדעת "איפה אני בתמונה הגדולה" — רק את השלב הנוכחי. מה מצפה לי קדימה? כמה זמן נשאר? המשתמש נאלץ לנחש או לזכור את התוכנית המקורית. זה יוצר חרדה ואיבוד כיוון בדיוק כשהתהליך הוא הכי ארוך.

## User Story
As a baker mid-bake, I want to see all stages at a glance with estimated durations, so that I know where I am in the process and what to expect next.

## Scope — What's In
- פס ההתקדמות (stepper) בראש ה-StageScreen הופך לחיץ — הדיזיין חייב לפתור את האפורדנס: כרגע הstepper לא נראה לחיץ בכלל, ויש למצוא דרך להמחיש שניתן ללחוץ עליו (למשל: אייקון, underline, ripple, hint טקסט, או כל פתרון אחר שיעבור בDesign review)
- לחיצה פותחת bottom sheet עם רשימת כל 12 השלבים
- כל שלב מציג: שם + משך משוער (`כ-30 דק׳` / `כ-4 שעות`)
- שלבים שהושלמו: מסומנים ✓ ומעומעמים
- השלב הנוכחי: מודגש
- שלבים קדימה: רגילים/אפורים

## Out of Scope
- שעות מדויקות או T+N מוחלט
- Adaptive recalculation לפי זמני סיום בפועל
- התראות (פיצ׳ר נפרד בהמשך)
- ניווט לשלב אחר דרך הsheet
- עריכת תוכנית תוך כדי בייק

## Acceptance Criteria
- [ ] לחיצה על הstepper פותחת bottom sheet
- [ ] כל 12 שלבים מוצגים עם שם ומשך
- [ ] שלבים שעברו מסומנים ✓
- [ ] השלב הנוכחי מודגש ויזואלית
- [ ] סגירת הsheet (גרירה למטה / X / לחיצה על הרקע) חוזרת ל-StageScreen
- [ ] עובד ב-RTL

## Dependencies
- Depends on: StageScreen (`components/bake/stage-screen.tsx`), StageHeader
- Blocks: F18 (adaptive timeline עם timestamps אמיתיים)

## Open Questions
