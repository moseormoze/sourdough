import { chromium } from "playwright";

const URL = process.env.PROBE_URL || "http://localhost:3040/bake/new";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
const page = await ctx.newPage();

const errors = [];
const consoleMsgs = [];
page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
page.on("console", (msg) => {
  if (msg.type() === "error") consoleMsgs.push(`console.error: ${msg.text()}`);
});
page.on("requestfailed", (req) =>
  consoleMsgs.push(`request failed: ${req.url()} ${req.failure()?.errorText}`)
);

await page.goto(URL, { waitUntil: "networkidle" });

const probe = await page.evaluate(() => {
  const a = document.querySelector('a[href="/"]');
  if (!a) return { found: false };
  const cs = getComputedStyle(a);
  const rect = a.getBoundingClientRect();
  // What's actually being hit at the link's center?
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const hit = document.elementFromPoint(cx, cy);
  return {
    found: true,
    tag: a.tagName,
    href: a.getAttribute("href"),
    text: a.textContent,
    cursor: cs.cursor,
    pointerEvents: cs.pointerEvents,
    display: cs.display,
    visibility: cs.visibility,
    opacity: cs.opacity,
    rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
    elementAtCenter: hit ? `${hit.tagName}${hit.id ? "#" + hit.id : ""}.${hit.className?.toString().slice(0, 80)}` : null,
    hitIsLinkOrChild: hit ? a.contains(hit) || hit === a : null,
  };
});

console.log("PROBE:");
console.log(JSON.stringify(probe, null, 2));

if (probe.found) {
  console.log("\nClicking the link...");
  const before = page.url();
  await page.click('a[href="/"]');
  // Wait briefly for client-side navigation
  await page.waitForTimeout(1000);
  console.log(`Before: ${before}\nAfter:  ${page.url()}`);
}

if (errors.length) console.log("\nPAGE ERRORS:\n" + errors.join("\n"));
if (consoleMsgs.length) console.log("\nCONSOLE/REQ:\n" + consoleMsgs.join("\n"));

await browser.close();
