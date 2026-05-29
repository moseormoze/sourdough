import { describe, it, expect } from "vitest";
import { RecipeSchema, RecipeInputSchema, FlourSchema } from "./recipe";

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

describe("FlourSchema — spelt fields + migration", () => {
  it("parses a legacy flour ({white,wholeWheat,rye,other:0}) with spelt defaulting to 0", () => {
    const parsed = FlourSchema.parse({ white: 100, wholeWheat: 0, rye: 0, other: 0 });
    expect(parsed.speltWhite).toBe(0);
    expect(parsed.speltWhole).toBe(0);
  });

  it("parses a legacy flour with no spelt and no other keys, defaulting both to 0", () => {
    const parsed = FlourSchema.parse({ white: 100, wholeWheat: 0, rye: 0 });
    expect(parsed.speltWhite).toBe(0);
    expect(parsed.speltWhole).toBe(0);
    expect(parsed.other).toBe(0);
  });

  it("accepts a new flour using spelt fields that sums to 100", () => {
    const parsed = FlourSchema.parse({
      white: 50,
      wholeWheat: 0,
      rye: 0,
      speltWhite: 0,
      speltWhole: 50,
    });
    expect(parsed.speltWhole).toBe(50);
  });

  it("rejects when the five fields (+other) do not sum to 100", () => {
    expect(() =>
      FlourSchema.parse({ white: 50, wholeWheat: 0, rye: 0, speltWhite: 0, speltWhole: 40 })
    ).toThrow();
  });

  it("sums all five fields plus other toward 100", () => {
    const parsed = FlourSchema.parse({
      white: 20,
      wholeWheat: 20,
      rye: 20,
      speltWhite: 20,
      speltWhole: 20,
    });
    expect(parsed.white).toBe(20);
  });
});
