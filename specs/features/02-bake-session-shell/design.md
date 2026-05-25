# Design: bake-session-shell

## Screens Affected

| מסך | שינוי |
|---|---|
| **HomeScreen** (קיים) | מוסיף מצב **״ממשיכים את הבייק שלך״** כשיש active bake. כשאין — נשאר כמו שהוא. |
| **/bake/new** (קיים, stub) | מוחלף ב-**ChooserScreen** — בחירת מתכון/preset להתחלת בייק. |
| **/bake/stage/[n]** | חדש — מסך placeholder לכל שלב. הגנות + redirect. |
| **/bake/done** | חדש — placeholder ל-completion. |
| **BakeStubScreen** | נמחק. |

## Components

**חדשים:**

| Component | תפקיד | חתימה |
|---|---|---|
| `ChooserScreen` | בחירת מתכון/preset לפתיחת בייק | `()` |
| `ChooserCard` | קלף בודד בגריד — preset או מתכון משתמש | `({ kind: 'preset' \| 'recipe', source, onSelect })` |
| `ResumeCard` | כרטיס במסך הבית למצב active | `({ activeBake, onResume, onAbandon })` |
| `BakeStageStubScreen` | placeholder לשלב — מציג ״שלב N — בקרוב״ עם back. | `({ stageNumber })` |
| `AbandonBakeDialog` | דיאלוג אישור לוויתור על בייק פעיל | `({ open, recipeName, onConfirm, onCancel })` |
| `useActiveBake` (hook) | קריאת/יצירת/מחיקת active bake (client-only) | `() => { activeBake, start(recipe), abandon(), advanceTo(n) }` |

