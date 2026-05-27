import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StageCelebration } from "./stage-celebration";

describe("StageCelebration", () => {
  it("renders the bread icon as a celebration hero", () => {
    render(<StageCelebration />);
    const img = screen.getByRole("img", { name: /הלחם שלכם/ });
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("icon.svg");
  });

  it("applies the celebration-pop entry animation class to the icon wrapper", () => {
    const { container } = render(<StageCelebration />);
    const pop = container.querySelector(".celebration-pop");
    expect(pop).toBeInTheDocument();
  });

  it("renders a confetti layer with several pieces", () => {
    const { container } = render(<StageCelebration />);
    const pieces = container.querySelectorAll(".confetti-piece");
    expect(pieces.length).toBeGreaterThanOrEqual(12);
  });

  it("confetti layer is aria-hidden (decorative)", () => {
    const { container } = render(<StageCelebration />);
    const layer = container.querySelector('[aria-hidden="true"]');
    expect(layer).toBeInTheDocument();
  });
});
