---
name: checkpoint
description: End a Sourdough work session by syncing live state to its canonical GitHub Issue, verifying that code and docs are available across computers, and routing durable learnings. Use when the user says checkpoint, wrap up, save and clear, or before ending a work session.
---

# Checkpoint

## 1. Resolve the workstream

- Identify the active GitHub Issue in `moseormoze/sourdough`; never guess its number.
- Read the Issue, branch/worktree state, feature docs, and current diff.
- If no Issue exists, create or select one before claiming the checkpoint complete.

## 2. Separate the records

- GitHub Issue: status, completed work, commit/PR evidence, single next action,
  blockers, branch/worktree, and timestamp.
- Repository docs: durable product decisions, approved scope, design, and task
  contracts. Never leave durable knowledge only in the Issue or conversation.
- Branch/PR: code, artifacts, and verification evidence.

Show proposed durable doc changes before writing role-gated files.

## 3. Draft one checkpoint update

```markdown
### Checkpoint — YYYY-MM-DD HH:MM Asia/Jerusalem
- Status: <active | blocked | review | done>
- Completed: <concise result>
- Evidence: <commit, PR, tests, or docs>
- Next: <one concrete action>
- Blockers: <none or explicit blocker>
- Branch/worktree: <branch and path>
```

Update the Issue body when its current fields changed; add the checkpoint as one comment.
Do not post command logs or duplicate information already in durable docs.

## 4. Make it cross-computer safe

- Confirm the Issue update succeeded.
- Inspect uncommitted and unpushed work. Commit and push only with explicit user
  authorization; otherwise state exactly what remains local.
- A checkpoint is not cross-computer safe until relevant commits are pushed.
- If GitHub is unavailable, write `specs/features/NN-name/_resume.md` beginning with
  `UNSYNCED`, include the same checkpoint fields, and say GitHub sync is still required.
- Delete an `UNSYNCED` resume file after its Issue and branch are synchronized.

## 5. Report

Link the Issue and relevant files/PR. Say `safe to continue from another computer` only
when the Issue is current and all required commits are pushed.
