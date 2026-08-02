# Sourdough — Claude Orchestration Rules

Several AI conversations may work in parallel. Each conversation owns one workstream; the user is the sole decision-maker and reviewer.

## Project Snapshot

A baking companion app for home bakers of sourdough bread (לחם מחמצת). Walks them through every stage of the bake from start to finish — starter check, recipe definition, levain build, autolyse, mix, folds, shaping, proofing, and bake — so a bake never stalls because the baker lost track of the schedule.

- **Project codename (English, this repo)**: Sourdough
- **App name (Hebrew, in UI)**: **״כיכר״** (meaning "loaf")
- **Logo**: a stylized loaf of bread (כיכר לחם)

### Hebrew terminology (use exactly these in user-facing copy)

| Concept | UI Hebrew | English in parens (first appearance) |
|---|---|---|
| Sourdough bread | לחם מחמצת | — |
| Starter (live culture) | סטארטר | — (loanword; avoids ambiguity with לחם מחמצת) |
| Levain | שאור | (levain) |
| Autolyse | אוטוליזה | — |
| Bulk fermentation | תסיסה ראשונית (״באלק״) | (Bulk fermentation) — the loanword באלק accompanies the Hebrew term so bakers learn it |
| Pre-shape | עיצוב ראשוני | (pre-shape) |
| Cold retard | התפחה | (retard) |
| Stretch & fold | קיפול | (stretch & fold) |
| Float test | מבחן ציפה | (float test) |
| Dutch oven | סיר ברזל יצוק | (dutch oven) |
| Crust / Crumb | קרום / פירור (מבנה פנימי) | (crumb) for the second |
| Hydration | הידרציה | — |

**This is a Hebrew-first app.** All UI copy, content, and content-driven layout decisions default to Hebrew with right-to-left (RTL) support. English may exist as a secondary locale later, but every screen, component, and asset must work cleanly in Hebrew/RTL from day one.

## Product Copy Ownership

The user owns final product copy. Unless the user explicitly asks for copywriting in the
current task:

- Preserve existing user-facing text verbatim. Do not add, rewrite, shorten, polish, or
  "align" it as part of design or implementation.
- Discovery, Brief, and Design documents define only the content goal, facts, hierarchy,
  questions to answer, constraints, and placement. Mark missing strings as
  `COPY_TBD — user/Gemini`; do not draft candidate UI text.
- Copy supplied by the user is canonical and is implemented verbatim, except for
  approved token substitution and technical direction/formatting wrappers.
- If implementation needs a missing string, stop at that dependency and ask for the
  user-authored copy. Never ship AI-written filler or a plausible placeholder.
- Whenever a need for new copy or a change to existing copy is identified, surface it
  explicitly to the user in the conversation; documenting `COPY_TBD` silently is not
  enough. State the exact screen/component, whether it is new or a change, why it is
  needed, and the content goal/constraints. A change to existing copy also requires
  explicit approval and a user-supplied replacement before implementation.

The mission, vision, goals, and product decisions are still placeholders — they are written in the first Discovery cycle. Until `context/mission.md` is replaced, you are in pre-Discovery mode and write no product code.

## Always-Load Context

Before responding to anything, read (in this order):
1. `context/mission.md` — why this app exists
2. `context/vision.md` — where it's going
3. `context/goals.md` — what success looks like
4. `context/product-decisions.md` — locked product decisions
5. `context/design-system.md` — visual & component standards
6. `context/tech-stack.md` — technical stack and constraints
7. `context/backlog.md` — strategic work order and future ideas
8. `ui-playbook.md` — interaction quality principles (read before any UI work)

Only skip this load when the user explicitly asks about something unrelated.

**Resume first:** fetch the workstream's canonical GitHub Issue before doing anything
else and state where it left off. Read `_resume.md` only when marked `UNSYNCED` as the
fallback for a failed GitHub checkpoint.

## GitHub Work Tracking

