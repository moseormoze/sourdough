import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BakingMethodSelector } from "./baking-method-selector";

describe("BakingMethodSelector", () => {
  it("renders the three Hebrew method titles + descriptions", () => {
    render(<BakingMethodSelector value="dutch-oven" onChange={() => {}} />);
    expect(screen.getByText("סיר ברזל יצוק")).toBeInTheDocument();
    expect(screen.getByText("אבן/פלדת אפייה + תבנית אדים")).toBeInTheDocument();
    expect(screen.getByText("תבנית + קערה הפוכה")).toBeInTheDocument();
    expect(screen.getByText(/הסטנדרט/)).toBeInTheDocument();
    expect(screen.getByText(/אבן או פלדה לוהטת/)).toBeInTheDocument();
    expect(screen.getByText(/לא זכוכית רגילה, לא פלסטיק/)).toBeInTheDocument();
  });

  it("marks the selected value with aria-checked=true and the others false", () => {
    render(<BakingMethodSelector value="stone-with-steam" onChange={() => {}} />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    const checkedRadio = radios.find((r) => r.getAttribute("aria-checked") === "true");
    expect(checkedRadio).toHaveTextContent(/אבן\/פלדת אפייה/);
  });

  it("uses role='radiogroup' on the container", () => {
    render(<BakingMethodSelector value="dutch-oven" onChange={() => {}} />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("calls onChange with the new method when an unselected card is clicked", () => {
    const onChange = vi.fn();
    render(<BakingMethodSelector value="dutch-oven" onChange={onChange} />);
    fireEvent.click(screen.getByText("אבן/פלדת אפייה + תבנית אדים"));
    expect(onChange).toHaveBeenCalledWith("stone-with-steam");
  });

  it("clicking the tray-with-bowl card emits its key", () => {
    const onChange = vi.fn();
    render(<BakingMethodSelector value="dutch-oven" onChange={onChange} />);
    fireEvent.click(screen.getByText("תבנית + קערה הפוכה"));
    expect(onChange).toHaveBeenCalledWith("tray-with-bowl");
  });

  it("includes the selector title as a heading", () => {
    render(<BakingMethodSelector value="dutch-oven" onChange={() => {}} />);
    expect(screen.getByText("באיזה כלי תאפה?")).toBeInTheDocument();
  });

  it("each radio card meets the 44px touch target minimum", () => {
    render(<BakingMethodSelector value="dutch-oven" onChange={() => {}} />);
    const radios = screen.getAllByRole("radio");
    radios.forEach((r) => {
      expect(r.className).toMatch(/min-h-touch|min-h-cta|min-h-\[/);
    });
  });
});
