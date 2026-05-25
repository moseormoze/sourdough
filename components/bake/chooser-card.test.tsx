import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChooserCard } from "./chooser-card";

describe("ChooserCard", () => {
  it("renders name and summary", () => {
    render(
      <ChooserCard name="כפרי קלאסי" summary="80% לבן · 75% הידרציה" onSelect={() => {}} />
    );
    expect(screen.getByText("כפרי קלאסי")).toBeInTheDocument();
    expect(screen.getByText("80% לבן · 75% הידרציה")).toBeInTheDocument();
  });

  it("renders 'שלי' badge when mine", () => {
    render(<ChooserCard name="x" summary="y" mine onSelect={() => {}} />);
    expect(screen.getByText("שלי")).toBeInTheDocument();
  });

  it("does not render the badge when mine is false", () => {
    render(<ChooserCard name="x" summary="y" onSelect={() => {}} />);
    expect(screen.queryByText("שלי")).not.toBeInTheDocument();
  });

  it("fires onSelect on tap (no drag)", () => {
    const onSelect = vi.fn();
    render(<ChooserCard name="x" summary="y" onSelect={onSelect} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 10, clientY: 10 });
    fireEvent.pointerUp(btn, { clientX: 10, clientY: 10 });
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("does NOT fire onSelect when pointer drags > 5px", () => {
    const onSelect = vi.fn();
    render(<ChooserCard name="x" summary="y" onSelect={onSelect} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
    fireEvent.pointerMove(btn, { clientX: 30, clientY: 0 });
    fireEvent.pointerUp(btn, { clientX: 30, clientY: 0 });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("fires onSelect on Enter key", () => {
    const onSelect = vi.fn();
    render(<ChooserCard name="x" summary="y" onSelect={onSelect} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
