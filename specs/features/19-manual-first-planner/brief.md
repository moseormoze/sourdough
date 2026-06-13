# Feature 19: Manual-First Planner

## Problem
מסך התכנון מכריח בחירת **מצב** — אחד מארבעת הפריסטים (מהיר/קלאסי/קלאסי מאוחר/ארוך) או card נפרד "לכוונן בעצמי". מתוך שימוש בפועל: בחירת פריסט "סופית" אינה ריאלית — בייקרים כמעט תמיד רוצים לכוונן ידנית. כך נוצרים שלב החלטה מיותר (לבחור "איך לכוון" לפני שרואים את הכוונון) והסתרה של הכוונון הידני מאחורי card חמישי.

## User Story
As a home baker, I want the manual schedule controls open by default with presets as an optional starting point, so that I can fine-tune my bake times directly without first choosing a "mode".

## Scope — What's In
- הסרת ה-state machine `ScheduleMode` (none/preset/manual) ו-`PresetCard` — הכוונון הידני תמיד גלוי.
- שורת **chips** קומפקטית מעל הכוונון ("התחל מתבנית:") עם הפריסטים הקיימים; לחיצה **מזריקה** ערכים (יום+שעה, retard, יחס שאור) לתוך הכוונון.
- שמירת הכותרת `תכננו את זמני הבייק` / `בחרו תבנית מומלצת או כווננו ידנית`.
- שמירת toggle הכיוון (להתחיל/לסיים), בורר יום/שעה, `RatioControl`, ו-`BakeTimeline` — מוצגים תמיד.
- מציאת בית חדש ל-`CompactBakeSummary` (היום חי בתוך ה-preset card).

## Out of Scope
- שינוי הגדרות הפריסטים (`lib/bake-presets.ts`) או `computePresetSchedule`.
- שינוי מנוע התזמון (`lib/bake-timing.ts`).
- שינוי התנהגות/לוגיקת toggle הכיוון.
- פריסטים מבוססי-אירוע ("בוקר שבת" וכו').

## Acceptance Criteria
- [ ] בכניסה למסך, פקדי הכוונון (toggle כיוון, יום/שעה, יחס שאור, ציר זמן) גלויים מיד — בלי לחיצה.
- [ ] אין יותר `radiogroup` של preset cards ואין card "לכוונן בעצמי".
- [ ] שורת chips של פריסטים מופיעה מעל פקדי הכוונון, פחות-בולטת מהפקדים.
- [ ] לחיצה על chip ממלאת יום+שעה+retard+יחס שאור; לאחר מכן המשתמש יכול לדייק כל ערך חופשי.
- [ ] שינוי ידני של יום/שעה אחרי בחירת chip לא נחסם ולא "קופץ" חזרה.
- [ ] CTA "התחל בייק" פעיל בכל פעם שהכוונון `isValid`.
- [ ] `onConfirm` נשלח עם אותם פרמטרים כמו היום (feedAt, peakAt, feedRatio, retardHours).
- [ ] כל הטסטים הקיימים עוברים / מעודכנים; `tsc` נקי; RTL נקי (לוגי בלבד).

## Dependencies
- Depends on: Feature 12 (schedule-presets) — קיים; Feature 10 (flour-aware timing) — merged ✅
- Supersedes UX: Feature 12 preset-card flow; Feature 11 (planning-ux-v2, ספק נמחק)
- Blocks: —

## Open Questions
1. כיוון אחרי פריסט — האם chip כופה `direction = "end"` (כמו היום) או מזריק ערכים בלבד ושומר כיוון נוכחי?
2. מצב ויזואלי של chip — האם יש "selected" אחרי הזרקה ומתי מתנקה, או רק פעולת מילוי חד-פעמית ללא selected?
3. מיקום `CompactBakeSummary` / ציר הזמן במבנה החדש.
