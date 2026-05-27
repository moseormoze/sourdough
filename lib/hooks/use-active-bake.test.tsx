import { describe, it, expect, beforeEach, vi } from "vitest";
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

describe("useActiveBake — 03 extensions", () => {
  it("advanceSubStep() increments subStep", async () => {
    const recipe = saveRecipe(sample);
    const { result } = renderHook(() => useActiveBake());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.start(recipe); });
    expect(result.current.activeBake?.subStep).toBe(0);
    act(() => { result.current.advanceSubStep(); });
    expect(result.current.activeBake?.subStep).toBe(1);
    act(() => { result.current.advanceSubStep(); });
    expect(result.current.activeBake?.subStep).toBe(2);
  });

  it("advanceTo() resets subStep back to 0", async () => {
    const recipe = saveRecipe(sample);
    const { result } = renderHook(() => useActiveBake());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.start(recipe); });
    act(() => { result.current.advanceSubStep(); });
    act(() => { result.current.advanceSubStep(); });
    act(() => { result.current.advanceTo(5); });
    expect(result.current.activeBake?.subStep).toBe(0);
    expect(result.current.activeBake?.currentStage).toBe(5);
  });

  it("startTimer() sets timerStartedAt and zeroes elapsed; resetTimer() clears both", async () => {
    const recipe = saveRecipe(sample);
    const { result } = renderHook(() => useActiveBake());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.start(recipe); });
    expect(result.current.activeBake?.timerStartedAt).toBeNull();
    expect(result.current.activeBake?.timerElapsedSeconds).toBe(0);
    act(() => { result.current.startTimer(); });
    expect(result.current.activeBake?.timerStartedAt).toBeTruthy();
    expect(result.current.activeBake?.timerElapsedSeconds).toBe(0);
    act(() => { result.current.resetTimer(); });
    expect(result.current.activeBake?.timerStartedAt).toBeNull();
    expect(result.current.activeBake?.timerElapsedSeconds).toBe(0);
  });

  it("pauseTimer() accumulates elapsed and clears startedAt; resumeTimer() restores startedAt while preserving elapsed", async () => {
    const recipe = saveRecipe(sample);
    const { result } = renderHook(() => useActiveBake());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.start(recipe); });

    const t0 = 10_000_000;
    vi.spyOn(Date, "now").mockReturnValue(t0);
    act(() => { result.current.startTimer(); });
    expect(result.current.activeBake?.timerStartedAt).toBe(t0);

    // 20 seconds later, pause
    vi.spyOn(Date, "now").mockReturnValue(t0 + 20_000);
    act(() => { result.current.pauseTimer(); });
    expect(result.current.activeBake?.timerStartedAt).toBeNull();
    expect(result.current.activeBake?.timerElapsedSeconds).toBe(20);

    // Resume 60s later, run another 15s, pause again — total should be 35s
    vi.spyOn(Date, "now").mockReturnValue(t0 + 80_000);
    act(() => { result.current.resumeTimer(); });
    expect(result.current.activeBake?.timerStartedAt).toBe(t0 + 80_000);
    expect(result.current.activeBake?.timerElapsedSeconds).toBe(20);

    vi.spyOn(Date, "now").mockReturnValue(t0 + 95_000);
    act(() => { result.current.pauseTimer(); });
    expect(result.current.activeBake?.timerStartedAt).toBeNull();
    expect(result.current.activeBake?.timerElapsedSeconds).toBe(35);

    vi.restoreAllMocks();
  });

  it("pauseTimer() is a no-op when timer is not running", async () => {
    const recipe = saveRecipe(sample);
    const { result } = renderHook(() => useActiveBake());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.start(recipe); });
    act(() => { result.current.pauseTimer(); });
    expect(result.current.activeBake?.timerStartedAt).toBeNull();
    expect(result.current.activeBake?.timerElapsedSeconds).toBe(0);
  });

  it("resumeTimer() is a no-op when timer is already running", async () => {
    const recipe = saveRecipe(sample);
    const { result } = renderHook(() => useActiveBake());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.start(recipe); });
    act(() => { result.current.startTimer(); });
    const startedAt = result.current.activeBake?.timerStartedAt;
    act(() => { result.current.resumeTimer(); });
    expect(result.current.activeBake?.timerStartedAt).toBe(startedAt);
  });

  it("advanceTo() clears timerStartedAt AND timerElapsedSeconds", async () => {
    const recipe = saveRecipe(sample);
    const { result } = renderHook(() => useActiveBake());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.start(recipe); });
    const t0 = 20_000_000;
    vi.spyOn(Date, "now").mockReturnValue(t0);
    act(() => { result.current.startTimer(); });
    vi.spyOn(Date, "now").mockReturnValue(t0 + 30_000);
    act(() => { result.current.pauseTimer(); });
    expect(result.current.activeBake?.timerElapsedSeconds).toBe(30);

    act(() => { result.current.advanceTo(3); });
    expect(result.current.activeBake?.timerStartedAt).toBeNull();
    expect(result.current.activeBake?.timerElapsedSeconds).toBe(0);

    vi.restoreAllMocks();
  });
});

describe("useActiveBake — 05 baking method", () => {
  it("start() without method defaults to 'closed-vessel'", async () => {
    const recipe = saveRecipe(sample);
    const { result } = renderHook(() => useActiveBake());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.start(recipe); });
    expect(result.current.activeBake?.bakingMethod).toBe("closed-vessel");
  });

  it("start() with explicit method preserves it on the active bake", async () => {
    const recipe = saveRecipe(sample);
    const { result } = renderHook(() => useActiveBake());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.start(recipe, "open-with-steam"); });
    expect(result.current.activeBake?.bakingMethod).toBe("open-with-steam");
    expect(loadActiveBake()?.bakingMethod).toBe("open-with-steam");
  });

  it("legacy active bake without bakingMethod loads with default", async () => {
    const recipe = saveRecipe(sample);
    const legacy = {
      id: "legacy-1",
      recipe,
      startedAt: 1000,
      currentStage: 2 as const,
      stageStartedAt: 2000,
      observationChecks: {},
    };
    localStorage.setItem("sourdough:v1:active-bake", JSON.stringify(legacy));

    const { result } = renderHook(() => useActiveBake());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.activeBake?.bakingMethod).toBe("closed-vessel");
  });
});
