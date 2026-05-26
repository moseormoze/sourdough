import { describe, it, expect } from "vitest";
import { RecipeSchema, RecipeInputSchema } from "./recipe";

const baseRecipe = {
  id: "r1",
  name: "כפרי",
  flour: { white: 100, wholeWheat: 0, rye: 0, other: 0 },
  hydration: 75,
  salt: 2,
  levain: 20,
  kitchenTemp: 25,
  inclusions: [],
  createdAt: 1_000,
  updatedAt: 2_000,
};

describe("RecipeSchema — flourWeightGrams", () => {
  it("defaults to 500 when missing (legacy recipe)", () => {
    const parsed = RecipeSchema.parse(baseRecipe);
    expect(parsed.flourWeightGrams).toBe(500);
  });

  it("accepts a valid integer in range", () => {
    const parsed = RecipeSchema.parse({ ...baseRecipe, flourWeightGrams: 750 });
    expect(parsed.flourWeightGrams).toBe(750);
  });

  it("accepts the min boundary (100)", () => {
    const parsed = RecipeSchema.parse({ ...baseRecipe, flourWeightGrams: 100 });
    expect(parsed.flourWeightGrams).toBe(100);
  });

  it("accepts the max boundary (1500)", () => {
    const parsed = RecipeSchema.parse({ ...baseRecipe, flourWeightGrams: 1500 });
    expect(parsed.flourWeightGrams).toBe(1500);
  });

  it("rejects below min (99)", () => {
    expect(() =>
      RecipeSchema.parse({ ...baseRecipe, flourWeightGrams: 99 })
    ).toThrow();
  });

  it("rejects above max (1501)", () => {
    expect(() =>
      RecipeSchema.parse({ ...baseRecipe, flourWeightGrams: 1501 })
    ).toThrow();
  });

  it("rejects non-integer values", () => {
    expect(() =>
      RecipeSchema.parse({ ...baseRecipe, flourWeightGrams: 500.5 })
    ).toThrow();
  });

  it("rejects negative values", () => {
    expect(() =>
      RecipeSchema.parse({ ...baseRecipe, flourWeightGrams: -1 })
    ).toThrow();
  });
});

describe("RecipeInputSchema — flourWeightGrams", () => {
  const baseInput = {
    name: "כפרי",
    flour: { white: 100, wholeWheat: 0, rye: 0, other: 0 },
    hydration: 75,
    salt: 2,
    levain: 20,
    kitchenTemp: 25,
    inclusions: [],
  };

  it("defaults to 500 when missing", () => {
    const parsed = RecipeInputSchema.parse(baseInput);
    expect(parsed.flourWeightGrams).toBe(500);
  });

  it("accepts and round-trips a valid value", () => {
    const parsed = RecipeInputSchema.parse({ ...baseInput, flourWeightGrams: 800 });
    expect(parsed.flourWeightGrams).toBe(800);
  });

  it("rejects below min", () => {
    expect(() =>
      RecipeInputSchema.parse({ ...baseInput, flourWeightGrams: 50 })
    ).toThrow();
  });
});
