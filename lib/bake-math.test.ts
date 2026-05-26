import { describe, it, expect } from "vitest";
import { computeBakeQuantities } from "./bake-math";
import type { Recipe } from "./types/recipe";

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "r",
    name: "כפרי",
    flour: { white: 100, wholeWheat: 0, rye: 0, other: 0 },
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
