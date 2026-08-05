import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NumberInput } from "./number-input";

describe("NumberInput", () => {
  it("renders label, unit, and current value", () => {
    render(<NumberInput label="הידרציה" unit="%" value={75} onChange={() => {}} />);
    expect(screen.getByLabelText("הידרציה")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
    const input = screen.getByLabelText("הידרציה") as HTMLInputElement;
    expect(input.value).toBe("75");
  });

  it("input has dir=ltr (numbers always LTR)", () => {
    render(<NumberInput label="hydration" value={75} onChange={() => {}} />);
    expect(screen.getByLabelText("hydration")).toHaveAttribute("dir", "ltr");
  });

  it("increments by step when + clicked", () => {
    const onChange = vi.fn();
    render(<NumberInput label="x" value={70} step={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("עוד"));
    expect(onChange).toHaveBeenCalledWith(75);
  });

  it("decrements by step when − clicked", () => {
    const onChange = vi.fn();
    render(<NumberInput label="x" value={70} step={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("פחות"));
    expect(onChange).toHaveBeenCalledWith(65);
  });

  it("clamps to max on increment", () => {
    const onChange = vi.fn();
    render(<NumberInput label="x" value={99} max={100} step={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("עוד"));
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it("clamps to min on decrement", () => {
    const onChange = vi.fn();
    render(<NumberInput label="x" value={2} min={0} step={5} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("פחות"));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("emits empty string when input cleared", () => {
    const onChange = vi.fn();
    render(<NumberInput label="x" value={5} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("x"), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("emits numeric value from typed input", () => {
    const onChange = vi.fn();
    render(<NumberInput label="x" value={5} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("x"), { target: { value: "42" } });
    expect(onChange).toHaveBeenCalledWith(42);
  });

  it("renders error and sets aria-invalid", () => {
    render(<NumberInput label="x" value={150} onChange={() => {}} error="טווח חורג" />);
    expect(screen.getByLabelText("x")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("טווח חורג");
  });

  it("anchors the value next to the unit in compact mode", () => {
    render(<NumberInput label="x" value={13} unit="גרם" compact onChange={() => {}} />);
    const input = screen.getByLabelText("x");
    expect(input.className).toContain("text-start");
    expect(input.className).not.toContain("text-center");
  });

  it("keeps the value centered between steppers in default mode", () => {
    render(<NumberInput label="x" value={13} unit="גרם" onChange={() => {}} />);
    const input = screen.getByLabelText("x");
    expect(input.className).toContain("text-center");
    expect(input.className).not.toContain("text-start");
  });

  // Two-up columns (the flour breakdown at 375px) gave the field 141px while the
  // 44px-wide steppers + unit + the input's intrinsic min-width demanded 159px, so
  // the + escaped 19px past the pill. The field must be allowed to shrink, and the
  // steppers must claim their 44px hit area without reserving 44px of layout width.
  it("lets the numeric field shrink so the steppers cannot overflow a narrow pill", () => {
    render(<NumberInput label="x" value={100} unit="%" onChange={() => {}} />);
    expect(screen.getByLabelText("x").className).toContain("min-w-0");
  });

  it("keeps a 44px stepper hit area without reserving 44px of width", () => {
    render(<NumberInput label="x" value={50} unit="%" onChange={() => {}} />);
    for (const label of ["עוד", "פחות"]) {
      const button = screen.getByLabelText(label);
      expect(button.className).not.toContain("min-w-touch");
      expect(button.className).toContain("min-h-touch");
      // hit area expanded past the visual box (ui-playbook §10)
      expect(button.className).toContain("before:");
    }
  });
});
