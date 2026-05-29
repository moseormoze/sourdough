import { describe, it, expect, beforeEach } from "vitest";
import {
  PENDING_PLAN_STORAGE_KEY,
  savePendingRecipe,
  loadPendingRecipe,
  clearPendingRecipe,
} from "./pending-plan";
import type { Recipe } from "@/lib/types/recipe";

const recipe: Recipe = {
  id: "r-1",
  name: "כפרי",
  flour: { white: 80, wholeWheat: 20, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
  hydration: 75,
  salt: 2,
  levain: 20,
  flourWeightGrams: 500,
  kitchenTemp: 25,
  inclusions: [],
  createdAt: 1,
  updatedAt: 1,
};

beforeEach(() => {
  sessionStorage.clear();
});

describe("lib/storage/pending-plan", () => {
  it("loadPendingRecipe returns null when nothing saved", () => {
    expect(loadPendingRecipe()).toBeNull();
  });

  it("save then load round-trips the recipe", () => {
    savePendingRecipe(recipe);
    expect(loadPendingRecipe()).toEqual(recipe);
  });

  it("loadPendingRecipe returns null on malformed JSON", () => {
    sessionStorage.setItem(PENDING_PLAN_STORAGE_KEY, "not-json{");
    expect(loadPendingRecipe()).toBeNull();
  });

  it("loadPendingRecipe returns null when schema fails", () => {
    sessionStorage.setItem(PENDING_PLAN_STORAGE_KEY, JSON.stringify({ id: "x" }));
    expect(loadPendingRecipe()).toBeNull();
  });

  it("clearPendingRecipe removes the entry", () => {
    savePendingRecipe(recipe);
    expect(loadPendingRecipe()).not.toBeNull();
    clearPendingRecipe();
    expect(loadPendingRecipe()).toBeNull();
  });
});
