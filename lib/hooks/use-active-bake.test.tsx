import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useActiveBake } from "./use-active-bake";
import { saveRecipe } from "@/lib/storage/recipes";
import { loadActiveBake } from "@/lib/storage/active-bake";

const sample = {
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

describe("useActiveBake", () => {
  it("resolves to loading=false / activeBake=null when nothing saved", async () => {
    const { result } = renderHook(() => useActiveBake());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.activeBake).toBeNull();
  });

  it("loads an existing active bake from storage", async () => {
    const recipe = saveRecipe(sample);
    // pre-seed the storage
    const seeded = {
      id: "abc",
      recipe,
      startedAt: 1000,
      currentStage: 3 as const,
      stageStartedAt: 5000,
      observationChecks: {},
    };
    localStorage.setItem("sourdough:v1:active-bake", JSON.stringify(seeded));

    const { result } = renderHook(() => useActiveBake());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.activeBake?.id).toBe("abc");
    expect(result.current.activeBake?.currentStage).toBe(3);
  });

  it("start() creates an active bake with stage=1 and persists it", async () => {
    const recipe = saveRecipe(sample);
    const { result } = renderHook(() => useActiveBake());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.start(recipe);
    });

    expect(result.current.activeBake?.currentStage).toBe(1);
    expect(result.current.activeBake?.recipe.name).toBe("כפרי");
    expect(loadActiveBake()?.id).toBe(result.current.activeBake?.id);
  });

  it("abandon() clears active bake from state + storage", async () => {
    const recipe = saveRecipe(sample);
    const { result } = renderHook(() => useActiveBake());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.start(recipe);
    });
    expect(result.current.activeBake).not.toBeNull();

    act(() => {
      result.current.abandon();
    });
    expect(result.current.activeBake).toBeNull();
    expect(loadActiveBake()).toBeNull();
  });

  it("advanceTo() updates currentStage and stageStartedAt", async () => {
    const recipe = saveRecipe(sample);
    const { result } = renderHook(() => useActiveBake());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.start(recipe);
    });
    const startedAt = result.current.activeBake?.stageStartedAt ?? 0;

    await new Promise((r) => setTimeout(r, 2));

    act(() => {
      result.current.advanceTo(4);
    });
    expect(result.current.activeBake?.currentStage).toBe(4);
    expect(result.current.activeBake?.stageStartedAt).toBeGreaterThan(startedAt);
    expect(loadActiveBake()?.currentStage).toBe(4);
  });

  it("advanceTo() no-ops when there's no active bake", async () => {
    const { result } = renderHook(() => useActiveBake());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.advanceTo(5);
    });
    expect(result.current.activeBake).toBeNull();
  });
});
