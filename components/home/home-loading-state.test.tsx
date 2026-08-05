import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeLoadingState } from "./home-loading-state";

describe("HomeLoadingState", () => {
  it("renders inert neutral placeholders without controls or visible copy", () => {
    const { container } = render(<HomeLoadingState />);

    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent("התחל אפייה");
  });

  it("renders the pre-extraction placeholder classes byte-for-byte", () => {
    const { container } = render(<HomeLoadingState />);
    const placeholders = Array.from(
      container.querySelectorAll('[aria-hidden="true"]'),
    );

    const glass =
      "rounded-[2rem] border border-paper/60 bg-[#FFF8F1]/95 shadow-[0_1px_0_rgba(255,255,255,0.65),0_14px_36px_rgba(80,61,45,0.07)] supports-[backdrop-filter]:bg-paper/35 supports-[backdrop-filter]:backdrop-blur-md";
    expect(placeholders[0]?.className).toBe(`min-h-[216px] ${glass}`);
    expect(placeholders[1]?.className).toBe(`min-h-[128px] ${glass}`);
  });
});
