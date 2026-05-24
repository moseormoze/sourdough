import { describe, it, expect } from "vitest";
import { PRESETS, getPreset } from "./presets";
import { RecipeInputSchema } from "@/lib/types/recipe";

describe("presets", () => {
  it("ships exactly 6 built-in presets", () => {
    expect(PRESETS).toHaveLength(6);
  });

  it("includes all expected preset ids", () => {
    const ids = PRESETS.map((p) => p.id).sort();
    expect(ids).toEqual(["beginner", "country", "rye50", "wheat70", "white", "whole100"]);
  });

  it("every preset has flour percentages summing to 100", () => {
    for (const p of PRESETS) {
      const total =
        p.data.flour.white + p.data.flour.wholeWheat + p.data.flour.rye + p.data.flour.other;
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
