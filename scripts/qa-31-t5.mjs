import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

// T5 rendered QA at 375px (and 340px): the bulk depth guide opens from stage 4,
// runs as one scroll with no nested sheet, plays the folds demo inline, and
// leaves the bake untouched.
const BASE = process.env.PROBE_URL || "http://localhost:3023";
const OUT = process.env.QA_OUT || "specs/features/31-bulk-readiness/qa/t5";
mkdirSync(OUT, { recursive: true });
const fails = [], notes = [];
const check = (n, ok, d) => (ok ? notes : fails).push(`${ok ? "PASS" : "FAIL"} ${n}${d ? ` — ${d}` : ""}`);

const RECIPE = {
  id: "r1", name: "כפרי כוסמין",
  flour: { white: 30, wholeWheat: 0, rye: 0, speltWhite: 0, speltWhole: 70, other: 0 },
  hydration: 85, salt: 2, levain: 20, flourWeightGrams: 500, kitchenTemp: 22,
  inclusions: [], createdAt: 1, updatedAt: 1,
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.evaluate((recipe) => {
  const now = Date.now();
  localStorage.setItem("sourdough:v1:identity", JSON.stringify({ name: "אילון", email: "e@x.ai", identifiedAt: "2026-08-06T00:00:00.000Z" }));
  localStorage.setItem("sourdough:v1:install-banner-dismissed", "1");
  localStorage.setItem("sourdough:v1:recipes", JSON.stringify([recipe]));
  localStorage.setItem("sourdough:v1:active-bake", JSON.stringify({
    id: "b1", recipe, startedAt: now - 7200000, currentStage: 4,
    stageStartedAt: now - 3600000, observationChecks: {}, subStep: 2,
    timerStartedAt: now - 600000, timerElapsedSeconds: 0, timerDurationSeconds: 30 * 60,
    bakingMethod: "dutch-oven", feedAt: null, peakAt: null, feedRatio: 3,
    doughTempC: 27, retardHours: 12,
  }));
}, RECIPE);
await page.goto(BASE + "/bake/stage/4", { waitUntil: "networkidle" });

const bakeBefore = await page.evaluate(() => localStorage.getItem("sourdough:v1:active-bake"));
const trigger = page.getByRole("button", { name: "הסבר על התסיסה הראשונית" });
check("the bulk stage offers its own depth trigger", (await trigger.count()) === 1);
await trigger.click();
await page.waitForSelector('[role="dialog"]');
await page.waitForTimeout(600);

const guide = await page.evaluate(() => {
  const d = [...document.querySelectorAll('[role="dialog"]')].find((x) => x.querySelector('[data-testid="guide-folds"]'));
  const iframe = d.querySelector('[data-testid="guide-folds"] iframe');
  const box = iframe.parentElement.getBoundingClientRect();
  const factors = [...d.querySelectorAll('[data-testid="autolyse-guidance-factor"]')].map((p) => p.textContent.trim());
  const r = d.getBoundingClientRect();
  return {
    // the stage keeps the timeline sheet mounted-but-closed, so counting
    // dialogs proves nothing. The constraint is: nothing nested inside the
    // guide, and no second sheet actually open on top of it.
    nestedDialogs: d.querySelectorAll('[role="dialog"]').length,
    otherOpenSheets: [...document.querySelectorAll('[role="dialog"]')]
      .filter((x) => x !== d)
      .filter((x) => x.getAttribute("aria-hidden") !== "true" && !(x.style.transform || "").includes("100%"))
      .length,
    hasGraph: !!d.querySelector('[data-testid="autolyse-guide-graph"]'),
    videoSrc: iframe.getAttribute("src"),
    landscape: box.width > box.height,
    ratio: +(box.width / box.height).toFixed(2),
    factors,
    heightPct: Math.round((r.height / window.innerHeight) * 100),
    overflowsX: d.scrollWidth > d.clientWidth + 1,
    direction: getComputedStyle(d).direction,
  };
});

check("no nested sheet inside the guide", guide.nestedDialogs === 0, `${guide.nestedDialogs} nested`);
check("no second sheet open on top of it", guide.otherOpenSheets === 0, `${guide.otherOpenSheets} open`);
check("no graph in the bulk guide", guide.hasGraph === false);
check("the folds demo plays inline, landscape", guide.videoSrc.includes("embed/jrDy90gD710") && guide.landscape, `ratio ${guide.ratio}`);
check("guidance follows the measured dough temp (27° in a 22° kitchen)",
  guide.factors.some((t) => t.includes("26°")), JSON.stringify(guide.factors.map((t) => t.slice(0, 24))));
check("spelt and high-hydration factors both fire", guide.factors.length === 3, `${guide.factors.length} factors`);
check("sheet takes the full-height shell", guide.heightPct >= 80, `${guide.heightPct}%`);
check("no horizontal overflow", guide.overflowsX === false);
check("guide renders RTL", guide.direction === "rtl");

await page.screenshot({ path: `${OUT}/t5-guide-top.png` });
await page.evaluate(() => {
  const d = [...document.querySelectorAll('[role="dialog"]')].find((x) => x.querySelector('[data-testid="guide-folds"]'));
  d.querySelector('[data-testid="guide-folds"]').scrollIntoView({ block: "center" });
});
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/t5-guide-folds.png` });
await page.evaluate(() => {
  const d = [...document.querySelectorAll('[role="dialog"]')].find((x) => x.querySelector('[data-testid="guide-folds"]'));
  d.querySelector('[data-testid="autolyse-guide-recipe"]').scrollIntoView({ block: "center" });
});
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/t5-guide-recipe-context.png` });

