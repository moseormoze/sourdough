# Kikar · Engineering Handoff

> **Read this first.** Then `components.md`. Tokens are in `tokens.json` + `tokens.css` + `tailwind.config.js`.

---

## 1. What you're building

**Kikar (כיכר)** — a Hebrew-first, mobile-only web app that guides home bakers through a sourdough (לחם מחמצת) bake, one stage at a time. From starter check to pulling the loaf out of the oven.

The whole experience is one linear journey: starter check → preset → recipe → 12 stages → completion. The user can peek forward; the current stage is always front and center.

**Audience**: beginner / hobbyist bakers. They don't remember ratios by heart, their hands are covered in flour, the app needs to be calm and beginner-respectful.

---

## 2. Non-negotiables

These come from the product brief and are NOT designer preferences — they are the product.

- **Hebrew only.** Every visible string in Hebrew.
- **RTL.** `<html dir="rtl">` is hard-coded.
- **Mobile-first, 375px reference width.** No desktop or tablet layouts in v1.
- **Tailwind CSS** with **logical properties only**: `ms-/me-/ps-/pe-/start-/end-`. Never `ml-/mr-/left-/right-`.
- **Touch targets ≥ 44×44px.** Always.
- **Numbers stay LTR inside Hebrew.** Wrap them: `<span dir="ltr">75%</span>` or use the `.num` utility.
- **`prefers-reduced-motion` respected.** Tokens already account for this.
- **No animation libraries.** No Framer Motion, no react-spring. CSS transitions + plain JS for gesture math.

---

## 3. Stack assumptions

- **React 18** (Next.js App Router or Vite — your call; routing is trivial, single-flow app)
- **Tailwind v3.3+** (logical property utilities are core; no plugin needed)
- **TypeScript** recommended
- **State**: nothing fancy. `useState` + a single Zustand or Context store for the active bake. Persist active bake to `localStorage` (mid-bake resume is a requirement).
- **No backend in v1.** Everything client-side. Presets + active bake live in `localStorage`.

---

## 4. Token system

You have three files; pick the one that fits your build.

| File | Use when |
|---|---|
| `tokens.json` | You want to run them through Style Dictionary or a code-gen step |
| `tokens.css`  | You want plain CSS custom properties — drop into your global stylesheet |
| `tailwind.config.js` | Standard Tailwind setup — merge the `theme.extend` block into yours |

All three encode the same values. Pick one, do not mix.

**Fonts** to load (Google Fonts):
- **Rubik** weights 400/500/600/700/800 — Hebrew + Latin coverage
- **JetBrains Mono** weights 400/500/600 — numerics (timers, time of day)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## 5. Visual reference

Open the HTML files in `/visual-reference/` (or the original project) in this order:

1. **`Kikar Soft.html`** — the canonical full screen set. Every screen, every state, real Hebrew copy. **This is the truth.**
2. **`Kikar Design System.html`** — every component with every state side-by-side. Reference for behavior + spec.

The flagship screen — Stage 4 (תסיסה ראשונית) — is the most important one to study. It exercises every education + media pattern in context.

---

## 6. File structure (recommended)

```
src/
  app/                       # routes (Next App Router) or pages
    layout.tsx               # <html dir="rtl">, font loading, providers
    page.tsx                 # Home (fresh or resuming)
    starter/page.tsx         # Starter check
    presets/page.tsx         # Preset gallery
    recipe/page.tsx          # Recipe form
    bake/[stage]/page.tsx    # The 12 stage screens
    done/page.tsx            # Completion

  components/
    primitives/              # Button, Input, Pill, Term, Icons, CheckTile, Switch, RadioGroup, ProgressStrip, FoldDots
    media/                   # Photo, RefGallery, VideoCard
    education/               # Expand, Briefing, Questions, Toast
    layout/                  # TopBar, IconButton, ContextPill, TabBar, BottomSheet
    screen/                  # StageScreen, StageHeader, StickyActions

  data/
    presets.ts               # built-in presets (from data.js)
    stages.ts                # the 12 stages (from data.js)
    glossary.ts              # term definitions for <Term>
    faqs.ts                  # per-stage Q&A entries

  store/
    bake.ts                  # active bake state (zustand or context)

  styles/
    globals.css              # imports tokens.css + Tailwind directives
```

---

## 7. Screens to build

In order:

| # | Route | Screen | Notes |
|---|-------|--------|-------|
| 1 | `/` | Home — fresh / resuming | Two states, branched on `hasActiveBake` |
| 2 | `/starter` | Starter check | Reference photo + checklist + FAQ |
| 3 | `/presets` | Preset gallery | 6 built-ins + user-saved (with "שלי" badge) |
| 4 | `/recipe` | Recipe form | Custom or fine-tune from preset |
| 5 | `/bake/[1..12]` | Stage screens | Same template; 7 observation-driven, 5 timer-driven |
| 6 | `/done` | Completion | Recap + photo slot + reflection note |

Plus the cheat sheet (overview of all 12 stages with current position highlighted) — opens as a route or modal from the ☰ on every screen. Mockup shows it as a route; either works.

Plus **bottom sheets** for FAQ deep dives — triggered from the Questions module on every stage.

---

## 8. The 12 stages

Defined in `data.js`. Two **types**:

**Observation-driven** (1, 2, 3, 4, 5, 6) — the user advances when the dough *looks right*. CTA enabled when checklist is complete (soft-warn if not).

**Timer-driven** (7, 8, 9, 10, 11) — the user advances when the *clock runs out*. CTA disabled until timer near zero (5min grace). Bake stages (9, 10) and preheat (8) often need live presence — surface a warning banner when near the end.

