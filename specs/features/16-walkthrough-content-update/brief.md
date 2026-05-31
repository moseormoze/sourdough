# Feature: Walkthrough Content Update

## Problem
Stage content in `lib/data/stages.ts` was written before we had the course reference material.
Several numbers and instructions are misaligned with what the course teaches, creating confusion
during the actual bake.

## Scope — What's In
- Stage 1 (בניית שאור): remove hardcoded 1:1:1 ratio from takeaways (ratio is now dynamic)
- Stage 4 (תסיסה ראשונית): fix volume range to +30–75% (was +50–70%); fix fold schedule to 3–4 sets with growing intervals (was fixed 30 min)
- Stage 7 (התפחה במקרר): extend range to 8–48 h (was 12 h / 24 h max)
- Stage 10 (אפייה — לא מכוסה): add temp drop to 190–210°C after removing lid
- `stage-screen.tsx`: update hardcoded bulk timer caption (was "30 דקות")

## Source
`context/baking-reference.md` — course material captured 2026-05-31.

## Acceptance Criteria
- [ ] All changed numbers match `context/baking-reference.md`
- [ ] Tests pass
