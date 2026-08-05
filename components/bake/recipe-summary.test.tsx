import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { RecipeSummary, summarizeRecipe } from "./recipe-summary";

describe("summarizeRecipe", () => {
  it("returns the dominant flour and hydration as value/label parts", () => {
    expect(
      summarizeRecipe({
        flour: { white: 80, wholeWheat: 20, rye: 0 },
        hydration: 75,
      }),
    ).toEqual([
      { value: "20%", label: "מלא" },
      { value: "75%", label: "הידרציה" },
    ]);
  });

  it("labels a 100% white flour recipe", () => {
    expect(
      summarizeRecipe({
        flour: { white: 100, wholeWheat: 0, rye: 0 },
        hydration: 70,
      }),
    ).toEqual([
      { value: "100%", label: "לבן" },
      { value: "70%", label: "הידרציה" },
    ]);
  });

  it("labels 100% spelt variants", () => {
    expect(
      summarizeRecipe({
        flour: { white: 0, wholeWheat: 0, rye: 0, speltWhole: 100 },
        hydration: 72,
      }),
    ).toEqual([
      { value: "100%", label: "כוסמין מלא" },
      { value: "72%", label: "הידרציה" },
    ]);
  });
});

describe("RecipeSummary", () => {
  const parts = [
    { value: "20%", label: "מלא" },
    { value: "75%", label: "הידרציה" },
  ];

  it("wraps every numeric segment in span[dir=ltr].num with the unit inside", () => {
    const { container } = render(<RecipeSummary parts={parts} />);
    const nums = container.querySelectorAll('span[dir="ltr"].num');
    expect(nums).toHaveLength(2);
    expect(nums[0]?.textContent).toBe("20%");
    expect(nums[1]?.textContent).toBe("75%");
  });

  it("keeps the separator and words outside the num spans", () => {
    const { container } = render(<RecipeSummary parts={parts} />);
    expect(container.textContent).toBe("20% מלא · 75% הידרציה");
    for (const num of container.querySelectorAll(".num")) {
      expect(num.textContent).not.toContain("·");
      expect(num.textContent).not.toMatch(/[א-ת]/);
    }
  });
});
