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

## Codex Routing

- Use the role files in `.claude/agents/`; state the active role at the start of every
  response involving specs or code.
- Use `.agents/skills/checkpoint/SKILL.md` when the user says `checkpoint`, asks to
  wrap up, or before ending an active work session.
- Do not start or resume project work without a canonical GitHub Issue.
- Never let two conversations actively own the same Issue or branch.
