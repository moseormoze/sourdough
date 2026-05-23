---
name: rtl-check
description: Audit the codebase for RTL / locale correctness — physical CSS properties that should be logical (ml/mr/pl/pr/left/right), hard-coded non-localized strings in JSX, missing `dir="rtl"` on root, directional icons without mirror logic. Use when the user says "rtl check", "locale audit", "is this RTL-safe", or before merging any UI PR in a Hebrew/RTL project. Only meaningful if the project applied `add-hebrew-rtl.md`.
---

# Skill: rtl-check

You audit the working tree (or a specific file/folder) for RTL and locale correctness. This skill is only meaningful if the project is Hebrew/RTL — verify by checking `context/product-decisions.md` for a Locale row saying Hebrew/RTL, or by checking that `add-hebrew-rtl.md` has been applied (i.e. removed and pasted into `CLAUDE.md`).

If the project is not RTL: respond "this project isn't RTL — skipping. If that's wrong, fix `context/product-decisions.md` first." and stop.

## When to Run

- User says: "rtl check", "audit rtl", "is X RTL-safe", "locale check".
- Before merging a UI PR in an RTL project.
- After scaffolding a v0 / shadcn / Figma → code output (these tools default to LTR).

## What to Check

Run these as parallel `grep` / search calls — collect findings, report once.

### 1. Physical → Logical CSS
Grep for these patterns in `app/`, `components/`, `src/` (whichever exist) — they should be logical equivalents:

| Physical (bad) | Logical (good) |
|---|---|
| `ml-`, `mr-` | `ms-`, `me-` |
| `pl-`, `pr-` | `ps-`, `pe-` |
| `left-` (positioning) | `start-` |
| `right-` (positioning) | `end-` |
| `text-left` | `text-start` |
| `text-right` | `text-end` |
| `border-l`, `border-r` | `border-s`, `border-e` |
| `rounded-l-`, `rounded-r-` | `rounded-s-`, `rounded-e-` |

Exception: `left-0` / `right-0` inside a component that *intentionally* anchors to physical screen edge (e.g. a global toast pinned to one corner regardless of locale) is OK. Note the count but don't flag automatically.

### 2. Hard-Coded Non-Localized Strings
Grep for English text inside JSX. Heuristic: look for `>[A-Z][a-z]{3,}` or `>[a-zA-Z ]{8,}<` inside `.tsx` / `.jsx` files, excluding obvious technical strings (`className`, `data-testid`, etc.). Flag anything that looks like user-visible English.

### 3. Missing `dir="rtl"`
Search for the root layout file (`app/layout.tsx`, `pages/_document.tsx`, `index.html`). Verify `dir="rtl"` is set on `<html>`.

### 4. Directional Icons Without Mirror
Grep for icon names that imply direction: `ArrowRight`, `ArrowLeft`, `ChevronRight`, `ChevronLeft`, `Send`, `Reply`. For each occurrence, check whether the surrounding logic mirrors based on direction. If used unconditionally, flag.

### 5. Form Inputs Without `dir="auto"`
Grep for `<input` / `<textarea` without `dir="auto"`. Users may type either language; `dir="auto"` lets the browser detect.

### 6. RTL Gesture Direction (if applicable)
If the project has swipe gestures (search for `touchStart`/`touchMove` or named gesture handlers in `components/`), check that swipe-right reveals trailing-left zone (matches iOS Mail RTL). Flag if swipe direction looks LTR-default.

## Output Format

```
# RTL Check Results

## Physical CSS Properties (should be logical)
- components/Foo.tsx:42 — `ml-4` → use `ms-4`
- components/Bar.tsx:18 — `text-right` → use `text-end`
[empty if clean]

## Hard-Coded English in JSX
- components/Baz.tsx:7 — "Click here" appears as user-visible text
[empty if clean]

## Root dir="rtl"
- [✓ found in app/layout.tsx | ✗ MISSING]

## Directional Icons
- components/Header.tsx:12 — <ArrowLeft /> used unconditionally; should mirror in RTL
[empty if clean]

## Form Inputs Without dir="auto"
- components/AddItem.tsx:34 — <input> missing dir="auto"
[empty if clean]

## Gestures (if applicable)
[per-gesture finding or "no gestures found"]

## Summary
N issues found across M files. [✓ all clean | ✗ blocking before merge]
```

## What Not to Do

- Do not auto-fix anything. Report only. Fixes go through the Engineer role with a test.
- Do not run on the entire `node_modules/` or `.next/` directories.
- Do not flag `left-0` / `right-0` on a global element unless context clearly suggests it should be logical.
- Do not run if the project isn't RTL — surface that and stop.