The live backlog is [GitHub Issues](https://github.com/moseormoze/sourdough/issues).
A GitHub Project may provide the board view, but Issues remain canonical.

- **Issue:** live status, dependency, owner/workstream, branch/PR, last checkpoint,
  next action, and blockers.
- **Repository docs:** durable product decisions, approved scope, design, and task
  contracts. No durable decision may live only in a conversation or Issue comment.
- **Git branch/PR:** implementation and verification evidence. Link every PR to its
  Issue; use `Closes #<issue>` when merge completes the task.
- **`context/backlog.md`:** strategic sequence and future ideas only; never duplicate
  live execution status there.

At workstream start, fetch the Issue, verify it is ready, and record the conversation,
branch, and worktree. Update it at every meaningful state change and checkpoint with
completed work, commit/PR evidence, the single next action, blockers, and timestamp.
One Issue may have only one active conversation/branch/worktree.

A checkpoint is not cross-computer safe while code, docs, or status exist only locally.
Update the Issue and, with explicit user authorization, commit and push the relevant
branch. If GitHub is unavailable, write an `UNSYNCED` local `_resume.md` and state that
GitHub sync is still required.

## Product Delivery Over Process

Product progress is the default objective. Backlog, specs, instructions, Issues, and
checkpoints support delivery; they are not independent deliverables unless the user
explicitly asks for process or documentation work.

- A PR must deliver user-testable product behavior, a production fix, or implementation
  infrastructure required by that product work. Do not open a PR only for backlog
  maintenance, status, checkpoints, spec reconciliation, or instruction cleanup unless
  the user explicitly requests that standalone PR.
- Routine backlog, spec, and instruction corrections join the next relevant product PR.
  If no product branch exists yet, record the correction in the canonical Issue and
  apply it when product implementation begins; do not create an administrative branch.
- A checkpoint updates the canonical Issue. It does not create a branch, commit, or PR
  by itself.
- If implementation reveals that approved specs no longer match `main`, correct those
  specs in the same product branch and PR. Do not create a prerequisite documentation
  PR merely to describe behavior that is already approved or already merged.
- After the user approves a gate, continue through implementation, verification, and a
  reviewable product PR. Do not repeatedly request approval for unchanged decisions.
  Pause only for a new product decision, scope expansion, destructive action, missing
  authority, or a genuine blocker.
- Before opening any PR, answer: **what new product behavior or required implementation
  capability can the user review?** If the answer is only process or documentation,
  bundle the change into product work or wait.
- Keep one active product PR per workstream. Do not create administrative precursor PRs.
- Do not invent a new workflow during a task. A process change becomes durable only
  after the user approves it and these project instructions are updated; otherwise keep
  following the current instructions.

## The Five Roles

At any moment you are in exactly one role. State the role at the start of every response when acting on spec/code work. Roles and their rules live in `.claude/agents/`:

| Role | File | When to enter |
|---|---|---|
| Discovery | `.claude/agents/discovery.md` | User brings a raw idea or question |
| PM | `.claude/agents/pm.md` | Discovery is closed, time to write a brief |
| Designer | `.claude/agents/designer.md` | Brief approved, UI/UX decisions needed |
| Tech Lead | `.claude/agents/tech-lead.md` | Design approved, break into tasks |
| Engineer | `.claude/agents/engineer.md` | One task selected, time to build |

## Workflow — The Pipeline

```
Discovery → PM Brief → Design → Task Breakdown → Engineer (per task) → Review
```

**Hard rules:**
- No project work starts or resumes without a canonical GitHub Issue.
- Never let two conversations actively own the same Issue or branch.
- Nothing graduates to the next phase without the user's explicit approval.
- Discovery docs live in `specs/discovery/`. Features live in `specs/features/NN-name/`.
- Every feature folder has: `brief.md`, `design.md`, `tasks.md`.
- Every product task is one PR-sized implementation unit. Supporting documentation is
  part of that unit, not a separate task or precursor PR.
- Every engineering task starts with a failing test and a new git branch.
- Never skip roles. Never write code in Discovery. Never brainstorm in Engineer.

## Numbering

Features are numbered sequentially: `01-…`, `02-…`, etc. Number reflects planned build order.

## Local Skills

Project skills exist under `.claude/skills/`:
- `new-feature` — scaffolds `specs/features/NN-<name>/` with `brief.md`/`design.md`/`tasks.md` templates and the next available number
- `ui-playbook` — loads `ui-playbook.md` when starting any UI feature
- `rtl-check` — scans for non-logical spacing (`ml-`/`mr-`/`left-`/`right-`), hard-coded English in JSX, missing icon mirroring, and missing `dir="rtl"`
- `checkpoint` — syncs the live handoff to the canonical GitHub Issue and verifies
  cross-computer safety before `/clear` or session end

## Code Standards

- TypeScript strict mode, no `any`.
- Tests first (Vitest or Jest). Task is not done until tests pass.
- One PR per product task. Supporting backlog, spec, and instruction updates belong in
  that same PR. Commit messages reference the feature folder.
- No comments unless explaining non-obvious *why*.
- Prefer editing over creating files.

## UI Standards (carry-over from prior project)

Before building or modifying any interactive UI, **read `ui-playbook.md`**. It defines:
- Press / drag / release state machines
- Spring & rubber-band physics with concrete values
- Optimistic UI + verification patterns
- Micro-interaction rules (every change ships with loading + feedback + cleanup)
- Touch-target minimums (44px)

Do not "just add an onClick" to a primary interaction. If it deserves UI, it deserves the playbook.

## Hebrew / RTL Rules

- All user-facing strings authored in Hebrew. No hard-coded English in components — strings go through the i18n layer.
- Layouts must work in RTL (`dir="rtl"` on `<html>` or via i18n config).
- Use **logical CSS properties only**: `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`. Never `ml-`, `mr-`, `left-`, `right-`.
- Icons that imply direction (arrows, chevrons, send) must mirror in RTL.
- Typography uses a font with a strong Hebrew set (candidates: Rubik, Heebo, Assistant, Noto Sans Hebrew).
- Numbers, dates, and any product-name English words must render correctly in mixed-direction text.
- Gestures respect cultural direction: in iOS Mail RTL, swipe *right* (positive X) reveals a destructive zone on the *left*. Apply the same convention.
- Date / number / duration formatting goes through `Intl.*` APIs with `he-IL`.

## What the User Does

- Approves at every gate (discovery → brief → design → tasks → each PR).
- Owns all product decisions.
- Owns final product copy, usually written separately with Gemini from the approved
  content brief.
- Reviews code before merge.

## What You Never Do

- Never build a feature without an approved brief.
- Never skip the test step.
- Never merge your own PR.
- Never write code during Discovery.
- Never expand scope mid-task.
- Never hide a copy dependency only in a spec or backlog; tell the user explicitly.
- Never add a tactile interaction without the playbook's state machine + cleanup.
