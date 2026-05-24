# Design Prompt — Kikar (Sourdough Companion App)

> **Purpose of this file**: A self-contained prompt to hand to a design-capable AI (Claude with artifacts, v0, or similar) that will produce visual mockups of the entire app flow. The prompt is intentionally specific where decisions are locked, and intentionally open where exploration is welcome.

---

## How to use this prompt

Copy everything below the `--- BEGIN PROMPT ---` line into Claude (or your design tool of choice). Ask it to produce a single artifact containing all the screens.

---

--- BEGIN PROMPT ---

# Design the UI for "Kikar" — a Hebrew-first sourdough (lechem michmetzet) baking companion app

## Context

You're designing the entire visual UI for a mobile-first web app called **Kikar** (in Hebrew: **״כיכר״**, meaning "loaf"). It's a step-by-step companion for home bakers who are baking sourdough bread — guiding them through every stage of the bake from starter check to pulling the loaf out of the oven.

**Brand note**:
- App name in Hebrew UI: **״כיכר״**
- App logo: a stylized **loaf of bread (כיכר לחם)**. You decide the exact style — could be a flat illustration, a single-line drawing, a textured woodcut feel, or something more abstract. Show what you propose.
- The word "כיכר" means "loaf" — perfect for a sourdough app. (It can also mean "town square" in modern Hebrew, but context resolves this.)

### Hebrew terminology — use these exact terms in UI copy

| Concept | Hebrew (preferred in UI) | English in parens (when helpful) |
|---|---|---|
| Sourdough bread | לחם מחמצת | — |
| Starter (the live culture) | סטארטר | — (loanword, avoids ambiguity with לחם מחמצת) |
| Levain (the build for this bake) | שאור | (levain) — add the first time it appears |
| Autolyse | אוטוליזה | — |
| Bulk fermentation | תסיסה ראשונית | (Bulk fermentation) — first appearance |
| Pre-shape | עיצוב ראשוני | (pre-shape) — first appearance |
| Cold retard | התפחה | (retard) — first appearance |
| Stretch & fold | קיפול | (stretch & fold) — first appearance |
| Float test | מבחן ציפה | (float test) — first appearance |
| Dutch oven | סיר ברזל יצוק | (dutch oven) — first appearance |
| Crust | קרום | — |
| Crumb | פירור / מבנה פנימי | (crumb) — first appearance |
| Hydration | הידרציה | — |

The target user is a **beginner or hobbyist baker** who doesn't remember all the steps by heart, isn't sure about ratios, and needs a calm, friendly guide while their hands are covered in dough.

The whole experience is **one linear journey**. The user starts at the beginning, walks through stages one screen at a time, and reaches completion at the end. They can peek forward at upcoming stages but the home / current stage is always front and center.

---

## Non-negotiable constraints

These are real product/process rules. Do not deviate.

### Locale & direction
- **Language**: Hebrew only. Every visible string in Hebrew.
- **Direction**: RTL (`dir="rtl"` on `<html>`).
- **Numbers**: stay LTR even inside Hebrew text. Wrap them: `<span dir="ltr">75%</span>`. Same for `°C`, `g`, `:` between hours and minutes.
- **Mixed direction**: handle gracefully — e.g., "סה״כ: 100%" should render correctly.

### Layout
- **Mobile-first**, 375px reference width.
- **Tailwind CSS** with **logical properties only**: `ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`. **Never** `ml-`/`mr-`/`left-`/`right-`.
- Touch targets ≥ **44×44px** always.
- Generous spacing. No cramped layouts.

### Tone & feel
- Calm. Kitchen-friendly. Warm. Beginner-respectful (never condescending).
- Visual style: propose a palette that evokes "baker's craft, warm dough, slow fermentation" — think bakery, not tech. Reject anything sterile or app-y. Suggested direction: warm off-whites, deep earthy ink, a single accent (caramel? olive? clay?). **You decide.**

---

## Preferred defaults (relax if you have a stronger idea)

These are reasonable starting points. If you have a stronger proposal that fits the tone and the constraints above, propose it — but call it out so I can decide.

