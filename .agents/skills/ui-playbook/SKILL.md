---
name: ui-playbook
description: Load the project's interaction quality principles before any UI work — press states, drag/swipe gestures, spring physics, optimistic UI, micro-interactions, touch targets. Use whenever the user starts a new UI feature, modifies an interactive component, adds a gesture, or asks about animation timing. Also use when reviewing PRs that touch interactive UI.
---

# Skill: ui-playbook

You load and apply the project's harvested UI interaction principles. The principles live in `ui-playbook.md` at the project root — that file is the source of truth, not this skill body.

## When to Run

Any of these triggers:
- User starts a Designer or Engineer role response touching interactive UI.
- User says "add a gesture", "make this tappable", "animate this", "swipe to X", "drag and drop".
- User asks about animation timing, easing, spring, rubber-band, scale on press.
- User opens or reviews a PR with changes to interactive components.
- User asks "is this UI right?" / "does this feel good?"

Do NOT run for:
- Pure static content (text, links, headings)
- Backend / API work
- Tooling, config, or deps changes

## What to Do

1. **Read `ui-playbook.md` at the project root**. The whole thing. It's short.
2. **Pin the five rules that apply** to the current work. Don't lecture the user with the full playbook — call out the specific sections (e.g. "§3 swipe-to-commit applies here, plus §6 optimistic UI because this mutates shared state").
3. **Block the work if a rule is violated**. Examples:
   - Tactile interaction with no `isPressed`/`isDragging` state machine → push back, cite §1.
   - Async mutation with a spinner blocking the UI → push back, cite §6.
   - Hard cap on swipe → push back, cite §3 (use rubber-band).
   - Transition under 100ms or over 300ms → push back, cite §5.
4. **Surface gaps from the "Known Gaps" section** if the current work hits one (haptics, reduced-motion, conflict UI, etc.). Flag and ask, don't silently guess.

## What Not to Do

- Do not paste the entire `ui-playbook.md` into your response. Cite sections by number.
- Do not modify `ui-playbook.md` without explicit user instruction. It's harvested knowledge, not a working file.
- Do not invent new principles on the fly. If the playbook doesn't cover a case, name the gap and ask.
- Do not override the playbook for "this case is special" reasons. If the playbook is wrong, the user updates it; you don't bypass it.

## Output Style

When pinning rules, prefer a tight bulleted list:

> Applying the playbook to this card:
> - §1 state machine: needs `isPressed`, `isDragging`, `justFinishedDrag` cooldown
> - §2 press feedback: `scale(0.965)` + ink-06 bg, 120ms ease-out
> - §3 swipe: commit threshold 120px with 0.3 rubber-band beyond
> - §6 delete is optimistic with realtime verification
>
> Gap to flag: should this respect `prefers-reduced-motion`? (§ Known Gaps #2)
