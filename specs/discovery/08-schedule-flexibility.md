# Schedule Flexibility (real-world timing)

## Idea
Sourdough bakes span 24–48h with long passive waits, and the planner computes
fixed clock times backward from a target. That creates two pains: (1) active
steps land at impossible hours (3am mixing), and (2) the exact-minute times feel
fake, since dough responds to temperature and cues, not the clock. We want the
plan to fit around the baker's life and read as a flexible estimate — without
asking for personal data or turning the baker into a scheduler.

## Explored & rejected
- **Avoid-asking / pure auto-magic** — too opaque; removes control.
- **Editable cold-retard as an abstract stepper** — works, but indirect: the baker
  tweaks a number and must eyeball whether hours came out OK.
- **Two anchors (shape time + bake time, retard between)** — built and rejected:
  it makes the *baker* the scheduler (two date-times + reasoning about their gap),
  tangles input with output, and is construction rather than recognition.

## Decisions (the chosen model)
- **One anchor, one knob.** The baker answers a single question — *"מתי אתה רוצה
  שהלחם ייצא מהתנור?"* — and the app builds the schedule backward from it.
- **Direct, bounded editing on the timeline.** Only the genuinely elastic step is
  editable: the **cold retard**, via an inline slider on its timeline row, with a
  clear min/max (6h–72h). Everything else is computed, not editable.
- **What moves when the retard changes:** the out-of-oven time stays fixed and the
  *start* shifts (longer retard → start earlier). This is also the lever that
  slides active steps out of the night.
- **Graceful overflow:** the slider isn't hard-blocked. While there's room the
  start moves; once the start would fall before "now", the out-of-oven time is
  pushed later instead. So the finish "gives" only at the extreme — the baker
  never manages two controls at once.
- **Honest ranges.** Biology-driven steps (levain, bulk) show a range in the gray
  secondary text — "בין 7 ל-9 שעות" instead of "כ-9 שעות". Fixed steps (preheat,
  bake) stay exact. Times are labeled estimates.
- **Planning only.** No live re-anchoring mid-bake in this cycle; the
  "estimates may change" note sets that expectation.

## Still Open (blockers for brief)
- None — model agreed. Range spread tuned to ~[0.8×, 1.0×] of the estimate.

## Graduates to Feature Brief?
Yes — prototyping first to validate the feel. Proposed folder when it proves out:
`09-schedule-flexibility` (08 is taken by spelt-flour).
