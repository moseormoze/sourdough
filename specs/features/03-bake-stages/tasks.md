# Tasks: bake-stages

5 משימות. ה-shell של 02 כבר מטפל בראוט וב-guards, אז כל המשימות פה מתעסקות בתוכן ובעיצוב של מסך השלב.

## Task List

### T1 — Stages data + ActiveBake schema extension

**Goal:** content של 12 השלבים, plus extension של `ActiveBake` schema לכלול את `subStep` ו-`timerStartedAt` בלי לשבור בייקים פעילים שכבר נשמרו.

**Files likely touched:**
- `lib/data/stages.ts` (חדש)
- `lib/data/stages.test.ts` (חדש)
- `lib/types/active-bake.ts` (extend)
- `lib/storage/active-bake.test.ts` (extend)
- `lib/hooks/use-active-bake.ts` (add `advanceSubStep`, `startTimer`, `stopTimer`)
- `lib/hooks/use-active-bake.test.tsx` (extend)

**Test strategy:**
- Vitest: כל 12 שלבים מוגדרים, types נכונים (`check`/`bulk`/`timer`/`done`), Stage 4 בלבד עם `subSteps: 4`, timer stages עם `durationSeconds` חיובי
- Vitest: ActiveBake schema עם `subStep` default 0 ו-`timerStartedAt: number | null` default null
- Vitest: `loadActiveBake` עדיין מחזיר נכון על entries ישנים בלי השדות (defaults אמורים להתמלא)
- Vitest על ה-hook: `advanceSubStep`, `startTimer`, `stopTimer` מעדכנים נכון

**Depends on:** 02-bake-session-shell

**Done when:**
- [ ] 12 פריטי stages במקור עם תוכן עברי תקין (briefing/todo/checks per design.md)
- [ ] `ActiveBakeSchema` כולל `subStep: z.number().int().min(0).default(0)` ו-`timerStartedAt: z.number().nullable().default(null)`
- [ ] Bakes שנשמרו לפני 03 נטענים בלי שגיאה (defaults מתמלאים)
- [ ] `useActiveBake` חושף `advanceSubStep()` (`subStep++`, ו-reset ל-0 ב-`advanceTo`), `startTimer()`, `stopTimer()`
- [ ] בדיקות 12+ ירוקות; type-check + lint + build נקיים

---

### T2 — ProgressStrip + FoldDots + OptionalTimer primitives

**Goal:** שלושה רכיבים ויזואליים קטנים שעצמאיים. אין business logic.

**Files likely touched:**
- `components/bake/progress-strip.tsx` + test
- `components/bake/fold-dots.tsx` + test
- `components/bake/optional-timer.tsx` + test

**Test strategy:**
- RTL: ProgressStrip מציג N מקטעים, הנוכחי highlighted (data attribute), aria-label תקין
- RTL: FoldDots מציג total נקודות, current=2 → 2 ממולאות
- RTL: OptionalTimer idle → לחיצה → running mode עם countdown, לחיצה נוספת → idle. הספירה מצמצמת כל שנייה (mock timer).

**Depends on:** T1

**Done when:**
- [ ] ProgressStrip מקבל `total`/`current`, מציג 12 מקטעים, current בולט (scale-110), aria-label: ״שלב {n} מתוך {total}״
- [ ] FoldDots מקבל `total`/`current`, מציג נקודות מודגשות, animation pulse על נקודה חדשה
- [ ] OptionalTimer מקבל `durationSeconds`, מנהל state פנימי (running/idle/finished), משתמש ב-`setInterval` עם cleanup. כפתורי start/stop. ספירה בפורמט `MM:SS` ב-`dir="ltr"` font-mono.
- [ ] `prefers-reduced-motion` משבית את ה-pulse/scale (כבר מטופל גלובלית, אבל לוודא)
- [ ] בדיקות 10+ ירוקות

---

### T3 — StageHeader + Briefing + InstructionCard + ChecklistReference

**Goal:** רכיבי תוכן סטטיים שמרכיבים את מסך השלב. ללא state.

**Files likely touched:**
- `components/bake/stage-header.tsx` + test (TopBar+ProgressStrip+pill+title+blurb)
- `components/bake/briefing.tsx` + test
- `components/bake/instruction-card.tsx` + test
- `components/bake/checklist-reference.tsx` + test

**Test strategy:**
- RTL: כל רכיב מקבל את ה-props ומציג את כל השדות שלו
- StageHeader: progress strip ממופה נכון, pill duration מציג את ה-`durationLabel`, hint לועזי בסוגריים אם קיים
- Briefing: peach gradient class applied (basic visual check via class), takeaways רוצים כ-`<ul>` עם N items
- InstructionCard: טקסט todo מוצג כ-`<p>` או similar
- ChecklistReference: רשימה עם `<ul>` של bullets. **אין** interactive elements; click שום-מקום אינו עושה כלום

**Depends on:** T2

**Done when:**
- [ ] StageHeader מציג: chevron-back (Link href="/" — או href="/bake/stage/{n-1}"? לא, לבית), counter ״{n}/12״, ProgressStrip, pill, name, hint
- [ ] Briefing peach-card עם heading + blurb + 2-3 takeaway bullets
- [ ] InstructionCard מציג את ה-todo
- [ ] ChecklistReference: `<ul role="list">` עם bullets, ללא interactivity, ללא checkboxes, ללא focus
- [ ] בדיקות 8+ ירוקות

