import { chromium } from "playwright";

const BASE = process.env.PROBE_URL || "http://localhost:3040";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
const page = await ctx.newPage();

const errors = [];
page.on("pageerror", (err) => errors.push(err.message));

async function probe(label, url, fn) {
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  const result = await fn();
  console.log(`\n=== ${label} ${url} ===`);
  console.log(JSON.stringify(result, null, 2));
}

// 1. Home
await probe("Home", "/", async () => {
  return await page.evaluate(() => ({
    wordmark: document.querySelector("h1")?.textContent,
    startBakeFound: !!Array.from(document.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("התחל אפייה")
    ),
    myRecipesFound: !!Array.from(document.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("המתכונים שלי")
    ),
  }));
});

// 2. Bake stub back
await probe("Bake stub back link", "/bake/new", async () => {
  const a = await page.locator('a[href="/"]').first();
  return {
    text: await a.textContent(),
    hitTest: await page.evaluate(() => {
      const a = document.querySelector('a[href="/"]');
      if (!a) return null;
      const r = a.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { hitTag: hit?.tagName, isInsideLink: a.contains(hit) };
    }),
  };
});

// 3. Preset gallery → tap a preset → form
await probe("Preset gallery", "/recipes/new", async () => {
  const cards = await page.locator("[data-preset-id]").count();
  return { cardCount: cards };
});

// 4. Form with preset → inclusion row layout
await probe("Form + inclusion row", "/recipes/new/country", async () => {
  // Click "+ הוסף תוספת" to add a row
  await page.getByRole("button", { name: /הוסף תוספת/ }).click();
  await page.waitForTimeout(200);

  // Measure the inclusion row
  return await page.evaluate(() => {
    // Find the new inclusion row by its container styling
    const cards = document.querySelectorAll(".rounded-xl.border.border-line.bg-paper");
    const row = cards[cards.length - 1];
    if (!row) return { found: false };
    const nameInput = row.querySelector('input[type="text"]');
    const amountInput = row.querySelector('input[type="number"]');
    const trashBtn = row.querySelector('button[aria-label*="מחק"]');
    return {
      found: true,
      rowRect: row.getBoundingClientRect(),
      nameRect: nameInput?.getBoundingClientRect(),
      amountRect: amountInput?.getBoundingClientRect(),
      trashRect: trashBtn?.getBoundingClientRect(),
    };
  });
});

console.log("\n=== Errors ===");
if (errors.length) console.log(errors.join("\n"));
else console.log("(none)");

await browser.close();
