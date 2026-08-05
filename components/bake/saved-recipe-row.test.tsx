import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SavedRecipeRow } from "./saved-recipe-row";

const summary = [
  { value: "20%", label: "מלא" },
  { value: "75%", label: "הידרציה" },
];

describe("SavedRecipeRow", () => {
  it("renders name, summary and the שלי badge with the composed accessible name", () => {
    render(<SavedRecipeRow name="שיפון מותאם" summary={summary} onSelect={() => {}} />);
    const row = screen.getByRole("button", { name: "שיפון מותאם (שלי)" });
    expect(row).toHaveClass("min-h-[64px]");
    expect(row.textContent).toContain("שיפון מותאם");
    expect(row.textContent).toContain("שלי");
    expect(row.textContent).toContain("75% הידרציה");
  });

  it("gives press feedback and clears it on release", () => {
    render(<SavedRecipeRow name="x" summary={summary} onSelect={() => {}} />);
    const row = screen.getByRole("button");
    fireEvent.pointerDown(row, { clientX: 0, clientY: 0 });
    expect(row).toHaveAttribute("data-pressed");
    expect(row.className).toContain("scale-[0.985]");
    expect(row.className).toContain("bg-ink/[0.05]");
    fireEvent.pointerUp(row, { clientX: 0, clientY: 0 });
    expect(row).not.toHaveAttribute("data-pressed");
  });

  it("fires onSelect on tap and suppresses activation after a drag", () => {
    const onSelect = vi.fn();
    render(<SavedRecipeRow name="x" summary={summary} onSelect={onSelect} />);
    const row = screen.getByRole("button");

    fireEvent.pointerDown(row, { clientX: 0, clientY: 0 });
    fireEvent.pointerMove(row, { clientX: 30, clientY: 0 });
    fireEvent.pointerUp(row, { clientX: 30, clientY: 0 });
    fireEvent.click(row, { detail: 1 });
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.pointerDown(row, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(row, { clientX: 0, clientY: 0 });
    fireEvent.click(row, { detail: 1 });
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("activates from native keyboard clicks", () => {
    const onSelect = vi.fn();
    render(<SavedRecipeRow name="x" summary={summary} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button"), { detail: 0 });
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
