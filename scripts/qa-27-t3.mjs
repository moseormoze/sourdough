import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

// T3 rendered QA: the wheel offers only the stage's curated stops, and a tap
// beats a scroll still settling. Fails on a bad state.
const BASE = process.env.PROBE_URL || "http://localhost:3009";
const OUT = "specs/features/27-configurable-stage-timers/qa";
mkdirSync(OUT, { recursive: true });
const fails = [], notes = [];
const check = (n, ok, d) => (ok ? notes : fails).push(`${ok ? "PASS" : "FAIL"} ${n}${d ? ` — ${d}` : ""}`);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

const RECIPE = {
  id: "r1", name: "כפרי קלאסי",
  flour: { white: 80, wholeWheat: 20, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
  hydration: 72, salt: 2, levain: 20, flourWeightGrams: 500, kitchenTemp: 24,
  inclusions: [], createdAt: 1, updatedAt: 1,
};

await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.evaluate((recipe) => {
  const now = Date.now();
  localStorage.setItem("sourdough:v1:identity", JSON.stringify({ name: "אילון", email: "e@x.ai", identifiedAt: "2026-08-06T00:00:00.000Z" }));
  localStorage.setItem("sourdough:v1:install-banner-dismissed", "1");
  localStorage.setItem("sourdough:v1:recipes", JSON.stringify([recipe]));
  localStorage.setItem("sourdough:v1:active-bake", JSON.stringify({
    id: "b1", recipe, startedAt: now - 3600000, currentStage: 2,
    stageStartedAt: now - 60000, observationChecks: {}, subStep: 0,
    timerStartedAt: null, timerElapsedSeconds: 0, timerDurationSeconds: null,
    bakingMethod: "dutch-oven", feedAt: null, peakAt: null, feedRatio: 3,
    retardHours: 12, doughTempC: null,
  }));
}, RECIPE);

await page.goto(BASE + "/bake/stage/2", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "הפעל טיימר" }).first().click();
await page.waitForTimeout(400);

const labels = await page.evaluate(() =>
  [...document.querySelectorAll('[role="option"]')].map((o) => o.textContent.trim()));
check("autolyse wheel offers exactly the curated stops", JSON.stringify(labels) === JSON.stringify(["30 דקות", "45 דקות", "60 דקות"]), JSON.stringify(labels));

const geom = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('[role="option"]')];
  const list = document.querySelector('[role="listbox"]');
  return {
    minRowHeight: Math.min(...rows.map((r) => Math.round(r.getBoundingClientRect().height))),
    selected: rows.filter((r) => r.getAttribute("aria-selected") === "true").map((r) => r.textContent.trim()),
    scrollable: list.scrollHeight > list.clientHeight,
  };
});
check("rows meet the 44px floor", geom.minRowHeight >= 44, `${geom.minRowHeight}px`);
check("exactly one stop is selected", geom.selected.length === 1, JSON.stringify(geom.selected));
check("the column scrolls", geom.scrollable === true);
await page.screenshot({ path: `${OUT}/t3-curated-wheel.png` });

// tap must beat a scroll that is still settling
const raced = await page.evaluate(async () => {
  const list = document.querySelector('[role="listbox"]');
  const rows = [...document.querySelectorAll('[role="option"]')];
  const last = rows[rows.length - 1];
  list.scrollTop = 0;
  list.dispatchEvent(new Event("scroll", { bubbles: true }));
  last.click();
  await new Promise((r) => setTimeout(r, 400));
  return [...document.querySelectorAll('[role="option"]')]
    .filter((r) => r.getAttribute("aria-selected") === "true")
    .map((r) => r.textContent.trim());
});
check("a tap wins over a settling scroll", JSON.stringify(raced) === JSON.stringify(["60 דקות"]), JSON.stringify(raced));

// start the timer with the tapped stop
await page.getByRole("dialog").getByRole("button", { name: "הפעל טיימר" }).click();
await page.waitForTimeout(400);
const bake = await page.evaluate(() => JSON.parse(localStorage.getItem("sourdough:v1:active-bake")));
check("the tapped stop is what starts", bake.timerDurationSeconds === 3600, `${bake.timerDurationSeconds}s`);
await page.screenshot({ path: `${OUT}/t3-timer-started.png` });

const overflow = await page.evaluate(() => {
  const d = document.documentElement;
  return { horizontal: d.scrollWidth > d.clientWidth };
});
check("no horizontal overflow", !overflow.horizontal);
check("no uncaught page errors", errors.length === 0, errors.join(" | "));

await browser.close();
console.log("\n=== T3 rendered QA ===");
[...notes, ...fails].forEach((l) => console.log(l));
if (fails.length) { console.error(`\n${fails.length} FAILED`); process.exit(1); }
console.log("\nall checks passed");
