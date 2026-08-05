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
  fireEvent.click(btn, { detail: 1 });
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

  it("renders all 7 preset cards", () => {
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

  // ── Redesigned composition ─────────────────────────────────────────────────

  it("paints the ambient canvas and clears the FAB with bottom padding", () => {
    render(<ChooserScreen />);
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("aria-busy", "false");
    expect(main).not.toHaveClass(
      "bg-[linear-gradient(160deg,_#FFF8F1_0%,_#FFDDBD_22%,_#F7F0E7_55%,_#DDEDF2_100%)]",
    );
    expect(main.parentElement).toHaveClass(
      "bg-[linear-gradient(160deg,_#FFF8F1_0%,_#FFDDBD_22%,_#F7F0E7_55%,_#DDEDF2_100%)]",
    );
    expect(main.parentElement).toHaveClass("min-h-dvh");
    expect(main.parentElement?.className).not.toContain("max-w");
    expect(main).toHaveClass("pb-[calc(9.25rem+env(safe-area-inset-bottom))]");
  });

  it("orders saved rows before the H2, and the H2 before the preset tiles", async () => {
    saveRecipe(sampleRecipeInput);
    render(<ChooserScreen />);

    const row = await screen.findByRole("button", { name: "שיפון מותאם (שלי)" });
    const h2 = screen.getByRole("heading", { level: 2, name: "איזה סוג לחם?" });
    const preset = screen.getByRole("button", { name: PRESETS[0]!.name });

    expect(row.compareDocumentPosition(h2) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(h2.compareDocumentPosition(preset) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders both groups as labelled lists of button rows/tiles", async () => {
    saveRecipe(sampleRecipeInput);
    render(<ChooserScreen />);
    await screen.findByRole("button", { name: "שיפון מותאם (שלי)" });

    const lists = screen.getAllByRole("list");
    expect(lists).toHaveLength(2);
    for (const list of lists) {
      expect(list.tagName).toBe("UL");
      for (const item of Array.from(list.children)) {
        expect(item.tagName).toBe("LI");
        expect(item.querySelector("button")).not.toBeNull();
      }
    }
    expect(screen.getAllByRole("listitem")).toHaveLength(1 + PRESETS.length);
  });

  it("omits the saved group structurally when there are no saved recipes", () => {
    render(<ChooserScreen />);
    expect(screen.getAllByRole("list")).toHaveLength(1);
    expect(screen.queryByText("שלי")).not.toBeInTheDocument();
  });

  it("isolates numeric summary segments in ltr .num spans", async () => {
    saveRecipe(sampleRecipeInput);
    render(<ChooserScreen />);
    const row = await screen.findByRole("button", { name: "שיפון מותאם (שלי)" });

    const nums = row.querySelectorAll('span[dir="ltr"].num');
    expect(nums.length).toBeGreaterThan(0);
    for (const num of Array.from(nums)) {
      expect(num.textContent).not.toContain("·");
      expect(num.textContent).not.toMatch(/[א-ת]/);
    }
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
    fireEvent.click(card, { detail: 1 });

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
      timerDurationSeconds: null,
      bakingMethod: "closed-vessel",
      feedAt: null,
      peakAt: null,
      feedRatio: 2 as const,
      retardHours: 12,
      doughTempC: null,
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
    expect(dialog).toHaveAttribute("data-appearance", "ambient");
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
      timerDurationSeconds: null,
      bakingMethod: "closed-vessel",
      feedAt: null,
      peakAt: null,
      feedRatio: 2 as const,
      retardHours: 12,
      doughTempC: null,
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
      timerDurationSeconds: null,
      bakingMethod: "closed-vessel",
      feedAt: null,
      peakAt: null,
      feedRatio: 2 as const,
      retardHours: 12,
      doughTempC: null,
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

  it("returns focus to the triggering card after cancelling the dialog", async () => {
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
      timerDurationSeconds: null,
      bakingMethod: "closed-vessel",
      feedAt: null,
      peakAt: null,
      feedRatio: 2 as const,
      retardHours: 12,
      doughTempC: null,
    });

    render(<ChooserScreen />);
    const country = PRESETS[0]!;
    await waitFor(() => {
      expect(screen.getByText(country.name)).toBeInTheDocument();
    });

    const trigger = screen.getByRole("button", { name: country.name });
    trigger.focus();
    tapCard(country.name);
    fireEvent.click(await screen.findByRole("button", { name: "ביטול" }));

    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
