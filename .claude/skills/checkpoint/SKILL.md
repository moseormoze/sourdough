---
name: checkpoint
description: End-of-session ritual. Writes a disposable `_resume.md` for the active feature(s) so the next conversation picks up exactly where this one stopped, then runs the Curator learning pass to persist durable lessons to their homes. Run before /clear, or when a session is about to be compacted. Use when the user says "checkpoint", "wrap up", "save and clear", or before ending a work session.
---

# Skill: checkpoint

You are running the **Session Checkpoint** — the ritual that protects the next conversation from two losses: losing *where we were* (continuity) and losing *what we learned* (durable knowledge). Two different jobs, two different homes, two different lifecycles. Do both, in order.

Scope hint: `$ARGUMENTS` (optional feature/topic name, e.g. `23-starter-tracker`).

---

## Step 0 — Identify the active work

From the conversation, determine what this session worked on:
- **A feature** → match it to a folder under `specs/features/NN-name/`. If `$ARGUMENTS` names one, trust it.
- **A discovery topic** with no feature folder yet → note it as discovery (`specs/discovery/NN-name.md`). The discovery doc is the WIP artifact; a separate resume note is usually unnecessary — record the next step at the top of that doc instead.
- **A non-feature session** (process/tooling change, a one-off question) → there may be nothing to resume. Say so and skip Step 2.

List the folder first (`ls specs/features/`) — do not guess the NN number.

---

## Step 1 — Learning pass (durable knowledge)

Run the **Curator** (`.claude/agents/curator.md`) over this conversation. Announce `🗂️ Curator:` and produce the Phase 1 inventory:
- List candidate **durable** learnings — things now true that weren't captured before. Skip disposable state (today's blockers, "we tried X then Y", in-flight status) — that goes in the resume note, not a durable doc.
- For each: **What / Type / Target / Action** (`CREATE` / `UPDATE existing` / `SKIP`).
- The most common home for product work is the feature's own `specs/features/NN-name/{brief,design,tasks}.md`; a **locked product decision** goes to `context/product-decisions.md`. **Before proposing any write, list the folder and grep the topic** so you update the right file instead of duplicating.
- Respect the role gates: propose edits to `brief`/`design`/`tasks` — never silently rewrite them.

Hold the inventory for the single confirmation in Step 3.

---

## Step 2 — Resume note (disposable continuity)

For each active feature, draft `specs/features/NN-name/_resume.md`, **overwriting** any existing one — it is a snapshot, never a log:

```
# Resume — <feature name>
**Updated:** <today's date> · session checkpoint

**Where we are:** <1–2 sentences — what was just completed>
**Next step:** <the very next concrete action>
**Open questions / blockers:** <or "none">
**Decisions this session:** <bullets — only those NOT already graduated to a durable doc in Step 1>
```

Keep it short. It must **not** duplicate what Step 1 graduated into the real docs — the resume note is only the in-flight state needed to resume.

If a feature **shipped or its last task merged** this session, propose **deleting** its `_resume.md` instead of writing one — the durable knowledge already lives in the feature's real docs (and the PR/commit history).

---

## Step 3 — One confirmation, then write

Present **both together**:
- the learning inventory (durable writes), and
- the resume-note draft(s) / deletions.

Wait for the user to approve / edit / remove. Then write:
- durable learnings to their homes (update `MEMORY.md` index if a memory file changed; update `CLAUDE.md` if an agent or skill was added),
- resume note(s) to `specs/features/NN-name/_resume.md` (or delete on ship).

**Never write durable knowledge without confirmation.** The resume note is low-stakes (overwritten anyway), but still show it before writing.

---

## Step 4 — Report

Summarize with `path:line` references: what durable knowledge landed where, and which resume notes were written / overwritten / deleted. Then confirm: **safe to `/clear` now** — the next session will read the resume note when the feature comes up (see the resume-pickup rule in `CLAUDE.md`).
