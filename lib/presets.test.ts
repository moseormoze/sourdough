import { describe, it, expect } from "vitest";
import { PRESETS, getPreset } from "./presets";
import { RecipeInputSchema } from "@/lib/types/recipe";

describe("presets", () => {
  it("ships exactly 7 built-in presets", () => {
    expect(PRESETS).toHaveLength(7);
  });

  it("includes all expected preset ids", () => {
    const ids = PRESETS.map((p) => p.id).sort();
    expect(ids).toEqual([
      "country",
      "country-rye",
      "rye50",
      "spelt-white",
      "spelt50",
      "wheat70",
      "white",
    ]);
  });

  it("no longer ships the retired 'whole100' preset", () => {
    expect(getPreset("whole100")).toBeNull();
    expect(PRESETS.some((p) => p.id === "whole100")).toBe(false);
  });

  it("keeps 'country' first (tests index PRESETS[0])", () => {
    expect(PRESETS[0]?.id).toBe("country");
  });

  it("every preset has flour percentages summing to 100", () => {
    for (const p of PRESETS) {
      const f = p.data.flour;
      const total =
        f.white +
        f.wholeWheat +
        f.rye +
        (f.speltWhite ?? 0) +
        (f.speltWhole ?? 0) +
        (f.other ?? 0);
      expect(total, `preset ${p.id}`).toBeCloseTo(100, 2);
    }
  });

  it("every preset's data passes RecipeInputSchema with a name", () => {
    for (const p of PRESETS) {
      const result = RecipeInputSchema.safeParse({ ...p.data, name: p.name });
      expect(result.success, `preset ${p.id}: ${JSON.stringify(result)}`).toBe(true);
    }
  });

  it("getPreset returns the preset by id", () => {
    const p = getPreset("country");
    expect(p?.name).toBe("כפרי קלאסי");
  });

  it("getPreset returns null for unknown id", () => {
    expect(getPreset("nope")).toBeNull();
  });
});
