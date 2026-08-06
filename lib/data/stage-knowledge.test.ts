import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import {
  AUTOLYSE_GUIDE,
  STAGE_KNOWLEDGE,
  getStageGuidance,
  getStageKnowledge,
  type StageKnowledgeContent,
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
    expect(AUTOLYSE_GUIDE.graph!.title).toBe(
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
    expect(getStageGuidance(context)).toEqual(expected);
  });

  it("uses the generic flour guidance for white flour and does not invent a white-flour factor", () => {
    expect(getStageGuidance(makeContext())).toEqual(["generic"]);
  });

  it("adds hydration guidance only beyond the two-point threshold", () => {
    expect(getStageGuidance(makeContext({ hydration: 74 }))).toEqual([
      "generic",
    ]);
    expect(getStageGuidance(makeContext({ hydration: 75 }))).toEqual([
      "generic",
      "highHydration",
    ]);
    expect(getStageGuidance(makeContext({ hydration: 70 }))).toEqual([
      "generic",
    ]);
    expect(getStageGuidance(makeContext({ hydration: 69 }))).toEqual([
      "generic",
      "lowHydration",
    ]);
  });

  it("omits missing numeric factors and never returns more than three", () => {
    const factors = getStageGuidance(
      makeContext({ hydration: "", kitchenTemp: "" }),
    );

    expect(factors).toEqual(["generic"]);
    expect(factors.length).toBeLessThanOrEqual(3);
  });
});

const flourOf = (o: Partial<AutolyseContext["flour"]> = {}) => ({ white: 100, wholeWheat: 0, rye: 0, speltWhite: 0, speltWhole: 0, other: 0, ...o });

const GUIDANCE_CASES: Record<string, AutolyseContext> = {
  "white/72/25": { flour: flourOf(), hydration: 72, kitchenTemp: 25 },
  "white/80/25": { flour: flourOf(), hydration: 80, kitchenTemp: 25 },
  "white/60/25": { flour: flourOf(), hydration: 60, kitchenTemp: 25 },
  "white/72/28": { flour: flourOf(), hydration: 72, kitchenTemp: 28 },
  "ww60/85/29": { flour: flourOf({ white: 40, wholeWheat: 60 }), hydration: 85, kitchenTemp: 29 },
  "rye35/70/22": { flour: flourOf({ white: 65, rye: 35 }), hydration: 70, kitchenTemp: 22 },
  "speltWhole30/75/26": { flour: flourOf({ white: 70, speltWhole: 30 }), hydration: 75, kitchenTemp: 26 },
  "speltWhite50/75/24": { flour: flourOf({ white: 50, speltWhite: 50 }), hydration: 75, kitchenTemp: 24 },
  "ww50rye30spelt30/95/30": { flour: flourOf({ white: 0, wholeWheat: 50, rye: 30, speltWhole: 30 }), hydration: 95, kitchenTemp: 30 },
  "missing hydration": { flour: flourOf(), hydration: "", kitchenTemp: 25 },
  "missing temp": { flour: flourOf(), hydration: 72, kitchenTemp: "" },
  "missing both": { flour: flourOf(), hydration: "", kitchenTemp: "" },
};

describe("stage knowledge registry (F31 T4 — generalized guide type)", () => {
  it("resolves guides through a per-stage registry, not a hard-coded stage number", () => {
    expect(STAGE_KNOWLEDGE[2]).toBe(getStageKnowledge(2));
    expect(Object.keys(STAGE_KNOWLEDGE)).toEqual(["2"]);
    for (const stageN of [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
      expect(getStageKnowledge(stageN), `stage ${stageN}`).toBeNull();
    }
  });

  it("accepts a guide with no graph — the type is no longer the autolyse literal", () => {
    const withoutGraph: StageKnowledgeContent = {
      title: "כותרת",
      intro: "פתיחה",
      mechanism: { heading: "מנגנון", body: "גוף" },
      recipeContext: {
        heading: "הקשר",
        guidance: AUTOLYSE_GUIDE.recipeContext.guidance,
      },
      decisionRule: "כלל החלטה",
    };
    expect(withoutGraph.graph).toBeUndefined();
    expect(withoutGraph.practicalCheck).toBeUndefined();
  });

  it("keeps every autolyse string byte-identical through the refactor", () => {
    // Frozen from the pre-refactor implementation: a changed stage-2 string
    // fails here on purpose, which is the whole point of a no-behaviour-change PR.
    expect(
      createHash("sha256").update(JSON.stringify(getStageKnowledge(2))).digest("hex"),
    ).toBe("d8ac8ed9c9ef0d750e412c5443b2395f36463ddcb5b7101345b2305c2f74f993");
    expect(Object.keys(AUTOLYSE_GUIDE)).toEqual([
      "title",
      "intro",
      "mechanism",
      "graph",
      "recipeContext",
      "practicalCheck",
      "decisionRule",
    ]);
  });

  it.each(Object.keys(GUIDANCE_CASES))(
    "guidance for %s survives the rename unchanged",
    (name) => {
      const expected: Record<string, readonly string[]> = {
        "white/72/25": ["generic"],
        "white/80/25": ["generic", "highHydration"],
        "white/60/25": ["generic", "lowHydration"],
        "white/72/28": ["generic", "warmKitchen"],
        "ww60/85/29": ["wholeWheat", "highHydration", "warmKitchen"],
        "rye35/70/22": ["rye", "lowHydration"],
        "speltWhole30/75/26": ["spelt", "warmKitchen"],
        "speltWhite50/75/24": ["spelt"],
        "ww50rye30spelt30/95/30": ["spelt", "highHydration", "warmKitchen"],
        "missing hydration": ["generic"],
        "missing temp": ["generic"],
        "missing both": ["generic"],
      };
      expect(getStageGuidance(GUIDANCE_CASES[name]!)).toEqual(expected[name]);
    },
  );
});
