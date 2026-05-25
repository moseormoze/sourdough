import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BakeStubScreen } from "./bake-stub-screen";

describe("BakeStubScreen", () => {
  it("shows the coming-soon title", () => {
    render(<BakeStubScreen />);
    expect(screen.getByText("מצב אפייה — בקרוב")).toBeInTheDocument();
  });

  it("shows the explanatory body", () => {
    render(<BakeStubScreen />);
    expect(
      screen.getByText("הזרימה הזאת תיכנס בקרוב. בינתיים, תכין את המתכונים שלך.")
    ).toBeInTheDocument();
  });

  it("back link points to /", () => {
    render(<BakeStubScreen />);
    const link = screen.getByRole("link", { name: /חזרה/ });
    expect(link).toHaveAttribute("href", "/");
  });
});
