import { describe, expect, it } from "vitest";
import {
  AUTOLYSE_GUIDE,
  getAutolyseGuidance,
  getStageKnowledge,
} from "./stage-knowledge";
import type { RecipeFormValues } from "@/lib/validate-recipe";

type AutolyseContext = Pick<
  RecipeFormValues,
  "flour" | "hydration" | "kitchenTemp"
>;

function makeContext(overrides: Partial<AutolyseContext> = {}): AutolyseContext {
  return {
    flour: {
      white: 100,
      wholeWheat: 0,
      rye: 0,
      speltWhite: 0,
      speltWhole: 0,
      other: 0,
    },
    hydration: 72,
    kitchenTemp: 25,
    ...overrides,
  };
}

describe("stage knowledge data", () => {
  it("exposes one guide only for the autolyse stage", () => {
    expect(getStageKnowledge(2)).toBe(AUTOLYSE_GUIDE);

    for (const stageN of [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
      expect(getStageKnowledge(stageN), `stage ${stageN}`).toBeNull();
    }
  });

  it("replaces the learn, FAQ, and troubleshooting branches with one deep guide", () => {
    expect(AUTOLYSE_GUIDE.title).toBe("להבין את הבצק");
    expect(AUTOLYSE_GUIDE.mechanism.heading).toBe("מה קורה בקערה?");
    expect(AUTOLYSE_GUIDE.graph.title).toBe(
      "הרווח מול הסיכון בזמן האוטוליזה",
    );
    expect(AUTOLYSE_GUIDE.recipeContext.heading).toBe(
      "מה זה אומר על הבצק שלכם?",
    );
    expect(AUTOLYSE_GUIDE).not.toHaveProperty("learn");
    expect(AUTOLYSE_GUIDE).not.toHaveProperty("faqs");
    expect(AUTOLYSE_GUIDE).not.toHaveProperty("troubleshooting");
  });

  it.each([
    [
      "whole spelt",
      makeContext({
        flour: {
          white: 70,
          wholeWheat: 0,
          rye: 0,
          speltWhite: 0,
          speltWhole: 30,
          other: 0,
        },
        hydration: 76,
      }),
      ["spelt"],
    ],
    [
      "white spelt",
      makeContext({
        flour: {
          white: 50,
          wholeWheat: 0,
          rye: 0,
          speltWhite: 50,
          speltWhole: 0,
          other: 0,
        },
        hydration: 73,
      }),
      ["spelt"],
    ],
    [
      "whole wheat, high hydration, warm kitchen",
      makeContext({
        flour: {
          white: 50,
          wholeWheat: 50,
          rye: 0,
          speltWhite: 0,
          speltWhole: 0,
          other: 0,
        },
        hydration: 83,
        kitchenTemp: 27,
      }),
      ["wholeWheat", "highHydration", "warmKitchen"],
    ],
    [
      "rye and low hydration",
      makeContext({
        flour: {
          white: 70,
          wholeWheat: 0,
          rye: 30,
          speltWhite: 0,
          speltWhole: 0,
          other: 0,
        },
        hydration: 75,
      }),
      ["rye", "lowHydration"],
    ],
  ] as const)("selects recipe factors for %s", (_name, context, expected) => {
    expect(getAutolyseGuidance(context)).toEqual(expected);
  });

  it("uses the generic flour guidance for white flour and does not invent a white-flour factor", () => {
    expect(getAutolyseGuidance(makeContext())).toEqual(["generic"]);
  });

  it("adds hydration guidance only beyond the two-point threshold", () => {
    expect(getAutolyseGuidance(makeContext({ hydration: 74 }))).toEqual([
      "generic",
    ]);
    expect(getAutolyseGuidance(makeContext({ hydration: 75 }))).toEqual([
      "generic",
      "highHydration",
    ]);
    expect(getAutolyseGuidance(makeContext({ hydration: 70 }))).toEqual([
      "generic",
    ]);
    expect(getAutolyseGuidance(makeContext({ hydration: 69 }))).toEqual([
      "generic",
      "lowHydration",
    ]);
  });

  it("omits missing numeric factors and never returns more than three", () => {
    const factors = getAutolyseGuidance(
      makeContext({ hydration: "", kitchenTemp: "" }),
    );

    expect(factors).toEqual(["generic"]);
    expect(factors.length).toBeLessThanOrEqual(3);
  });
});
