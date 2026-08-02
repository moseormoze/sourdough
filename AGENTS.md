# Sourdough — Codex Orchestration Rules

Read [`CLAUDE.md`](./CLAUDE.md) completely before project work. Its project context,
roles, workflow gates, code standards, Hebrew/RTL rules, and user-approval rules apply
to Codex as the shared project contract.

Several AI conversations may work in parallel. Each conversation owns one workstream;
the user is the sole decision-maker and reviewer.

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

## Codex Routing

- Use the role files in `.claude/agents/`; state the active role at the start of every
  response involving specs or code.
- Use `.agents/skills/checkpoint/SKILL.md` when the user says `checkpoint`, asks to
  wrap up, or before ending an active work session.
- Do not start or resume project work without a canonical GitHub Issue.
- Never let two conversations actively own the same Issue or branch.
