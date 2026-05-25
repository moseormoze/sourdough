# Feature: bake-stages

## Problem

ה-shell של בייק-סשן (02) יודע להתחיל בייק, לזכור את ״איפה אני״, ולחזור לשלב הנוכחי — אבל כל מסך שלב הוא placeholder ריק. בלי תוכן השלבים, האפליקציה לא מספקת את הליווי שהיא הוקמה בשבילו. זה ה-feature שהופך אותה לאפליקציה ממש.

## User Story

כאופה באמצע בייק, אני רוצה לפתוח את האפליקציה ולמצוא במסך השלב הנוכחי:
- שם השלב + מסכת מבט קצרה ״מה אני עושה כאן״,
- הוראות ברורות מה לעשות,
- רשימת רפרנס של ״איך הבצק אמור להיראות״ (קריאה בלבד, לא לסמן),
- כפתור ״הבא״ שזמין תמיד,
- בשלבי טיימר (התפחה במקרר, חימום תנור, אפייה, קירור) — אפשרות צדדית-קטנה ״התחל טיימר״ אם רוצים,
- בשלב 4 (תסיסה ראשונית) — מציין כמה קיפולים בוצעו ומה הבא.

## Scope — What's In

### תוכן ב-`lib/data/stages.ts`
- מבנה data per-stage:
  ```ts
  type Stage = {
    n: number;              // 1..12
    name: string;            // עברית, מההנדאוף
    hint?: string;           // לועזית בסוגריים, פעם אחת
    type: 'check' | 'timer' | 'bulk' | 'done';
    durationLabel: string;   // ל-display ולא לחישוב — "כ-4 שעות", "12 שעות"
    briefing: { heading: string; blurb: string; takeaways: string[] };
    todo: string;            // ההוראה המרכזית
    checks?: string[];       // לרפרנס בלבד, לא חוסם
    durationSeconds?: number; // רק לשלבי timer — לטיימר אופציונלי
    subSteps?: number;       // רק לבולק (=4)
  };
  ```
- 12 פריטי תוכן מההנדאוף `data.js`. נשמרים ב-source code (לא ב-localStorage) — content static.

### Stage Shell (Universal Layout)
מסך אחד שמרנדר את כל ה-12 שלבים. עוקב אחרי המבנה הקנוני מההנדאוף:
- **TopBar** עם back + ״{n}/12״
- **ProgressStrip** — 12 מקטעים, הנוכחי highlighted
- **StageHeader** — pill עם משך + name + hint
- **Briefing** — peach-card עם heading + blurb + takeaways
- **״מה לעשות״** — InstructionCard עם ה-todo (טקסט עברי)
- **״איך לדעת״** — Checklist (טקסט בלבד עם bullets, אין checkboxes)
- **FoldDots** — רק ב-stage 4: 4 נקודות לסטרץ׳-אנד-פולד
- **Optional Timer Helper** — רק ב-type:'timer': כפתור ghost קטן ״התחל טיימר״. כשהוא פעיל, מציג ספירה לאחור פשוטה. **לא חוסם** מעבר לשלב הבא. נשמר ב-state of activeBake.
- **StickyActions** בתחתית:
  - Primary: ״הבא — {next stage name}״ (תמיד פעיל). שלב 12 → ״סיימתי״ → /bake/done
  - Ghost: ״חזרה לשלב הקודם״ (רק אם currentStage > 1)

### Stage 4 (תסיסה ראשונית) — Sub-steps
- `subSteps: 4` ב-data → רכיב `FoldDots` מציג 4 נקודות מנוקדות
- מעבר ל-substep הבא = לחיצה על ״סיימתי קיפול״ (לא ״הבא״). אחרי הקיפול האחרון → ״הבא — עיצוב ראשוני״
- נשמר ב-`activeBake.subStep` (already in T1 schema as part of observationChecks, אבל נוסיף שדה ייעודי)

### State persistence
- כל ניווט בין שלבים → `advanceTo(n)` קורא ל-`saveActiveBake` כך שעם reload נוצר resume לשלב הנכון
- timer optional state: אם המשתמש התחיל timer, ה-`stageStartedAt` כבר נשמר וניתן לחשב מתי הוא יסתיים — אבל הטיימר לא מסונכרן בין reloads (זה רק helper)

### Tests
- Unit על `lib/data/stages.ts` schema (כל 12 מוגדרים, sub-steps רק ב-4)
- RTL על StageShell render — briefing, todo, checklist as text, sticky actions
- RTL על FoldDots — 0/4 → 1/4 → 4/4 → next stage
- RTL על optional timer — start, display, doesn't block next button
- Integration: full happy path stage 1 → 12 → /bake/done

## Out of Scope

- **Education layer מורחב** — `<Term>` popovers, `<Expand>` (״למה?״), VideoCard, Questions module עם BottomSheet. כל אלה דחויים ל-follow-up feature.
- **תמונות רפרנס** ב-RefGallery — דחוי. כרגע הצ׳ק־ליסט הוא טקסט בלבד.
- **התראות** — לא ב-MVP (Discovery). הטיימרים האופציונליים שלנו לא שולחים notifications.
- **Push reminders ל-+5 דקות** — נדחה.
- **שמירת הבייק שהושלם בהיסטוריה** — שייך ל-04.

## Acceptance Criteria

- [ ] `lib/data/stages.ts` מכיל 12 פריטים עם תוכן עברי תקין (briefing+blurb+takeaways+todo+checks)
- [ ] שלב 1-3, 5, 6 הם type=`check` עם checks
- [ ] שלב 4 הוא type=`bulk` עם subSteps=4
- [ ] שלב 7-11 הם type=`timer` עם durationSeconds
- [ ] שלב 12 הוא type=`done`
- [ ] StageShell מציג TopBar+ProgressStrip+StageHeader+Briefing+todo+checks+StickyActions
- [ ] ProgressStrip מסמן את השלב הנוכחי בולט (כל ה-12 מקטעים נראים)
- [ ] Checklist הוא טקסט עם bullets — לא tappable
- [ ] Sticky Primary button תמיד פעיל. שלב 12 הראשי → ״סיימתי״ → router.push('/bake/done')
- [ ] שלב 4 מציג FoldDots עם 4 נקודות; ״סיימתי קיפול״ מתקדם sub-step; אחרי 4 sub-steps → ״הבא״ פעיל
- [ ] שלבי timer (7-11) מציגים כפתור ghost ״התחל טיימר״; לחיצה מתחילה ספירה לאחור בלי לחסום ״הבא״
- [ ] לחיצה על ״הבא״ קוראת ל-`advanceTo(n+1)` → ניווט ל-`/bake/stage/{n+1}` → resume אחרי reload עובד
- [ ] לחיצה על ״חזרה לשלב הקודם״ קוראת ל-`advanceTo(n-1)` (זמין רק כש-currentStage > 1)
- [ ] כל המסכים בעברית עם RTL תקין; CSS לוגי בלבד; touch targets ≥44px
- [ ] tests יחידה ל-stages data + RTL ל-StageShell + FoldDots + optional timer

## Dependencies

- **Depends on**: 02-bake-session-shell (קיים) — `useActiveBake`, `advanceTo`, `/bake/stage/[n]` route, ResumeBanner
- **Blocks**: 04-bake-completion-journal — שלב 12 → /bake/done

## Open Questions

(אין. כל מה שדרוש לעבור לעיצוב נסגר.)
