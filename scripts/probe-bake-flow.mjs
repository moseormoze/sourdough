import { chromium } from "playwright";

const BASE = process.env.PROBE_URL || "http://localhost:3000";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
const page = await ctx.newPage();

const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console.error: ${m.text()}`);
});

function fail(msg) {
  console.error("\n✗ " + msg);
  errors.push(msg);
}

console.log("→ Step 1: open home (fresh state, no active bake)");
await page.goto(BASE + "/", { waitUntil: "networkidle" });
const freshHome = await page.evaluate(() => ({
  wordmark: document.querySelector("h1")?.textContent,
  hasStartBakeCta: !!Array.from(document.querySelectorAll("button")).find((b) =>
    b.textContent?.includes("התחל אפייה")
  ),
  hasResumeBanner: !!document.querySelector("aside[aria-label='ממשיכים']"),
}));
console.log(" ", JSON.stringify(freshHome));
if (!freshHome.hasStartBakeCta) fail("fresh home: missing 'התחל אפייה' CTA");
if (freshHome.hasResumeBanner) fail("fresh home: unexpected ResumeBanner");

console.log("→ Step 2: tap 'התחל אפייה' → chooser");
await page
  .getByRole("button", { name: /התחל אפייה/ })
  .first()
  .click();
await page.waitForURL(/\/bake\/new/, { timeout: 4000 });
console.log("   landed at " + page.url());

const chooserCount = await page.locator("button").filter({ hasText: /קלאסי|מלא|שיפון|לבן|כפרי/ }).count();
console.log("  chooser cards (presets matched):", chooserCount);
if (chooserCount < 6) fail(`chooser: expected ≥6 preset cards, got ${chooserCount}`);

console.log("→ Step 3: tap first preset → starts bake → /bake/stage/1");
await page.getByRole("button", { name: /כפרי קלאסי/ }).click();
await page.waitForURL(/\/bake\/stage\/1/, { timeout: 4000 });
await page.waitForSelector("text=שלב 1 — בקרוב", { timeout: 4000 });
const stage1 = await page.evaluate(() => ({
  hasTitle: !!document.body.textContent?.includes("שלב 1 — בקרוב"),
  hasBackLink: !!document.querySelector('a[href="/"]'),
}));
console.log(" ", JSON.stringify(stage1));
if (!stage1.hasTitle) fail("stage 1: placeholder title missing");
if (!stage1.hasBackLink) fail("stage 1: back link missing");

console.log("→ Step 4: back to home → ResumeBanner appears, CTAs still visible");
await page.click('a[href="/"]');
await page.waitForURL(BASE + "/", { timeout: 4000 });
await page.waitForSelector("aside[aria-label='ממשיכים']", { timeout: 4000 });
const resumeHome = await page.evaluate(() => ({
  hasResumeBanner: !!document.querySelector("aside[aria-label='ממשיכים']"),
  hasStartBakeCta: !!Array.from(document.querySelectorAll("button")).find((b) =>
    b.textContent?.includes("התחל אפייה")
  ),
}));
console.log(" ", JSON.stringify(resumeHome));
if (!resumeHome.hasResumeBanner) fail("after navigating back: ResumeBanner missing");
if (!resumeHome.hasStartBakeCta) fail("after navigating back: 'התחל אפייה' CTA should still be visible (banner sits on top)");

console.log("→ Step 5: tap 'המשך' → stage 1 again");
await page.getByRole("button", { name: "המשך" }).click();
await page.waitForURL(/\/bake\/stage\/1/, { timeout: 4000 });
console.log("   landed at " + page.url());

console.log("→ Step 6: back to home, then stop the bake");
await page.click('a[href="/"]');
await page.waitForURL(BASE + "/", { timeout: 4000 });
await page.waitForSelector("aside[aria-label='ממשיכים']", { timeout: 4000 });
await page.getByRole("button", { name: "סיים בייק" }).click();
await page.getByRole("button", { name: "כן, להפסיק" }).click();
await page.waitForTimeout(400);
const cleared = await page.evaluate(() => ({
  hasResumeBanner: !!document.querySelector("aside[aria-label='ממשיכים']"),
  hasStartBakeCta: !!Array.from(document.querySelectorAll("button")).find((b) =>
    b.textContent?.includes("התחל אפייה")
  ),
  storageActive: localStorage.getItem("sourdough:v1:active-bake"),
}));
console.log(" ", JSON.stringify(cleared));
if (cleared.hasResumeBanner) fail("after stop: ResumeBanner should be gone");
if (!cleared.hasStartBakeCta) fail("after stop: should be back to fresh home with CTA");
if (cleared.storageActive !== null) fail("after stop: localStorage should be cleared");

console.log("\n=== Errors ===");
if (errors.length) {
  console.log(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("(none)");
  console.log("\n✓ Full bake-session-shell flow probe passed.");
}

await browser.close();
