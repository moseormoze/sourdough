import { describe, it, expect, beforeEach } from "vitest";
import {
  listRecipes,
  getRecipe,
  saveRecipe,
  deleteRecipe,
  STORAGE_KEY,
} from "./recipes";

const sampleInput = {
  name: "כפרי קלאסי",
  flour: { white: 80, wholeWheat: 20, rye: 0, other: 0 },
  hydration: 75,
  salt: 2,
  levain: 20,
  kitchenTemp: 25,
  inclusions: [],
};

beforeEach(() => {
  localStorage.clear();
});

describe("lib/storage/recipes", () => {
  it("listRecipes returns empty when nothing saved", () => {
    expect(listRecipes()).toEqual([]);
  });

  it("saveRecipe persists a new recipe with generated id and timestamps", () => {
    const saved = saveRecipe(sampleInput);
    expect(saved.id).toBeTruthy();
    expect(saved.createdAt).toBeGreaterThan(0);
    expect(saved.updatedAt).toBe(saved.createdAt);
    expect(listRecipes()).toHaveLength(1);
  });

  it("getRecipe returns saved recipe by id", () => {
    const saved = saveRecipe(sampleInput);
    expect(getRecipe(saved.id)).toEqual(saved);
  });

  it("getRecipe returns null for missing id", () => {
    expect(getRecipe("nonexistent")).toBeNull();
  });

  it("re-saving an existing recipe updates updatedAt but keeps createdAt and id", async () => {
    const r1 = saveRecipe(sampleInput);
    await new Promise((resolve) => setTimeout(resolve, 5));
    const r2 = saveRecipe({ ...r1, name: "שונה" });
    expect(r2.id).toBe(r1.id);
    expect(r2.createdAt).toBe(r1.createdAt);
    expect(r2.updatedAt).toBeGreaterThan(r1.updatedAt);
    expect(r2.name).toBe("שונה");
    expect(listRecipes()).toHaveLength(1);
  });

  it("listRecipes returns sorted by updatedAt desc", async () => {
    const r1 = saveRecipe(sampleInput);
    await new Promise((resolve) => setTimeout(resolve, 5));
    const r2 = saveRecipe({ ...sampleInput, name: "שני" });
    const list = listRecipes();
    expect(list).toHaveLength(2);
    expect(list[0]?.id).toBe(r2.id);
    expect(list[1]?.id).toBe(r1.id);
  });

  it("deleteRecipe removes the recipe", () => {
    const saved = saveRecipe(sampleInput);
    deleteRecipe(saved.id);
    expect(getRecipe(saved.id)).toBeNull();
    expect(listRecipes()).toEqual([]);
  });

  it("saveRecipe rejects flour not summing to 100", () => {
    expect(() =>
      saveRecipe({ ...sampleInput, flour: { white: 50, wholeWheat: 50, rye: 50, other: 0 } })
    ).toThrow();
    expect(() =>
      saveRecipe({ ...sampleInput, flour: { white: 50, wholeWheat: 30, rye: 0, other: 0 } })
    ).toThrow();
  });

  it("saveRecipe rejects hydration out of range", () => {
    expect(() => saveRecipe({ ...sampleInput, hydration: 30 })).toThrow();
    expect(() => saveRecipe({ ...sampleInput, hydration: 150 })).toThrow();
  });

  it("saveRecipe rejects salt out of range", () => {
    expect(() => saveRecipe({ ...sampleInput, salt: -1 })).toThrow();
    expect(() => saveRecipe({ ...sampleInput, salt: 10 })).toThrow();
  });

  it("saveRecipe rejects levain out of range", () => {
    expect(() => saveRecipe({ ...sampleInput, levain: -1 })).toThrow();
    expect(() => saveRecipe({ ...sampleInput, levain: 50 })).toThrow();
  });

  it("saveRecipe rejects kitchenTemp out of range", () => {
    expect(() => saveRecipe({ ...sampleInput, kitchenTemp: 5 })).toThrow();
    expect(() => saveRecipe({ ...sampleInput, kitchenTemp: 50 })).toThrow();
  });

  it("saveRecipe rejects empty name", () => {
    expect(() => saveRecipe({ ...sampleInput, name: "" })).toThrow();
  });

  it("saveRecipe rejects inclusion with empty name or non-positive amount", () => {
    expect(() =>
      saveRecipe({ ...sampleInput, inclusions: [{ name: "", amountGrams: 50 }] })
    ).toThrow();
    expect(() =>
      saveRecipe({ ...sampleInput, inclusions: [{ name: "זיתים", amountGrams: 0 }] })
    ).toThrow();
    expect(() =>
      saveRecipe({ ...sampleInput, inclusions: [{ name: "זיתים", amountGrams: -10 }] })
    ).toThrow();
  });

  it("listRecipes filters corrupted entries (schema failures)", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: "1", name: "missing fields" },
        { id: "2", junk: true },
      ])
    );
    expect(listRecipes()).toEqual([]);
  });

  it("listRecipes returns empty when storage has malformed JSON", () => {
    localStorage.setItem(STORAGE_KEY, "not-json{");
    expect(listRecipes()).toEqual([]);
  });

  it("listRecipes returns empty when storage value is not an array", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: "an array" }));
    expect(listRecipes()).toEqual([]);
  });
});
