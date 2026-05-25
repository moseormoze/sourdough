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

  it("renders the CTAs in fresh state", async () => {
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

  it("ALSO shows the resume banner when an active bake exists (CTAs remain visible underneath)", async () => {
    const recipe = saveRecipe(sample);
    seedActive(recipe);
    render(<HomeScreen />);
    expect(await screen.findByText("ממשיכים")).toBeInTheDocument();
    expect(screen.getByText("כפרי")).toBeInTheDocument();
    // The dashboard CTAs are still accessible
    expect(screen.getByText("התחל אפייה")).toBeInTheDocument();
    expect(screen.getByText("המתכונים שלי")).toBeInTheDocument();
  });

  it("banner 'סיים בייק' opens the StopBakeDialog; confirm clears the active bake", async () => {
    const recipe = saveRecipe(sample);
    seedActive(recipe);
    render(<HomeScreen />);
    await screen.findByText("ממשיכים");

    fireEvent.click(screen.getByRole("button", { name: "סיים בייק" }));
    expect(await screen.findByText("להפסיק את הבייק?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "כן, להפסיק" }));
    await waitFor(() => expect(loadActiveBake()).toBeNull());
    // Banner is gone
    await waitFor(() => {
      expect(screen.queryByText("ממשיכים")).not.toBeInTheDocument();
    });
  });

  it("banner 'סיים בייק' cancel keeps the active bake", async () => {
    const recipe = saveRecipe(sample);
    seedActive(recipe);
    render(<HomeScreen />);
    await screen.findByText("ממשיכים");

    fireEvent.click(screen.getByRole("button", { name: "סיים בייק" }));
    fireEvent.click(await screen.findByRole("button", { name: "לא, להמשיך" }));
    expect(loadActiveBake()?.id).toBe("ab-1");
  });
});
