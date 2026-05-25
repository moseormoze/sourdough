import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PercentInputWithHint } from "./percent-input-with-hint";

const baseProps = {
  label: "הידרציה",
  min: 50,
  max: 100,
  value: 80 as number | "",
  onChange: () => {},
};

describe("PercentInputWithHint", () => {
  it("renders the underlying PercentInput", () => {
    render(<PercentInputWithHint {...baseProps} recommended={null} />);
    expect(screen.getByLabelText("הידרציה")).toBeInTheDocument();
  });

  it("does NOT render the chip when recommended is null", () => {
    render(<PercentInputWithHint {...baseProps} recommended={null} />);
    expect(screen.queryByText(/הקש לעדכן/)).not.toBeInTheDocument();
  });

  it("renders the chip when recommended is provided", () => {
    render(<PercentInputWithHint {...baseProps} recommended={72} />);
    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("clicking the chip calls onChange with the recommended value", () => {
    const onChange = vi.fn();
    render(
      <PercentInputWithHint {...baseProps} onChange={onChange} recommended={72} />
    );
    fireEvent.click(screen.getByRole("button", { name: /מומלץ 72/ }));
    expect(onChange).toHaveBeenCalledWith(72);
  });

  it("does NOT auto-fill — onChange only fires on chip press, not on render", () => {
    const onChange = vi.fn();
    render(
      <PercentInputWithHint {...baseProps} onChange={onChange} recommended={72} />
    );
    expect(onChange).not.toHaveBeenCalled();
  });
});
