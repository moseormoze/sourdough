import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getStageKnowledge } from "@/lib/data/stage-knowledge";
import type { Recipe } from "@/lib/types/recipe";
import { StageKnowledgeSheet } from "./stage-knowledge-sheet";

const content = getStageKnowledge(2)!;
// the autolyse guide is the one that carries a graph and a practical check
const graphCopy = content.graph!;
const practicalCheck = content.practicalCheck!;

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
    expect(screen.getByRole("img", { name: graphCopy.description })).toBeInTheDocument();
    const plot = screen.getByTestId("autolyse-conceptual-plot");
    expect(plot).toHaveAttribute("data-surface", "inset");
    expect(plot).toHaveClass("bg-ink/[0.03]");
    expect(plot).not.toHaveClass("shadow-inner");
    const graph = screen.getByTestId("autolyse-conceptual-graph");
    expect(graph.querySelectorAll("linearGradient, filter, circle")).toHaveLength(0);
    expect(graph.querySelector('[data-curve="hydration"]')).toHaveClass("text-ink-2");
    expect(graph.querySelector('[data-curve="weakening"]')).toHaveClass("text-accent");
    expect(screen.getByText(graphCopy.startLabel)).toBeInTheDocument();
    expect(screen.getByText(graphCopy.endLabel)).toBeInTheDocument();
    expect(screen.getByText(graphCopy.startLabel).parentElement).toHaveClass("text-ink-2");
    expect(screen.getByText(graphCopy.description)).toHaveClass("text-ink-2");
    expect(screen.getByText(practicalCheck)).toBeInTheDocument();
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
  it("renders a guide that carries no graph and no practical check (F31 T4)", () => {
    const { graph, practicalCheck: _drop, ...rest } = content;
    void graph;
    void _drop;

    render(
      <StageKnowledgeSheet
        open
        content={rest}
        recipe={makeRecipe()}
        onClose={() => {}}
      />,
    );

    // the sections a bulk-shaped guide omits simply do not paint
    expect(screen.queryByTestId("autolyse-guide-graph")).not.toBeInTheDocument();
    expect(screen.queryByTestId("autolyse-conceptual-graph")).not.toBeInTheDocument();
    expect(screen.queryByText(practicalCheck)).not.toBeInTheDocument();
    // everything else still renders, decision rule included
    expect(screen.getByText(content.intro)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: content.mechanism.heading })).toBeInTheDocument();
    expect(screen.getByText(content.decisionRule)).toBeInTheDocument();
  });
});

describe("StageKnowledgeSheet — bulk guide (F31 T5)", () => {
  const bulk = getStageKnowledge(4)!;

  function openBulk(recipe = makeRecipe(), doughTempC?: number | null) {
    return render(
      <StageKnowledgeSheet
        open
        content={bulk}
        recipe={recipe}
        doughTempC={doughTempC}
        onClose={() => {}}
      />,
    );
  }

  it("renders the guide sections in order and no graph", () => {
    openBulk();
    expect(screen.getByText(bulk.intro)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: bulk.mechanism.heading })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: bulk.folds!.heading })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: bulk.recipeContext.heading })).toBeInTheDocument();
    expect(screen.getByText(bulk.decisionRule)).toBeInTheDocument();
    // locked in design: no quantified axes around rise percentages
    expect(screen.queryByTestId("autolyse-guide-graph")).not.toBeInTheDocument();
    expect(screen.queryByTestId("autolyse-conceptual-graph")).not.toBeInTheDocument();
  });

  it("plays the stretch & fold demo inline and landscape — no card, no nested sheet", () => {
    const { container } = openBulk();
    const folds = screen.getByTestId("guide-folds");
    const iframe = folds.querySelector("iframe")!;
    expect(iframe.getAttribute("src")).toContain("youtube.com/embed/jrDy90gD710");
    expect(iframe.parentElement!.className).toContain("aspect-video");
    // one dialog only: the guide itself
    expect(container.ownerDocument.querySelectorAll('[role="dialog"]').length).toBe(1);
    expect(screen.queryByRole("button", { name: /ככה נראה בצק מוכן/ })).not.toBeInTheDocument();
  });

  it("follows a measured dough temperature over the kitchen temperature", () => {
    const coolKitchen = makeRecipe({ kitchenTemp: 22 });
    openBulk(coolKitchen, 27);
    expect(screen.getByText(bulk.recipeContext.guidance.warmKitchen!)).toBeInTheDocument();
  });

  it("guides a plain white bake — the case the engine picks most often", () => {
    const plain = makeRecipe({
      flour: { white: 100, wholeWheat: 0, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
      hydration: 72,
      kitchenTemp: 22,
    });
    openBulk(plain, null);
    const factors = screen.getAllByTestId("autolyse-guidance-factor");
    expect(factors).toHaveLength(1);
    expect(factors[0]).toHaveTextContent(bulk.recipeContext.guidance.generic!);
  });

  it("skips a factor with no copy rather than rendering a blank paragraph", () => {
    const { generic: _drop, ...rest } = bulk.recipeContext.guidance;
    void _drop;
    render(
      <StageKnowledgeSheet
        open
        content={{ ...bulk, recipeContext: { ...bulk.recipeContext, guidance: rest } }}
        recipe={makeRecipe({
          flour: { white: 100, wholeWheat: 0, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
          hydration: 72,
          kitchenTemp: 22,
        })}
        onClose={() => {}}
      />,
    );
    expect(screen.queryAllByTestId("autolyse-guidance-factor")).toHaveLength(0);
    expect(screen.getByRole("heading", { name: bulk.recipeContext.heading })).toBeInTheDocument();
  });
});

describe("StageKnowledgeSheet — the facts panel names the temperature in play", () => {
  const bulk = getStageKnowledge(4)!;

  it("shows the measured dough temperature when the guidance used it", () => {
    render(
      <StageKnowledgeSheet
        open
        content={bulk}
        recipe={makeRecipe({ kitchenTemp: 22 })}
        doughTempC={27}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText("טמפ׳ הבצק")).toBeInTheDocument();
    expect(screen.getByText("27°C")).toBeInTheDocument();
    expect(screen.queryByText("טמפ׳ מטבח")).not.toBeInTheDocument();
  });

  it("falls back to the kitchen temperature when nothing was measured", () => {
    render(
      <StageKnowledgeSheet
        open
        content={bulk}
        recipe={makeRecipe({ kitchenTemp: 22 })}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText("טמפ׳ מטבח")).toBeInTheDocument();
    expect(screen.getByText("22°C")).toBeInTheDocument();
  });
});