### Typography
- **Default font**: Heebo (Google Fonts). Reasoning: full Hebrew character set, good number rendering, free, common.
- Alternatives that fit Hebrew well: Rubik, Assistant, Noto Sans Hebrew, Frank Ruhl Libre (more editorial), Suez One (display).
- Use weights 400 (body), 500 (labels), 600 (section heads), 700 (page titles).
- Big, readable type. Assume the user is reading from arm's length with flour-dusted glasses.

### Iconography
- **Default**: Lucide React. Reasoning: free, mainstream, directional icons mirror automatically in RTL.
- Lucide's limitation: it's a generic utility-icon set. It does **not** have rich baking-specific visuals (no bread loaf, no dutch oven, no fermenting dough).
- **Encouraged**: propose **custom illustrations or emojis** for hero elements (preset cards, stage headers, completion screen). Lucide stays as fallback for utility icons (chevron, plus, close, back).
- If you have a clean illustration style in mind that fits "warm bakery craft," show it on at least the preset gallery and the completion screen.

---

## The journey — full structure

All screens in order. Each gets a dedicated screen in your output.

### 1. Home (״מסך הבית״)
**Purpose**: entry point.

**Two states**:
- **Fresh** (no active bake): single big primary CTA: **״התחל אפייה חדשה״**. Below it, a calm tagline: **״מה אופים היום?״**
- **Resuming** (bake in progress): primary CTA becomes **״ממשיכים את הבייק שלך״** with a sub-line like **״שלב 4 מתוך 12 · בתסיסה ראשונית״**. A secondary, smaller link below: **״התחל בייק חדש (יבטל את הקיים)״**.

You decide: should there be any other element on the home screen? A small preview of the cheat sheet? A "tip of the day"? A starter health reminder? Use your judgment.

### 2. Starter check (״בדיקת סטארטר״)
**Purpose**: confirm the starter is healthy before starting a bake.

**Elements**:
- Question at the top: **״האם הסטארטר מוכן?״**
- A checklist (yes/no) of conditions, e.g.:
  - **״הוכפל בנפח ב-4–12 השעות האחרונות״**
  - **״רואים בועות פעילות בפנים״**
  - **״עובר מבחן ציפה (float test) — חתיכה צפה במים״**
- A "what does this mean?" expandable section for beginners — short Hebrew explanation.
- **Two actions**:
  - **״הסטארטר מוכן — בוא נמשיך״** (primary) — proceeds. Only enabled when at least one condition is checked (or all? you decide).
  - **״הסטארטר לא מוכן עדיין״** (secondary) — leads to a small "wake up your starter" screen with instructions ("הזן 1:1:1 וחזור כשהוכפל"), and a way to come back later.

### 3. Pick preset (״בחירת מתכון״)
**Purpose**: pick a recipe to bake, either a built-in preset or a previously saved custom preset.

**Elements**:
- Title: **״מאיפה להתחיל?״**
- Visual gallery (cards/tiles, not a plain list). Show 6 built-in presets + any user-saved ones. Mix them in the same grid; user-saved ones can have a small "שלי" badge or similar mark.
- Each card should show: **icon/visual**, **name**, **brief one-line description**, **key params** (e.g., "75% הידרציה · 30% מלא").
- Suggested 6 built-ins (Hebrew names final):
  1. **״כפרי קלאסי״** — 80% לבן + 20% מלא, 75% הידרציה, מלח 2%, שאור (levain) 20%
  2. **״70% מלא״** — 30% לבן + 70% מלא, 78% הידרציה, מלח 2.2%, שאור 22%
  3. **״שיפון 50%״** — 50% לבן + 50% שיפון, 78% הידרציה, מלח 2.2%, שאור 25%
  4. **״לבן בסיסי״** — 100% לבן, 72% הידרציה, מלח 2%, שאור 20%
  5. **״מלא 100%״** — 100% מלא, 82% הידרציה, מלח 2.2%, שאור 22%
  6. **״כפרי קל למתחילים״** — 90% לבן + 10% מלא, 70% הידרציה, מלח 2%, שאור 18%
- Below the gallery: secondary link **״התחל מאפס (מתכון מותאם)״** — leads to recipe form.

### 4. Recipe form (״הגדרת מתכון״)
**Purpose**: define a custom recipe (or fine-tune a preset).

