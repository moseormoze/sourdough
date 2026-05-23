# Design System

The design tool owns detailed visual decisions (palette, type ramp, exact spacing). This file captures system-level rules and points to `ui-playbook.md` for interaction quality.

## Foundations
- **Locale**: Hebrew-first, **RTL** everywhere (`dir="rtl"` on `<html>`)
- **Mixed-direction text**: numbers stay LTR inside RTL paragraphs — verify mixed-direction lines render correctly
- **Form inputs**: default to `dir="auto"` so users can type either language
- **Theme**: TBD — defer to design tool
- **Viewport**: TBD — typically mobile-first, 375px reference
- **Feel**: TBD — one phrase the team agrees on (e.g. "minimal, thumb-friendly, fast")
- **Font**: TBD — must have a strong Hebrew set (candidates: Rubik, Heebo, Assistant, Noto Sans Hebrew)
- **Radii**: TBD (typically `rounded-xl` cards, `rounded-full` pills)
- **Spacing**: TBD — but generous; no cramped layouts
- **Tap targets**: Minimum **44×44px** — non-negotiable (see `ui-playbook.md` §10)

## RTL Rules (concrete)
- All layout primitives must respect **logical properties** (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`).
- Directional icons (arrows, chevrons, send) mirror in RTL.
- Swipe direction is **right = trailing destructive** (mirrors iOS Mail RTL).
- Date / number / duration formatting goes through `Intl.*` APIs with `he-IL`.

## Component Library
- Base: TBD (shadcn/ui, Radix, custom)
- Framework: TBD (Next.js, Vite, etc.)
- Initial scaffold: TBD (v0, Figma → code, manual)

## Patterns
- **Primary view**: TBD
- **Add / create flow**: TBD
- **Empty / loading / error states**: each screen defines its own
- **Optimistic UI**: any shared / synced data follows `ui-playbook.md` §6

## Color Decisions (delegated)
Colors and tokens are owned by the design tool. The repo references tokens; the playbook controls *motion*, not *palette*.

## Interaction Quality (mandatory)
Read **`ui-playbook.md`** before building any interactive component. It defines:
- Press / drag / release state machines
- Spring & rubber-band physics with concrete values
- Optimistic UI patterns
- The carry-over rule: every UI change ships with loading + feedback + cleanup