// narrow phone
await page.setViewportSize({ width: 340, height: 780 });
await page.waitForTimeout(400);
const narrow = await page.evaluate(() => {
  const d = [...document.querySelectorAll('[role="dialog"]')].find((x) => x.querySelector('[data-testid="guide-folds"]'));
  return { overflowsX: d.scrollWidth > d.clientWidth + 1, bodyOverflows: document.body.scrollWidth > window.innerWidth + 1 };
});
check("no horizontal overflow at 340px", !narrow.overflowsX && !narrow.bodyOverflows, JSON.stringify(narrow));
await page.screenshot({ path: `${OUT}/t5-guide-340px.png` });
await page.setViewportSize({ width: 375, height: 812 });

// close: bake untouched, focus back on the trigger
await page.getByRole("button", { name: "סגור" }).click();
await page.waitForTimeout(500);
const after = await page.evaluate(() => ({
  bake: localStorage.getItem("sourdough:v1:active-bake"),
  focused: document.activeElement?.textContent?.trim() ?? null,
  iframesLeft: document.querySelectorAll("iframe").length,
}));
check("activeBake untouched by the guide", after.bake === bakeBefore);
check("focus returns to the trigger", after.focused?.includes("הסבר על התסיסה הראשונית") === true, after.focused);
check("the demo is torn down on close", after.iframesLeft === 0, `${after.iframesLeft}`);

// regression: stage 2 keeps its own guide
await page.evaluate(() => {
  const b = JSON.parse(localStorage.getItem("sourdough:v1:active-bake"));
  b.currentStage = 2;
  localStorage.setItem("sourdough:v1:active-bake", JSON.stringify(b));
});
await page.goto(BASE + "/bake/stage/2", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "הסבר על אוטוליזה" }).click();
await page.waitForTimeout(500);
const stage2 = await page.evaluate(() => {
  const d = [...document.querySelectorAll('[role="dialog"]')].find((x) => x.textContent.includes("להבין את הבצק"));
  return { hasGraph: !!d.querySelector('[data-testid="autolyse-guide-graph"]'), hasFolds: !!d.querySelector('[data-testid="guide-folds"]') };
});
check("stage 2 still shows its graph and no folds section", stage2.hasGraph && !stage2.hasFolds, JSON.stringify(stage2));
await page.screenshot({ path: `${OUT}/t5-stage2-unchanged.png` });

check("no page errors", errors.length === 0, errors.join(" | "));
await browser.close();
console.log([...notes, ...fails].join("\n"));
if (fails.length) { console.log(`\n${fails.length} FAILURE(S)`); process.exit(1); }
console.log("\nall checks passed");
