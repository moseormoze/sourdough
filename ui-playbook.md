# UI Playbook — Interaction Quality Principles

> Harvested from real features (not theory). Every rule here was paid for by a build cycle where we discovered, debated, and settled on the answer. Read before any tactile UI work.

## The One Sentence

**Every gesture has a preview state before commit; every commit has cleanup; every async change is optimistic with a verification path.**

If a change you're about to ship violates that sentence, stop and re-read this doc.

---

## 1. The Touch State Machine

Every tactile element walks the same five states. Mixing them is the #1 source of janky UI.

```
Idle  →  Press  →  (Drag?)  →  Release  →  Snap/Commit  →  Idle
```

**State flags** (carry these on the element, not as CSS pseudo-classes):
- `isPressed` — finger down, no significant movement yet
- `isDragging` — finger moved past a small threshold (~5px); position is now tracked
- `justFinishedDrag` — a release just happened; brief cooldown (200ms) to suppress accidental taps

**The critical rule**: when `isDragging` becomes true, **clear `isPressed`**. Press-feedback (scale, bg-shift) is for committed-not-yet-moving; once movement starts it's noise. Conversely, on `pointerup` after a drag, do **not** fire the underlying tap handler — that's what `justFinishedDrag` guards against.

**Why not CSS `:active`?** It fires on drag-start too, and it can't be cleared. Use pointer events and explicit state.

---

## 2. Press Feedback

Tap on a primary card / banner / button:

```css
transform: scale(0.965);       /* sometimes 0.985 for large surfaces */
background: rgba(0,0,0,0.06);  /* or ink-06 token */
transition: transform 120ms ease-out, background-color 120ms ease-out;
```

**Timing**: 120ms. Faster feels twitchy; slower feels heavy.
**Scale**: 0.965 for cards, 0.985 for full-bleed banners, 0.97 for buttons. Smaller = more pressed-in.
**Don't** scale below 0.94 — it looks broken on rounded corners.

---

## 3. Swipe-to-Commit (Rubber-Band)

The classic "swipe a card to delete" pattern, done right.

**Zones** (assume 150px swipe limit):
- `0–120px` — reveal zone, finger 1:1 with card
- `120–180px` — commit zone, with resistance
- `>180px` — hard cap

**Resistance math** in the commit zone:
```js
const resistance = 0.3; // each finger pixel = 0.3 card pixels past threshold
const next = Math.min(120 + (target - 120) * resistance, 180);
```

**Why rubber-band, not a hard cap?** The cap feels like the app is broken. Rubber-band tells the finger "you've reached the limit" without freezing it.

**Visual commit signal**: when `swipeX >= COMMIT_THRESHOLD`, deepen the background color (e.g. red-500 → red-600). The user feels resistance *and* sees the warning.

**Velocity-aware snap on release**:
```js
const velocity = swipeX / timeSincePointerDown; // px/ms
if (velocity > 0.5 || swipeX > 60) snap(120); // open / commit
else snap(0);                                  // close
```

A fast flick opens even if short. A slow long drag also opens. Match user intent, not just distance.

---

## 4. Spring on Release

Snap-back transitions must overshoot ~5–7% to feel alive.

