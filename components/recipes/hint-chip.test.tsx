import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HintChip } from "./hint-chip";

describe("HintChip", () => {
  it("renders the recommended value", () => {
    render(<HintChip recommended={78} onAccept={() => {}} />);
    expect(screen.getByText("78%")).toBeInTheDocument();
    expect(screen.getByText(/מומלץ/)).toBeInTheDocument();
    expect(screen.getByText(/הקש לעדכן/)).toBeInTheDocument();
  });

  it("calls onAccept when clicked", () => {
    const onAccept = vi.fn();
    render(<HintChip recommended={78} onAccept={onAccept} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onAccept).toHaveBeenCalledOnce();
  });

  it("has an aria-label that conveys the value", () => {
    render(<HintChip recommended={78} onAccept={() => {}} />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      expect.stringContaining("78")
    );
  });
});
