import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecipeListItem, summarizeRecipe } from "./recipe-list-item";
import { routerMock } from "../../vitest.setup";
import type { Recipe } from "@/lib/types/recipe";

const sample: Recipe = {
  id: "abc-123",
  name: "כפרי קלאסי",
  flour: { white: 80, wholeWheat: 20, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
  hydration: 75,
  salt: 2,
  levain: 20,
  flourWeightGrams: 500,
  kitchenTemp: 25,
  inclusions: [],
  createdAt: 1000,
  updatedAt: 2000,
};

describe("summarizeRecipe", () => {
  it("100% white loaf shows '100% לבן · X% הידרציה'", () => {
    expect(
      summarizeRecipe({
        ...sample,
        flour: { white: 100, wholeWheat: 0, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
        hydration: 72,
      })
    ).toBe("100% לבן · 72% הידרציה");
  });

  it("mostly-white loaf shows the wholewheat percentage as the dominant grain", () => {
    expect(summarizeRecipe(sample)).toBe("20% מלא · 75% הידרציה");
  });

  it("rye-heavy loaf shows rye percentage", () => {
    expect(
      summarizeRecipe({
        ...sample,
        flour: { white: 50, wholeWheat: 0, rye: 50, speltWhite: 0, speltWhole: 0, other: 0 },
        hydration: 78,
      })
    ).toBe("50% שיפון · 78% הידרציה");
  });

  it("includes inclusions count when present", () => {
    expect(
      summarizeRecipe({
        ...sample,
        inclusions: [
          { name: "זיתים", amountGrams: 50 },
          { name: "אגוזים", amountGrams: 30 },
        ],
      })
    ).toBe("20% מלא · 75% הידרציה · 2 תוספות");
  });

  it("omits inclusions when none", () => {
    expect(summarizeRecipe(sample)).not.toContain("תוספות");
  });
});

describe("RecipeListItem", () => {
  beforeEach(() => {
    routerMock.push.mockClear();
  });

  it("renders name and summary", () => {
    render(<RecipeListItem recipe={sample} />);
    expect(screen.getByRole("heading", { name: "כפרי קלאסי" })).toBeInTheDocument();
    expect(screen.getByText(/20% מלא · 75% הידרציה/)).toBeInTheDocument();
  });

  it("navigates to /recipes/{id}/edit on pointer up", () => {
    render(<RecipeListItem recipe={sample} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 5, clientY: 5 });
    fireEvent.pointerUp(btn, { clientX: 5, clientY: 5 });
    expect(routerMock.push).toHaveBeenCalledWith("/recipes/abc-123/edit");
  });

  it("does NOT navigate when pointer drags > 5px", () => {
    render(<RecipeListItem recipe={sample} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
    fireEvent.pointerMove(btn, { clientX: 30, clientY: 0 });
    fireEvent.pointerUp(btn, { clientX: 30, clientY: 0 });
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("navigates on Enter key", () => {
    render(<RecipeListItem recipe={sample} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(routerMock.push).toHaveBeenCalledWith("/recipes/abc-123/edit");
  });

  it("exposes the id on a data attribute", () => {
    render(<RecipeListItem recipe={sample} />);
    expect(screen.getByRole("button")).toHaveAttribute("data-recipe-id", "abc-123");
  });
});
