// One-off exporter: public/icon.svg → the four PWA install PNGs.
// Run manually when the logo changes: `node scripts/export-icons.mjs`
// Uses sharp (available in node_modules); not a runtime dependency.
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BG = "#F8F5EE";
const svg = readFileSync(fileURLToPath(new URL("../public/icon.svg", import.meta.url)));

// icon.svg has a landscape viewBox (290×200), so every square target gets the
// logo `contain`-fitted on an opaque cream canvas: iOS renders transparency as
// black, and Android launchers letterbox transparent `any` icons badly.
async function exportIcon(file, size, logoScale = 1) {
  const logoSize = Math.round(size * logoScale);
  const logo = await sharp(svg, { density: 300 })
    .resize(logoSize, logoSize, { fit: "contain", background: BG })
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 3, background: BG },
  })
    .composite([{ input: logo, gravity: "center" }])
    .removeAlpha() // iOS renders any transparency as black
    .png()
    .toFile(fileURLToPath(new URL(`../public/${file}`, import.meta.url)));
  console.log(`✓ ${file} — ${size}×${size}${logoScale < 1 ? ` (logo in ${logoScale * 100}% safe zone)` : ""}`);
}

await exportIcon("icon-192.png", 192);
await exportIcon("icon-512.png", 512);
await exportIcon("icon-maskable-512.png", 512, 0.8);
await exportIcon("apple-touch-icon.png", 180);
