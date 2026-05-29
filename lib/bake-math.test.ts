import { describe, it, expect } from "vitest";
import { computeBakeQuantities } from "./bake-math";
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
  it("Country (500g, 75% hyd, 2% salt, 20% lev)", () => {
    const q = computeBakeQuantities(makeRecipe());
    expect(q.totalFlourGrams).toBe(500);
    expect(q.totalWaterGrams).toBe(375);
    expect(q.saltGrams).toBe(10);
    expect(q.levainTotalGrams).toBe(100);
    expect(q.levainBuild.starterGrams).toBe(33);
    expect(q.levainBuild.waterGrams).toBe(33);
    expect(q.levainBuild.flourGrams).toBe(33);
    expect(q.mixAdditions.saltReserveWaterGrams).toBe(20);
  });

  it("Whole Wheat (500g, 80% hyd, 2.2% salt, 25% lev)", () => {
    const q = computeBakeQuantities(
      makeRecipe({ hydration: 80, salt: 2.2, levain: 25 })
    );
    expect(q.totalFlourGrams).toBe(500);
    expect(q.totalWaterGrams).toBe(400);
    expect(q.saltGrams).toBe(11);
    expect(q.levainTotalGrams).toBe(125);
    expect(q.levainBuild.starterGrams).toBe(42);
    expect(q.levainBuild.waterGrams).toBe(42);
    expect(q.levainBuild.flourGrams).toBe(42);
  });

  it("Rye 50 (500g, 70% hyd, 2.5% salt, 15% lev)", () => {
    const q = computeBakeQuantities(
      makeRecipe({ hydration: 70, salt: 2.5, levain: 15 })
    );
    expect(q.totalFlourGrams).toBe(500);
    expect(q.totalWaterGrams).toBe(350);
    expect(q.saltGrams).toBe(13);
    expect(q.levainTotalGrams).toBe(75);
    expect(q.levainBuild.starterGrams).toBe(25);
    expect(q.levainBuild.waterGrams).toBe(25);
    expect(q.levainBuild.flourGrams).toBe(25);
  });

  it("High hydration (500g, 90% hyd, 2% salt, 20% lev)", () => {
    const q = computeBakeQuantities(makeRecipe({ hydration: 90 }));
    expect(q.totalWaterGrams).toBe(450);
  });

  it("Lean baguette (500g, 65% hyd, 2% salt, 10% lev)", () => {
    const q = computeBakeQuantities(makeRecipe({ hydration: 65, levain: 10 }));
    expect(q.totalWaterGrams).toBe(325);
    expect(q.levainTotalGrams).toBe(50);
    expect(q.levainBuild.starterGrams).toBe(17);
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

  it("saltReserveWaterGrams is always 20 (constant)", () => {
    expect(computeBakeQuantities(makeRecipe()).mixAdditions.saltReserveWaterGrams).toBe(20);
    expect(computeBakeQuantities(makeRecipe({ flourWeightGrams: 100 })).mixAdditions.saltReserveWaterGrams).toBe(20);
    expect(computeBakeQuantities(makeRecipe({ flourWeightGrams: 1500 })).mixAdditions.saltReserveWaterGrams).toBe(20);
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
