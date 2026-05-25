import { describe, it, expect } from "vitest";
import {
  emptyRecipeFormValues,
  flourTotal,
  hasAnyError,
  validateRecipe,
} from "./validate-recipe";

const valid = () => ({
  name: "כפרי",
  flour: { white: 80, wholeWheat: 20, rye: 0, other: 0 },
  hydration: 75,
  salt: 2,
  levain: 20,
  kitchenTemp: 25,
  inclusions: [],
});

describe("validateRecipe", () => {
  it("returns all-null errors for a valid recipe", () => {
    const errors = validateRecipe(valid());
    expect(hasAnyError(errors)).toBe(false);
  });

  it("flags empty name", () => {
    const errors = validateRecipe({ ...valid(), name: "  " });
    expect(errors.name).toBeTruthy();
  });

  it("flags flour sum < 100 with current total in message", () => {
    const errors = validateRecipe({
      ...valid(),
      flour: { white: 70, wholeWheat: 20, rye: 0, other: 0 },
    });
    expect(errors.flour).toContain("90");
  });

  it("flags flour sum > 100", () => {
    const errors = validateRecipe({
      ...valid(),
      flour: { white: 80, wholeWheat: 20, rye: 20, other: 0 },
    });
    expect(errors.flour).toBeTruthy();
  });

  it("flags hydration below 50% or above 100%", () => {
    expect(validateRecipe({ ...valid(), hydration: 30 }).hydration).toBeTruthy();
    expect(validateRecipe({ ...valid(), hydration: 110 }).hydration).toBeTruthy();
  });

  it("flags salt outside 0-5", () => {
    expect(validateRecipe({ ...valid(), salt: -1 }).salt).toBeTruthy();
    expect(validateRecipe({ ...valid(), salt: 10 }).salt).toBeTruthy();
  });

  it("flags levain outside 0-40", () => {
    expect(validateRecipe({ ...valid(), levain: -1 }).levain).toBeTruthy();
    expect(validateRecipe({ ...valid(), levain: 50 }).levain).toBeTruthy();
  });

  it("flags kitchenTemp outside 10-40", () => {
    expect(validateRecipe({ ...valid(), kitchenTemp: 5 }).kitchenTemp).toBeTruthy();
    expect(validateRecipe({ ...valid(), kitchenTemp: 50 }).kitchenTemp).toBeTruthy();
  });

  it("flags empty numeric field as out of range", () => {
    expect(validateRecipe({ ...valid(), hydration: "" }).hydration).toBeTruthy();
  });

  it("emptyRecipeFormValues seeds kitchenTemp to 25 (default)", () => {
    const empty = emptyRecipeFormValues();
    expect(empty.kitchenTemp).toBe(25);
    expect(empty.name).toBe("");
  });

  it("flourTotal sums the four flour fields, treating '' as 0", () => {
    expect(flourTotal({ white: 80, wholeWheat: 20, rye: 0, other: 0 })).toBe(100);
    expect(flourTotal({ white: "", wholeWheat: 20, rye: 0, other: 0 })).toBe(20);
    expect(flourTotal({ white: 50, wholeWheat: 50, rye: 50, other: "" })).toBe(150);
  });
});
