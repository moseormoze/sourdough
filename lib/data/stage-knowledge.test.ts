import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import {
  AUTOLYSE_GUIDE,
  STAGE_KNOWLEDGE,
  getStageGuidance,
  getStageKnowledge,
  type StageKnowledgeContent,
} from "./stage-knowledge";
import { strings } from "@/lib/strings";
import { STRETCH_AND_FOLD_VIDEO } from "./stages";
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
  it("exposes a guide only for the stages that have one", () => {
    expect(getStageKnowledge(2)).toBe(AUTOLYSE_GUIDE);
    expect(getStageKnowledge(4)).not.toBeNull();

    for (const stageN of [1, 3, 5, 6, 7, 8, 9, 10, 11, 12]) {
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
    expect(Object.keys(STAGE_KNOWLEDGE)).toEqual(["2", "4"]);
    for (const stageN of [1, 3, 5, 6, 7, 8, 9, 10, 11, 12]) {
      expect(getStageKnowledge(stageN), `stage ${stageN}`).toBeNull();
    }
  });

  it("accepts a guide with no graph — the type is no longer the autolyse literal", () => {
    const withoutGraph: StageKnowledgeContent = {
      title: "כותרת",
      triggerLabel: "טריגר",
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
    const { triggerLabel: _label, ...copy } = getStageKnowledge(2)!;
    void _label; // added by T5; the frozen hash guards the copy, not the shape
    expect(createHash("sha256").update(JSON.stringify(copy)).digest("hex")).toBe(
      "d8ac8ed9c9ef0d750e412c5443b2395f36463ddcb5b7101345b2305c2f74f993",
    );
    expect(Object.keys(copy)).toEqual([
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

describe("bulk deep-dive guide (F31 T5)", () => {
  const bulk = getStageKnowledge(4)!;

  it("registers a guide for the bulk stage", () => {
    expect(bulk).toBe(STAGE_KNOWLEDGE[4]);
    expect(bulk.title).toBeTruthy();
    expect(bulk.triggerLabel).toBe("הסבר על התסיסה הראשונית");
  });

  it("carries no graph — quantified axes would invite false precision here", () => {
    expect(bulk.graph).toBeUndefined();
    expect(bulk.practicalCheck).toBeUndefined();
  });

  it("holds the folds section with the stretch & fold demo", () => {
    expect(bulk.folds?.heading).toBeTruthy();
    expect(bulk.folds?.body).toBeTruthy();
    expect(bulk.folds?.youtubeId).toBe(STRETCH_AND_FOLD_VIDEO.youtubeId);
    expect(bulk.folds?.videoCaption).toBe(STRETCH_AND_FOLD_VIDEO.videoCaption);
  });

  it("repeats the decision rule the stage already shows, not a second wording", () => {
    expect(bulk.decisionRule).toBe(strings.bake.bulkDecisionRule);
  });

  it("offers guidance for every factor the engine can pick", () => {
    for (const key of [
      "spelt",
      "wholeWheat",
      "rye",
      "generic",
      "highHydration",
      "lowHydration",
      "warmKitchen",
    ] as const) {
      expect(bulk.recipeContext.guidance[key], key).toBeTruthy();
    }
  });

  it("covers the plain-flour bake — the case the engine picks most often", () => {
    expect(bulk.recipeContext.guidance.generic).toBe(
      "בבצק מחיטה לבנה סימני התסיסה מתנהגים לפי הספר. הדרך הטובה ביותר היא להשוות את מצב הבצק לעצמו בתחילת השלב, ולא לחפש מראה אבסולוטי אחד.",
    );
  });

  it("phrases the warm guidance for either temperature source", () => {
    const warm = bulk.recipeContext.guidance.warmKitchen!;
    // it fires from a measured dough temp too, so it must not claim the room is warm
    expect(warm).not.toContain("בסביבה");
    expect(warm).toContain("בטמפרטורה של 26° ומעלה");
  });

  it("leaves the autolyse guide alone", () => {
    expect(getStageKnowledge(2)).toBe(AUTOLYSE_GUIDE);
    expect(Object.keys(STAGE_KNOWLEDGE)).toEqual(["2", "4"]);
  });
});

describe("guidance prefers measured dough temperature (F31 T5)", () => {
  const white = flourOf();

  it("uses the measured dough temp over the kitchen when it is present", () => {
    expect(
      getStageGuidance({ flour: white, hydration: 72, kitchenTemp: 22, doughTempC: 27 }),
    ).toContain("warmKitchen");
  });

  it("a cool measured dough overrides a warm kitchen", () => {
    expect(
      getStageGuidance({ flour: white, hydration: 72, kitchenTemp: 29, doughTempC: 22 }),
    ).not.toContain("warmKitchen");
  });

  it("falls back to the kitchen temp when nothing was measured", () => {
    expect(
      getStageGuidance({ flour: white, hydration: 72, kitchenTemp: 29, doughTempC: null }),
    ).toContain("warmKitchen");
    expect(
      getStageGuidance({ flour: white, hydration: 72, kitchenTemp: 22 }),
    ).not.toContain("warmKitchen");
  });

  it("still caps at three factors with a measured temp in play", () => {
    expect(
      getStageGuidance({
        flour: flourOf({ white: 0, wholeWheat: 50, rye: 30, speltWhole: 30 }),
        hydration: 95,
        kitchenTemp: 20,
        doughTempC: 30,
      }),
    ).toEqual(["spelt", "highHydration", "warmKitchen"]);
  });
});