```css
transition: transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

**Don't** use `cubic-bezier(0.32, 0.72, 0, 1)` — looks "dead" after a tactile drag. The overshoot in `(…, 1.56, …)` is the whole point.

**Where to spring**: position snap after release, modal entrance, toast appear.
**Where NOT to spring**: opacity fades, color shifts, progress bars.

---

## 5. Motion Curve Semantics

| Purpose | Duration | Easing |
|---|---|---|
| Press feedback (scale/bg) | 120ms | `ease-out` |
| Hover state | 120ms | `ease-out` |
| Snap/spring on release | 250ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Toast / modal enter | 250ms | `ease-out` (or spring for vertical entrance) |
| Fade-out / dismissal | 200ms | `ease-in` |
| Layout shift (sort, filter) | 200–300ms | `ease-in-out` |

**Hard ceiling**: 300ms. Beyond that, respect `prefers-reduced-motion` or snap instantly.

---

## 6. Optimistic UI with Realtime Verification

For any shared / synced data:

1. **Apply the change to local state immediately** — UI updates with zero latency.
2. **Fire the network request in the background** — no spinner, no block.
3. **Realtime subscription confirms or corrects** — server pushes the canonical state; your local copy aligns.
4. **On failure** — rollback with a fade (200ms) and surface a toast: *"couldn't save"*. Don't silently revert.

**Rule**: the user never waits for the network on a happy path. The only time they see a spinner is on initial load.

---

## 7. Offline Queue

Persist mutations to `localStorage` if offline. On reconnect:

- Replay the queue in order.
- Mark synced; remove from queue.
- For shared lists: server resolves conflicts (last-write-wins by timestamp, or merge). Client respects server.
- **Show queue state subtly**: e.g. a small `⏳` icon on rows that are pending. Clears on confirmation.

**Storage shape**:
```ts
type QueuedMutation = {
  id: string;            // UUID
  type: 'insert' | 'update' | 'delete';
  payload: unknown;
  createdAt: number;     // for ordering
  syncedAt?: number;
};
```

**Storage key**: namespaced — `<app>:offline-queue`. Never just `queue`.

---

## 8. Micro-Interactions — The Carry-Over Rule

Every interactive UI change ships with **three layers**:

1. **Loading state** — what the user sees while the change is in flight (or empty if optimistic)
2. **Feedback animation** — visible confirmation that the action landed (toast / scale / color shift)
3. **State cleanup** — pressed/dragged/pending flags fully reset; no orphaned classes

No "snap-in" changes. If you can't think of all three layers, the design isn't done.

---

## 9. Toast Pattern

```ts
duration: 2400ms  // default; longer for error toasts
enter: translateY(20px) → translateY(0), opacity 0 → 1, 250ms ease-out
exit:  translateY(0) → translateY(-10px), opacity 1 → 0, 200ms ease-in
```

**Rules**:
- One toast at a time. New toast replaces (don't stack).
- Errors live until dismissed; successes auto-clear at 2400ms.
- Tap-anywhere-on-toast to dismiss.

---

## 10. Touch Targets

- **Minimum 44px height** on any tappable element. Hard floor.
- For dense lists, expand the tap target beyond the visible bounds (`::before` overlay) rather than enlarging the visual.
- Drag handles and delete icons: 44×44px minimum, even if the visual icon is 16px.

---

## 11. RTL Gesture Mapping (if Hebrew/RTL)

- Swipe **right** (positive X) reveals **destructive zone on the left** — mirrors iOS Mail RTL.
- Touch coordinates are absolute; CSS `dir="rtl"` handles visual mirroring implicitly. **No special-case JS for direction.**
- Drag-between-sections in RTL: preview line snaps to the *logical trailing edge* (right in LTR, left in RTL) of the target section.

---

## 12. Tactility Without Animation Libraries

We don't ship Framer Motion or react-spring. Reasons:

- **Bundle**: ~50kb saved.
- **Determinism**: math you wrote is debuggable; library internals aren't.
- **Native feel**: spring physics with hand-tuned cubic-beziers + velocity calc beats library defaults for one-off gestures.

**When to break this rule**: if a feature needs *coordinated* layout animation across many elements (FLIP / shared element transitions), consider a library. But default to handwritten math.

---

## Known Gaps (Address When Needed)

These were not solved in the harvest project. Solve them in this project as they come up:

1. **Haptic feedback rules** — when to call `navigator.vibrate()` (Android only; iOS WebKit doesn't support it). Pattern was never formalized.
2. **`prefers-reduced-motion`** — all 250ms+ transitions should respect it. Add a wrapper or CSS variable for transition durations.
3. **Error rollback animation** — exact behavior when an optimistic update fails: fade item back out? leave + toast? Make a per-mutation-type decision.
4. **Conflict resolution UI** — when two clients edit the same field offline, what does the UI show on reconnect? Server resolves the data; client needs a story for *displaying* the resolution.
5. **Multi-select / batch gestures** — swipe-to-delete is single-row only. If batch actions are needed, design a long-press → select mode → batch-action path.
6. **Sticky elements during drag** — if a sticky bar (e.g. add-button) overlaps a draggable list, decide auto-scroll behavior at the edge.
7. **Pending-mutation indicator** — a per-row queue marker is mentioned but never standardized.

Add to this list as you discover new gaps. The list shrinks as the project matures.

---

## Quick Reference Card

```
PRESS         scale(0.965)     bg ink-06        120ms ease-out
SPRING        snap back        overshoot 6%     250ms cubic-bezier(.34,1.56,.64,1)
SWIPE COMMIT  threshold 120    cap 180          resistance 0.3
VELOCITY      open if v>0.5px/ms  OR  distance>60px
TOAST         translateY 20→0  duration 2400    enter 250ms ease-out
TOUCH TARGET  ≥44×44px         always
```
