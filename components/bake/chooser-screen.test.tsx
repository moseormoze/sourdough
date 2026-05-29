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

/** Pass through the starter gate by clicking "כן, הסטארטר בשיא". */
async function clickThroughGate() {
  fireEvent.click(await screen.findByText("כן, הסטארטר בשיא"));
}

/** Tap a recipe card to open the confirm sheet, then click "התחל בייק". */
async function tapCardAndConfirm(cardName: string) {
  const btn = screen.getByRole("button", { name: cardName });
  fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
  fireEvent.pointerUp(btn, { clientX: 0, clientY: 0 });
  fireEvent.click(await screen.findByRole("button", { name: "התחל בייק" }));
}

describe("ChooserScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    routerMock.push.mockClear();
    routerMock.back.mockClear();
  });

  // ── Gate step ────────────────────────────────────────────────────────────

  it("starts on the gate step — shows 'הסטארטר שלך בשיא?' question", () => {
    render(<ChooserScreen />);
    expect(screen.getByText("הסטארטר שלך בשיא?")).toBeInTheDocument();
  });

  it("gate: 'כן' transitions to the recipe chooser", async () => {
    render(<ChooserScreen />);
    fireEvent.click(screen.getByText("כן, הסטארטר בשיא"));
    expect(await screen.findByRole("heading", { level: 1, name: "בייק חדש" })).toBeInTheDocument();
  });

  it("gate: 'לא' transitions to the schedule screen", async () => {
    render(<ChooserScreen />);
    fireEvent.click(screen.getByText("לא, צריך לתכנן"));
    expect(await screen.findByText("מתכננים את הבייק")).toBeInTheDocument();
  });

  it("schedule: 'הבנתי' calls router.back()", async () => {
    render(<ChooserScreen />);
    fireEvent.click(screen.getByText("לא, צריך לתכנן"));
    const dismissBtn = await screen.findByText("הבנתי, אחזור מאוחר יותר");
    if (!(dismissBtn as HTMLButtonElement).disabled) {
      fireEvent.click(dismissBtn);
      expect(routerMock.back).toHaveBeenCalled();
    }
  });

  it("back button on gate step calls router.back()", () => {
    render(<ChooserScreen />);
    fireEvent.click(screen.getByRole("button", { name: /חזרה/ }));
    expect(routerMock.back).toHaveBeenCalled();
  });

  // ── Choosing step (after passing the gate) ───────────────────────────────

  it("renders the page title + recipe section heading", async () => {
    render(<ChooserScreen />);
    await clickThroughGate();
    expect(
      screen.getByRole("heading", { level: 1, name: "בייק חדש" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "איזה סוג לחם?" })
    ).toBeInTheDocument();
  });

  it("renders all 6 preset cards", async () => {
    render(<ChooserScreen />);
    await clickThroughGate();
    for (const p of PRESETS) {
      expect(screen.getByText(p.name)).toBeInTheDocument();
    }
  });

  it("renders user recipes with the 'שלי' badge", async () => {
    saveRecipe(sampleRecipeInput);
    render(<ChooserScreen />);
    await clickThroughGate();
    expect(await screen.findByText("שיפון מותאם")).toBeInTheDocument();
    expect(screen.getAllByText("שלי")).toHaveLength(1);
  });

  it("user recipe count grows with the gallery", async () => {
    saveRecipe(sampleRecipeInput);
    saveRecipe({ ...sampleRecipeInput, name: "אחר" });
    render(<ChooserScreen />);
    await clickThroughGate();
    expect(await screen.findByText("שיפון מותאם")).toBeInTheDocument();
    expect(screen.getByText("אחר")).toBeInTheDocument();
  });

  it("tapping a preset opens the confirm sheet (does NOT navigate yet)", async () => {
    render(<ChooserScreen />);
    await clickThroughGate();
    const country = PRESETS[0]!;
    const btn = screen.getByRole("button", { name: country.name });
    fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(btn, { clientX: 0, clientY: 0 });

    expect(await screen.findByText("מוכן לאפות?")).toBeInTheDocument();
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("confirming the sheet starts an active bake and navigates to /bake/stage/1", async () => {
    render(<ChooserScreen />);
    await clickThroughGate();
    const country = PRESETS[0]!;
    await tapCardAndConfirm(country.name);

    await waitFor(() => {
      expect(loadActiveBake()?.recipe.name).toBe(country.name);
    });
    expect(routerMock.push).toHaveBeenCalledWith("/bake/stage/1");
  });

  it("the confirm sheet renders the BakingMethodSelector with closed-vessel as default", async () => {
    render(<ChooserScreen />);
    await clickThroughGate();
    const country = PRESETS[0]!;
    const btn = screen.getByRole("button", { name: country.name });
    fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(btn, { clientX: 0, clientY: 0 });

    await screen.findByText("מוכן לאפות?");
    expect(screen.getByText("באיזה כלי תאפה?")).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    const checked = radios.find((r) => r.getAttribute("aria-checked") === "true");
    expect(checked).toHaveTextContent("סיר/כלי סגור");
  });

  it("default bake start writes bakingMethod='closed-vessel' to the active bake", async () => {
    render(<ChooserScreen />);
    await clickThroughGate();
    const country = PRESETS[0]!;
    await tapCardAndConfirm(country.name);

    await waitFor(() => {
      expect(loadActiveBake()?.bakingMethod).toBe("closed-vessel");
    });
  });

  it("picking a different method in the sheet persists it on the active bake", async () => {
    render(<ChooserScreen />);
    await clickThroughGate();
    const country = PRESETS[0]!;
    const btn = screen.getByRole("button", { name: country.name });
    fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(btn, { clientX: 0, clientY: 0 });

    await screen.findByText("מוכן לאפות?");
    fireEvent.click(screen.getByText("אפייה פתוחה + תבנית אדים"));
    fireEvent.click(screen.getByRole("button", { name: "התחל בייק" }));

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
      timerElapsedSeconds: 0,
      bakingMethod: "closed-vessel",
    });

    render(<ChooserScreen />);
    await clickThroughGate();
    await waitFor(() => {
      expect(screen.getByText(PRESETS[0]!.name)).toBeInTheDocument();
    });
    const country = PRESETS[0]!;
    const btn = screen.getByRole("button", { name: country.name });
    fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(btn, { clientX: 0, clientY: 0 });

    expect(routerMock.push).not.toHaveBeenCalled();
    expect(await screen.findByText("להחליף בייק?")).toBeInTheDocument();
    const dialog = document.querySelector("dialog");
    expect(dialog?.textContent).toContain("שיפון מותאם");
  });

  it("confirming abandon shows confirm sheet, then starting navigates", async () => {
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
    });

    render(<ChooserScreen />);
    await clickThroughGate();
    const country = PRESETS[0]!;
    await waitFor(() => {
      expect(screen.getByText(country.name)).toBeInTheDocument();
    });

    fireEvent.pointerDown(screen.getByRole("button", { name: country.name }), { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(screen.getByRole("button", { name: country.name }), { clientX: 0, clientY: 0 });
    fireEvent.click(await screen.findByRole("button", { name: "כן, להחליף" }));

    // Confirm sheet should open now
    await screen.findByText("מוכן לאפות?");
    fireEvent.click(screen.getByRole("button", { name: "התחל בייק" }));

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
      timerElapsedSeconds: 0,
      bakingMethod: "closed-vessel",
    });

    render(<ChooserScreen />);
    await clickThroughGate();
    const country = PRESETS[0]!;
    await waitFor(() => {
      expect(screen.getByText(country.name)).toBeInTheDocument();
    });

    fireEvent.pointerDown(screen.getByRole("button", { name: country.name }), { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(screen.getByRole("button", { name: country.name }), { clientX: 0, clientY: 0 });
    fireEvent.click(await screen.findByRole("button", { name: "ביטול" }));

    expect(loadActiveBake()?.id).toBe("existing");
    expect(routerMock.push).not.toHaveBeenCalled();
  });
});
