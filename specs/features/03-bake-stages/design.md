# Design: bake-stages

## Screens Affected

| מסך | שינוי |
|---|---|
| `/bake/stage/[n]` | מחליף את ה-`BakeStageStubScreen` ב-`StageScreen` המלא |

הראוט וה-guard logic של 02 לא משתנים. רק ה-component שמרונדר.

## Components

**חדשים:**

| Component | תפקיד | חתימה |
|---|---|---|
| `StageScreen` | המסך המלא של שלב — מרכז את כל הרכיבים, מנהל substeps + timer | `({ stageData, activeBake })` |
| `StageHeader` | TopBar + ProgressStrip + duration pill + name + hint | `({ stageNumber, totalStages, stage })` |
| `ProgressStrip` | 12 מקטעים אופקיים, הנוכחי בולט | `({ total, current })` |
| `Briefing` | קלף peach-gradient עם heading + blurb + takeaways | `({ briefing })` |
| `InstructionCard` | טקסט ההוראה הראשי בקלף paper | `({ text })` |
| `ChecklistReference` | רשימת ייחוס עם bullets, **לא** interactive | `({ items })` |
| `FoldDots` | 4 נקודות לסטרץ׳-אנד-פולד; הנוכחית מודגשת | `({ total, current })` |
| `OptionalTimer` | כפתור ״התחל טיימר״ → מתחיל לספור; להציג ספירה־לאחור | `({ durationSeconds })` |
| `StickyActions` | אזור הכפתורים בתחתית המסך | `({ primary, ghost? })` |

**Reused/Existing:**
- `Button`, `Link`, `useActiveBake`, `useRouter`
- `Toast` (אם נצטרך — לא מתוכנן ב-MVP של 03)

**Modified:**
- `app/bake/stage/[n]/page.tsx` — במקום `BakeStageStubScreen`, מרנדר `StageScreen`
- `BakeStageStubScreen` נשאר ככלי fallback אם data חסר ל-stage מסוים? **לא** — נמחק. תמיד יש 12 stages.

## User Flow

```
─── normal flow ────────────────────────
/bake/stage/{n} render → StageScreen(stageData[n])
  ├─ Click "הבא — {next stage name}" (Primary, sticky)
  │     ↓
  │  advanceTo(n+1)
  │     ↓
  │  router.push("/bake/stage/" + (n+1))
  │
  ├─ Click "חזרה לשלב הקודם" (Ghost, visible only if n>1)
  │     ↓
  │  advanceTo(n-1)
  │     ↓
  │  router.push("/bake/stage/" + (n-1))
  │
  ├─ Stage 4 only — Click "סיימתי קיפול"
  │     ↓
  │  subStep++ (in activeBake)
  │  if subStep < 4: stay, FoldDots updates
  │  if subStep == 4: switch primary action to "הבא — עיצוב ראשוני"
  │
  ├─ Stage 12 only — Click "סיימתי"
  │     ↓
  │  advanceTo(12)  // already there
  │  router.push("/bake/done")
  │
  └─ Optional Timer (stage 7-11): Click "התחל טיימר"
        ↓
     Save tick state to activeBake (simple ephemeral)
     Show countdown in place of the button. Doesn't gate "הבא".

─── reload during stage ────────────────
/bake/stage/{n} render → reads activeBake.currentStage, validates match
(same as 02)

─── reload during sub-step (stage 4) ───
/bake/stage/4 render → reads activeBake.subStep → FoldDots shows correct progress
```

## States

### StageScreen
- **loading** (active bake check from useActiveBake): null render (consistent with 02 guard)
- **loaded — normal**: full layout above
- **loaded — last sub-step** (stage 4, subStep === total): primary text changes to ״הבא — עיצוב ראשוני״
- **loaded — stage 12**: primary text is ״סיימתי״, no next stage name

### OptionalTimer
- **idle**: כפתור ״התחל טיימר״ ב-ghost variant. small.
- **running**: מציג ספירה לאחור (`MM:SS`). כפתור משני קטן ״עצור״.
- **finished**: שינוי וויזואלי קטן (״הטיימר הסתיים״), הכפתור הראשי ״הבא״ נשאר זהה (לא חוסם).

