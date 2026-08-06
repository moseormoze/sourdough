import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

// T3 rendered QA at 375px: the readiness asset must reach the baker as a compact
// card in the decision zone — never as a portrait player eating the page flow —
// and the sheet must play it without disturbing the bake.
const BASE = process.env.PROBE_URL || "http://localhost:3013";
const OUT = process.env.QA_OUT || "specs/features/31-bulk-readiness/qa/t3";
mkdirSync(OUT, { recursive: true });

const fails = [], notes = [];
const check = (n, ok, d) => (ok ? notes : fails).push(`${ok ? "PASS" : "FAIL"} ${n}${d ? ` — ${d}` : ""}`);

const RECIPE = {
  id: "r1", name: "כפרי קלאסי",
  flour: { white: 80, wholeWheat: 20, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
  hydration: 72, salt: 2, levain: 20, flourWeightGrams: 500, kitchenTemp: 24,
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
    retardHours: 12, doughTempC: null,
  }));
}, RECIPE);
await page.goto(BASE + "/bake/stage/4", { waitUntil: "networkidle" });

const card = page.getByRole("button", { name: /ככה נראה בצק מוכן/ });
check("the readiness card is on the stage", (await card.count()) === 1);

const layout = await page.evaluate(() => {
  const btns = [...document.querySelectorAll("button")];
  const card = btns.find((b) => b.textContent.includes("ככה נראה בצק מוכן"));
  const checklist = document.querySelector('section[aria-label="מתי להמשיך לשלב הבא"]');
  const folds = [...document.querySelectorAll("section")].find((s) => s.textContent.startsWith("קיפולים"));
  const r = card.getBoundingClientRect();
  return {
    height: Math.round(r.height),
    width: Math.round(r.width),
    afterFolds: !!(folds.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING),
    beforeChecklist: !!(card.compareDocumentPosition(checklist) & Node.DOCUMENT_POSITION_FOLLOWING),
    inlineIframes: document.querySelectorAll("main iframe").length,
    textDirection: getComputedStyle(card).direction,
  };
});

// a 9:16 player at 375px would be ~590px tall — the problem the card removes
check("card stays compact, nowhere near a portrait player", layout.height < 120, `${layout.height}px tall (a 9:16 player would be ~590px)`);
check("card reaches the full column width", layout.width > 300, `${layout.width}px`);
check("card sits after the folds and before the checklist", layout.afterFolds && layout.beforeChecklist, JSON.stringify(layout));
check("no iframe in the page flow before tapping", layout.inlineIframes === 0, `${layout.inlineIframes} iframe(s)`);
check("card renders RTL", layout.textDirection === "rtl", layout.textDirection);
check("card clears the 44px touch target", layout.height >= 44, `${layout.height}px`);

await card.scrollIntoViewIfNeeded();
await page.screenshot({ path: `${OUT}/t3-card-in-decision-zone.png` });

// tap → sheet plays the readiness short
const bakeBefore = await page.evaluate(() => localStorage.getItem("sourdough:v1:active-bake"));
const foldProgress = () => page.evaluate(() => {
  const folds = [...document.querySelectorAll("section")].find((s) => s.textContent.startsWith("קיפולים"));
  return [...folds.querySelectorAll("p")].find((p) => p.textContent.includes("/"))?.textContent.trim() ?? null;
});
const foldsBefore = await foldProgress();

await card.click();
await page.waitForSelector('[role="dialog"] iframe');
await page.waitForTimeout(500);

const sheet = await page.evaluate(() => {
  const dialog = [...document.querySelectorAll('[role="dialog"]')].find((d) => d.querySelector("iframe"));
  const iframe = dialog.querySelector("iframe");
  const link = dialog.querySelector('a[href*="youtube.com"]');
  const frame = iframe.parentElement.getBoundingClientRect();
  return {
    src: iframe.getAttribute("src"),
    portrait: frame.height > frame.width,
    ratio: +(frame.height / frame.width).toFixed(2),
    overlayIsBodyChild: dialog.parentElement.parentElement === document.body,
    watchHref: link?.getAttribute("href") ?? null,
    caption: dialog.textContent.includes("Milk and Pop"),
  };
});
check("sheet plays the readiness short", sheet.src.includes("youtube.com/embed/vkJqIwbapf0"), sheet.src);
check("player is portrait (9:16)", sheet.portrait && sheet.ratio > 1.6, `ratio ${sheet.ratio}`);
check("the YouTube escape route is present", !!sheet.watchHref, sheet.watchHref ?? "missing");
check("source attribution is shown", sheet.caption);
check("sheet is portalled to <body>", sheet.overlayIsBodyChild);
await page.screenshot({ path: `${OUT}/t3-sheet-portrait.png` });

// closing leaves the bake untouched
await page.getByRole("button", { name: "סגור" }).click();
await page.waitForTimeout(450);
const bakeAfter = await page.evaluate(() => localStorage.getItem("sourdough:v1:active-bake"));
const foldsAfter = await foldProgress();
check("activeBake is untouched by opening the sheet", bakeBefore === bakeAfter);
check("fold counter is untouched", foldsBefore !== null && foldsBefore === foldsAfter, `${foldsBefore} → ${foldsAfter}`);
check("no iframe left in the page flow after closing",
  (await page.evaluate(() => document.querySelectorAll("main iframe").length)) === 0);

// regression: a landscape stage still embeds inline. The bake has to BE there —
// navigating past the current stage redirects home to it.
await page.evaluate(() => {
  const bake = JSON.parse(localStorage.getItem("sourdough:v1:active-bake"));
  bake.currentStage = 5;
  localStorage.setItem("sourdough:v1:active-bake", JSON.stringify(bake));
});
await page.goto(BASE + "/bake/stage/5", { waitUntil: "networkidle" });
const stage5 = await page.evaluate(() => {
  const iframe = document.querySelector("main iframe");
  const box = iframe?.parentElement.getBoundingClientRect();
  return {
    heading: document.querySelector("h1")?.textContent ?? null,
    inline: !!iframe,
    src: iframe?.getAttribute("src") ?? null,
    landscape: box ? box.width > box.height : null,
    card: [...document.querySelectorAll("button")].some((b) => b.textContent.includes("ככה נראה בצק מוכן")),
  };
});
check("stage 5 still embeds its landscape asset inline", stage5.inline && stage5.landscape, JSON.stringify(stage5));
check("stage 5 shows no readiness card", stage5.card === false);
await page.screenshot({ path: `${OUT}/t3-stage5-unchanged.png` });

check("no page errors", errors.length === 0, errors.join(" | "));
await browser.close();
console.log([...notes, ...fails].join("\n"));
if (fails.length) { console.log(`\n${fails.length} FAILURE(S)`); process.exit(1); }
console.log("\nall checks passed");
