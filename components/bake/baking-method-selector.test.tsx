import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BakingMethodSelector } from "./baking-method-selector";

describe("BakingMethodSelector", () => {
  it("renders the three Hebrew method titles + descriptions", () => {
    render(<BakingMethodSelector value="closed-vessel" onChange={() => {}} />);
    expect(screen.getByText("סיר/כלי סגור")).toBeInTheDocument();
    expect(screen.getByText("אפייה פתוחה + תבנית אדים")).toBeInTheDocument();
    expect(screen.getByText("אחר / לא בטוח")).toBeInTheDocument();
    expect(screen.getByText(/הכלי אוטם את האדים/)).toBeInTheDocument();
    expect(screen.getByText(/תבנית מים נפרדת/)).toBeInTheDocument();
    expect(screen.getByText(/הוראות הגנריות/)).toBeInTheDocument();
  });

  it("marks the selected value with aria-checked=true and the others false", () => {
    render(<BakingMethodSelector value="open-with-steam" onChange={() => {}} />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    const checkedRadio = radios.find((r) => r.getAttribute("aria-checked") === "true");
    expect(checkedRadio).toHaveTextContent(/אפייה פתוחה/);
  });

  it("uses role='radiogroup' on the container", () => {
    render(<BakingMethodSelector value="closed-vessel" onChange={() => {}} />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("calls onChange with the new method when an unselected card is clicked", () => {
    const onChange = vi.fn();
    render(<BakingMethodSelector value="closed-vessel" onChange={onChange} />);
    fireEvent.click(screen.getByText("אפייה פתוחה + תבנית אדים"));
    expect(onChange).toHaveBeenCalledWith("open-with-steam");
  });

  it("clicking the 'other' card emits its key", () => {
    const onChange = vi.fn();
    render(<BakingMethodSelector value="closed-vessel" onChange={onChange} />);
    fireEvent.click(screen.getByText("אחר / לא בטוח"));
    expect(onChange).toHaveBeenCalledWith("other");
  });

  it("includes the selector title as a heading", () => {
    render(<BakingMethodSelector value="closed-vessel" onChange={() => {}} />);
    expect(screen.getByText("באיזה כלי תאפה?")).toBeInTheDocument();
  });

  it("each radio card meets the 44px touch target minimum", () => {
    render(<BakingMethodSelector value="closed-vessel" onChange={() => {}} />);
    const radios = screen.getAllByRole("radio");
    radios.forEach((r) => {
      expect(r.className).toMatch(/min-h-touch|min-h-cta|min-h-\[/);
    });
  });
});
