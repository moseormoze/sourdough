import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeScreen } from "./home-screen";
import { saveRecipe } from "@/lib/storage/recipes";

const sample = {
  name: "כפרי",
  flour: { white: 80, wholeWheat: 20, rye: 0, other: 0 },
  hydration: 75,
  salt: 2,
  levain: 20,
  kitchenTemp: 25,
  inclusions: [],
};

describe("HomeScreen", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders wordmark and subtitle", () => {
    render(<HomeScreen />);
    expect(screen.getByText("כיכר")).toBeInTheDocument();
    expect(screen.getByText("מה אופים היום?")).toBeInTheDocument();
  });

  it("renders primary CTA 'התחל אפייה'", () => {
    render(<HomeScreen />);
    expect(screen.getByText("התחל אפייה")).toBeInTheDocument();
  });

  it("renders secondary CTA 'המתכונים שלי'", () => {
    render(<HomeScreen />);
    expect(screen.getByText("המתכונים שלי")).toBeInTheDocument();
  });

  it("shows recipe count when > 0", async () => {
    saveRecipe(sample);
    saveRecipe({ ...sample, name: "אחר" });
    render(<HomeScreen />);
    // useEffect runs after mount
    expect(await screen.findByText("2")).toBeInTheDocument();
  });

  it("does not show recipe count when 0", () => {
    render(<HomeScreen />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