**Elements**:
- **Name** field — placeholder **״לחם של שישי״**.
- **Flour breakdown** — four fields (% לבן, % מלא, % שיפון, % אחר). Live sum indicator below: **״סה״כ: 100% ✓״** in green or **״סה״כ: X% · חסר Y%״** in red.
- **Hydration** (%), **Salt** (%), **Levain** (%) — three rows with `PercentInputWithHint`. Each shows a small **HintChip** beside the field IF the recommended value (based on flour ratios) differs from the current value: **״מומלץ: 78% · עדכן״**. Tapping the chip animates the field to the recommended value with a brief highlight. Manual changes by the user dismiss the chip. **Never auto-overwrite.**
- **Kitchen temperature** (°C, default 25).
- **Inclusions section** (optional, collapsible when empty): title **״תוספות (אופציונלי)״**, **״+ הוסף תוספת״**, each row has name (free text, placeholder **״זיתים שחורים״**) + amount in grams.
- **Save as preset** option: a checkbox or toggle below the form labeled **״שמור כפריסט לבייקים הבאים״**. If checked, the recipe is added to the preset gallery for future bakes.
- **Primary action**: **״התחל לאפות״** (this kicks off the bake journey).

**Validation rules**: hydration 50–100%, salt 0–5%, levain 0–40%, temp 10–40°C, flours must sum to 100%, inclusion names non-empty, inclusion amounts positive. Errors render in Hebrew, inline below the field, only after the field is touched.

### 5. Stage screens (the core of the app)

Every bake stage is **its own dedicated screen**. The user advances stage-by-stage. The current stage is always front and center — no "everything visible at once" lists in the main view.

The full stage sequence (your design should accommodate all of these — they all use the same template):
1. **בניית שאור (Levain build)** — ~10–12 hours before mix
2. **אוטוליזה (Autolyse)** — 30–60 minutes
3. **לישה והוספת שאור ומלח (Mix)** — 15 minutes
4. **תסיסה ראשונית (Bulk fermentation)** with sub-steps of **קיפול (stretch & fold) × 3–4** every 30 minutes — total 4–6 hours
5. **עיצוב ראשוני (pre-shape)** — 20–30 minutes rest after a light initial shaping
6. **עיצוב סופי (final shape)** — moves dough to banneton
7. **התפחה (retard)** — 8–24 hours in the fridge
8. **חימום תנור (preheat)** — 45–60 minutes
9. **אפייה — מכוסה (bake, lid on)** — 20 minutes
10. **אפייה — לא מכוסה (bake, lid off)** — 20–25 minutes
11. **קירור (cool)** — 1–2 hours, hands off
12. **הלחם מוכן!** (done!)

**Stage screen template** — every stage uses the same shape:

