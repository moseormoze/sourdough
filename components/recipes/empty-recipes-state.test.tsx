import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyRecipesState } from "./empty-recipes-state";
import { routerMock } from "../../vitest.setup";

describe("EmptyRecipesState", () => {
  beforeEach(() => {
    routerMock.push.mockClear();
  });

  it("renders the empty title and description", () => {
    render(<EmptyRecipesState />);
    expect(screen.getByText("עדיין אין מתכונים")).toBeInTheDocument();
    expect(
      screen.getByText("הוסף את המתכון הראשון שלך כדי להתחיל")
    ).toBeInTheDocument();
  });

  it("renders a primary CTA labelled '+ מתכון חדש'", () => {
    render(<EmptyRecipesState />);
    expect(screen.getByRole("button", { name: "+ מתכון חדש" })).toBeInTheDocument();
  });

  it("navigates to /recipes/new when the CTA is clicked", () => {
    render(<EmptyRecipesState />);
    fireEvent.click(screen.getByRole("button", { name: "+ מתכון חדש" }));
    expect(routerMock.push).toHaveBeenCalledWith("/recipes/new");
  });
});
