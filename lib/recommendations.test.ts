import { describe, it, expect } from "vitest";
import { hintFor, recommendFor } from "./recommendations";

describe("recommendFor", () => {
  it("white-heavy (≥80% white) → 72/2.0/20", () => {
    expect(
      recommendFor({ white: 100, wholeWheat: 0, rye: 0, other: 0 })
    ).toEqual({ hydration: 72, salt: 2.0, levain: 20 });
    expect(
      recommendFor({ white: 80, wholeWheat: 20, rye: 0, other: 0 })
    ).toEqual({ hydration: 72, salt: 2.0, levain: 20 });
  });

  it("wholewheat-heavy (≥50% wholeWheat) → 80/2.2/22", () => {
    expect(
      recommendFor({ white: 30, wholeWheat: 70, rye: 0, other: 0 })
    ).toEqual({ hydration: 80, salt: 2.2, levain: 22 });
    expect(
      recommendFor({ white: 0, wholeWheat: 100, rye: 0, other: 0 })
    ).toEqual({ hydration: 80, salt: 2.2, levain: 22 });
  });

  it("rye-heavy (≥30% rye) → 78/2.2/25", () => {
    expect(
      recommendFor({ white: 50, wholeWheat: 0, rye: 50, other: 0 })
    ).toEqual({ hydration: 78, salt: 2.2, levain: 25 });
    expect(
      recommendFor({ white: 30, wholeWheat: 40, rye: 30, other: 0 })
    ).toEqual({ hydration: 78, salt: 2.2, levain: 25 });
  });

  it("mostly-white (50-80% white) → 75/2.0/20", () => {
    expect(
      recommendFor({ white: 70, wholeWheat: 20, rye: 10, other: 0 })
    ).toEqual({ hydration: 75, salt: 2.0, levain: 20 });
  });

  it("mixed-other falls through to default 75/2.0/20", () => {
    expect(
      recommendFor({ white: 40, wholeWheat: 30, rye: 20, other: 10 })
    ).toEqual({ hydration: 75, salt: 2.0, levain: 20 });
  });

  it("treats empty strings as 0", () => {
    expect(
      recommendFor({ white: 100, wholeWheat: "", rye: "", other: "" })
    ).toEqual({ hydration: 72, salt: 2.0, levain: 20 });
  });
});

describe("hintFor", () => {
  const whiteHeavy = { white: 100, wholeWheat: 0 as 0, rye: 0 as 0, other: 0 as 0 };

  it("returns null when current is empty (no hint)", () => {
    expect(hintFor("hydration", "", whiteHeavy)).toBeNull();
  });

  it("returns null when current matches recommended exactly", () => {
    expect(hintFor("hydration", 72, whiteHeavy)).toBeNull();
  });

  it("returns null when current is within threshold (default 2%)", () => {
    expect(hintFor("hydration", 73, whiteHeavy)).toBeNull();
    expect(hintFor("hydration", 74, whiteHeavy)).toBeNull();
    expect(hintFor("hydration", 70, whiteHeavy)).toBeNull();
  });

  it("returns recommended value when current is > threshold off", () => {
    expect(hintFor("hydration", 80, whiteHeavy)).toBe(72);
    expect(hintFor("hydration", 60, whiteHeavy)).toBe(72);
  });

  it("respects custom threshold", () => {
    expect(hintFor("hydration", 73, whiteHeavy, 0)).toBe(72);
    expect(hintFor("hydration", 75, whiteHeavy, 5)).toBeNull();
  });

  it("uses the field-specific recommendation for the lookup", () => {
    expect(hintFor("salt", 4.5, whiteHeavy)).toBe(2.0);
    expect(hintFor("levain", 35, whiteHeavy)).toBe(20);
  });
});