## Interaction Specs

### Stage 4 — sub-step flow
- Initial: subStep=0, FoldDots shows 0/4
- After 1st "סיימתי קיפול": subStep=1, FoldDots 1/4
- ...
- After 4th: subStep=4 (= subSteps total), FoldDots full, primary changes to ״הבא״
- If user reloads in middle: subStep preserved in activeBake; UI shows correct dot
- Special button mapping: in stage 4, primary toggles between "סיימתי קיפול" (subStep < total) and "הבא — עיצוב ראשוני" (subStep === total)

### OptionalTimer
- Implementation: simple `setInterval` with `useEffect` cleanup; stores `timerStartedAt: number | null` on `activeBake`
- On stage advance: timer state cleared
- Press feedback: standard (Button comp)

### ProgressStrip
- 12 מקטעים: gap-1, rounded-full, h-1.5
- Past: bg-accent
- Current: bg-accent + scale-110 (קל)
- Future: bg-line
- Reduced motion → no scale

### StickyActions
- Position: `fixed bottom-0`-ish via Tailwind, או `sticky bottom-0` בתוך MAIN. **בחירה**: `sticky` עם spacer בתחתית — צריך padding-bottom מספיק כדי שתוכן לא יוסתר. או fixed עם spacer. נחליט במימוש.
- Primary: `Button variant=accent`, רוחב מלא.
- Ghost: למטה ממנו, גם רוחב מלא, או חצי.

### Animation curves
| פעולה | משך | curve |
|---|---|---|
| ProgressStrip current dot — scale on stage change | 200ms | ease-out |
| FoldDots — pulse + fill on advance | 250ms | ease-out |
| Timer countdown digit update | 0ms | — (just rerenders) |

## Optimistic / Sync Notes

- כל פעולה (advance, subStep++, timer start) → `saveActiveBake` immediate write.
- אין סנכרון רחוק. שגיאת write → toast (לא חוסם).

## Locale / Direction Notes

### Final copy

Stage data — locked from handoff (`specs/design/visual-reference/data.js`). דוגמאות:
- Stage 1 name: ״בניית שאור״, hint: ״(levain)״, todo: ״ערבבו סטארטר פעיל עם קמח ומים ביחס 1:1:1...״, checks: [״השאור הוכפל בנפח״, ...].

Buttons + meta:
| מקום | טקסט |
|---|---|
| Primary (general) | ״הבא — {שם השלב הבא}״ |
| Primary (stage 4, mid-substep) | ״סיימתי קיפול״ |
| Primary (stage 12) | ״סיימתי״ |
| Ghost (back) | ״חזרה לשלב הקודם״ |
| Briefing label (eyebrow) | (מ-eyebrow style, no extra text) |
| Optional Timer idle | ״התחל טיימר״ |
| Optional Timer stop | ״עצור״ |
| Optional Timer finished | ״הסתיים״ |
| ProgressStrip a11y | ״שלב {n} מתוך 12״ |

### Mirrored elements
- ChevronRight ב-back button של TopBar (תקין ל-RTL כפי שכבר נקבע).
- אין swipe gestures ב-03 (אם נחליט להוסיף ב-polish — separately).

### Mixed-direction concerns
- שלב N: ״שלב N · {שם}״ — N נעטף ב-`<span dir="ltr">{N}</span>`.
- Optional Timer countdown ״05:42״ — `<span dir="ltr" className="num">05:42</span>`, font mono.

## Design System Impact

- אין tokens חדשים.
- ProgressStrip — primitive חדש, נכנס תחת `components/bake/progress-strip.tsx`.
- FoldDots — דומה אבל קטן יותר. גם חדש.
- StickyActions — pattern קצר, אפשר להחזיר fragment ב-StageScreen ולא לעשות component נפרד. **החלטה**: נשאיר inline ב-StageScreen, אם נצטרך לפצל ב-04 — אז.

## Open Questions

(אין. כל מה שדרוש לעבור ל-Tech Lead נסגר.)
