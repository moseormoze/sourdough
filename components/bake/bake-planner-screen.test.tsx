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

  it("renders the timeline section title and subtitle", () => {
    renderScreen();
    expect(screen.getByText(s.timelineTitle)).toBeInTheDocument();
    expect(screen.getByText(s.timelineSubtitle)).toBeInTheDocument();
  });

  it("renders the temperature question + seasonal hint", () => {
    renderScreen();
    expect(screen.getByText(s.tempQuestion)).toBeInTheDocument();
    expect(screen.getByText(s.tempHint)).toBeInTheDocument();
  });

  it("asks the single out-of-oven question", () => {
    renderScreen();
    expect(screen.getByText(s.readyQuestion)).toBeInTheDocument();
  });

  it("renders the inline retard slider (default 12h) + the estimate note", () => {
    renderScreen();
    const slider = screen.getByRole("slider", { name: s.retardSliderLabel });
    expect(slider).toHaveValue("12");
    expect(screen.getByText(s.timelineEstimateNote)).toBeInTheDocument();
  });

  it("the retard slider can be changed", () => {
    renderScreen();
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
    expect(screen.queryByText(s.timelineSteps.feed.label)).not.toBeInTheDocument();
  });

  it("toggling to 'לא' reveals the feed step in the timeline", async () => {
    renderScreen();
    const no = screen.getByRole("radio", { name: s.starterNo });
    fireEvent.pointerDown(no);
    fireEvent.pointerUp(no);
    await waitFor(() => {
      expect(screen.getByText(s.timelineSteps.feed.label)).toBeInTheDocument();
    });
  });

  it("always shows the separated preheat + bake-in rows and the cooling tip", () => {
    renderScreen();
    expect(screen.getByText(s.timelineSteps.preheat.label)).toBeInTheDocument();
    expect(screen.getByText(s.timelineSteps.bake.label)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(s.coolingTip))).toBeInTheDocument();
  });

  it("back button calls onBack", () => {
    renderScreen();
    fireEvent.click(screen.getByRole("button", { name: s.backToChooser }));
    expect(onBack).toHaveBeenCalled();
  });

  it("confirming calls onConfirm with recipe, method, no feedAt (starter ready), and a peakAt", async () => {
    renderScreen();
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

  it("confirming with starter NOT ready passes a feedAt", async () => {
    renderScreen();
    const no = screen.getByRole("radio", { name: s.starterNo });
    fireEvent.pointerDown(no);
    fireEvent.pointerUp(no);
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
});
