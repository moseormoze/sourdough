import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BakeSchedulerSheet } from "./bake-scheduler-sheet";
import { strings } from "@/lib/strings";
import type { Recipe } from "@/lib/types/recipe";

const s = strings.bakeScheduler;

const baseRecipe: Recipe = {
  id: "test-recipe-1",
  name: "לחם כפרי",
  flour: { white: 80, wholeWheat: 20, rye: 0, other: 0 },
  hydration: 75,
  salt: 2,
  levain: 20,
  flourWeightGrams: 500,
  kitchenTemp: 25,
  inclusions: [],
  createdAt: 1000,
  updatedAt: 1000,
};

describe("BakeSchedulerSheet", () => {
  let onConfirm: ReturnType<typeof vi.fn>;
  let onClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onConfirm = vi.fn();
    onClose = vi.fn();
  });

  it("renders the recipe name and header title", () => {
    render(
      <BakeSchedulerSheet
        recipe={baseRecipe}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    expect(screen.getByText(s.headerTitle)).toBeInTheDocument();
    expect(screen.getByText(baseRecipe.name)).toBeInTheDocument();
  });

  it("renders starter toggle with label", () => {
    render(
      <BakeSchedulerSheet
        recipe={baseRecipe}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    expect(screen.getByText(s.starterLabel)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: s.starterYes })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: s.starterNo })).toBeInTheDocument();
  });

  it("defaults to starterReady=true ('כן' is active)", () => {
    render(
      <BakeSchedulerSheet
        recipe={baseRecipe}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    expect(screen.getByRole("radio", { name: s.starterYes })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("renders BakingMethodSelector with closed-vessel as default", () => {
    render(
      <BakeSchedulerSheet
        recipe={baseRecipe}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    const radios = screen.getAllByRole("radio");
    const methodRadios = radios.filter((r) =>
      ["סיר/כלי סגור", "אפייה פתוחה + תבנית אדים", "אחר / לא בטוח"].some((label) =>
        r.textContent?.includes(label),
      ),
    );
    const checked = methodRadios.find((r) => r.getAttribute("aria-checked") === "true");
    expect(checked?.textContent).toContain("סיר/כלי סגור");
  });

  it("Escape key calls onClose", () => {
    render(
      <BakeSchedulerSheet
        recipe={baseRecipe}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("backdrop click calls onClose", () => {
    render(
      <BakeSchedulerSheet
        recipe={baseRecipe}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    // The backdrop is the first child of the dialog container
    const dialog = screen.getByRole("dialog");
    const backdrop = dialog.querySelector(".absolute.inset-0") as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("clicking 'התחל בייק' calls onConfirm with the recipe and baking method", async () => {
    render(
      <BakeSchedulerSheet
        recipe={baseRecipe}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    const startBtn = screen.getByRole("button", { name: s.startButton });
    fireEvent.click(startBtn);
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ name: baseRecipe.name }),
        "closed-vessel",
        undefined,
        expect.any(Date),
      );
    });
  });

  it("toggling to 'לא' shows the feed timeline row ('האכלת סטארטר')", async () => {
    render(
      <BakeSchedulerSheet
        recipe={baseRecipe}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    const noOption = screen.getByRole("radio", { name: s.starterNo });
    fireEvent.pointerDown(noOption);
    fireEvent.pointerUp(noOption);

    await waitFor(() => {
      expect(screen.getByText(s.timelineFeedLabel)).toBeInTheDocument();
    });
  });

  it("with starterReady=true, 'האכלת סטארטר' is NOT shown", () => {
    render(
      <BakeSchedulerSheet
        recipe={baseRecipe}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    expect(screen.queryByText(s.timelineFeedLabel)).not.toBeInTheDocument();
  });

  it("always shows levain and done rows in the timeline", () => {
    render(
      <BakeSchedulerSheet
        recipe={baseRecipe}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    expect(screen.getByText(s.timelineLevainLabel)).toBeInTheDocument();
    expect(screen.getByText(s.timelineDoneLabel)).toBeInTheDocument();
  });

  it("selecting a different baking method passes it to onConfirm", async () => {
    render(
      <BakeSchedulerSheet
        recipe={baseRecipe}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
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
