# Kikar · Components

> Component API reference. Read alongside `HANDOFF.md`, `tokens.json`, `tokens.css`, `tailwind.config.js`.
>
> All examples assume a React/Tailwind stack with `dir="rtl"` on `<html>`.

---

## Conventions

- **Logical properties only**: `ms-/me-/ps-/pe-/start-/end-`. Never `ml-/mr-/left-/right-`.
- **Touch targets ≥ 44×44px** on anything interactive.
- **Numbers stay LTR** inside Hebrew text — wrap with `<span dir="ltr" className="num">75%</span>`.
- **Press feedback** is universal: `scale(0.965) / 120ms / ease-out` on any tap. Implemented via the `.pressable` utility in `tokens.css` (or a base layer on all buttons).
- **Focus**: use `:focus-visible`, not `:focus`. Ring color matches variant.
- **`prefers-reduced-motion`** is respected globally (see `tokens.css`).

---

## Atoms

### `<Button>`

| Prop      | Type                                         | Default    | Notes |
|-----------|----------------------------------------------|------------|-------|
| `variant` | `'primary' \| 'accent' \| 'soft' \| 'ghost' \| 'warn'` | `'primary'` | |
| `size`    | `'md' \| 'sm'`                               | `'md'`     | `md`=56px min-height, `sm`=44px |
| `disabled`| `boolean`                                    | `false`    | 40% opacity, no pointer events |
| `loading` | `boolean`                                    | `false`    | spinner replaces leading icon, copy stays |
| `iconStart` / `iconEnd` | `ReactNode`                      | —          | RTL-aware: `iconEnd` renders at the inline-end |

**States** (visualized in design system): `default · hover · pressed · focus-visible · disabled · loading`

**Variants**
- `primary` — ink fill on cream. Workhorse.
- `accent` — clay fill. Use for **the** action on a screen. Never two on one screen.
- `soft` — paper fill with shadow. Secondary action.
- `ghost` — transparent. Tertiary; in a row of actions, the dismiss/skip.
- `warn` — amber fill. Reserved for actions that delay (e.g. "+5 דקות").

**Press feedback**: 120ms `scale(0.965)`. **Focus ring**: 3px halo (`#B5BEEC` on ink buttons, `#FBD0B5` on accent).

```tsx
<Button variant="accent" iconEnd={<ArrowEnd />}>
  סיימתי קיפול
</Button>
```

---

### `<Input>`

Text or numeric. Border-only by default — no fill on rest.

| State | Style |
|-------|-------|
| rest    | `border: 1.5px solid var(--line)` |
| focus   | `border-color: var(--ink)` + `3px halo` |
| filled  | same as rest |
| error   | `border-color: var(--danger)` + inline message below |
| disabled| 40% opacity |

**Validation timing**: errors render only after blur AND on invalid value. Never block typing. Clear instantly when valid.

```tsx
<Input
  label="שם המתכון"
  placeholder="לחם של שישי"
  error={touched && !name ? "שדה חובה" : null}
/>
```

For numeric fields use `<NumericStepper>` (a styled input + `−` / `+` buttons in a card-flat container — see DS for spec).

---

### `<Pill>`

Small semantic chip. **Never tappable as primary action** — that's a button.

| Variant | Use |
|---------|-----|
| `accent` (default) | duration tags, stage hints |
| `sage`  | success / completed |
| `warn`  | caution states |
| `ink`   | high emphasis ("בייק פעיל") |
| `ghost` | on tinted surfaces |

```tsx
<Pill variant="sage">הושלם · קיפול 1</Pill>
```

---

### `<Term>`

Inline Hebrew term with dotted underline + small `(?)`. Opens a popover with a 1–2 sentence definition.

**Use rule**: the FIRST occurrence of a technical term on a given screen. Not every mention.

```tsx
הבצק עובר <Term title="אוטוליזה" body="מים+קמח נחים יחד">אוטוליזה</Term> במשך
<span dir="ltr" className="num">30</span> דקות.
```

The popover positions automatically; in tight spaces fall back to a bottom sheet.

---

### Icons

22 line icons from `soft-ui.jsx` (Lucide-style, 1.5–1.8 stroke). Default size 18px. Directional icons (`ChevronStart`, `ChevronEnd`, `ArrowEnd`) **auto-mirror** in RTL — don't manually rotate.

