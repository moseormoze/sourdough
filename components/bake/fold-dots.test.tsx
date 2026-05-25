import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { FoldDots } from "./fold-dots";

describe("FoldDots", () => {
  it("renders `total` dots", () => {
    const { container } = render(<FoldDots total={4} current={0} />);
    expect(container.querySelectorAll("[data-fold]").length).toBe(4);
  });

  it("fills exactly `current` dots", () => {
    const { container } = render(<FoldDots total={4} current={2} />);
    const filled = container.querySelectorAll('[data-state="filled"]');
    const empty = container.querySelectorAll('[data-state="empty"]');
    expect(filled.length).toBe(2);
    expect(empty.length).toBe(2);
  });

  it("all dots filled when current === total", () => {
    const { container } = render(<FoldDots total={4} current={4} />);
    expect(container.querySelectorAll('[data-state="filled"]').length).toBe(4);
    expect(container.querySelectorAll('[data-state="empty"]').length).toBe(0);
  });

  it("no dots filled when current === 0", () => {
    const { container } = render(<FoldDots total={4} current={0} />);
    expect(container.querySelectorAll('[data-state="empty"]').length).toBe(4);
  });
});
