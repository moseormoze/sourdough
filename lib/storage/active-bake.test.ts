import { describe, it, expect, beforeEach } from "vitest";
import {
  ACTIVE_BAKE_STORAGE_KEY,
  clearActiveBake,
  loadActiveBake,
  saveActiveBake,
} from "./active-bake";
import { saveRecipe } from "./recipes";

const sampleRecipeInput = {
  name: "כפרי",
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

describe("lib/storage/active-bake", () => {
  it("loadActiveBake returns null when nothing saved", () => {
    expect(loadActiveBake()).toBeNull();
  });

  it("saveActiveBake then loadActiveBake round-trips a valid bake", () => {
    const recipe = saveRecipe(sampleRecipeInput);
    const bake = {
      id: "bake-1",
      recipe,
      startedAt: 1000,
      currentStage: 1 as const,
      stageStartedAt: 1000,
      observationChecks: {},
      subStep: 0,
      timerStartedAt: null,
      timerElapsedSeconds: 0,
      bakingMethod: "closed-vessel" as const,
    };
    saveActiveBake(bake);
    expect(loadActiveBake()).toEqual(bake);
  });

  it("loadActiveBake returns null on malformed JSON", () => {
    localStorage.setItem(ACTIVE_BAKE_STORAGE_KEY, "not-json{");
    expect(loadActiveBake()).toBeNull();
  });

  it("loadActiveBake returns null when schema fails (out-of-range stage)", () => {
    const recipe = saveRecipe(sampleRecipeInput);
    localStorage.setItem(
      ACTIVE_BAKE_STORAGE_KEY,
      JSON.stringify({
        id: "x",
        recipe,
        startedAt: 1,
        currentStage: 99,
        stageStartedAt: 1,
        observationChecks: {},
      })
    );
    expect(loadActiveBake()).toBeNull();
  });

  it("loadActiveBake returns null when missing required field", () => {
    localStorage.setItem(
      ACTIVE_BAKE_STORAGE_KEY,
      JSON.stringify({ id: "x" })
    );
    expect(loadActiveBake()).toBeNull();
  });

  it("clearActiveBake removes the entry", () => {
    const recipe = saveRecipe(sampleRecipeInput);
    saveActiveBake({
      id: "x",
      recipe,
      startedAt: 1,
      currentStage: 1,
      stageStartedAt: 1,
      observationChecks: {},
      subStep: 0,
      timerStartedAt: null,
      timerElapsedSeconds: 0,
      bakingMethod: "closed-vessel" as const,
    });
    expect(loadActiveBake()).not.toBeNull();
    clearActiveBake();
    expect(loadActiveBake()).toBeNull();
  });
});

describe("migration: ActiveBake from before 03 (no subStep / no timerStartedAt)", () => {
  it("loads an old-shaped bake by filling Zod defaults", () => {
    const recipe = saveRecipe(sampleRecipeInput);
    // Simulate an entry written before T1 of feature 03
    localStorage.setItem(
      ACTIVE_BAKE_STORAGE_KEY,
      JSON.stringify({
        id: "old-bake",
        recipe,
        startedAt: 1000,
        currentStage: 4,
        stageStartedAt: 2000,
        observationChecks: {},
      })
    );
    const loaded = loadActiveBake();
    expect(loaded).not.toBeNull();
    expect(loaded?.id).toBe("old-bake");
    expect(loaded?.subStep).toBe(0);
    expect(loaded?.timerStartedAt).toBeNull();
  });
});