**Special case — Stage 4 (bulk fermentation)**: has 3–4 nested stretch-and-fold sub-steps with their own 30-min timers. Use `<FoldDots>` to render sub-step progress inline.

---

## 9. State & persistence

```ts
// store/bake.ts
type ActiveBake = {
  id: string;                  // generated on creation
  preset: Preset;
  recipe: Recipe;
  startedAt: number;           // epoch ms
  currentStage: number;        // 1..12
  stageStartedAt: number;
  subStep?: number;            // bulk fermentation only
  observationChecks: Record<number, Record<string, boolean>>;
  timerOverrides?: Record<number, number>; // user +/- adjustments
};
```

Persist on **every state mutation** to `localStorage`. The "ממשיכים את הבייק שלך" home state rehydrates from this. No background sync needed — when the user comes back, the timer is recomputed from `stageStartedAt`.

---

## 10. Patterns to honor

### Press feedback (universal)
```css
.pressable { transition: transform 120ms cubic-bezier(0.22, 1, 0.36, 1); }
.pressable:active { transform: scale(0.965); }
```
Already in `tokens.css`. Apply to all buttons, cards, list rows, anything tappable.

### Inline term explanations
First mention of a technical term on a screen → `<Term>`. Tap = popover. Don't mark every mention.

### Explanation hierarchy
On any stage screen, layer education progressively:
1. **Briefing** — context before instructions
2. **Term chips** — inline definitions on the fly
3. **Expand "למה?"** — the reasoning
4. **Reference gallery** — visual confirmation
5. **Video card** — when technique matters
6. **Questions module** — failure modes & deep dives

Max ~3 Expands per screen. Overflow → Questions.

### Bottom sheets
Two heights: **peek (56%)** for quick answers, **full (88%)** for deep dives. Open from Questions rows. Scrim is always tap-to-close.

### Toast pattern
Replace-don't-stack. 2.4s hold. Bottom inset.

---

## 11. RTL specifics (read carefully)

- Set `dir="rtl"` on `<html>`, not `<body>`. Tailwind's logical properties read it from the root.
- Numbers in Hebrew sentences: `<span dir="ltr" className="num">7:14</span>` — otherwise punctuation between digits flips.
- `°C`, `g`, `%` follow the number inside the same `dir="ltr"` span.
- Directional icons (`ChevronStart`, `ChevronEnd`, `ArrowEnd`) auto-mirror via parent direction — DON'T transform them manually.
- Mixed-direction phrases like `"סה״כ: 100%"` — let the browser handle. Test with real Hebrew copy, not Lorem Ipsum.
- The status bar (mock device chrome in design) is `dir="ltr"` because time/battery/signal read left-to-right.

---

## 12. A11y floor

- All interactive elements: 44×44 minimum hit area.
- Focus visible on keyboard nav (use `:focus-visible`, not `:focus`).
- Color contrast: body copy ink-on-bg = 14.2:1 (AAA). Don't put small accent text on small light surfaces — fails AA. Use ink-2 (5.8:1) for secondary.
- Announce stage advancement to screen readers (`role="status"` on the stage title block, polite).
- Checklist items: actual `<button role="checkbox" aria-checked>`.

---

## 13. What's NOT in v1 (deferred — don't build)

- Authentication / accounts
- Sharing, social features
- Multi-language toggle (Hebrew only)
- Settings screen
- Push notifications (user manages their own reminders for v1)
- "My recipes" library (presets gallery serves this role — built-ins + user-saved live together)

---

## 14. Open product decisions (designer pushed off)

These need product calls before you finalize:

- **Bake history**: home (resuming) mocks a small carousel of recent bakes. Do we persist completed bakes? For how long? Show in cheat sheet too?
- **Photo uploads**: completion screen has a photo slot. Where does the file go? `localStorage` (small, base64) is fine for v1 but breaks at scale.
- **Reminders**: every stage offers "+5 דקות" reminder buttons. Are these in-app banners only, or do we want browser Notifications API permission flow?
- **Glossary**: `<Term>` popovers currently inline. Do we also want a glossary screen?

When in doubt, ship the simplest version and instrument it.

---

## 15. Suggested first PRs

1. **Foundation**: install fonts, wire `tokens.css` + Tailwind config, set up the `<html dir="rtl">` shell. Empty Home route renders the wordmark.
2. **Primitives**: build Button, Pill, Term, CheckTile, Input. Match design system 1:1. Test in Storybook.
3. **Stage shell**: TopBar + ProgressStrip + StageHeader. Hard-code stage 4 data. Verify visual parity with the Soft Bake flagship.
4. **Education layer**: Briefing, Expand, Questions, BottomSheet. Wire from the stage shell.
5. **Media layer**: Photo, RefGallery, VideoCard.
6. **Active bake store + persistence.**
7. **The other 11 stages** (mostly data-driven once template is solid).
8. **Recipe form + presets** (mostly form work).
9. **Completion + cheat sheet.**

---

## 16. Asking the designer for more

If any of the following blocks you, ping back:

- **Real photography** — currently all duotone placeholders. Will need 8 tones × 3-5 photos each. (Pro tip: stock isn't great for sourdough at this specificity — consider one shoot.)
- **Real video** — same. The video card mocks chapter timelines; works with YouTube or Vimeo iframe out of the box, we just need real URLs.
- **More glossary entries** — design has ~10 terms marked; the full app likely needs 30–40.
- **Stage-specific FAQs** — design has 4-5 per stage on the flagship; need to fill in for the other 11.

Good luck. 🍞
