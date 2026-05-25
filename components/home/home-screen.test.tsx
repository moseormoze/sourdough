import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HomeScreen } from "./home-screen";
import { saveRecipe } from "@/lib/storage/recipes";
import { loadActiveBake, saveActiveBake } from "@/lib/storage/active-bake";
import type { Recipe } from "@/lib/types/recipe";

const sample = {
  name: "כפרי",
  flour: { white: 80, wholeWheat: 20, rye: 0, other: 0 },
  hydration: 75,
  salt: 2,
  levain: 20,
  kitchenTemp: 25,
  inclusions: [],
};

function seedActive(recipe: Recipe) {
  saveActiveBake({
    id: "ab-1",
    recipe,
    startedAt: 1,
    currentStage: 4,
    stageStartedAt: 2,
    observationChecks: {},
  });
}

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

describe("HomeScreen", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders wordmark and subtitle", () => {
    render(<HomeScreen />);
    expect(screen.getByText("כיכר")).toBeInTheDocument();
    expect(screen.getByText("מה אופים היום?")).toBeInTheDocument();
  });

  it("renders the fresh CTAs when no active bake", async () => {
    render(<HomeScreen />);
    expect(await screen.findByText("התחל אפייה")).toBeInTheDocument();
    expect(screen.getByText("המתכונים שלי")).toBeInTheDocument();
  });

  it("shows recipe count when > 0", async () => {
    saveRecipe(sample);
    saveRecipe({ ...sample, name: "אחר" });
    render(<HomeScreen />);
    expect(await screen.findByText("2")).toBeInTheDocument();
  });

  it("does not show recipe count when 0", async () => {
    render(<HomeScreen />);
    await screen.findByText("התחל אפייה");
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("renders ResumeCard instead of the CTAs when an active bake exists", async () => {
    const recipe = saveRecipe(sample);
    seedActive(recipe);
    render(<HomeScreen />);
    expect(await screen.findByText("ממשיכים את הבייק שלך")).toBeInTheDocument();
    expect(screen.queryByText("התחל אפייה")).not.toBeInTheDocument();
    expect(screen.queryByText("המתכונים שלי")).not.toBeInTheDocument();
  });

  it("ResumeCard 'ביטול בייק' opens abandon dialog; confirm clears the active bake", async () => {
    const recipe = saveRecipe(sample);
    seedActive(recipe);
    render(<HomeScreen />);
    await screen.findByText("ממשיכים את הבייק שלך");

    fireEvent.click(screen.getByRole("button", { name: "ביטול בייק" }));
    expect(await screen.findByText("לוותר על הבייק הנוכחי?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "כן, ויתור" }));
    await waitFor(() => expect(loadActiveBake()).toBeNull());
    expect(await screen.findByText("התחל אפייה")).toBeInTheDocument();
  });

  it("ResumeCard 'ביטול בייק' cancel keeps the active bake", async () => {
    const recipe = saveRecipe(sample);
    seedActive(recipe);
    render(<HomeScreen />);
    await screen.findByText("ממשיכים את הבייק שלך");

    fireEvent.click(screen.getByRole("button", { name: "ביטול בייק" }));
    fireEvent.click(await screen.findByRole("button", { name: "ביטול" }));
    expect(loadActiveBake()?.id).toBe("ab-1");
  });
});
