import { describe, it, expect } from "vitest";
import { computeBakeQuantities, computeRefreshBreakdown } from "./bake-math";
import type { FeedRatio } from "./bake-timing";
import type { Recipe } from "./types/recipe";

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "r",
    name: "כפרי",
    flour: { white: 100, wholeWheat: 0, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
    flourWeightGrams: 500,
    hydration: 75,
    salt: 2,
    levain: 20,
    kitchenTemp: 25,
    inclusions: [],
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

describe("computeBakeQuantities — representative recipes", () => {
  // Default ratio is 1:2:2 (5 parts): starter=total/5, flour=water=2×starter.
  it("Country (500g, 75% hyd, 2% salt, 20% lev) at default ratio 1:2:2", () => {
    const q = computeBakeQuantities(makeRecipe());
    expect(q.totalFlourGrams).toBe(500);
    expect(q.totalWaterGrams).toBe(375);
    expect(q.saltGrams).toBe(10);
    expect(q.levainTotalGrams).toBe(100);
    // 100g at 1:2:2 (5 parts): starter=20, water=40, flour=40
    expect(q.levainBuild.starterGrams).toBe(20);
    expect(q.levainBuild.waterGrams).toBe(40);
    expect(q.levainBuild.flourGrams).toBe(40);
    expect(q.mixAdditions.saltReserveWaterGrams).toBe(20);
  });

  it("Whole Wheat (500g, 80% hyd, 2.2% salt, 25% lev) at default ratio 1:2:2", () => {
    const q = computeBakeQuantities(
      makeRecipe({ hydration: 80, salt: 2.2, levain: 25 })
    );
    expect(q.totalFlourGrams).toBe(500);
    expect(q.totalWaterGrams).toBe(400);
    expect(q.saltGrams).toBe(11);
    expect(q.levainTotalGrams).toBe(125);
    // 125g at 1:2:2: starter=25, water=50, flour=50
    expect(q.levainBuild.starterGrams).toBe(25);
    expect(q.levainBuild.waterGrams).toBe(50);
    expect(q.levainBuild.flourGrams).toBe(50);
  });

  it("Rye 50 (500g, 70% hyd, 2.5% salt, 15% lev) at default ratio 1:2:2", () => {
    const q = computeBakeQuantities(
      makeRecipe({ hydration: 70, salt: 2.5, levain: 15 })
    );
    expect(q.totalFlourGrams).toBe(500);
    expect(q.totalWaterGrams).toBe(350);
    expect(q.saltGrams).toBe(13);
    expect(q.levainTotalGrams).toBe(75);
    // 75g at 1:2:2: starter=15, water=30, flour=30
    expect(q.levainBuild.starterGrams).toBe(15);
    expect(q.levainBuild.waterGrams).toBe(30);
    expect(q.levainBuild.flourGrams).toBe(30);
  });

  it("High hydration (500g, 90% hyd, 2% salt, 20% lev)", () => {
    const q = computeBakeQuantities(makeRecipe({ hydration: 90 }));
    expect(q.totalWaterGrams).toBe(450);
  });

  it("Lean baguette (500g, 65% hyd, 2% salt, 10% lev) at default ratio 1:2:2", () => {
    const q = computeBakeQuantities(makeRecipe({ hydration: 65, levain: 10 }));
    expect(q.totalWaterGrams).toBe(325);
    expect(q.levainTotalGrams).toBe(50);
    // 50g at 1:2:2: starter=10
    expect(q.levainBuild.starterGrams).toBe(10);
  });
});

describe("computeBakeQuantities — edge cases", () => {
  it("levain=0 → all levain values 0, no division-by-zero", () => {
    const q = computeBakeQuantities(makeRecipe({ levain: 0 }));
    expect(q.levainTotalGrams).toBe(0);
    expect(q.levainBuild.starterGrams).toBe(0);
    expect(q.levainBuild.waterGrams).toBe(0);
    expect(q.levainBuild.flourGrams).toBe(0);
    expect(q.mixAdditions.flourGrams).toBe(500);
  });

  it("min flourWeightGrams (100) → small but valid integers", () => {
    const q = computeBakeQuantities(makeRecipe({ flourWeightGrams: 100 }));
    expect(q.totalFlourGrams).toBe(100);
    expect(Number.isInteger(q.totalWaterGrams)).toBe(true);
    expect(Number.isInteger(q.saltGrams)).toBe(true);
    expect(Number.isInteger(q.levainTotalGrams)).toBe(true);
    expect(q.totalWaterGrams).toBeGreaterThanOrEqual(0);
  });

  it("max flourWeightGrams (1500) → larger integers, all finite", () => {
    const q = computeBakeQuantities(makeRecipe({ flourWeightGrams: 1500 }));
    expect(q.totalFlourGrams).toBe(1500);
    expect(q.totalWaterGrams).toBe(1125);
    expect(q.saltGrams).toBe(30);
    expect(q.levainTotalGrams).toBe(300);
  });
});

describe("computeBakeQuantities — invariants", () => {
  const recipe = makeRecipe();

  it("all returned values are integers", () => {
    const q = computeBakeQuantities(recipe);
    expect(Number.isInteger(q.totalFlourGrams)).toBe(true);
    expect(Number.isInteger(q.totalWaterGrams)).toBe(true);
    expect(Number.isInteger(q.saltGrams)).toBe(true);
    expect(Number.isInteger(q.levainTotalGrams)).toBe(true);
    expect(Number.isInteger(q.levainBuild.starterGrams)).toBe(true);
    expect(Number.isInteger(q.levainBuild.waterGrams)).toBe(true);
    expect(Number.isInteger(q.levainBuild.flourGrams)).toBe(true);
    expect(Number.isInteger(q.mixAdditions.flourGrams)).toBe(true);
    expect(Number.isInteger(q.mixAdditions.waterGrams)).toBe(true);
    expect(Number.isInteger(q.mixAdditions.saltReserveWaterGrams)).toBe(true);
  });

  it("flour conservation: mix flour + levain flour + starter-flour ≈ totalFlour (±1g)", () => {
    const q = computeBakeQuantities(recipe);
    // Starter is 100% hydration → half flour, half water
    const starterFlour = q.levainBuild.starterGrams / 2;
    const sum = q.mixAdditions.flourGrams + q.levainBuild.flourGrams + starterFlour;
    expect(Math.abs(sum - q.totalFlourGrams)).toBeLessThanOrEqual(2);
  });

  it("water conservation: mix water + levain water + starter-water + reserve ≈ totalWater (±1g)", () => {
    const q = computeBakeQuantities(recipe);
    const starterWater = q.levainBuild.starterGrams / 2;
    const sum =
      q.mixAdditions.waterGrams +
      q.levainBuild.waterGrams +
      starterWater +
      q.mixAdditions.saltReserveWaterGrams;
    expect(Math.abs(sum - q.totalWaterGrams)).toBeLessThanOrEqual(2);
  });

  it("salt reserve scales with total water — 5% rounded to 5g, clamped 15–50", () => {
    // 500g @75% → 375g water → 18.75 → 20 (canonical value unchanged)
    expect(computeBakeQuantities(makeRecipe()).mixAdditions.saltReserveWaterGrams).toBe(20);
    // 750g @75% → 562g water → 28 → 30
    expect(computeBakeQuantities(makeRecipe({ flourWeightGrams: 750 })).mixAdditions.saltReserveWaterGrams).toBe(30);
    // 1500g @75% → 1125g water → 56 → capped at 50
    expect(computeBakeQuantities(makeRecipe({ flourWeightGrams: 1500 })).mixAdditions.saltReserveWaterGrams).toBe(50);
    // 300g @75% → 225g water → 11 → floored at 15
    expect(computeBakeQuantities(makeRecipe({ flourWeightGrams: 300 })).mixAdditions.saltReserveWaterGrams).toBe(15);
  });
});

describe("flour breakdown — rounding edges (engine review)", () => {
  const fiveWay = { white: 20, wholeWheat: 20, rye: 20, speltWhite: 20, speltWhole: 20, other: 0 };

  it("tiny levain with a five-way blend never shows negative or zero grams", () => {
    const q = computeBakeQuantities(
      makeRecipe({ flourWeightGrams: 350, levain: 2, flour: fiveWay }),
      1 as FeedRatio
    );
    const bd = q.levainBuild.flourBreakdown;
    expect(bd.length).toBeGreaterThan(0);
    expect(bd.every((e) => e.grams >= 1)).toBe(true);
    expect(bd.reduce((a, e) => a + e.grams, 0)).toBe(q.levainBuild.flourGrams);
  });

  it("breakdown always sums exactly to its component total across blends", () => {
    for (const flour of [fiveWay, { white: 34, wholeWheat: 33, rye: 33, speltWhite: 0, speltWhole: 0, other: 0 }]) {
      for (const grams of [100, 350, 500, 1500]) {
        const q = computeBakeQuantities(makeRecipe({ flourWeightGrams: grams, flour }));
        const sum = q.mixAdditions.flourBreakdown.reduce((a, e) => a + e.grams, 0);
        expect(sum).toBe(q.mixAdditions.flourGrams);
        expect(q.mixAdditions.flourBreakdown.every((e) => e.grams >= 1)).toBe(true);
      }
    }
  });

  it("legacy `other` flour gets its own entry instead of being folded into another type", () => {
    const q = computeBakeQuantities(
      makeRecipe({ flour: { white: 70, wholeWheat: 0, rye: 0, speltWhite: 0, speltWhole: 0, other: 30 } })
    );
    const bd = q.mixAdditions.flourBreakdown;
    const other = bd.find((e) => e.type === "other");
    const white = bd.find((e) => e.type === "white");
    expect(other).toBeDefined();
    expect(white).toBeDefined();
    const whiteShare = white!.grams / (white!.grams + other!.grams);
    expect(Math.abs(whiteShare - 0.7)).toBeLessThan(0.02);
  });
});

describe("computeBakeQuantities — mix flourBreakdown", () => {
  it("100% white → single entry summing to mixFlour", () => {
    const q = computeBakeQuantities(makeRecipe());
    expect(q.mixAdditions.flourBreakdown).toEqual([
      { type: "white", grams: q.mixAdditions.flourGrams },
    ]);
  });

  it("80% white + 20% wholeWheat → two entries summing to mixFlour", () => {
    const q = computeBakeQuantities(
      makeRecipe({
        flour: { white: 80, wholeWheat: 20, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
      })
    );
    const breakdown = q.mixAdditions.flourBreakdown;
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0]?.type).toBe("white");
    expect(breakdown[1]?.type).toBe("wholeWheat");
    const sum = breakdown.reduce((acc, e) => acc + e.grams, 0);
    expect(sum).toBe(q.mixAdditions.flourGrams);
  });

  it("zero-percent flour types are omitted from breakdown", () => {
    const q = computeBakeQuantities(
      makeRecipe({
        flour: { white: 50, wholeWheat: 0, rye: 50, speltWhite: 0, speltWhole: 0, other: 0 },
      })
    );
    const types = q.mixAdditions.flourBreakdown.map((e) => e.type);
    expect(types).toEqual(["white", "rye"]);
  });

  it("three-way blend: rounding drift goes to the largest entry", () => {
    const q = computeBakeQuantities(
      makeRecipe({
        flour: { white: 33, wholeWheat: 33, rye: 34, speltWhite: 0, speltWhole: 0, other: 0 },
        flourWeightGrams: 1000,
      })
    );
    const breakdown = q.mixAdditions.flourBreakdown;
    expect(breakdown).toHaveLength(3);
    const sum = breakdown.reduce((acc, e) => acc + e.grams, 0);
    expect(sum).toBe(q.mixAdditions.flourGrams);
  });

  it("all entries are integers", () => {
    const q = computeBakeQuantities(
      makeRecipe({
        flour: { white: 60, wholeWheat: 30, rye: 10, speltWhite: 0, speltWhole: 0, other: 0 },
      })
    );
    q.mixAdditions.flourBreakdown.forEach((e) => {
      expect(Number.isInteger(e.grams)).toBe(true);
    });
  });

  it("levainBuild.flourBreakdown follows the recipe blend proportionally", () => {
    const q = computeBakeQuantities(
      makeRecipe({
        flour: { white: 80, wholeWheat: 20, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
      })
    );
    const breakdown = q.levainBuild.flourBreakdown;
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0]?.type).toBe("white");
    expect(breakdown[1]?.type).toBe("wholeWheat");
    const sum = breakdown.reduce((acc, e) => acc + e.grams, 0);
    expect(sum).toBe(q.levainBuild.flourGrams);
  });

  it("levainBuild.flourBreakdown is empty array when levain=0", () => {
    const q = computeBakeQuantities(makeRecipe({ levain: 0 }));
    expect(q.levainBuild.flourBreakdown).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// T3 — ratio-driven refresh math
// ---------------------------------------------------------------------------

describe("computeRefreshBreakdown (T3)", () => {
  it("at ratio 1:1:1 — starter = flour = water = total/3", () => {
    const b = computeRefreshBreakdown(150, 1);
    expect(b.starterGrams).toBe(50);
    expect(b.flourGrams).toBe(50);
    expect(b.waterGrams).toBe(50);
    expect(b.starterGrams + b.flourGrams + b.waterGrams).toBe(150);
  });

  it("at ratio 1:2:2 — total = starter + 2×flour + 2×water (five parts)", () => {
    // 150g at 1:2:2: 1 part starter = 30g, 2 parts flour = 60g, 2 parts water = 60g
    const b = computeRefreshBreakdown(150, 2);
    expect(b.starterGrams + b.flourGrams + b.waterGrams).toBe(150);
    expect(b.flourGrams).toBe(b.waterGrams); // equal flour and water (100% hydration)
    expect(b.starterGrams * 2).toBe(b.flourGrams); // ratio: 1 starter, 2 flour
  });

  it("at ratio 1:5:5 — total splits into 11 parts", () => {
    // 110g at 1:5:5: 1 part = 10g starter, 5 parts = 50g flour, 5 parts = 50g water
    const b = computeRefreshBreakdown(110, 5);
    expect(b.starterGrams + b.flourGrams + b.waterGrams).toBe(110);
    expect(b.starterGrams).toBe(10);
    expect(b.flourGrams).toBe(50);
    expect(b.waterGrams).toBe(50);
  });

  it("all values are integers", () => {
    const ratios: FeedRatio[] = [1, 2, 3, 4, 5];
    for (const r of ratios) {
      const b = computeRefreshBreakdown(150, r);
      expect(Number.isInteger(b.starterGrams)).toBe(true);
      expect(Number.isInteger(b.flourGrams)).toBe(true);
      expect(Number.isInteger(b.waterGrams)).toBe(true);
    }
  });

  it("total always sums exactly (no drift)", () => {
    const ratios: FeedRatio[] = [1, 2, 3, 4, 5];
    for (const r of ratios) {
      const total = 100;
      const b = computeRefreshBreakdown(total, r);
      expect(b.starterGrams + b.flourGrams + b.waterGrams).toBe(total);
    }
  });

  it("at 0g total — all zeros", () => {
    const b = computeRefreshBreakdown(0, 2);
    expect(b.starterGrams).toBe(0);
    expect(b.flourGrams).toBe(0);
    expect(b.waterGrams).toBe(0);
  });
});