```tsx
import { ChevronEnd, ArrowEnd, Bell } from "@/components/icons";
```

---

### Selection controls

- **`<CheckTile>`** — for stage checklists. Tile is the touch target, not just the box. Checked state uses sage tint + border.
- **`<Switch>`** — binary on/off. Ink fill when on. Smooth 200ms knob slide.
- **`<RadioGroup>`** — large pill-shaped options stacked vertically. Selected = accent-bg + accent border + filled inner dot.

```tsx
<CheckTile checked={checks.a} onChange={v => setChecks({ ...checks, a: v })}>
  הבצק תפח בכ-60%
</CheckTile>
```

---

### Progress

- **`<ProgressStrip>`** — 12-segment bar at the top of every stage screen.
- **`<FoldDots>`** — sub-step progress (e.g. 4 stretch-and-folds inside the bulk stage).
- **`<ProgressBar>`** — percentage bar inside a card.

```tsx
<ProgressStrip total={12} current={4} />  // segments 1-3 done, 4 current
```

---

## Molecules

### `<Photo>`

Typed photo slot. Renders a duotone placeholder in design; swap for real images at build.

| Prop | Type | Notes |
|------|------|-------|
| `src` | `string` | optional — when present, renders real image |
| `tone`| `'dough'\|'bowl'\|'fold'\|'shaped'\|'banneton'\|'baked'\|'crumb'\|'jar'` | placeholder fallback tone |
| `aspect`| `'4/3'\|'16/10'\|'1/1'\|...` | required |
| `tag` | `string` | optional top-start chip |
| `caption` | `string` | optional bottom-start caption |

Always wrap in a `radius-2xl` card.

---

### `<RefGallery>`

Horizontal scroll of comparison thumbnails. Two modes:
- **strict-positive** (default) — only good examples
- **comparative** — pass `label` + `kind: 'good'|'bad'` on each item

```tsx
<RefGallery items={[
  { tone: 'bowl',   text: 'תפיחה אחידה' },
  { tone: 'dough',  text: 'בועות קטנות' },
]} />
```

---

### `<Expand>`

Collapsed by default. Click → chevron rotates, surface tints. Two tones: `accent` (reasoning) or `question` (FAQ).

**Rule**: max 3 Expands per screen. Overflow → Questions module.

```tsx
<Expand title="למה מקפלים ולא לשים?" tone="accent">
  לישה אגרסיבית קורעת את הגלוטן. הקיפול מארגן את הסיבים בלי לשבור.
</Expand>
```

---

### `<Briefing>`

Peach-gradient card at the top of every stage. Heading + blurb + 2–3 takeaway bullets.

```tsx
<Briefing
  heading="זה השלב שבו הלחם מקבל את האופי שלו"
  blurb="התסיסה הראשונית בונה מבנה וטעם."
  takeaways={[
    "הקיפולים בונים חוזק בלי לישה אגרסיבית",
    "החום במטבח מאיץ או מאט את התסיסה",
  ]}
/>
```

---

### `<VideoCard>`

Photo thumbnail + play overlay + duration. Optional chapter timeline below.

| Prop | Type |
|------|------|
| `src` | `string` — YouTube/Vimeo URL |
| `tone` | placeholder tone (fallback before src loads) |
| `title` | `string` |
| `source` | `string` — channel/publisher (required for attribution) |
| `duration` | `string` — e.g. `"3:42"` |
| `chapters` | `Array<{t, label, current?}>` (optional, up to 6) |

---

### `<Questions>`

Bottom-of-stage list of FAQ rows. Each row → `onOpen(q)` callback. Pair with `<BottomSheet>`.

```tsx
<Questions
  heading="שאלות נפוצות בשלב הזה"
  items={questionsForStage(stageId)}
  onOpen={q => openSheet(q)}
/>
```

Icon tones: `icn-warn` for things that signal something wrong. Default accent otherwise.

---

### `<Toast>`

Bottom inset. **Replace, don't stack**: a new toast replaces the previous mid-display.

- Holds **2.4s** (action toasts: 5s)
- Single line, max ~30 chars
- Slide up on enter, slide down on exit (200ms ease-out)

