import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BakePlannerScreen } from "./bake-planner-screen";
import { strings } from "@/lib/strings";
import type { Recipe } from "@/lib/types/recipe";

const s = strings.bakeScheduler;

const baseRecipe: Recipe = {
  id: "test-recipe-1",
  name: "לחם כפרי",
  flour: { white: 80, wholeWheat: 20, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
  hydration: 75,
  salt: 2,
  levain: 20,
  flourWeightGrams: 500,
  kitchenTemp: 25,
  inclusions: [],
  createdAt: 1000,
  updatedAt: 1000,
};

describe("BakePlannerScreen", () => {
  let onConfirm: ReturnType<typeof vi.fn>;
  let onBack: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onConfirm = vi.fn();
    onBack = vi.fn();
  });

  function renderScreen() {
    render(
      <BakePlannerScreen recipe={baseRecipe} onConfirm={onConfirm} onBack={onBack} />,
    );
  }

  it("renders the title and recipe name", () => {
    renderScreen();
    expect(screen.getByText(s.headerTitle)).toBeInTheDocument();
    expect(screen.getByText(baseRecipe.name)).toBeInTheDocument();
  });

  it("renders the planning framing title and subtitle", () => {
    renderScreen();
    expect(screen.getByRole("heading", { name: s.planningTitle })).toBeInTheDocument();
    expect(screen.getByText(s.planningSubtitle)).toBeInTheDocument();
  });

  it("renders the temperature importance hint", () => {
    renderScreen();
    expect(screen.getByText(s.tempImportantHint)).toBeInTheDocument();
  });

  it("renders the temperature question + seasonal hint", () => {
    renderScreen();
    expect(screen.getByText(s.tempQuestion)).toBeInTheDocument();
    expect(screen.getByText(s.tempHint)).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Schedule section — preset cards
  // ---------------------------------------------------------------------------

  it("renders schedule section title and subtitle", () => {
    renderScreen();
    expect(screen.getByText(s.scheduleSectionTitle)).toBeInTheDocument();
    expect(screen.getByText(s.scheduleSectionSubtitle)).toBeInTheDocument();
  });

  it("renders all four preset cards by name", () => {
    renderScreen();
    expect(screen.getByRole("radio", { name: s.presets.fast.name })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: s.presets.classic.name })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: s.presets.classicLate.name })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: s.presets.long.name })).toBeInTheDocument();
  });

  it("no preset is selected by default (all aria-checked=false)", () => {
    renderScreen();
    const cards = screen.getAllByRole("radio");
    const presetCards = cards.filter((c) => c.hasAttribute("data-preset"));
    presetCards.forEach((c) => expect(c).toHaveAttribute("aria-checked", "false"));
  });

  it("CTA is disabled by default (no preset selected)", () => {
    renderScreen();
    expect(screen.getByRole("button", { name: s.startButton })).toBeDisabled();
  });

  it("selecting קלאסי preset enables the CTA", async () => {
    renderScreen();
    fireEvent.click(screen.getByRole("radio", { name: s.presets.classic.name }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: s.startButton })).not.toBeDisabled();
    });
  });

  it("selecting קלאסי sets aria-checked=true on that card", async () => {
    renderScreen();
    fireEvent.click(screen.getByRole("radio", { name: s.presets.classic.name }));
    await waitFor(() => {
      expect(
        screen.getByRole("radio", { name: s.presets.classic.name }),
      ).toHaveAttribute("aria-checked", "true");
    });
  });

  it("selecting a preset reveals the inline timeline (bake step labels visible)", async () => {
    renderScreen();
    fireEvent.click(screen.getByRole("radio", { name: s.presets.fast.name }));
    await waitFor(() => {
      expect(screen.getByText(s.timelineSteps.bake.label)).toBeInTheDocument();
    });
  });

  it("old preset pills (הערב/מחר בבוקר/ערב שבת/בוקר שבת) are not rendered", () => {
    renderScreen();
    expect(screen.queryByRole("button", { name: "הערב" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "מחר בבוקר" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ערב שבת" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "בוקר שבת" })).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Advanced disclosure
  // ---------------------------------------------------------------------------

  it("disclosure button shows 'לכוונן בעצמי' when closed", () => {
    renderScreen();
    expect(screen.getByText(s.advancedDisclosureOpen)).toBeInTheDocument();
  });

  it("direction toggle is hidden before disclosure opens", () => {
    renderScreen();
    // The radiogroup with direction options should not be accessible before disclosure opens
    expect(screen.queryByRole("radio", { name: s.directionEnd })).not.toBeVisible();
  });

  it("opening disclosure reveals direction toggle and day picker", async () => {
    renderScreen();
    fireEvent.click(screen.getByText(s.advancedDisclosureOpen));
    await waitFor(() => {
      expect(screen.getByText(s.advancedDisclosureClose)).toBeInTheDocument();
    });
  });

  it("opening disclosure enables the CTA when isValid", async () => {
    renderScreen();
    fireEvent.click(screen.getByText(s.advancedDisclosureOpen));
    // After opening manual mode, isValid=true by default (picker is at earliest valid slot)
    await waitFor(() => {
      expect(screen.getByRole("button", { name: s.startButton })).not.toBeDisabled();
    });
  });

  it("selecting a preset after opening disclosure closes it", async () => {
    renderScreen();
    fireEvent.click(screen.getByText(s.advancedDisclosureOpen));
    await waitFor(() => expect(screen.getByText(s.advancedDisclosureClose)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("radio", { name: s.presets.classic.name }));
    await waitFor(() => {
      expect(screen.getByText(s.advancedDisclosureOpen)).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // F11 regression — controls inside disclosure still work
  // ---------------------------------------------------------------------------

  it("direction toggle works after opening disclosure", async () => {
    renderScreen();
    fireEvent.click(screen.getByText(s.advancedDisclosureOpen));
    await waitFor(() => expect(screen.getByText(s.advancedDisclosureClose)).toBeInTheDocument());
    const startBtn = screen.getByRole("radio", { name: s.directionStart });
    fireEvent.pointerDown(startBtn);
    fireEvent.pointerUp(startBtn);
    await waitFor(() => {
      expect(screen.getByText(s.readyQuestionStart)).toBeInTheDocument();
    });
  });

  it("start mode shows the computed ready-at result inside disclosure", async () => {
    renderScreen();
    fireEvent.click(screen.getByText(s.advancedDisclosureOpen));
    await waitFor(() => expect(screen.getByText(s.advancedDisclosureClose)).toBeInTheDocument());
    fireEvent.pointerDown(screen.getByRole("radio", { name: s.directionStart }));
    fireEvent.pointerUp(screen.getByRole("radio", { name: s.directionStart }));
    await waitFor(() => {
      expect(screen.getByTestId("ready-result")).toBeInTheDocument();
    });
  });

  it("retard slider is visible inside disclosure after opening (default 12h)", async () => {
    renderScreen();
    fireEvent.click(screen.getByText(s.advancedDisclosureOpen));
    await waitFor(() => expect(screen.getByText(s.advancedDisclosureClose)).toBeInTheDocument());
    const slider = screen.getByRole("slider", { name: s.retardSliderLabel });
    expect(slider).toHaveValue("12");
  });

  it("retard slider max is 48 (not 72)", async () => {
    renderScreen();
    fireEvent.click(screen.getByText(s.advancedDisclosureOpen));
    await waitFor(() => expect(screen.getByText(s.advancedDisclosureClose)).toBeInTheDocument());
    const slider = screen.getByRole("slider", { name: s.retardSliderLabel });
    expect(slider).toHaveAttribute("max", "48");
  });

  it("retard slider can be changed inside disclosure", async () => {
    renderScreen();
    fireEvent.click(screen.getByText(s.advancedDisclosureOpen));
    await waitFor(() => expect(screen.getByText(s.advancedDisclosureClose)).toBeInTheDocument());
    const slider = screen.getByRole("slider", { name: s.retardSliderLabel });
    fireEvent.change(slider, { target: { value: "24" } });
    expect(slider).toHaveValue("24");
  });

  it("defaults starterReady=true ('כן' active) and hides the feed row", () => {
    renderScreen();
    expect(screen.getByRole("radio", { name: s.starterYes })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.queryByText(s.timelineSteps.build.label)).not.toBeInTheDocument();
  });

  it("toggling starter to 'לא' reveals the build step in the preset timeline", async () => {
    renderScreen();
    // Select a preset first so the timeline is visible
    fireEvent.click(screen.getByRole("radio", { name: s.presets.classic.name }));
    await waitFor(() => expect(screen.getByText(s.timelineSteps.bake.label)).toBeInTheDocument());
    const no = screen.getByRole("radio", { name: s.starterNo });
    fireEvent.pointerDown(no);
    fireEvent.pointerUp(no);
    await waitFor(() => {
      expect(screen.getByText(s.timelineSteps.build.label)).toBeInTheDocument();
    });
  });

  it("back button calls onBack", () => {
    renderScreen();
    fireEvent.click(screen.getByRole("button", { name: s.backToChooser }));
    expect(onBack).toHaveBeenCalled();
  });

  it("confirming with a preset calls onConfirm (no feedAt, has peakAt)", async () => {
    renderScreen();
    fireEvent.click(screen.getByRole("radio", { name: s.presets.classic.name }));
    await waitFor(() => expect(screen.getByRole("button", { name: s.startButton })).not.toBeDisabled());
    fireEvent.click(screen.getByRole("button", { name: s.startButton }));
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ name: baseRecipe.name }),
        "closed-vessel",
        undefined,
        expect.any(Date),
      );
    });
  });

  it("confirming via manual with starter NOT ready passes a feedAt", async () => {
    renderScreen();
    // Toggle starter off
    const no = screen.getByRole("radio", { name: s.starterNo });
    fireEvent.pointerDown(no);
    fireEvent.pointerUp(no);
    // Select a preset
    fireEvent.click(screen.getByRole("radio", { name: s.presets.classic.name }));
    await waitFor(() => expect(screen.getByRole("button", { name: s.startButton })).not.toBeDisabled());
    fireEvent.click(screen.getByRole("button", { name: s.startButton }));
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ name: baseRecipe.name }),
        "closed-vessel",
        expect.any(Date),
        expect.any(Date),
      );
    });
  });

  it("selecting a different baking method passes it to onConfirm", async () => {
    renderScreen();
    fireEvent.click(screen.getByRole("radio", { name: s.presets.classic.name }));
    await waitFor(() => expect(screen.getByRole("button", { name: s.startButton })).not.toBeDisabled());
    fireEvent.click(screen.getByText("אפייה פתוחה + תבנית אדים"));
    fireEvent.click(screen.getByRole("button", { name: s.startButton }));
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ name: baseRecipe.name }),
        "open-with-steam",
        undefined,
        expect.any(Date),
      );
    });
  });

  it("always shows preheat + bake rows when a preset is selected", async () => {
    renderScreen();
    fireEvent.click(screen.getByRole("radio", { name: s.presets.fast.name }));
    await waitFor(() => {
      expect(screen.getByText(s.timelineSteps.preheat.label)).toBeInTheDocument();
      expect(screen.getByText(s.timelineSteps.bake.label)).toBeInTheDocument();
    });
  });
});
