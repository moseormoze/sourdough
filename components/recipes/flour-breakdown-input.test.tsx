import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FlourBreakdownInput } from "./flour-breakdown-input";

const empty = { white: "" as const, wholeWheat: "" as const, rye: "" as const, other: "" as const };

describe("FlourBreakdownInput", () => {
  it("renders 4 inputs labeled לבן/מלא/שיפון/אחר", () => {
    render(<FlourBreakdownInput value={empty} onChange={() => {}} />);
    expect(screen.getByLabelText("לבן")).toBeInTheDocument();
    expect(screen.getByLabelText("מלא")).toBeInTheDocument();
    expect(screen.getByLabelText("שיפון")).toBeInTheDocument();
    expect(screen.getByLabelText("אחר")).toBeInTheDocument();
  });

  it("shows live sum 0% when all empty", () => {
    render(<FlourBreakdownInput value={empty} onChange={() => {}} />);
    expect(screen.getByText(/סה״כ/)).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("shows ✓ when sum exactly 100", () => {
    render(
      <FlourBreakdownInput
        value={{ white: 80, wholeWheat: 20, rye: 0, other: 0 }}
        onChange={() => {}}
      />
    );
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("shows 'חסר' diff when sum < 100", () => {
    render(
      <FlourBreakdownInput
        value={{ white: 60, wholeWheat: 20, rye: 0, other: 0 }}
        onChange={() => {}}
      />
    );
    expect(screen.getByText(/חסר/)).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
  });

  it("shows 'עודף' diff when sum > 100", () => {
    render(
      <FlourBreakdownInput
        value={{ white: 80, wholeWheat: 30, rye: 0, other: 0 }}
        onChange={() => {}}
      />
    );
    expect(screen.getByText(/עודף/)).toBeInTheDocument();
    expect(screen.getByText("110%")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
  });

  it("calls onChange when a field changes", () => {
    const onChange = vi.fn();
    render(<FlourBreakdownInput value={empty} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("לבן"), { target: { value: "80" } });
    expect(onChange).toHaveBeenCalledWith({ white: 80, wholeWheat: "", rye: "", other: "" });
  });

  it("shows error message when error prop is set", () => {
    render(<FlourBreakdownInput value={empty} onChange={() => {}} error="טעות כלשהי" />);
    expect(screen.getByRole("alert")).toHaveTextContent("טעות כלשהי");
  });
});
