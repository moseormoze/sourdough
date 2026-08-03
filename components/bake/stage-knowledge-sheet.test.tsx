import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getStageKnowledge } from "@/lib/data/stage-knowledge";
import type { Recipe } from "@/lib/types/recipe";
import { StageKnowledgeSheet } from "./stage-knowledge-sheet";

const content = getStageKnowledge(2)!;

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "recipe",
    name: "כפרי",
    flour: {
      white: 50,
      wholeWheat: 50,
      rye: 0,
      speltWhite: 0,
      speltWhole: 0,
      other: 0,
    },
    hydration: 83,
    salt: 2,
    levain: 20,
    flourWeightGrams: 500,
    kitchenTemp: 27,
    inclusions: [],
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

describe("StageKnowledgeSheet", () => {
  it("renders one full guide with mechanism, conceptual graph, and practical close", () => {
    render(
      <StageKnowledgeSheet
        open
        content={content}
        recipe={makeRecipe()}
        onClose={() => {}}
      />,
    );

    const dialogs = screen.getAllByRole("dialog");
    expect(dialogs).toHaveLength(1);
    expect(dialogs[0]?.className).toContain("88svh");
    expect(screen.getByRole("heading", { name: content.title })).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveAttribute("data-variant", "pilot");
    const guide = screen.getByTestId("autolyse-guide-redesign");
    expect(guide).toHaveAttribute("data-colorway", "ambient-glass");
    expect(within(guide).getByTestId("autolyse-guide-intro")).toHaveAttribute(
      "data-surface",
      "glass",
    );
    expect(within(guide).getByTestId("autolyse-guide-mechanism")).toHaveAttribute(
      "data-surface",
      "charcoal",
    );
    expect(within(guide).getByTestId("autolyse-guide-mechanism")).toHaveClass(
      "bg-[#292A28]",
    );
    expect(within(guide).getByTestId("autolyse-guide-graph")).toHaveAttribute(
      "data-surface",
      "glass",
    );
    expect(within(guide).getByTestId("autolyse-guide-recipe")).toHaveAttribute(
      "data-surface",
      "glass",
    );
    expect(within(guide).getByTestId("autolyse-guide-practical")).toHaveAttribute(
      "data-surface",
      "glass",
    );
    expect(within(guide).getAllByTestId("autolyse-guide-inset").length).toBeGreaterThan(3);
    expect(screen.getByText(content.intro)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: content.mechanism.heading }),
    ).toBeInTheDocument();
    expect(screen.getByText(content.mechanism.body)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: content.graph.description })).toBeInTheDocument();
    const plot = screen.getByTestId("autolyse-conceptual-plot");
    expect(plot).toHaveAttribute("data-surface", "inset");
    expect(plot).toHaveClass("bg-ink/[0.03]");
    expect(plot).not.toHaveClass("shadow-inner");
    const graph = screen.getByTestId("autolyse-conceptual-graph");
    expect(graph.querySelectorAll("linearGradient, filter, circle")).toHaveLength(0);
    expect(graph.querySelector('[data-curve="hydration"]')).toHaveClass("text-ink-2");
    expect(graph.querySelector('[data-curve="weakening"]')).toHaveClass("text-accent");
    expect(screen.getByText(content.graph.startLabel)).toBeInTheDocument();
    expect(screen.getByText(content.graph.endLabel)).toBeInTheDocument();
    expect(screen.getByText(content.graph.startLabel).parentElement).toHaveClass("text-ink-2");
    expect(screen.getByText(content.graph.description)).toHaveClass("text-ink-2");
    expect(screen.getByText(content.practicalCheck)).toBeInTheDocument();
    expect(screen.getByText(content.decisionRule)).toBeInTheDocument();
  });

  it("shows no FAQ or troubleshooting branches", () => {
    render(
      <StageKnowledgeSheet
        open
        content={content}
        recipe={makeRecipe()}
        onClose={() => {}}
      />,
    );

    expect(screen.queryByText("שאלות נפוצות")).not.toBeInTheDocument();
    expect(screen.queryByText("אבחון מהיר")).not.toBeInTheDocument();
    expect(screen.queryByText("משהו לא מסתדר?")).not.toBeInTheDocument();
  });

  it("shows at most three recipe-specific factors in their fixed order", () => {
    render(
      <StageKnowledgeSheet
        open
        content={content}
        recipe={makeRecipe()}
        onClose={() => {}}
      />,
    );

    const context = screen.getByRole("region", {
      name: content.recipeContext.heading,
    });
    const factors = within(context).getAllByTestId("autolyse-guidance-factor");
    expect(factors).toHaveLength(3);
    expect(factors[0]).toHaveTextContent("הסובין ממשיך לשתות מים");
    expect(factors[1]).toHaveTextContent("בהידרציה גבוהה");
    expect(factors[2]).toHaveTextContent("במטבח חם");
  });

  it("uses existing recipe labels and isolates numbers for mixed-direction text", () => {
    render(
      <StageKnowledgeSheet
        open
        content={content}
        recipe={makeRecipe()}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("קמח")).toBeInTheDocument();
    expect(screen.getByText("הידרציה")).toBeInTheDocument();
    expect(screen.getByText("טמפ׳ מטבח")).toBeInTheDocument();
    for (const number of ["50%", "83%", "27°C"]) {
      for (const node of screen.getAllByText(number)) {
        expect(node).toHaveAttribute("dir", "ltr");
        expect(node).toHaveClass("num");
      }
    }
  });

  it("keeps content mounted during the close animation", async () => {
    const { rerender } = render(
      <StageKnowledgeSheet
        open
        content={content}
        recipe={makeRecipe()}
        onClose={() => {}}
      />,
    );

    rerender(
      <StageKnowledgeSheet
        open={false}
        content={content}
        recipe={makeRecipe()}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText(content.intro)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument(), {
      timeout: 500,
    });
  });

  it("delegates close to the shared BottomSheet", () => {
    const onClose = vi.fn();
    render(
      <StageKnowledgeSheet
        open
        content={content}
        recipe={makeRecipe()}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "סגור" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
