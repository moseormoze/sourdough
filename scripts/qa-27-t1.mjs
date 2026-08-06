import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

// T1 rendered QA: navigating away from a stage must not destroy a running timer.
// Asserts and fails on a bad state; screenshots are evidence, not the check.
const BASE = process.env.PROBE_URL || "http://localhost:3008";
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
async function seed(stage, timerAgeMs) {
  await page.evaluate(([recipe, stage, age]) => {
    const now = Date.now();
    localStorage.setItem("sourdough:v1:identity", JSON.stringify({ name: "אילון", email: "e@x.ai", identifiedAt: "2026-08-06T00:00:00.000Z" }));
    localStorage.setItem("sourdough:v1:install-banner-dismissed", "1");
    localStorage.setItem("sourdough:v1:recipes", JSON.stringify([recipe]));
    localStorage.setItem("sourdough:v1:active-bake", JSON.stringify({
      id: "b1", recipe, startedAt: now - 7200000, currentStage: stage,
      stageStartedAt: now - 600000, observationChecks: {}, subStep: 0,
      timerStartedAt: age === null ? null : now - age, timerElapsedSeconds: 0,
      timerDurationSeconds: age === null ? null : 1800,
      bakingMethod: "dutch-oven", feedAt: null, peakAt: null, feedRatio: 3,
      retardHours: 12, doughTempC: null,
    }));
  }, [RECIPE, stage, timerAgeMs]);
}
const bake = () => page.evaluate(() => JSON.parse(localStorage.getItem("sourdough:v1:active-bake")));
const remaining = () => page.evaluate(() =>
  [...document.querySelectorAll("*")].filter((e) => e.children.length === 0 && /^\d{1,2}:\d{2}$/.test((e.textContent || "").trim()))
    .map((e) => e.textContent.trim())[0] ?? null);
const secs = (t) => (t ? t.split(":").reduce((a, b) => a * 60 + +b, 0) : null);

// bulk stage with a timer 5 minutes into 30
await seed(4, 300000);
await page.goto(BASE + "/bake/stage/4", { waitUntil: "networkidle" });
const t0 = await remaining();
const b0 = await bake();
check("stage 4 shows the running timer", secs(t0) > 0 && secs(t0) < 1800, `${t0} left`);
await page.screenshot({ path: `${OUT}/t1-stage4-running.png` });

// peek back
await page.getByRole("button", { name: /^חזרה$/ }).click();
await page.waitForURL("**/bake/stage/3");
const b1 = await bake();
check("back reaches the earlier stage instead of redirecting", page.url().endsWith("/bake/stage/3"), page.url());
check("back leaves currentStage alone", b1.currentStage === 4, `currentStage=${b1.currentStage}`);
check("back leaves the timer running", b1.timerStartedAt === b0.timerStartedAt && b1.timerDurationSeconds === 1800);
await page.screenshot({ path: `${OUT}/t1-peeked-stage3.png` });

// a re-read stage must not paint the current stage's countdown as its own
await page.goto(BASE + "/bake/stage/2", { waitUntil: "networkidle" });
const leak = await page.evaluate(() => ({
  card: !!document.querySelector('[data-testid="autolyse-timer-card"]'),
  times: [...document.querySelectorAll("*")]
    .filter((e) => e.children.length === 0 && /^\d{1,2}:\d{2}$/.test((e.textContent || "").trim())).length,
}));
check("a re-read stage shows no timer of its own", !leak.card && leak.times === 0, JSON.stringify(leak));
await page.screenshot({ path: `${OUT}/t1-peeked-stage2-no-timer.png` });
await page.goto(BASE + "/bake/stage/3", { waitUntil: "networkidle" });

// forward again — navigation, not a re-commit
await page.getByRole("button", { name: /^הבא/ }).click();
await page.waitForURL("**/bake/stage/4");
const b2 = await bake();
const t1 = await remaining();
check("returning to stage 4 keeps the same timer", b2.timerStartedAt === b0.timerStartedAt);
check("remaining time is continuous, not reset", secs(t1) !== null && secs(t1) < secs(t0), `${t0} → ${t1}`);
await page.screenshot({ path: `${OUT}/t1-returned-stage4.png` });

// a real advance still ends the wait
await page.getByRole("button", { name: /^הבא/ }).click();
await page.waitForURL("**/bake/stage/5");
const b3 = await bake();
check("a real advance still ends the wait", b3.currentStage === 5 && b3.timerStartedAt === null && b3.timerDurationSeconds === null);

// skipping ahead is still refused
await page.goto(BASE + "/bake/stage/9", { waitUntil: "networkidle" });
check("skipping ahead is still redirected", page.url().endsWith("/bake/stage/5"), page.url());

check("no uncaught page errors", errors.length === 0, errors.join(" | "));
await browser.close();
console.log("\n=== T1 rendered QA ===");
[...notes, ...fails].forEach((l) => console.log(l));
if (fails.length) { console.error(`\n${fails.length} FAILED`); process.exit(1); }
console.log("\nall checks passed");
