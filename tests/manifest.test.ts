import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

const pub = (p: string) => path.join(process.cwd(), "public", p);
const manifest = JSON.parse(fs.readFileSync(pub("manifest.json"), "utf8")) as {
  icons: ManifestIcon[];
};

describe("PWA manifest icons", () => {
  it("declares separate any (192+512) and maskable (512) PNG entries", () => {
    const { icons } = manifest;
    expect(icons.some((i) => i.sizes === "192x192" && i.purpose === "any")).toBe(true);
    expect(icons.some((i) => i.sizes === "512x512" && i.purpose === "any")).toBe(true);
    expect(icons.some((i) => i.sizes === "512x512" && i.purpose === "maskable")).toBe(true);
  });

  it("has no combined 'any maskable' entry (causes clipping on Android)", () => {
    expect(manifest.icons.every((i) => i.purpose !== "any maskable")).toBe(true);
  });

  it("every icon src points at an existing file in public/", () => {
    for (const icon of manifest.icons) {
      const file = pub(icon.src.replace(/^\//, ""));
      expect(fs.existsSync(file), `${icon.src} is missing from public/`).toBe(true);
    }
  });

  it("apple-touch-icon.png exists and layout.tsx points at it", () => {
    expect(fs.existsSync(pub("apple-touch-icon.png"))).toBe(true);
    const layout = fs.readFileSync(path.join(process.cwd(), "app", "layout.tsx"), "utf8");
    expect(layout).toContain('"/apple-touch-icon.png"');
  });
});
