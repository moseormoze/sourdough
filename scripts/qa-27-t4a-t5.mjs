import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

// T4a + T5 rendered QA: one shared timer shell on every stage that carries a
// wait, a progress bar that actually represents time, and no timer UI on a
// stage being peeked at. Exits non-zero on a bad state.
const BASE = process.env.PROBE_URL || "http://localhost:3024";
const OUT = "specs/features/27-configurable-stage-timers/qa";
mkdirSync(OUT, { recursive: true });
const fails = [], notes = [];
const check = (n, ok, d) => (ok ? notes : fails).push(`${ok ? "PASS" : "FAIL"} ${n}${d ? ` — ${d}` : ""}`);

const RECIPE = {
  id: "r1", name: "כפרי קלאסי",
  flour: { white: 80, wholeWheat: 20, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
  hydration: 72, salt: 2, levain: 20, flourWeightGrams: 500, kitchenTemp: 24,
  inclusions: [], createdAt: 1, updatedAt: 1,
};

const TIMER_STAGES = [1, 2, 4, 7, 8, 9, 10, 11];
const NO_TIMER_STAGES = [3, 5, 6, 12];

const browser = await chromium.launch();
const errors = [];

async function seed(page, { currentStage, timer = {} }) {
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(([recipe, currentStage, timer]) => {
    const now = Date.now();
    localStorage.setItem("sourdough:v1:identity", JSON.stringify({ name: "אילון", email: "e@x.ai", identifiedAt: "2026-08-06T00:00:00.000Z" }));
    localStorage.setItem("sourdough:v1:install-banner-dismissed", "1");
    localStorage.setItem("sourdough:v1:recipes", JSON.stringify([recipe]));
    localStorage.setItem("sourdough:v1:active-bake", JSON.stringify({
      id: "b1", recipe, startedAt: now - 3600000, currentStage,
      stageStartedAt: now - 60000, observationChecks: {}, subStep: 0,
      timerStartedAt: null, timerElapsedSeconds: 0, timerDurationSeconds: null,
      bakingMethod: "dutch-oven", feedAt: null, peakAt: null, feedRatio: 3,
      retardHours: 12, doughTempC: null, ...timer,
    }));
  }, [RECIPE, currentStage, timer]);
}

async function openPage(width, height) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${width}px: ${e.message}`));
  return page;
}

/* ─── 1. coverage: the shared shell reaches every waiting stage, and only those ─── */
{
  const page = await openPage(375, 812);
  for (const n of TIMER_STAGES) {
    await seed(page, { currentStage: n });
    await page.goto(`${BASE}/bake/stage/${n}`, { waitUntil: "networkidle" });
    const card = page.locator('[data-testid="bake-timer-card"]');
    const count = await card.count();
    check(`stage ${n} renders exactly one shared timer card`, count === 1, `found ${count}`);
    if (n === 7 && count === 1) {
      // Stage 7 is a migrated stage: it used to carry the OptionalTimer pill.
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await card.screenshot({ path: `${OUT}/t4a-idle-migrated-stage.png` });
    }
  }
  for (const n of NO_TIMER_STAGES) {
    await seed(page, { currentStage: n });
    await page.goto(`${BASE}/bake/stage/${n}`, { waitUntil: "networkidle" });
    const count = await page.locator('[data-testid="bake-timer-card"]').count();
    check(`stage ${n} carries no timer`, count === 0, `found ${count}`);
  }
  await page.context().close();
}

/* ─── 2. the running card: real progress, one charcoal hero, 44px controls ─── */
{
  const page = await openPage(375, 812);
  const DURATION = 45 * 60;
  await seed(page, {
    currentStage: 2,
    timer: {
      timerStartedAt: Date.now() - 15 * 60 * 1000,
      timerElapsedSeconds: 0,
      timerDurationSeconds: DURATION,
    },
  });
  await page.goto(`${BASE}/bake/stage/2`, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-testid="timer-progress-fill"]');

  const bar = await page.evaluate(() => {
    const track = document.querySelector('[data-testid="timer-progress"]');
    const fill = document.querySelector('[data-testid="timer-progress-fill"]');
    const cs = getComputedStyle(fill);
    return {
      trackHeight: Math.round(track.getBoundingClientRect().height),
      ratio: fill.getBoundingClientRect().width / track.getBoundingClientRect().width,
      ariaHidden: track.getAttribute("aria-hidden"),
      image: cs.backgroundImage,
      transition: cs.transitionProperty,
      timing: cs.transitionTimingFunction,
      // Scoped to the card: ProgressStrip legitimately owns a page-level
      // progressbar ("שלב 2 מתוך 12"); the timer must not add a second voice.
      progressbarRoles: document
        .querySelector('[data-testid="bake-timer-card"]')
        .querySelectorAll('[role="progressbar"]').length,
    };
  });
  // 30 of 45 minutes left → the fill must sit at two thirds, not at a decoration.
  check("fill width tracks secondsLeft / durationSeconds", Math.abs(bar.ratio - 2 / 3) < 0.02, `ratio ${bar.ratio.toFixed(3)}`);
  check("track is the specified 3px", bar.trackHeight === 3, `${bar.trackHeight}px`);
  check("fill carries the orange gradient", /gradient/.test(bar.image) && bar.image.includes("230, 107, 61"), bar.image.slice(0, 90));
  check("bar is hidden from assistive tech", bar.ariaHidden === "true", `${bar.ariaHidden}`);
  check("time is announced once, not twice", bar.progressbarRoles === 0, `${bar.progressbarRoles} progressbar roles`);
  check("width transitions without a spring curve", bar.transition.includes("width") && !bar.timing.includes("1.56"), `${bar.transition} / ${bar.timing}`);

  const surfaces = await page.evaluate(() =>
    document.querySelectorAll('[data-surface="charcoal"]').length);
  check("at most one charcoal hero on the screen", surfaces <= 1, `${surfaces} charcoal surfaces`);

  const controls = await page.evaluate(() => {
    const card = document.querySelector('[data-testid="bake-timer-card"]');
    return [...card.querySelectorAll("button")].map((b) => Math.round(Math.min(
      b.getBoundingClientRect().width, b.getBoundingClientRect().height)));
  });
  check("every timer control meets the 44px floor", controls.every((c) => c >= 44), JSON.stringify(controls));
  await page.locator('[data-testid="bake-timer-card"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/t4a-running-375.png` });
  await page.locator('[data-testid="bake-timer-card"]').screenshot({ path: `${OUT}/t4a-running-card.png` });
  await page.context().close();
}

