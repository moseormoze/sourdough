import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChooserScreen } from "./chooser-screen";
import { saveRecipe } from "@/lib/storage/recipes";
import { saveActiveBake } from "@/lib/storage/active-bake";
import { loadPendingRecipe } from "@/lib/storage/pending-plan";
import { PRESETS } from "@/lib/presets";
import { routerMock } from "../../vitest.setup";

const sampleRecipeInput = {
  name: "שיפון מותאם",
  flour: { white: 80, wholeWheat: 20, rye: 0, other: 0 },
  hydration: 75,
  salt: 2,
  levain: 20,
  kitchenTemp: 25,
  inclusions: [],
};

beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
});

/** Tap a recipe card (press + release). */
function tapCard(cardName: string) {
  const btn = screen.getByRole("button", { name: cardName });
  fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
  fireEvent.pointerUp(btn, { clientX: 0, clientY: 0 });
}

describe("ChooserScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    routerMock.push.mockClear();
    routerMock.back.mockClear();
  });

  // ── Chooser rendering ──────────────────────────────────────────────────────

  it("renders the page title + recipe section heading immediately", () => {
    render(<ChooserScreen />);
    expect(screen.getByRole("heading", { level: 1, name: "בייק חדש" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "איזה סוג לחם?" })).toBeInTheDocument();
  });

  it("back button calls router.back()", () => {
    render(<ChooserScreen />);
    fireEvent.click(screen.getByRole("button", { name: /חזרה/ }));
    expect(routerMock.back).toHaveBeenCalled();
  });

  it("renders all 6 preset cards", () => {
    render(<ChooserScreen />);
    for (const p of PRESETS) {
      expect(screen.getByText(p.name)).toBeInTheDocument();
    }
  });

  it("renders user recipes with the 'שלי' badge", async () => {
    saveRecipe(sampleRecipeInput);
    render(<ChooserScreen />);
    expect(await screen.findByText("שיפון מותאם")).toBeInTheDocument();
    expect(screen.getAllByText("שלי")).toHaveLength(1);
  });

  // ── Navigation to planner ────────────────────────────────────────────────

  it("tapping a preset stashes the recipe and navigates to /bake/plan", async () => {
    render(<ChooserScreen />);
    const country = PRESETS[0]!;
    tapCard(country.name);

    await waitFor(() => {
      expect(routerMock.push).toHaveBeenCalledWith("/bake/plan");
    });
    expect(loadPendingRecipe()?.name).toBe(country.name);
  });

  it("tapping a user recipe stashes that recipe", async () => {
    saveRecipe(sampleRecipeInput);
    render(<ChooserScreen />);
    const card = await screen.findByText("שיפון מותאם");
    fireEvent.pointerDown(card, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(card, { clientX: 0, clientY: 0 });

    await waitFor(() => {
      expect(routerMock.push).toHaveBeenCalledWith("/bake/plan");
    });
    expect(loadPendingRecipe()?.name).toBe("שיפון מותאם");
  });

  // ── Replace-active-bake flow ───────────────────────────────────────────────

  it("tapping a card with an existing active bake opens the abandon dialog (no nav)", async () => {
    const seededRecipe = saveRecipe(sampleRecipeInput);
    saveActiveBake({
      id: "existing",
      recipe: seededRecipe,
      startedAt: 1,
      currentStage: 1,
      stageStartedAt: 1,
      observationChecks: {},
      subStep: 0,
      timerStartedAt: null,
      timerElapsedSeconds: 0,
      bakingMethod: "closed-vessel",
      feedAt: null,
      peakAt: null,
      feedStagePassed: false,
    });

    render(<ChooserScreen />);
    await waitFor(() => {
      expect(screen.getByText(PRESETS[0]!.name)).toBeInTheDocument();
    });
    tapCard(PRESETS[0]!.name);

    expect(routerMock.push).not.toHaveBeenCalled();
    expect(await screen.findByText("להחליף בייק?")).toBeInTheDocument();
    const dialog = document.querySelector("dialog");
    expect(dialog?.textContent).toContain("שיפון מותאם");
  });

  it("confirming abandon stashes the new recipe and navigates to /bake/plan", async () => {
    const seededRecipe = saveRecipe(sampleRecipeInput);
    saveActiveBake({
      id: "existing",
      recipe: seededRecipe,
      startedAt: 1,
      currentStage: 5,
      stageStartedAt: 1,
      observationChecks: {},
      subStep: 0,
      timerStartedAt: null,
      timerElapsedSeconds: 0,
      bakingMethod: "closed-vessel",
      feedAt: null,
      peakAt: null,
      feedStagePassed: false,
    });

    render(<ChooserScreen />);
    const country = PRESETS[0]!;
    await waitFor(() => {
      expect(screen.getByText(country.name)).toBeInTheDocument();
    });

    tapCard(country.name);
    fireEvent.click(await screen.findByRole("button", { name: "כן, להחליף" }));

    await waitFor(() => {
      expect(routerMock.push).toHaveBeenCalledWith("/bake/plan");
    });
    expect(loadPendingRecipe()?.name).toBe(country.name);
  });

  it("cancelling abandon keeps the existing bake and does NOT navigate", async () => {
    const seededRecipe = saveRecipe(sampleRecipeInput);
    saveActiveBake({
      id: "existing",
      recipe: seededRecipe,
      startedAt: 1,
      currentStage: 5,
      stageStartedAt: 1,
      observationChecks: {},
      subStep: 0,
      timerStartedAt: null,
      timerElapsedSeconds: 0,
      bakingMethod: "closed-vessel",
      feedAt: null,
      peakAt: null,
      feedStagePassed: false,
    });

    render(<ChooserScreen />);
    const country = PRESETS[0]!;
    await waitFor(() => {
      expect(screen.getByText(country.name)).toBeInTheDocument();
    });

    tapCard(country.name);
    fireEvent.click(await screen.findByRole("button", { name: "ביטול" }));

    expect(routerMock.push).not.toHaveBeenCalled();
    expect(loadPendingRecipe()).toBeNull();
  });
});
