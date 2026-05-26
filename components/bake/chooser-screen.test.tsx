import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChooserScreen } from "./chooser-screen";
import { saveRecipe } from "@/lib/storage/recipes";
import { loadActiveBake, saveActiveBake } from "@/lib/storage/active-bake";
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

describe("ChooserScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    routerMock.push.mockClear();
    routerMock.back.mockClear();
  });

  it("renders the page title 'במה אופים?'", () => {
    render(<ChooserScreen />);
    expect(
      screen.getByRole("heading", { name: "במה אופים?" })
    ).toBeInTheDocument();
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
    // The "שלי" badge appears exactly once (no preset is mine).
    expect(screen.getAllByText("שלי")).toHaveLength(1);
  });

  it("user recipe count grows with the gallery", async () => {
    saveRecipe(sampleRecipeInput);
    saveRecipe({ ...sampleRecipeInput, name: "אחר" });
    render(<ChooserScreen />);
    expect(await screen.findByText("שיפון מותאם")).toBeInTheDocument();
    expect(screen.getByText("אחר")).toBeInTheDocument();
  });

  it("tapping a preset starts an active bake and navigates to /bake/stage/1", async () => {
    render(<ChooserScreen />);
    const country = PRESETS[0]!;
    const btn = screen.getByRole("button", { name: country.name });
    fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(btn, { clientX: 0, clientY: 0 });
    await waitFor(() => {
      expect(loadActiveBake()?.recipe.name).toBe(country.name);
    });
    expect(routerMock.push).toHaveBeenCalledWith("/bake/stage/1");
  });

  it("renders the BakingMethodSelector with closed-vessel as default", () => {
    render(<ChooserScreen />);
    expect(screen.getByText("באיזה כלי תאפה?")).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    const checked = radios.find((r) => r.getAttribute("aria-checked") === "true");
    expect(checked).toHaveTextContent("סיר/כלי סגור");
  });

  it("default bake start writes bakingMethod='closed-vessel' to the active bake", async () => {
    render(<ChooserScreen />);
    const country = PRESETS[0]!;
    const btn = screen.getByRole("button", { name: country.name });
    fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(btn, { clientX: 0, clientY: 0 });
    await waitFor(() => {
      expect(loadActiveBake()?.bakingMethod).toBe("closed-vessel");
    });
  });

  it("picking a different method before starting persists it on the active bake", async () => {
    render(<ChooserScreen />);
    fireEvent.click(screen.getByText("אפייה פתוחה + תבנית אדים"));
    const country = PRESETS[0]!;
    const btn = screen.getByRole("button", { name: country.name });
    fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(btn, { clientX: 0, clientY: 0 });
    await waitFor(() => {
      expect(loadActiveBake()?.bakingMethod).toBe("open-with-steam");
    });
  });

  it("tapping a card with an existing active bake opens the abandon dialog (does NOT navigate yet)", async () => {
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
      bakingMethod: "closed-vessel",
    });

    render(<ChooserScreen />);
    // wait for active bake to load
    await waitFor(() => {
      // any preset card
      expect(screen.getByText(PRESETS[0]!.name)).toBeInTheDocument();
    });
    const country = PRESETS[0]!;
    const btn = screen.getByRole("button", { name: country.name });
    fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(btn, { clientX: 0, clientY: 0 });

    expect(routerMock.push).not.toHaveBeenCalled();
    expect(await screen.findByText("להחליף בייק?")).toBeInTheDocument();
    // The dialog body includes the existing recipe name; assert via the dialog body element specifically.
    const dialog = document.querySelector("dialog");
    expect(dialog?.textContent).toContain("שיפון מותאם");
  });

  it("confirming abandon replaces the existing bake with the new one and navigates", async () => {
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
      bakingMethod: "closed-vessel",
    });

    render(<ChooserScreen />);
    const country = PRESETS[0]!;
    await waitFor(() => {
      expect(screen.getByText(country.name)).toBeInTheDocument();
    });

    fireEvent.pointerDown(screen.getByRole("button", { name: country.name }), {
      clientX: 0,
      clientY: 0,
    });
    fireEvent.pointerUp(screen.getByRole("button", { name: country.name }), {
      clientX: 0,
      clientY: 0,
    });
    fireEvent.click(await screen.findByRole("button", { name: "כן, להחליף" }));

    await waitFor(() => {
      expect(loadActiveBake()?.recipe.name).toBe(country.name);
    });
    expect(routerMock.push).toHaveBeenCalledWith("/bake/stage/1");
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
      bakingMethod: "closed-vessel",
    });

    render(<ChooserScreen />);
    const country = PRESETS[0]!;
    await waitFor(() => {
      expect(screen.getByText(country.name)).toBeInTheDocument();
    });

    fireEvent.pointerDown(screen.getByRole("button", { name: country.name }), {
      clientX: 0,
      clientY: 0,
    });
    fireEvent.pointerUp(screen.getByRole("button", { name: country.name }), {
      clientX: 0,
      clientY: 0,
    });
    fireEvent.click(await screen.findByRole("button", { name: "ביטול" }));

    expect(loadActiveBake()?.id).toBe("existing");
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("back button calls router.back()", () => {
    render(<ChooserScreen />);
    fireEvent.click(screen.getByRole("button", { name: /חזרה/ }));
    expect(routerMock.back).toHaveBeenCalled();
  });
});