**Reused/Existing:**
- `Button`, `Dialog` (T3), `Toast` (T3, דרך `ToastProvider` הקיים)
- `PresetCard` ימוחזר כבסיס וירונדר עם variant מתאים, או שניצור `ChooserCard` חדש יותר גמיש (Designer מחליט במהלך מימוש — אופציה ב' מומלצת לבידוד צרכי תצוגה).
- `HomeCta` נשאר ל-state ה-״fresh״

**Modified:**
- `HomeScreen` — לוגיקה נוספת לבדוק active bake, סוויץ' בין מצב fresh ל-resume

## User Flow

```
─── Fresh state ───────────────────────────────
HomeScreen (no active bake)
  ├─ ״התחל אפייה״ → ChooserScreen
  │      ↓
  │   tap preset/recipe card
  │      ↓
  │   useActiveBake.start(recipe-snapshot)
  │      ↓
  │   router.push("/bake/stage/1")
  │      ↓
  │   [Placeholder — מטופל ב-03]
  │
  └─ ״המתכונים שלי״ → /recipes (לא משתנה)

─── Active state ───────────────────────────────
HomeScreen (active bake exists)
  ├─ ResumeCard
  │     ├─ ״המשך לבייק״ → router.push(`/bake/stage/${currentStage}`)
  │     │
  │     └─ ״ביטול בייק״
  │           ↓
  │        AbandonBakeDialog
  │           ↓
  │        confirm → useActiveBake.abandon() → home re-renders fresh

─── Edge: try to start new while active exists ───
ChooserScreen tap on card with active bake
  ↓
AbandonBakeDialog (״לוותר על הבייק הנוכחי?״)
  ↓
confirm → abandon() → start(new) → push stage 1
cancel → stay in chooser
```

## States

### HomeScreen
- **loading** (active bake check): כפתורים מוסתרים; spinner קצר (<200ms — לא מציגים).
- **fresh**: כותרת ״כיכר״ + שני הקלפים הקיימים.
- **active**: כותרת ״כיכר״ + ResumeCard (מחליף את שני ה-CTAs).

### ChooserScreen
- **loaded**: 6 פריסטים + N מתכוני משתמש בגריד 2 עמודות. Always at least 6 cards (presets).
- **loading**: skeleton קצר עד שה-list של המתכונים נקרא (פחות מ-200ms — לא מציגים).
- **no error state**: localStorage קריאה מקומית, לא צפויה כשלון.

### BakeStageStubScreen
- **loading active bake check**: spinner קצר.
- **redirect-no-active**: `router.replace("/")` מיידי, ללא flash visible.
- **redirect-wrong-stage**: `router.replace(/bake/stage/${currentStage})` מיידי.
- **placeholder**: ״שלב N — בקרוב״ + back to home.

## Interaction Specs

### `ChooserCard` press
- Same state machine as `PresetCard`/`HomeCta` (תואם [`ui-playbook.md §1-2`](../../../ui-playbook.md)):
  - `pointerdown` → pressed (scale 0.97, bg shift)
  - `pointermove > 5px` → cancel press
  - `pointerup` no-drag → fires `onSelect(recipe)`
- Enter/Space keyboard navigation

### `ResumeCard` layout
```
┌──────────────────────────────────────┐
│  ממשיכים את הבייק שלך                │
│  ─────────────────────                │
│  לחם של שישי                          │   ← recipe name (heading)
│  שלב 4 · תסיסה ראשונית                │   ← stage info
│                                       │
│  ┌─────────────────────────────┐     │
│  │  המשך לבייק                  │     │   ← primary CTA
│  └─────────────────────────────┘     │
│  ביטול בייק                           │   ← ghost
└──────────────────────────────────────┘
```
- Primary CTA = accent. Ghost dismissal underneath.
- Press feedback: scale 0.985 (לפי playbook §2 לקלפים גדולים).

### `AbandonBakeDialog`
- כותרת: ״לוותר על הבייק הנוכחי?״
- תיאור: ״תאבד את ההתקדמות של 'שם המתכון'.״
- כפתורים: `warn` ״כן, ויתור״ / `ghost` ״ביטול״
- בנוי על `Dialog` הקיים (T3) — focus trap, escape, scrim-click

### Animation curves — סיכום
| פעולה | משך | curve |
|---|---|---|
| Press feedback (קלף בצ׳וזר/resume) | 120ms | ease-out |
| הופעת ResumeCard בטעינה ראשונה | 200ms | ease-out (fade+slight slide up) |
| Dialog enter | 200ms | ease-out |
| Dialog exit | 150ms | ease-in |

### Touch targets
- כל קלף בצ׳וזר: ≥44×44 (קלף הרבה יותר גדול, אין בעיה)
- כפתור ביטול ב-ResumeCard: 44×44 (ghost button קטן, צריך `min-h-touch min-w-touch` או padding מתאים)

## Optimistic / Sync Notes

- אחסון מקומי בלבד, אין סנכרון. כל פעולת CRUD על active bake היא immediate-save ל-localStorage.
- **״Optimistic״ במובן**: על start, ה-UI מנווט מיד ל-stage 1 גם אם ה-write ל-localStorage נכשל. אם נכשל → toast ״לא הצלחנו לשמור״ + הניווט עדיין מתרחש כי ה-state ב-memory תקין; בהפעלה הבאה ה-bake יאבד.
- **״Optimistic״ ב-abandon**: על אישור הדיאלוג, ה-UI מתחדש מיד גם לפני שה-localStorage נמחק (פעולה סינכרונית פשוטה).

## Locale / Direction Notes

### Final copy

| מקום | טקסט |
|---|---|
| ChooserScreen כותרת | ״במה אופים?״ (שונה מ-״מאיפה להתחיל?״ של 01 כדי להבדיל בין יצירת מתכון לבחירת מתכון לבייק) |
| תג preset על קלף משתמש | ״שלי״ |
| ResumeCard כותרת | ״ממשיכים את הבייק שלך״ |
| ResumeCard meta (placeholder) | ״שלב N — {שם השלב או 'בקרוב'}״ |
| ResumeCard primary CTA | ״המשך לבייק״ |
| ResumeCard ghost CTA | ״ביטול בייק״ |
| Stub-stage כותרת | ״שלב N — בקרוב״ |
| Stub-stage CTA | ״חזרה למסך הבית״ |
| AbandonBakeDialog כותרת | ״לוותר על הבייק הנוכחי?״ |
| AbandonBakeDialog body | ״תאבד את ההתקדמות של ״{שם המתכון}״.״ |
| AbandonBakeDialog confirm | ״כן, ויתור״ |
| AbandonBakeDialog cancel | ״ביטול״ |

### Mirrored elements
- ChevronRight חוזר בכפתורי back (תקין ל-RTL כפי שכבר נקבע).
- אין swipe gestures ב-02 (ב-03 ייתכן בשלבים מסוימים).

### Mixed-direction concerns
- ResumeCard meta: ״שלב N · {שם}״ — N הוא מספר → `<span dir="ltr">{N}</span>`. שם השלב עברי, השאר עברי. הצירוף תקין עם isolation.

## Design System Impact

- אין tokens חדשים.
- אין רכיבי atoms חדשים — הכל מורכב מ-Button/Dialog/Card patterns קיימים.
- אין צבעים חדשים — `accent` ל-CTA העיקרי של ResumeCard, `paper` לרקע הכרטיס.

## Open Questions

(אין. כל מה שדרוש לעבור ל-Tech Lead נסגר.)
