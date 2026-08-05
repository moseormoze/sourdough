import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecipeListScreen } from "./recipe-list-screen";
import { ToastProvider } from "@/components/ui/toast";
import { saveRecipe } from "@/lib/storage/recipes";
import { AMBIENT_CANVAS, AMBIENT_GLASS } from "@/components/ui/ambient";
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

  // ── Redesigned composition (Feature 30 — ambient carry-over) ─────────────

  it("paints the ambient canvas on main's parent, with main as the content column", async () => {
    renderScreen();
    await screen.findByText("עדיין אין מתכונים");
    const main = screen.getByRole("main");
    expect(main).not.toHaveClass(AMBIENT_CANVAS);
    expect(main.parentElement).toHaveClass(AMBIENT_CANVAS);
    expect(main.parentElement).toHaveClass("min-h-dvh");
    expect(main.parentElement?.className).not.toContain("max-w");
    expect(main).toHaveClass("max-w-md", "isolate", "overflow-x-clip");
  });

  it("groups the saved recipes into a single glass surface with row dividers", async () => {
    saveRecipe(sample);
    saveRecipe({ ...sample, name: "שיפון" });
    renderScreen();
    await screen.findByText("כפרי");

    const list = screen.getByRole("list", { name: "המתכונים שלי" });
    expect(list.className).toContain("overflow-hidden");
    for (const cls of AMBIENT_GLASS.split(" ")) {
      expect(list.className).toContain(cls);
    }
    expect(list.className).toContain("[&>*+*]:border-t");
  });

  it("renders the header CTA as the charcoal surface, not an orange one", async () => {
    saveRecipe(sample);
    renderScreen();
    const cta = await screen.findByRole("button", { name: "+ מתכון חדש" });
    expect(cta.className).toContain("bg-[#292A28]");
    expect(cta.className).not.toContain("bg-accent");
  });

  it("renders the empty-state CTA as the charcoal surface, not an orange one", async () => {
    renderScreen();
    const cta = await screen.findByRole("button", { name: "+ מתכון חדש" });
    expect(cta.className).toContain("bg-[#292A28]");
    expect(cta.className).not.toContain("bg-accent");
  });

  it("has no accent-framed controls on the loaded screen", async () => {
    saveRecipe(sample);
    renderScreen();
    await screen.findByText("כפרי");
    for (const btn of screen.getAllByRole("button")) {
      expect(btn.className).not.toMatch(/\bborder-accent\b/);
      expect(btn.className).not.toMatch(/\bbg-accent\b/);
    }
  });

  it("isolates numeric summary segments in ltr .num spans within each row", async () => {
    saveRecipe(sample);
    renderScreen();
    const row = await screen.findByRole("button", { name: /כפרי/ });

    const nums = row.querySelectorAll('span[dir="ltr"].num');
    expect(nums.length).toBeGreaterThan(0);
    for (const num of Array.from(nums)) {
      expect(num.textContent).not.toContain("·");
      expect(num.textContent).not.toMatch(/[א-ת]/);
    }
  });

  it("row items carry no old-language opaque card styling (no shadow-sm)", async () => {
    saveRecipe(sample);
    renderScreen();
    const row = await screen.findByRole("button", { name: /כפרי/ });
    expect(row.className).not.toContain("shadow-sm");
  });
});
