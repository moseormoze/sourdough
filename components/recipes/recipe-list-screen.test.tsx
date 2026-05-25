import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecipeListScreen } from "./recipe-list-screen";
import { ToastProvider } from "@/components/ui/toast";
import { saveRecipe } from "@/lib/storage/recipes";
import { routerMock } from "../../vitest.setup";

function renderScreen() {
  return render(
    <ToastProvider>
      <RecipeListScreen />
    </ToastProvider>
  );
}

const sample = {
  name: "כפרי",
  flour: { white: 80, wholeWheat: 20, rye: 0, other: 0 },
  hydration: 75,
  salt: 2,
  levain: 20,
  kitchenTemp: 25,
  inclusions: [],
};

describe("RecipeListScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    routerMock.push.mockClear();
  });

  it("renders the page title", async () => {
    renderScreen();
    expect(
      await screen.findByRole("heading", { name: "המתכונים שלי" })
    ).toBeInTheDocument();
  });

  it("renders the empty state when no recipes exist", async () => {
    renderScreen();
    expect(await screen.findByText("עדיין אין מתכונים")).toBeInTheDocument();
  });

  it("does NOT render the inline '+ מתכון חדש' header button when empty (button is in EmptyRecipesState only)", async () => {
    renderScreen();
    await screen.findByText("עדיין אין מתכונים");
    const newButtons = screen.getAllByRole("button", { name: "+ מתכון חדש" });
    expect(newButtons).toHaveLength(1);
  });

  it("renders the inline '+ מתכון חדש' button when recipes exist", async () => {
    saveRecipe(sample);
    renderScreen();
    expect(
      await screen.findByRole("button", { name: "+ מתכון חדש" })
    ).toBeInTheDocument();
    expect(screen.queryByText("עדיין אין מתכונים")).not.toBeInTheDocument();
  });

  it("inline button navigates to /recipes/new when recipes exist", async () => {
    saveRecipe(sample);
    renderScreen();
    const button = await screen.findByRole("button", { name: "+ מתכון חדש" });
    fireEvent.click(button);
    expect(routerMock.push).toHaveBeenCalledWith("/recipes/new");
  });

  it("back button navigates to /", async () => {
    renderScreen();
    await screen.findByText("עדיין אין מתכונים");
    fireEvent.click(screen.getByRole("button", { name: /חזרה/ }));
    expect(routerMock.push).toHaveBeenCalledWith("/");
  });

  it("lists each saved recipe by name", async () => {
    saveRecipe(sample);
    saveRecipe({ ...sample, name: "שיפון" });
    renderScreen();
    expect(await screen.findByText("כפרי")).toBeInTheDocument();
    expect(screen.getByText("שיפון")).toBeInTheDocument();
  });
});
