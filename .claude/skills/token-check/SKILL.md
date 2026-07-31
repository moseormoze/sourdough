---
name: token-check
description: Estimate this session's token cost and give a one-line recommendation on how to proceed. Use when the user asks "how expensive is this session", "should I clear", "token check", or when you suspect a session is getting long/costly.
---

# Skill: token-check

You are running a **session health check** — a fast, honest read of where this session stands cost-wise and what to do next.

**Rules:**
- Read only what is already in your context window. No extra tool calls for the estimate.
- Be honest about uncertainty — these are estimates, not exact counts.

---

## Step 1 — Compute session health

**Turn count:** count the user/assistant message pairs visible in the history.

**Risk flags** — check the conversation for any of these (each compounds cost because every turn replays the full history):
- **Figma MCP call** (`get_design_context`, `get_metadata`, `get_variable_defs`, `get_screenshot`) → **+1 level, +$5–15 each** — these return 100K+ token blobs that replay every turn after.
- **Subagent / Workflow spawn** (Explore, general-purpose, Plan, a Workflow run) → **+0.5–1 level**
- **Browser-preview verification loop** (repeated screenshots / read_page / console reads) → **+0.5 level**
- **Large file reads** (>300 lines in one call, or many files) → **+0.5 level**
- **Multiple repo greps / bash searches** → **+0.5 level**
- **Repeated build/test or Vercel-status polling loops** → **+0.5 level**

**Cost estimate (Opus 4.8, rough):**
- < 20 turns → ~$1–2
- 20–40 turns → ~$2–5
- 40–70 turns → ~$5–12
- 70–100 turns → ~$12–25
- > 100 turns → $25+ (danger zone)
- Add risk-flag costs on top. A Figma-heavy or workflow-heavy session can dwarf these.

**Health level:**
- **GREEN**: < 40 turns, no major risk flags
- **YELLOW**: 40–70 turns, or any subagent/workflow spawn, browser loop, or large reads
- **RED**: > 70 turns, or any Figma MCP call, or multiple compounding flags

**Recommendation logic:**
- GREEN → keep going
- YELLOW → finish the current thought, then `/checkpoint` and `/clear`
- RED → `/checkpoint` and `/clear` now, before the next task
- If Figma was called this session → "extract what you need into the feature's `design.md`, then `/clear`"
- If the next step is a fresh, separable task (a new feature, an unrelated fix) → "start a fresh session for it"

---

## Step 2 — Output

Output exactly this 5-line block:

```
Session health: [GREEN / YELLOW / RED]
Turns: ~N | Est. cost: ~$X
Risk flags: [list, or "none"]
Active task: [one phrase — what's in flight, or "unclear"]
Recommendation: [one sentence — what to do right now]
```

Then, if health is YELLOW or RED, add a **Context handoff** block (so a `/clear` loses nothing even without a full `/checkpoint`):

```
## Context handoff (paste at start of next session)

**Feature:** [NN-name and one-line description, or "N/A"]
**Spec location:** specs/features/NN-name/ or specs/discovery/NN-name.md or "none"
**Branch / PR:** [branch name + base, or PR link, or "not yet created"]
**Where we left off:** [1–2 sentences — exactly what was just completed and the next step]
**Unresolved items:** [open questions, blockers, decisions — or "none"]
```

If health is GREEN, omit the handoff block.

> For a durable end-of-session save (resume note + learning pass), use `/checkpoint` — this skill only reads the cost and hands off.