```tsx
toast.show("המתכון נשמר כפריסט");
toast.show("תזכורת נקבעה", { variant: "accent" });
```

---

## Organisms

### `<TopBar>`

Three slots: `start` / `center` / `end`. 56px tall. Always sits inside `safe-area-inset-top`.

Variants:
- **Home** — wordmark + sheet
- **Stage** — back + counter pill + sheet
- **Overlay** — close-only on end

```tsx
<TopBar
  start={<IconButton icon={<ChevronEnd />} onClick={back} />}
  center={<ContextPill>04 / 12 · תסיסה</ContextPill>}
  end={<IconButton icon={<Menu />} onClick={openSheet} />}
/>
```

---

### `<TabBar>`

Floating, glass-backed (44% opacity + 20px blur). 3 tabs: בית · מתכונים · למידה. Lives ONLY on the home screen.

---

### `<StageHeader>`

The first three blocks on every stage screen: TopBar → ProgressStrip → pill + title + blurb. Always identical structure — never customize across stages.

```tsx
<StageHeader
  stageNumber={4} totalStages={12}
  stageName="תסיסה ראשונית"
  durationPill="~ 4 שעות · קיפולים ×4"
  intro="הבצק מתחיל לחיות. כל 30 דקות קיפול."
/>
```

---

### `<BottomSheet>`

Modal that slides up from below.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `open` | `boolean` | — | |
| `size` | `'peek'\|'full'` | `'peek'` | peek=56%, full=88% |
| `onClose` | `() => void` | — | scrim, ✕, drag-grip-down all call this |
| `title` | `string` | — | rendered with `text-heading` |

Scrim: `rgba(31,26,20,0.45)` + `backdrop-filter: blur(2px)`.

```tsx
<BottomSheet open={!!activeQ} size="peek" title={activeQ?.q} onClose={() => setActiveQ(null)}>
  {/* photo + 3 short steps + optional video card */}
</BottomSheet>
```

---

## Composition: a stage screen

This is the canonical structure for ALL 12 stage screens. Don't deviate.

```tsx
<Screen dir="rtl">
  <TopBar ... />
  <ProgressStrip ... />
  <StageHeader ... />
  <Briefing ... />

  <FoldDots ... />                       {/* only on bulk fermentation */}

  <RefGallery items={...} />             {/* what the dough should look like */}

  <InstructionCard>                      {/* "מה לעשות" */}
    {instructionText}                    {/* inline <Term> chips as needed */}
    <Tip>{shortTip}</Tip>
  </InstructionCard>

  <Expand title="למה?">{whyBody}</Expand>
  <Expand title="איך לדעת שזה נגמר?">{readyBody}</Expand>

  <VideoCard ... />                      {/* technique-heavy stages only */}

  <Questions items={faqsForThisStage} onOpen={openSheet} />

  <Checklist items={observationChecks} value={checks} onChange={setChecks} />

  <StickyActions>
    <Button variant="accent">סיימתי, להמשיך</Button>
    <Button variant="soft" size="sm">תזכורת בעוד 5 ד׳</Button>
    <Button variant="ghost" size="sm">הצץ בשלב הבא</Button>
  </StickyActions>
</Screen>
```

For timer-driven stages (retard / preheat / bake / cool), replace `RefGallery` + `Checklist` with `<TimerRing>`, and the primary CTA is disabled until the timer reaches zero (or near zero with a 5min grace).

---

## Data shapes

See `data.js` for the source. Two collections:

```ts
type Preset = {
  id: string;
  name: string;            // Hebrew
  flours: string;          // "80% לבן · 20% מלא"
  hydration: number;       // 50-100
  salt: number;            // 0-5
  levain: number;          // 0-40
  blurb: string;
  art: PhotoTone;          // matches Photo's tone prop
  mine?: boolean;          // user-saved
};

type Stage = {
  n: number;               // 1-12
  short: string;
  name: string;
  hint: string;            // English in parens, optional
  time: string;            // human duration "~ 4 שעות"
  type: 'check' | 'timer' | 'bulk' | 'done';
  art: PhotoTone;
  todo?: string;
  checks?: string[];
  duration?: number;       // seconds — for type:'timer' only
  subSteps?: number;       // for bulk only
};
```