- **Header**: stage number + name (e.g., **״שלב 4 מתוך 12 · תסיסה ראשונית״**)
- **Estimated time for this stage**: e.g., **״כ-4 שעות״** — this is just guidance, not a countdown. (Exception: stages 7, 8, 9, 10, 11 — these DO have hard timers since they're time-driven, not observation-driven. See note below.)
- **What to do** (״מה לעשות״): a short, clear instruction in Hebrew. Big readable type.
- **Reference media (optional per stage)**:
  - Some stages have **a photo** (you produce / placeholder)
  - Some stages have an **embedded YouTube video** (use a placeholder iframe)
  - Most stages have neither
- **״עשיתי טוב?״ checklist**: a small list of yes/no observations the user can self-check before advancing. E.g., for bulk fermentation: **״הבצק הוכפל בנפח?״**, **״רואים בועות?״**, **״הבצק מרגיש קליל וגמיש?״**.
- **Primary action**: **״סיימתי, להמשיך לשלב הבא״** — only enabled (or warning-on-tap) if checklist isn't fully checked. If not fully checked but tapped, show a soft warning: **״רוצה לחכות עוד קצת או להמשיך בכל זאת?״**.
- **Secondary actions**: **״עוד 20 דקות״** (sets a reminder, doesn't advance), **״קפוץ לשלב הבא בעיון״** (preview the next stage without committing).

**Time-driven stages** (cold retard, preheat, bake lid-on, bake lid-off, cool): instead of a self-check checklist, show a **countdown timer** prominently. The "I'm done" button is disabled until the timer reaches zero (or near zero — your call on grace period).

**Sub-steps within bulk fermentation**: stage 4 (תסיסה ראשונית) has 3–4 קיפול (stretch & fold) sub-steps. Decide a UX: nested checklist within the stage screen? Sub-screens? A small progress dot row inside the stage? Use your judgment.

### 6. Completion (״הלחם מוכן!״)
**Purpose**: celebrate the end of a bake.

**Elements**:
- Big celebratory title: **״הלחם שלך מוכן! 🍞״**
- A brief recap: when it started, when it ended, the recipe name.
- Optional: photo of the loaf (user upload? skip for now? you decide).
- Two actions:
  - **״התחל בייק חדש״** — back to home
  - **״סיימתי״** — back to home

---

## Cross-cutting elements

### Cheat sheet (״צ׳יט שיט״ / ״סקירה כללית״)
A view that shows **all stages of the bake at once** at high level — names, rough timing, and current position. The user can pop it open from any screen to orient themselves.

**Decide for me**:
- Where lives it? (header button? floating button? swipe gesture? bottom tab?)
- What does it look like? (vertical list? horizontal scroll? grid?)
- How does it interact with the current stage? (highlighted? clickable to jump-preview?)

I want to see your proposal. Show 2–3 small variations if you have ideas.

### Progress indicator
The user should always know *which stage of N* they're in. Could be:
- A progress bar
- A vertical timeline always visible on the side
- A header counter ("4 מתוך 12")
- Embedded into the cheat sheet

You decide. Show your choice on the stage screens.

### Mid-bake persistence
The app remembers which stage the user is on. If they close and reopen, they return to that stage. **No data loss.** This affects only home screen state (״ממשיכים את הבייק שלך״). Just call it out visually somewhere.

### Toasts
For events like "מתכון נשמר כפריסט", "הקלטת לפעם הבאה", etc. Use the standard pattern: bottom of screen, slide up, 2.4 seconds, replace-don't-stack.

### Empty / loading states
Mostly N/A for this app (everything is client-side, no network on the happy path). But on first launch with no presets used yet, the recipe-pick screen still shows the 6 built-in presets — there's never a truly "empty" state in the user's path.

---

## Interaction principles (locked)

These are from our internal `ui-playbook.md`. Honor them in your visual design (and note them in your output if generating code):

- **Press feedback** on tappable cards/buttons: `transform: scale(0.965)`, slight `bg ink-06` darken, 120ms ease-out. Once a drag starts (>5px movement), clear the press state.
- **Spring on release** after a swipe gesture: 250ms `cubic-bezier(0.34, 1.56, 0.64, 1)` — slight overshoot.
- **Swipe gesture** (if you propose one anywhere, e.g., dismissing a stage card): in RTL, swipe **right** (positive X) reveals **destructive zone on the left**. This mirrors iOS Mail RTL.
- **Touch targets ≥44×44px** — always.
- **`prefers-reduced-motion`**: respect it. Animations should be cut or shortened if requested.
- **No animation libraries** (no Framer Motion, no react-spring). Use CSS transitions and plain JS for any gesture math.

---

## What to produce

Generate a **single artifact** (one HTML file or one React component file) that shows **all the screens stacked vertically** for easy review. Each screen labeled clearly (Hebrew name in the screen, English label or comment outside).

Use Tailwind CSS for styling. If you generate React, use functional components, no state management library — internal `useState` is fine. Treat this as a **high-fidelity visual prototype**, not a wireframe and not production code: real Hebrew copy, realistic data, real visual polish.

**Show variations** where I asked for your judgment:
- The palette
- The cheat sheet (2–3 variations)
- The progress indicator
- The home screen extras
- The completion screen photo handling

For the rest, make confident decisions. I'd rather see strong opinions than safe defaults.

---

## What to leave out

- Authentication, sign-in, account anything — not in MVP.
- Sharing, social features — not in MVP.
- Multi-language toggle — Hebrew only.
- Settings screen — defer; not needed for MVP.
- Notifications UI — not in MVP (user manages their own reminders).
- A "my recipes" / recipe library screen — **doesn't exist**. Presets gallery serves this role (built-in + user-saved presets live together).

--- END PROMPT ---