---

### T4 — StageScreen (compose + wire activeBake + sub-step logic + sticky actions)

**Goal:** ה-component הראשי שמרכז את כל T2+T3 ומגיב לפעולות המשתמש.

**Files likely touched:**
- `components/bake/stage-screen.tsx` (חדש)
- `components/bake/stage-screen.test.tsx` (חדש)
- `lib/strings.ts` (additions: stage navigation copy)

**Test strategy:**
- RTL: stage 1 רגיל — מציג briefing + todo + checks + ״הבא — אוטוליזה״ primary; אין ghost ״חזרה לקודם״ (currentStage = 1)
- RTL: stage 4 (bulk) — FoldDots מופיע. mid sub-step: ״סיימתי קיפול״. אחרי הקיפול הרביעי: ״הבא — עיצוב ראשוני״.
- RTL: stage 7 (timer) — OptionalTimer מופיע. ״הבא״ פעיל גם בלי לחיצה על הטיימר.
- RTL: stage 12 (done) — primary ״סיימתי״; לחיצה → `router.push('/bake/done')`.
- RTL: לחיצה על ״הבא״ → `advanceTo(n+1)` נקרא + ניווט ל-`/bake/stage/{n+1}`.
- RTL: לחיצה על ״חזרה לשלב הקודם״ → `advanceTo(n-1)` (אם n > 1).

**Depends on:** T1, T2, T3

**Done when:**
- [ ] StageScreen מקבל `stageData` + `activeBake`, מרנדר את הלייאוט המלא
- [ ] StickyActions בתחתית עם padding-bottom להגן על תוכן
- [ ] Stage 4 לוגיקה: primary toggles בין ״סיימתי קיפול״ (subStep < subSteps) ל-״הבא — עיצוב ראשוני״ (subStep === subSteps). FoldDots מצוייר.
- [ ] Stage 12: primary ״סיימתי״ → router.push(/bake/done)
- [ ] Optional timer state נשמר ב-activeBake (timerStartedAt)
- [ ] בדיקות 10+ ירוקות

---

### T5 — Wire into route + Playwright probe + polish

**Goal:** ה-route `/bake/stage/[n]` משתמש ב-StageScreen במקום ב-stub. Playwright probe על הזרימה המלאה. ניקיון.

**Files likely touched:**
- `app/bake/stage/[n]/page.tsx` (mod — מחליף את BakeStageStubScreen ב-StageScreen)
- `components/bake/bake-stage-stub-screen.tsx` + test — **נמחקים**
- `scripts/probe-bake-flow.mjs` (mod — extends to cover stages content)

**Test strategy:**
- כל הקיים עובר
- Playwright: התחל בייק → stage 1 רואה את ה-briefing + todo → ״הבא״ → stage 2 → ... → stage 4 → 4×״סיימתי קיפול״ → stage 5 → ... → stage 12 → ״סיימתי״ → /bake/done

**Depends on:** T4

**Done when:**
- [ ] `app/bake/stage/[n]/page.tsx` מרנדר StageScreen
- [ ] BakeStageStubScreen + ה-test שלו נמחקים
- [ ] `rtl-check` returns 0 findings
- [ ] `npm run type-check` clean, `npm run lint` clean, `npm run build` clean
- [ ] Playwright probe עובר על הזרימה stage 1 → 12

---

## Build Order

```
T1 (data + schema)
  ↓
T2 (3 primitives — parallel internally) ──┐
T3 (4 content components) ─────────────────┴── (both depend only on T1)
  ↓
T4 (StageScreen compose + logic)
  ↓
T5 (route wire + probe)
```

## Risks

1. **Migration של activeBake קיים** — אם המשתמש פתח בייק לפני 03, ה-schema החדש מצפה ל-`subStep` ו-`timerStartedAt`. Zod's `default()` אמור לטפל, אבל יש לבדוק. אם נכשל, ה-bake נמחק בשקט (כמו ב-recipes).

2. **Stage 4 sub-step UX** — שינוי טקסט primary בין ״סיימתי קיפול״ ל-״הבא״ עלול לבלבל אם המעבר מהיר. **mitigation**: animation זעיר על שינוי הטקסט (250ms fade).

3. **OptionalTimer ב-reload** — אם המשתמש סגר את הדף באמצע countdown, ה-`setInterval` מת. עם reload, אם `timerStartedAt` קיים, אפשר לחשב כמה זמן עבר ולהמשיך מהמקום, או להתחיל מחדש. **החלטה**: לאחר reload, אם `timerStartedAt + durationSeconds*1000 > Date.now()`, מציג countdown מהשארית; אחרת ״הסתיים״.

4. **ProgressStrip ב-12 מקטעים** — על mobile 375px יוצא צר. **mitigation**: gap-0.5 או overflow ב-x עם scroll silent. אופציה ב' לא רצויה. סבר ש-gap קטן יסתדר.

5. **Stage 12 (done)** — currentStage=12 הופך את הדף ל-״סיימתי״. הלחיצה דוחפת ל-/bake/done. ה-route /bake/done עדיין placeholder עד 04, אז המשתמש רואה ״הבייק הסתיים — בקרוב״. **זה תקין** — ה-04 ימלא.
