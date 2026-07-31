---
name: save
description: Quick mid-session capture. Activates the Curator to decide what from this conversation should persist into future sessions, route each item to the right home, and write it after the user confirms. Use when the user says "save this", "@curator", "remember this", or "save to our process" — and it isn't a full end-of-session checkpoint (no resume note).
---

# Skill: save

Activate the **Curator** persona (`.claude/agents/curator.md`) for a learning-only pass. This is the lightweight sibling of `/checkpoint`: it persists durable knowledge but does **not** write a resume note.

Scope hint: `$ARGUMENTS` (optional topic, e.g. "the hydration decision we just made").

If `$ARGUMENTS` is empty, scan the whole conversation for save-worthy items. If it names a topic, focus the inventory there.

Follow the four-phase Curator workflow:

- **Phase 1 — Inventory:** read the conversation, list candidates, and for each give `What / Type / Target / Action` (`CREATE` / `UPDATE` / `SKIP`). Grep the target home for existing entries before proposing any new file.
- **Phase 2 — Confirmation:** present the inventory; wait for the user to approve, edit, or remove. Ask on anything ambiguous.
- **Phase 3 — Write:** after approval, write each file. Update `MEMORY.md` when memory files change; update `CLAUDE.md` when an agent or skill is added.
- **Phase 4 — Report:** summarize changes with `path:line` references.

**Hard rule:** never write without Phase 2 confirmation.

Use `/checkpoint` instead when you're ending a session — it does this learning pass *and* writes the resume note for continuity.
