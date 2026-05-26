import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FlourWeightInput } from "./flour-weight-input";

describe("FlourWeightInput", () => {
  it("renders the Hebrew label", () => {
    render(<FlourWeightInput value={500} onChange={() => {}} />);
    expect(screen.getByLabelText("משקל קמח")).toBeInTheDocument();
  });

  it("renders the value inside the input", () => {
    render(<FlourWeightInput value={750} onChange={() => {}} />);
    const input = screen.getByLabelText("משקל קמח") as HTMLInputElement;
    expect(input.value).toBe("750");
  });

  it("renders the 'g' unit suffix", () => {
    render(<FlourWeightInput value={500} onChange={() => {}} />);
    expect(screen.getByText("g")).toBeInTheDocument();
  });

  it("renders both hint lines", () => {
    render(<FlourWeightInput value={500} onChange={() => {}} />);
    expect(screen.getByText(/500g · ככר בינונית/)).toBeInTheDocument();
    expect(screen.getByText(/750g · ככר גדולה/)).toBeInTheDocument();
  });

  it("calls onChange when the input changes", () => {
    const onChange = vi.fn();
    render(<FlourWeightInput value={500} onChange={onChange} />);
    const input = screen.getByLabelText("משקל קמח");
    fireEvent.change(input, { target: { value: "800" } });
    expect(onChange).toHaveBeenCalledWith(800);
  });

  it("displays the error message when provided", () => {
    render(
      <FlourWeightInput value={50} onChange={() => {}} error="משקל קמח חייב להיות בין 100g ל-1500g" />
    );
    expect(screen.getByText(/בין 100g ל-1500g/)).toBeInTheDocument();
  });

  it("calls onBlur when the input loses focus", () => {
    const onBlur = vi.fn();
    render(<FlourWeightInput value={500} onChange={() => {}} onBlur={onBlur} />);
    const input = screen.getByLabelText("משקל קמח");
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalled();
  });
});
