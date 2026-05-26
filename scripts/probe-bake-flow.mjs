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
await page.waitForSelector("text=בניית שאור", { timeout: 4000 });
const stage1 = await page.evaluate(() => ({
  hasStageName: !!document.body.textContent?.includes("בניית שאור"),
  hasBriefing: !!document.body.textContent?.includes("השאור"),
  hasNextButton: !!Array.from(document.querySelectorAll("button")).find((b) =>
    b.textContent?.includes("הבא — אוטוליזה")
  ),
  hasBackLink: !!document.querySelector('a[href="/"]'),
  // 04-bake-quantities: stage 1 should now show bolded gram numbers + disclosures
  boldedGrams: Array.from(document.querySelectorAll("strong"))
    .map((s) => s.textContent?.trim())
    .filter((t) => t && /^\d+g$/.test(t)),
  hasStarterDisclosure: !!document.body.textContent?.includes("הנחה: סטארטר ב-100% הידרציה"),
  hasFlourNote: !!document.body.textContent?.includes("הקמח של השאור כלול"),
}));
console.log(" ", JSON.stringify(stage1));
if (!stage1.hasStageName) fail("stage 1: stage name missing");
if (!stage1.hasBriefing) fail("stage 1: briefing missing");
if (!stage1.hasNextButton) fail("stage 1: 'הבא — אוטוליזה' button missing");
if (!stage1.hasBackLink) fail("stage 1: back link missing");
if (stage1.boldedGrams.length < 2)
  fail(`stage 1: expected ≥2 bolded gram values from quantities, got ${stage1.boldedGrams.length}`);
if (!stage1.hasStarterDisclosure) fail("stage 1: 'הנחה: סטארטר ב-100% הידרציה' missing");
if (!stage1.hasFlourNote) fail("stage 1: 'הקמח של השאור כלול' note missing");

console.log("→ Step 3a: tap 'הבא — אוטוליזה' → /bake/stage/2");
await page.getByRole("button", { name: /הבא — אוטוליזה/ }).click();
await page.waitForURL(/\/bake\/stage\/2/, { timeout: 4000 });
await page.waitForSelector("text=אוטוליזה", { timeout: 4000 });

const stage2 = await page.evaluate(() => ({
  boldedGrams: Array.from(document.querySelectorAll("strong"))
    .map((s) => s.textContent?.trim())
    .filter((t) => t && /^\d+g$/.test(t)),
}));
console.log(" stage 2 grams:", stage2.boldedGrams);
// Country preset (500g flour default) → expect 500g totalFlour to appear bolded
if (!stage2.boldedGrams.includes("500g"))
  fail(`stage 2: expected '500g' total flour bolded, got ${stage2.boldedGrams.join(",")}`);

console.log("→ Step 3b: advance to bulk stage (stage 4)");
await page.getByRole("button", { name: /הבא — לישה והוספת שאור/ }).click();
await page.waitForURL(/\/bake\/stage\/3/, { timeout: 4000 });
await page.getByRole("button", { name: /הבא — תסיסה ראשונית/ }).click();
await page.waitForURL(/\/bake\/stage\/4/, { timeout: 4000 });
await page.waitForSelector("text=תסיסה ראשונית", { timeout: 4000 });

const stage4Initial = await page.evaluate(() => ({
  primaryText: Array.from(document.querySelectorAll("button"))
    .map((b) => b.textContent?.trim())
    .find((t) => t === "סיימתי קיפול" || (t && t.startsWith("הבא"))),
  hasFoldsSection: !!document.body.textContent?.includes("קיפולים בוצעו"),
}));
console.log(" ", JSON.stringify(stage4Initial));
if (stage4Initial.primaryText !== "סיימתי קיפול")
  fail(`stage 4 initial: primary should be 'סיימתי קיפול', got '${stage4Initial.primaryText}'`);
if (!stage4Initial.hasFoldsSection) fail("stage 4: folds section missing");

console.log("→ Step 3c: complete 4 folds in stage 4");
for (let i = 0; i < 4; i++) {
  await page.getByRole("button", { name: "סיימתי קיפול" }).click();
  await page.waitForTimeout(150);
}
const stage4Done = await page.evaluate(() => ({
  primaryText: Array.from(document.querySelectorAll("button"))
    .map((b) => b.textContent?.trim())
    .find((t) => t && t.startsWith("הבא")),
}));
if (!stage4Done.primaryText?.startsWith("הבא — עיצוב ראשוני"))
  fail(`stage 4 after folds: primary should be 'הבא — עיצוב ראשוני', got '${stage4Done.primaryText}'`);

console.log("→ Step 3d: skip ahead — directly advance stages 5..11");
for (const next of [
  /הבא — עיצוב ראשוני/,
  /הבא — עיצוב סופי/,
  /הבא — התפחה במקרר/,
  /הבא — חימום תנור/,
  /הבא — אפייה — מכוסה/,
  /הבא — אפייה — לא מכוסה/,
  /הבא — קירור/,
  /הבא — הלחם מוכן/,
]) {
  await page.getByRole("button", { name: next }).click();
  await page.waitForTimeout(150);
}

await page.waitForURL(/\/bake\/stage\/12/, { timeout: 4000 });
console.log("   landed at stage 12: " + page.url());

console.log("→ Step 3e: stage 12 → tap 'סיימתי' → /bake/done");
await page.getByRole("button", { name: "סיימתי" }).click();
await page.waitForURL(/\/bake\/done/, { timeout: 4000 });
console.log("   landed at " + page.url());

console.log("→ Step 3f: navigate back to home for the next steps");
await page.click('a[href="/"]');
await page.waitForURL(BASE + "/", { timeout: 4000 });
await page.waitForSelector("aside[aria-label='ממשיכים']", { timeout: 4000 });
// Stop the bake to clean state before step 4
await page.getByRole("button", { name: "סיים בייק" }).click();
await page.getByRole("button", { name: "כן, להפסיק" }).click();
await page.waitForTimeout(300);

// re-create a fresh bake so the rest of the original probe (steps 4-6) works
await page.getByRole("button", { name: /התחל אפייה/ }).first().click();
await page.waitForURL(/\/bake\/new/, { timeout: 4000 });
await page.getByRole("button", { name: /כפרי קלאסי/ }).click();
await page.waitForURL(/\/bake\/stage\/1/, { timeout: 4000 });

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
