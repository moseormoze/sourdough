import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

// T3 rendered QA: two free scrollable columns, exact minutes, and a tap that
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

const shape = await page.evaluate(() => {
  const lists = [...document.querySelectorAll('[role="listbox"]')];
  return lists.map((l) => ({
    label: l.getAttribute("aria-label"),
    count: l.querySelectorAll('[role="option"]').length,
    scrollable: l.scrollHeight > l.clientHeight,
    minRow: Math.min(...[...l.querySelectorAll('[role="option"]')].map((o) => Math.round(o.getBoundingClientRect().height))),
  }));
});
check("two columns are present", shape.length === 2, JSON.stringify(shape.map((s) => s.label)));
const hours = shape.find((s) => s.label === "שעות");
const minutes = shape.find((s) => s.label === "דקות");
check("hours column offers 24 values", hours?.count === 24, `${hours?.count}`);
check("minutes column offers every minute (60)", minutes?.count === 60, `${minutes?.count}`);
check("both columns scroll", hours?.scrollable && minutes?.scrollable, JSON.stringify([hours?.scrollable, minutes?.scrollable]));
check("rows meet the 44px floor", Math.min(hours?.minRow ?? 0, minutes?.minRow ?? 0) >= 44, `${Math.min(hours?.minRow ?? 0, minutes?.minRow ?? 0)}px`);
await page.screenshot({ path: `${OUT}/t3-two-column-wheel.png` });

// pick an exact odd minute, and prove a tap beats a settling scroll
const picked = await page.evaluate(async () => {
  const minutesList = [...document.querySelectorAll('[role="listbox"]')].find((l) => l.getAttribute("aria-label") === "דקות");
  const target = [...minutesList.querySelectorAll('[role="option"]')].find((o) => o.textContent.trim() === "37");
  minutesList.scrollTop = 0;
  minutesList.dispatchEvent(new Event("scroll", { bubbles: true }));
  target.click();
  await new Promise((r) => setTimeout(r, 400));
  return [...minutesList.querySelectorAll('[role="option"]')]
    .filter((o) => o.getAttribute("aria-selected") === "true")
    .map((o) => o.textContent.trim());
});
check("an exact odd minute is selectable and a tap beats a settling scroll", JSON.stringify(picked) === JSON.stringify(["37"]), JSON.stringify(picked));
await page.screenshot({ path: `${OUT}/t3-exact-minute.png` });

await page.getByRole("dialog").getByRole("button", { name: "הפעל טיימר" }).click();
await page.waitForTimeout(500);
const bake = await page.evaluate(() => JSON.parse(localStorage.getItem("sourdough:v1:active-bake")));
check("the exact chosen duration starts", bake.timerDurationSeconds === 37 * 60, `${bake.timerDurationSeconds}s`);
await page.screenshot({ path: `${OUT}/t3-timer-started.png` });

const overflow = await page.evaluate(() => {
  const d = document.documentElement;
  return d.scrollWidth > d.clientWidth;
});
check("no horizontal overflow", !overflow);
check("no uncaught page errors", errors.length === 0, errors.join(" | "));

await browser.close();
console.log("\n=== T3 rendered QA ===");
[...notes, ...fails].forEach((l) => console.log(l));
if (fails.length) { console.error(`\n${fails.length} FAILED`); process.exit(1); }
console.log("\nall checks passed");
