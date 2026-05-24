# Design System

Always-loaded summary of the design DNA. Full handoff lives in [`specs/design/`](../specs/design/):

- [`specs/design/tokens.json`](../specs/design/tokens.json) · [`tokens.css`](../specs/design/tokens.css) · [`tailwind.config.js`](../specs/design/tailwind.config.js) — same values, pick one
- [`specs/design/components.md`](../specs/design/components.md) — full component API (Button, Pill, Term, Photo, Expand, BottomSheet, etc.)
- [`specs/design/visual-reference/`](../specs/design/visual-reference/) — HTML + JSX prototypes of every screen and every component state

The screen list and product decisions inside `specs/design/HANDOFF.md` are **inputs to Discovery**, not facts. PM decides what ships.

## Foundations

- **Locale**: Hebrew-first, RTL hard-coded (`dir="rtl"` on `<html>`, not `<body>`)
- **Viewport**: mobile-only, 375px reference width (no desktop/tablet in v1)
- **Feel**: calm, beginner-respectful, hands-may-be-floury — generous spacing, no cramped layouts
- **Tap targets**: minimum **44×44px** — non-negotiable (see [`ui-playbook.md`](../ui-playbook.md) §10)
- **Forms**: inputs default to `dir="auto"` so users can type either language

## Color (named tokens — full values in `tokens.css`)

- **Surfaces**: `bg` (cream), `bg-2`, `paper` (white), `line`, `line-2`
- **Ink**: `ink` (text), `ink-2` (secondary), `ink-3` (tertiary) — body-on-bg AAA (14.2:1)
- **Accent (clay)**: `accent`, `accent-2`, `accent-3`, `accent-bg` — used for **the** primary action per screen, never two
- **Sage**: secondary / success — `sage`, `sage-2`, `sage-bg`
- **Status**: `warn`/`warn-bg` (delays, caution), `danger`/`danger-bg` (errors)

## Typography

- **UI**: Rubik 400/500/600/700/800 — Hebrew + Latin
- **Numerics**: JetBrains Mono 400/500/600 — timers, time-of-day, durations
- **Number isolation**: numbers in Hebrew sentences wrap with `<span dir="ltr" className="num">75%</span>`. `°C`, `g`, `%` follow inside the same LTR span. The `.num` utility is in `tokens.css`.

## Motion

- **Durations**: `instant 0` / `fast 120ms` / `base 200ms` / `slow 300ms` / `delib 450ms`
- **Easings**: `ease-out`, `ease-in-out`, `ease-spring`
- **Press feedback (universal)**: `scale(0.965)` over `fast 120ms` `ease-out` on anything tappable. The `.pressable` utility in `tokens.css` applies it automatically to `button, [role="button"]`.
- **`prefers-reduced-motion: reduce`** kills all transforms and shortens transitions — already wired in `tokens.css`.
- **No animation libraries**: no Framer Motion, no react-spring. CSS transitions + plain JS for gesture math (per [`ui-playbook.md`](../ui-playbook.md) §12).

## RTL Rules

- All layout uses **logical properties only**: `ms-/me-/ps-/pe-/start-/end-`. Never `ml-/mr-/left-/right-`.
- Directional icons (chevrons, arrows, send) **auto-mirror** via parent direction — don't manually rotate.
- Swipe direction: **right = trailing destructive** (mirrors iOS Mail RTL).
- Mixed-direction text: let the browser handle, test with real Hebrew copy.
- Status bars / device chrome mocks: `dir="ltr"` (time/battery read LTR).
- Date / number / duration formatting via `Intl.*` with `he-IL`.

## Interaction Patterns

- **Explanation hierarchy** (layer education progressively, max ~3 Expands per screen, overflow → Questions):
  1. Briefing card (context before instructions)
  2. Term chips inline (`<Term>` — first occurrence only)
  3. Expand "למה?" (the reasoning)
  4. Reference gallery (visual confirmation)
  5. Video card (when technique matters)
  6. Questions module (failure modes, deep dives)
- **Bottom sheets**: two heights — **peek 56%** (quick answers) / **full 88%** (deep dives). Scrim is always tap-to-close (`rgba(31,26,20,0.45)` + 2px blur).
- **Toast**: replace-don't-stack, 2.4s hold (5s for action toasts), bottom inset, single line ~30 chars.
- **Press**: see Motion above. Universal — buttons, cards, list rows, anything tappable.

## A11y Floor

- Focus visible on keyboard nav via `:focus-visible`, not `:focus`. Ring color matches variant.
- Body copy ink-on-bg is AAA (14.2:1); `ink-2` is 5.8:1 — don't put small accent text on small light surfaces.
- Announce stage advancement to screen readers (`role="status"`, polite).
- Checklist items: real `<button role="checkbox" aria-checked>`.

## Interaction Quality (mandatory)

Read **[`ui-playbook.md`](../ui-playbook.md)** before building any interactive component. Press/drag/release state machines, spring physics, optimistic UI, and the carry-over rule (every UI change ships with loading + feedback + cleanup) live there.
