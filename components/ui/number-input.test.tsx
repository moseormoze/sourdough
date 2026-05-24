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
});
