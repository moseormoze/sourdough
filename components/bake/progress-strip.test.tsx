import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressStrip } from "./progress-strip";

describe("ProgressStrip", () => {
  it("renders exactly `total` segments", () => {
    const { container } = render(<ProgressStrip total={12} current={1} />);
    expect(container.querySelectorAll("[data-segment]").length).toBe(12);
  });

  it("marks segments < current as 'past'", () => {
    const { container } = render(<ProgressStrip total={5} current={3} />);
    const past = container.querySelectorAll('[data-state="past"]');
    expect(past.length).toBe(2); // segments 1 and 2
  });

  it("marks one segment as 'current'", () => {
    const { container } = render(<ProgressStrip total={5} current={3} />);
    const current = container.querySelectorAll('[data-state="current"]');
    expect(current.length).toBe(1);
  });

  it("marks segments > current as 'future'", () => {
    const { container } = render(<ProgressStrip total={5} current={3} />);
    const future = container.querySelectorAll('[data-state="future"]');
    expect(future.length).toBe(2); // segments 4 and 5
  });

  it("has aria-label and progressbar role", () => {
    render(<ProgressStrip total={12} current={4} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-label", "שלב 4 מתוך 12");
    expect(bar).toHaveAttribute("aria-valuenow", "4");
    expect(bar).toHaveAttribute("aria-valuemax", "12");
  });
});
