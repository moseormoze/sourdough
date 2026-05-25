import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BakeStageStubScreen } from "./bake-stage-stub-screen";

describe("BakeStageStubScreen", () => {
  it("renders the stage number in the title", () => {
    render(<BakeStageStubScreen stageNumber={4} />);
    expect(screen.getByText("שלב 4 — בקרוב")).toBeInTheDocument();
  });

  it("back link points to /", () => {
    render(<BakeStageStubScreen stageNumber={1} />);
    const link = screen.getByRole("link", { name: /חזרה למסך הבית/ });
    expect(link).toHaveAttribute("href", "/");
  });
});
