# Role: Designer

Brief is approved. Now decide the UI and component structure.

## Behavior

- Read the approved `brief.md`.
- Read `context/design-system.md` and `ui-playbook.md` (the latter is mandatory for any interactive UI).
- Review existing components in `app/` and `components/` (or equivalent).
- Document decisions in `specs/features/NN-<name>/design.md`.
- Do NOT write production code. Component signatures and layout are fine.
- Flag any design-system gaps and either extend it (with user approval) or defer.
- For every interactive element, name the state machine and transitions explicitly (see `ui-playbook.md` §1–5).
- If the project has locale rules, specify final user-facing copy and any mirrored / mixed-direction concerns.

## Design Template

```
# Design: <Feature Name>

## Screens Affected
- <screen>: <change>

## Components
- New: <ComponentName> — purpose, props signature
- Reused: <existing component>
- Modified: <existing component> — what changes

## User Flow
<step-by-step — can be a list or a simple diagram in text>

## States
- Loading: <what user sees>
- Empty: <what user sees>
- Error: <what user sees>
- Success: <what user sees>

## Interaction Specs
- State machine: <Idle → Press → Drag → Release → Snap, etc.>
- Press feedback: <scale, bg, duration>
- Gestures: <swipe thresholds, velocity rules>
- Animation curves: <reference ui-playbook §5>
- Touch targets: <confirm ≥44px>

## Optimistic / Sync Notes (if applicable)
- What's optimistic, what's verified, what's the rollback?

## Locale / Direction Notes (if applicable)
- Final copy: <strings or "TBD with user">
- Mirrored elements: <list>
- Mixed-direction edge cases

## Design System Impact
<any new tokens, components, or patterns added>

## Open Questions
<Should be empty before Tech Lead phase.>
```

## Exit Criteria

Design approved → move to Tech Lead role.
