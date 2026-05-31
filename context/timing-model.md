# Timing Model — Single Source of Truth

This document is the canonical description of **how the app computes every bake
duration today**. Both the engine ([`lib/bake-timing.ts`](../lib/bake-timing.ts))
and the walkthrough content ([`lib/data/stages.ts`](../lib/data/stages.ts)) must
agree with what is written here. When they drift, this file is right and the code
is a bug — until a new Discovery cycle changes the model and updates this file
first.

> Status: **descriptive, not yet ratified.** It records the code as it stands on
> 2026-05-31. Numbers marked ⚠️ are known contradictions awaiting the next
> timing Discovery — do not treat them as decided.

---

## 1. The two independent time axes

The model has **two separate axes** that must never be mixed:

1. **The starter axis** — the baker's own culture, fed with its own fixed flour.
   Governs the optional **Stage 0 (feeding → peak)** when the starter isn't
   already at peak. Takes temperature, **never** the recipe's flour blend.
2. **The dough axis** — every stage from the levain build to out-of-oven. Takes
   temperature, and fermentation stages also take the recipe's flour blend.

Keeping them apart is deliberate: the starter is fed at a fixed ratio regardless
of what bread you're making, so the recipe's flour must not bend its timing.
See the engine comment at [`bake-timing.ts:24-37`](../lib/bake-timing.ts#L24-L37).

---

## 2. Temperature model (Q10)

Every **fermentation** duration scales by the Q10 rule: each 10 °C change
doubles or halves fermentation speed.

```
factor = 2 ^ ((BASE_TEMP − kitchenTemp) / 10)
adjustedSecs = baseSecs × factor
```

- Dough-axis base temperature: **24 °C** (`BASE_TEMP_C`)
- Starter-axis base temperature: **25 °C** (`STARTER_PEAK_BASE_TEMP_C`)
- Fixed (non-fermentation) stages — mix, shape, preheat, bake, retard — are
  **not** temperature-adjusted.

UI temperature range exposed to the user: **20–27 °C** (winter 20–24, summer 24–27).

---

## 3. Flour model

Whole grains and rye carry more enzymes, microbes and bran, so they ferment
faster. The recipe's blend yields a single multiplier applied to **fermentation
stages only** (levain build + bulk), never to the starter axis.

| Flour | Shortening at 100% |
|---|---|
| White (לבן) | 0% |
| Spelt white (כוסמין לבן) | 5% |
| Whole wheat (חיטה מלאה) | 18% |
| Spelt whole (כוסמין מלא) | 18% |
| Rye (שיפון) | 25% |

- Weighted by the blend, then **capped at 20% total** — even 100% rye only shaves
  20% off fermentation time.
- `flourFactor` ranges 1.0 (all white) → 0.80 (very high rye/whole).

Source: [`bake-timing.ts:67-93`](../lib/bake-timing.ts#L67-L93).

---

## 4. Stage durations (current code)

All "base" values are at the axis base temp above, before Q10 / flour.

| # | Stage | Hebrew | Kind | Base | Temp? | Flour? | Notes |
|---|---|---|---|---|---|---|---|
| 0 | Feed → peak | האכלת סטארטר → שיא | starter | **9 h** @25°C | ✓ | ✗ | Only when "הסטארטר כבר בשיא?" = לא. ±1 h window. |
| 1 | Levain build | בניית שאור | fermentation | **8 h** @24°C | ✓ | ✓ | Shown as a range "7–9 שעות". ⚠️ see §6 |
| 2 | Autolyse + mix | אוטוליזה + לישה | fixed | 45 + 15 min | ✗ | ✗ | |
| 3 | Bulk + folds | תסיסה ראשונית | fermentation | **4 h** @24°C | ✓ | ✓ | 4 folds, every 30 min |
| 4 | Pre-shape + shape | עיצוב | fixed | 25 + 10 min | ✗ | ✗ | |
| 5 | Cold retard | התפחה במקרר | fixed | **12 h** | ✗ | ✗ | Editable 6–48 h, see §5 |
| 6 | Preheat | חימום תנור | fixed | 45 min | ✗ | ✗ | |
| 7 | Bake | אפייה | fixed | 20 + 22 min | ✗ | ✗ | covered + uncovered |
| — | Cool | קירור | — | 60 min | — | — | Recommendation only — **not** part of "ready" |

"Ready" = the moment the loaf leaves the oven. Cooling is shown as a tip after.

---

## 5. The cold retard — the schedule's shock absorber

The retard is the one duration the baker stretches to fit the bake around their
life:

- Default **12 h** · Min **6 h** (below this crumb/handling suffers) · Max **48 h**
  (beyond this it over-proofs / gets too sour).

Source: [`bake-timing.ts:99-101`](../lib/bake-timing.ts#L99-L101).

---

## 6. Decisions — 2026-05-31 timing Discovery

The three contradictions below were resolved by one structural decision. They are
**decided direction, pending implementation** — the code still reflects the old
model until a feature ships.

### Decision 1 — Collapse feed + levain into a single build

The app currently runs **two** back-to-back fermentation builds: Stage 0 (feed
starter → peak, 9 h) and Stage 1 (build levain → peak, 8 h) — ~17 h of process
the target audience's course does in one. We adopt the course's model: **refresh
the starter to peak once, use it directly in the dough.** No separate levain
build stage.

### Decision 2 — The refresh ratio is the scheduling lever, not a fixed number

- Peak time comes from the **§8 reference table** (temp × ratio), not a fixed Q10
  number.
- The ratio (1:1:1 … 1:5:5) becomes a **user-facing planning lever**, exposed as a
  smart-default hybrid: the app proposes a ratio that lands the feed at a
  convenient hour, and the baker can adjust it. Bidirectional — pin the feed time
  and the app picks the ratio, or pin the ratio and the app moves the feed time.
- What stays recipe-fixed is the **amount** of active starter the dough needs
  (`levain%` of flour). The ratio is free; given amount + ratio, the math derives
  how much mother / flour / water to feed. The build breakdown therefore moves to
  **plan time** instead of being stored 1:1:1 on the recipe
  ([`bake-math.ts:59-61`](../lib/bake-math.ts#L59-L61)).

### How this resolves the old contradictions

- **6a (ratio vs. times):** gone — there's one build, its ratio is chosen, and its
  time is looked up from the table for that ratio + temp.
- **6b (two times for one levain):** gone — one build, one number, one source.
- **6c (Stage 0 in engine but not in walkthrough):** the single build *is* the
  walkthrough's first stage; `STAGES` and the engine describe the same step.

---

## 7. Schedule presets (start-ASAP rhythms)

Presets pick the **earliest** valid ready-time on a target hour such that every
active hands-on step (mix, bulk, shape, preheat, bake) **starts between
07:00–23:00**. Source: [`bake-presets.ts`](../lib/bake-presets.ts).

| Preset | Hebrew | Retard | Target ready hour |
|---|---|---|---|
| `fast` | מהיר | 6 h | 20:00 |
| `classic` | קלאסי | 12 h | 10:00 |
| `classic-late` | קלאסי מאוחר | 16 h | 17:00 |
| `long` | ארוך | 28 h | 18:00 |

---

## 8. Starter peak — reference table (course data)

Empirical "hours to peak after refresh" from the Israeli sourdough course the
target audience learns from. Rows = room temperature, columns = **refresh ratio**
(starter : flour : water). This is the data that should drive the starter axis,
**replacing the fixed Q10 number** in §2/§4 for Stage 0.

| °C | 1:1:1 | 1:2:2 | 1:3:3 | 1:4:4 | 1:5:5 |
|---|---|---|---|---|---|
| 16 | 12 | 14 | 16 | 18 | 20 |
| 18 | 10 | 12 | 14 | 16 | 18 |
| 20 | 8 | 10 | 12 | 14 | 16 |
| 22 | 6.5 | 9 | 11 | 13 | 15 |
| 24 | 5 | 8 | 10 | 12 | 14 |
| 26 | 4 | 7 | 9 | 11 | 13 |
| 28 | 3 | 6 | 8 | 10 | 12 |
| 30 | 2.5 | 5 | 7 | 9 | 11 |
| 32 | 2 | 4.5 | 6 | 8 | 10 |

Key properties the current Q10 model gets wrong:
- **Steeper than Q10 at low ratios.** 1:1:1 goes 12 h → 4 h between 16→26 °C — a
  ~3× swing per 10 °C, not the 2× Q10 assumes.
- **Higher ratios are flatter** (less temperature-sensitive): 1:5:5 only moves
  20 h → 13 h over the same span.
- **The refresh ratio is a deliberate scheduling lever**: at 24 °C the baker can
  choose anywhere from 5 h (1:1:1) to 14 h (1:5:5) to make the feed land at a
  convenient hour. This is the course's core scheduling technique.

**Lookup rule (decided, Feature 14):** ratio is one of the **5 discrete columns**;
temperature **interpolates linearly** between rows and **clamps** below 16 °C /
above 32 °C. No continuous-ratio interpolation — the ±1 h peak window absorbs
finer precision.

Implication for §6a: our math's **1:1:1** ⇒ ~5 h at 24 °C, but the engine's fixed
**9 h** implies ~1:2:2–1:3:3. The contradiction is now precisely quantified.

## 9. Stage timing validated against the course (deltas to decide)

Cross-check of every dough-axis duration against the course material. "Δ" rows
are gaps between our current code and the course — pending decisions, not yet
applied. Full technique detail lives in
[`baking-reference.md`](./baking-reference.md).

| Stage | Course says | Our code | Δ to decide |
|---|---|---|---|
| Autolyse | 20–60 min; whole flours longer (up to 2 h, sometimes in fridge). Salt always added after. | 45 min (inside `mix`) | Whole-flour blends could earn a longer autolyse. |
| Knead/mix | Hand: fold-based, merged into bulk. Mixer: 5–15 min. **Ideal dough temp 24–26 °C.** | 15 min (inside `mix`) | Model anchors on *room* temp; course anchors fermentation on *dough* temp. |
| Bulk | No fixed time. Driven by **dough temp (24–26 °C ideal), starter %, flour, hydration.** 2–3 h warm → 8–12 h+ cold. | 4 h @24 °C, Q10 + flour | **Misses the starter-% lever.** Higher inoculation shortens bulk; we don't model it yet. |
| Bulk end-signal | Volume **+30–75%** (not doubling), domed surface, rounded edges. "Under-proofed > over-proofed." | walkthrough says +50–70% | Align copy to +30–75% and the "under is safer" framing. |
| Folds | 3–4 sets in first ~2 h, intervals **15–45 min**, tapering (frequent early → spaced later). | 4 folds every 30 min | Course tapers intervals; ours are uniform. |
| Bench rest | 15–60 min (depends on temp + dough strength). | 25 min (inside `shape`) | Ours sits at the low end. |
| Preheat | **45–60 min**, 230–250 °C; tin method needs less, stone/steel/cast-iron need 60. | 45 min fixed | Low end; could scale by vessel (cast-iron/steel → 60). |
| Bake covered | 20–25 min. | 20 min | OK. |
| Bake uncovered | 15–30 min **at reduced temp 190–210 °C.** Done at **96–99 °C** internal. | 22 min, temp stays high | Content should drop the temp for the uncovered phase. |
| **Retard** | **Min 8–12 h**, up to 24/48/72 h. Ideal fridge **4–5 °C.** | default 12 h, **min 6 h, max 48 h** | **Decided (F14): min 6 → 8 h; max stays 48 h** (72 h excessive for beginners; long-retard warning is a UX concern). |
| Cool | 1 h min, **2–3 h ideal.** | 60 min recommendation | Could recommend 2–3 h. |

Conceptual note from the course's final-proof graph: the retard's real value is a
**wide oven-entry window** — fridge dough holds near the 170%-volume "ready" line
for roughly 6 h → 46 h, versus a narrow ~2 h window at room temp. This is the
foundation under the schedule-flexibility presets.

## 10. Where each number lives in code

| Concern | File |
|---|---|
| Q10, flour model, sequence, retard bounds, starter peak | [`lib/bake-timing.ts`](../lib/bake-timing.ts) |
| Levain quantities & ratio | [`lib/bake-math.ts`](../lib/bake-math.ts) |
| Walkthrough content + per-stage display durations | [`lib/data/stages.ts`](../lib/data/stages.ts) |
| Preset configs & in-window rule | [`lib/bake-presets.ts`](../lib/bake-presets.ts) |