/* ─── 3. the bulk stage: hero lifted out of the folds card, hint stays ─── */
{
  const page = await openPage(375, 812);
  await seed(page, { currentStage: 4 });
  await page.goto(`${BASE}/bake/stage/4`, { waitUntil: "networkidle" });
  const bulk = await page.evaluate(() => {
    const card = document.querySelector('[data-testid="bake-timer-card"]');
    const folds = [...document.querySelectorAll("section")].find(
      (s) => s.querySelector("h3")?.textContent.trim() === "קיפולים");
    return {
      nested: folds ? folds.contains(card) : null,
      hintInFolds: folds ? /המרווחים יכולים לגדול/.test(folds.textContent) : null,
    };
  });
  check("bulk timer is not nested inside the folds card", bulk.nested === false, `${bulk.nested}`);
  check("fold-cadence hint stayed in the folds card", bulk.hintInFolds === true, `${bulk.hintInFolds}`);
  await page.locator('[data-testid="bake-timer-card"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/t4a-bulk-375.png` });
  await page.context().close();
}

/* ─── 3b. the wheel sheet clears the FAB (interaction with #110's portal) ─── */
{
  const page = await openPage(375, 812);
  await seed(page, { currentStage: 7 });
  await page.goto(`${BASE}/bake/stage/7`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "הפעל טיימר" }).first().click();
  await page.waitForTimeout(500);

  const layering = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return { opened: false };
    const fab = document.querySelector('[data-testid="feedback-fab"]')
      ?? [...document.querySelectorAll("button")].find(
        (b) => getComputedStyle(b).position === "fixed" && b.getBoundingClientRect().width <= 72);
    const r = fab?.getBoundingClientRect();
    const hit = r ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null;
    return {
      opened: true,
      portalled: dialog.parentElement === document.body,
      hasWheel: document.querySelectorAll('[role="listbox"]').length === 2,
      fabPresent: !!r,
      hitIsSheet: hit ? !!hit.closest('[role="dialog"]') : null,
    };
  });
  check("timer setup sheet opens from the migrated stage", layering.opened === true, JSON.stringify(layering));
  check("sheet is portalled to body (post-#110)", layering.portalled === true, `${layering.portalled}`);
  check("wheel offers both columns inside the sheet", layering.hasWheel === true, `${layering.hasWheel}`);
  check(
    "sheet paints above the feedback FAB",
    layering.fabPresent ? layering.hitIsSheet === true : true,
    `fab=${layering.fabPresent} hit=${layering.hitIsSheet}`,
  );
  await page.screenshot({ path: `${OUT}/t4a-wheel-sheet-375.png` });
  await page.context().close();
}

/* ─── 4. peeking at another stage still shows no timer (T1 contract) ─── */
{
  const page = await openPage(375, 812);
  await seed(page, {
    currentStage: 4,
    timer: { timerStartedAt: Date.now(), timerElapsedSeconds: 0, timerDurationSeconds: 30 * 60 },
  });
  await page.goto(`${BASE}/bake/stage/2`, { waitUntil: "networkidle" });
  const peek = await page.locator('[data-testid="bake-timer-card"]').count();
  check("a peeked stage paints no timer it does not own", peek === 0, `found ${peek}`);

  await page.goto(`${BASE}/bake/stage/4`, { waitUntil: "networkidle" });
  const back = await page.locator('[data-testid="bake-timer-card"]').count();
  check("returning to the holding stage restores the timer", back === 1, `found ${back}`);
  await page.context().close();
}

/* ─── 5. 320px: nothing overflows ─── */
{
  const page = await openPage(320, 780);
  await seed(page, {
    currentStage: 2,
    timer: { timerStartedAt: Date.now(), timerElapsedSeconds: 0, timerDurationSeconds: 45 * 60 },
  });
  await page.goto(`${BASE}/bake/stage/2`, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => {
    const card = document.querySelector('[data-testid="bake-timer-card"]');
    return {
      cardRight: Math.round(card.getBoundingClientRect().right),
      docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  check("no horizontal page overflow at 320px", overflow.docOverflow <= 0, `${overflow.docOverflow}px`);
  check("timer card stays inside the 320px viewport", overflow.cardRight <= 320, `right edge ${overflow.cardRight}`);
  await page.screenshot({ path: `${OUT}/t4a-running-320.png` });
  await page.context().close();
}

check("no page errors in any run", errors.length === 0, errors.join(" | "));

await browser.close();
for (const n of notes) console.log(n);
for (const f of fails) console.error(f);
console.log(`\n${notes.length} passed, ${fails.length} failed`);
process.exit(fails.length ? 1 : 0);
