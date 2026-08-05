import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

// Rendered QA for the redesign-rollout polish pass (items 1+2 of issue #93):
// RTL hint alignment and stepper overflow. Asserts, then screenshots — a bad
// state fails the run instead of printing numbers nobody reads.
const BASE = process.env.PROBE_URL || "http://localhost:3007";
const LABEL = process.env.QA_LABEL || "after";
const OUT = `specs/features/30-redesign-rollout/qa/polish`;
mkdirSync(OUT, { recursive: true });

const failures = [];
const notes = [];
function check(name, ok, detail) {
  (ok ? notes : failures).push(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));

await page.goto(BASE + "/", { waitUntil: "networkidle" });

// ---------- item 1: welcome gate, empty fields must keep hints on the right ----------
await page.evaluate(() => localStorage.clear());
await page.goto(BASE + "/", { waitUntil: "networkidle" });
const gate = await page.evaluate(() =>
  [...document.querySelectorAll("input")].map((i) => ({
    type: i.type,
    dir: i.getAttribute("dir"),
    computedDir: getComputedStyle(i).direction,
    textAlign: getComputedStyle(i).textAlign,
  }))
);
check(
  "welcome gate: empty fields resolve RTL (hint on the start edge)",
  gate.length === 2 && gate.every((f) => f.computedDir === "rtl"),
  JSON.stringify(gate)
);
await page.screenshot({ path: `${OUT}/${LABEL}-welcome-gate.png` });

// ---------- item 2: recipe form, steppers must stay inside the pill ----------
await page.evaluate(() =>
  localStorage.setItem(
    "sourdough:v1:identity",
    JSON.stringify({ name: "אילון", email: "eilon@mycache.ai", identifiedAt: "2026-08-05T00:00:00.000Z" })
  )
);
for (const width of [375, 320]) {
  await page.setViewportSize({ width, height: 812 });
  await page.goto(BASE + "/recipes/new/country", { waitUntil: "networkidle" });
  const geom = await page.evaluate(async () => {
    const escapes = [];
    const hitWidths = [];
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (const inp of document.querySelectorAll('input[type="number"]')) {
      const pill = inp.parentElement;
      const pr = pill.getBoundingClientRect();
      for (const b of pill.querySelectorAll("button")) {
        const r0 = b.getBoundingClientRect();
        if (r0.left < pr.left - 0.5 || r0.right > pr.right + 0.5) {
          escapes.push({ label: b.getAttribute("aria-label"), btn: Math.round(r0.left), pill: Math.round(pr.left) });
        }
        // elementFromPoint only resolves inside the viewport, and the sticky
        // footer occludes the bottom — centre the field first, then probe.
        pill.scrollIntoView({ block: "center" });
        await sleep(30);
        const r = b.getBoundingClientRect();
        const cy = r.top + r.height / 2;
        const owns = (x) => document.elementFromPoint(x, cy)?.closest("button") === b;
        if (!owns(r.left + r.width / 2)) continue; // occluded — not measurable here
        // Exact geometry from the ::before overlay's insets (probing integer pixel
        // centres under-reports a 44px span by 1px), plus a real hit-test proving
        // the overlay is actually reachable outside the visual box.
        const before = getComputedStyle(b, "::before");
        // No overlay at all → NaN, which must read as a failure, not a pass.
        const grow = (v) => (Number.isFinite(parseFloat(v)) ? -parseFloat(v) : NaN);
        const hit = r.width + grow(before.left) + grow(before.right);
        hitWidths.push({
          label: b.getAttribute("aria-label"),
          hit: Number.isFinite(hit) ? Math.round(hit) : null,
          visual: Math.round(r.width),
          reachableOutsideVisual: owns(r.left - 2) && owns(r.right + 2),
        });
      }
    }
    const d = document.documentElement;
    return {
      escapes,
      measured: hitWidths.length,
      minHit: hitWidths.length ? Math.min(...hitWidths.map((h) => h.hit)) : 0,
      tooSmall: hitWidths.filter((h) => !(h.hit >= 44)),
      unreachable: hitWidths.filter((h) => !h.reachableOutsideVisual).map((h) => h.label),
      horizontalScroll: d.scrollWidth > d.clientWidth,
      pastEdge: [...document.querySelectorAll("*")].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right > d.clientWidth + 0.5 || r.left < -0.5;
      }).length,
    };
  });
  check(`@${width}: every stepper was measurable`, geom.measured >= 16, `measured ${geom.measured}`);
  check(`@${width}: no stepper escapes its pill`, geom.escapes.length === 0, JSON.stringify(geom.escapes));
  check(
    `@${width}: stepper hit area >= 44px (ui-playbook §10)`,
    geom.tooSmall.length === 0,
    `min ${geom.minHit}px; under-sized: ${JSON.stringify(geom.tooSmall)}`
  );
  check(
    `@${width}: overlay reachable outside the 32px visual box`,
    geom.unreachable.length === 0,
    geom.unreachable.join(", ")
  );
  check(`@${width}: no horizontal overflow`, !geom.horizontalScroll && geom.pastEdge === 0, JSON.stringify(geom));
  await page.screenshot({ path: `${OUT}/${LABEL}-recipe-form-${width}.png` });
}

// ---------- item 1: feedback sheet placeholders ----------
await page.setViewportSize({ width: 375, height: 812 });
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.locator('button[aria-label="שליחת פידבק"]').click();
await page.waitForTimeout(400);
const fb = await page.evaluate(() =>
  [...document.querySelectorAll("input[type=text], textarea")]
    .filter((el) => el.placeholder)
    .map((el) => ({ tag: el.tagName, dir: el.getAttribute("dir"), computedDir: getComputedStyle(el).direction }))
);
check(
  "feedback sheet: placeholders resolve RTL",
  fb.length >= 2 && fb.every((f) => f.computedDir === "rtl"),
  JSON.stringify(fb)
);
await page.screenshot({ path: `${OUT}/${LABEL}-feedback-sheet.png` });

check("no uncaught page errors", pageErrors.length === 0, pageErrors.join(" | "));

await browser.close();
console.log(`\n=== rendered QA (${LABEL}) ===`);
[...notes, ...failures].forEach((l) => console.log(l));
console.log(`screenshots → ${OUT}/${LABEL}-*.png`);
if (failures.length) {
  console.error(`\n${failures.length} check(s) FAILED`);
  process.exit(1);
}
console.log("\nall checks passed");
