import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FlourBreakdownInput } from "./flour-breakdown-input";

const empty = {
  white: "" as const,
  wholeWheat: "" as const,
  rye: "" as const,
  speltWhite: "" as const,
  speltWhole: "" as const,
  other: "" as const,
};

describe("FlourBreakdownInput", () => {
  it("renders exactly 5 named inputs (לבן/מלא/שיפון/כוסמין לבן/כוסמין מלא), no אחר", () => {
    render(<FlourBreakdownInput value={empty} onChange={() => {}} />);
    expect(screen.getByLabelText("לבן")).toBeInTheDocument();
    expect(screen.getByLabelText("מלא")).toBeInTheDocument();
    expect(screen.getByLabelText("שיפון")).toBeInTheDocument();
    expect(screen.getByLabelText("כוסמין לבן")).toBeInTheDocument();
    expect(screen.getByLabelText("כוסמין מלא")).toBeInTheDocument();
    expect(screen.queryByLabelText("אחר")).not.toBeInTheDocument();
    expect(screen.getAllByRole("spinbutton")).toHaveLength(5);
  });

  it("shows live sum 0% when all empty", () => {
    render(<FlourBreakdownInput value={empty} onChange={() => {}} />);
    expect(screen.getByText(/סה״כ/)).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("counts spelt toward the sum and shows ✓ at 100", () => {
    render(
      <FlourBreakdownInput
        value={{ white: 50, wholeWheat: 0, rye: 0, speltWhite: 0, speltWhole: 50, other: "" }}
        onChange={() => {}}
      />
    );
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("shows 'חסר' diff when sum < 100 (spelt included)", () => {
    render(
      <FlourBreakdownInput
        value={{ white: 60, wholeWheat: 0, rye: 0, speltWhite: 20, speltWhole: 0, other: "" }}
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
        value={{ white: 80, wholeWheat: 0, rye: 0, speltWhite: 0, speltWhole: 30, other: "" }}
        onChange={() => {}}
      />
    );
    expect(screen.getByText(/עודף/)).toBeInTheDocument();
    expect(screen.getByText("110%")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
  });

  it("calls onChange with the spelt key when a spelt field changes", () => {
    const onChange = vi.fn();
    render(<FlourBreakdownInput value={empty} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("כוסמין מלא"), { target: { value: "40" } });
    expect(onChange).toHaveBeenCalledWith({
      white: "",
      wholeWheat: "",
      rye: "",
      speltWhite: "",
      speltWhole: 40,
      other: "",
    });
  });

  it("shows error message when error prop is set", () => {
    render(<FlourBreakdownInput value={empty} onChange={() => {}} error="טעות כלשהי" />);
    expect(screen.getByRole("alert")).toHaveTextContent("טעות כלשהי");
  });
});
