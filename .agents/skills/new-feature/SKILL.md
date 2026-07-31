---
name: new-feature
description: Scaffold a new feature folder under `specs/features/NN-<name>/` with empty `brief.md`, `design.md`, and `tasks.md` templates. Automatically finds the next available NN number. Use when the user has approved a Discovery doc and is ready to move into the PM phase, or says "scaffold the feature", "create a feature folder", "start a new feature".
---

# Skill: new-feature

You scaffold a new feature folder using the project's pipeline conventions. The user is moving out of Discovery into PM/Design/Tech-Lead/Engineer.

## When to Run

The user says one of:
- "scaffold a new feature called X"
- "create a feature folder for X"
- "start feature X"
- a discovery doc just graduated and a feature name was proposed

If the user hasn't named the feature yet, ask for a short kebab-case name first.

## Steps

1. **Find the next NN number**:
   - List `specs/features/`.
   - The next number is the highest existing `NN-` prefix + 1, two digits zero-padded (e.g. `01`, `02`, …, `12`).
   - If none exist, start at `01`.

2. **Confirm the slug** with the user (kebab-case, no spaces). Reject names with underscores, spaces, or punctuation.

3. **Create the folder**: `specs/features/NN-<slug>/`.

4. **Write three files** using the templates below. Do not invent content — leave headings and placeholders for the user to fill.

5. **Tell the user**:
   - The folder path that was created.
   - Which role they should switch to next (PM, since you just scaffolded a brief).
   - The next concrete action ("fill in `brief.md` — start with the Problem paragraph").

## Templates

### `brief.md`
```
# Feature: <Name>

## Problem
<One paragraph. What breaks if we don't build this?>

## User Story
As a <user>, I want to <action>, so that <outcome>.

## Scope — What's In
- ...

## Out of Scope
- ...

## Acceptance Criteria
- [ ] Testable statement 1
- [ ] Testable statement 2

## Dependencies
- Depends on: <other feature or decision>
- Blocks: <downstream features>

## Open Questions
<Should be empty before Design phase.>
```

### `design.md`
```
# Design: <Feature Name>

## Screens Affected
- <screen>: <change>

## Components
- New: <ComponentName> — purpose, props signature
- Reused: <existing component>
- Modified: <existing component> — what changes

## User Flow
<step-by-step>

## States
- Loading:
- Empty:
- Error:
- Success:

## Interaction Specs
- State machine:
- Press feedback:
- Gestures:
- Animation curves (see ui-playbook.md §5):
- Touch targets:

## Optimistic / Sync Notes (if applicable)
-

## Locale / Direction Notes (if applicable)
-

## Design System Impact
<any new tokens, components, or patterns added>

## Open Questions
<Should be empty before Tech Lead phase.>
```

### `tasks.md`
```
# Tasks: <Feature Name>

## Task List

### T1 — <Short Title>
**Goal:**
**Files likely touched:**
**Test strategy:**
**Depends on:**
**Done when:**
- [ ] Tests written and passing
- [ ]

## Build Order
T1 → T2 → T3

## Risks
-
```

## What Not to Do

- Do not write any actual content into the templates. The user fills them.
- Do not skip the numbering step or guess; always list the directory first.
- Do not create the folder if a feature with the same slug already exists — surface the conflict.
- Do not switch into PM/Designer/Tech-Lead role inside this skill. Just scaffold and hand off.
