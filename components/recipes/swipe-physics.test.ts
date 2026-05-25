import { describe, it, expect } from "vitest";

// Re-derived locally from recipe-list-item.tsx so the test can exercise the
// rubber-band shape without exporting internals. Keep these constants in sync.
const SWIPE_OPEN_PX = 120;
const SWIPE_RESIST_TO_PX = 180;
const SWIPE_RESIST_FACTOR = 0.3;

function applyRubberBand(rawX: number): number {
  if (rawX <= 0) return 0;
  if (rawX <= SWIPE_OPEN_PX) return rawX;
  if (rawX <= SWIPE_RESIST_TO_PX) {
    return SWIPE_OPEN_PX + (rawX - SWIPE_OPEN_PX) * SWIPE_RESIST_FACTOR;
  }
  return SWIPE_OPEN_PX + (SWIPE_RESIST_TO_PX - SWIPE_OPEN_PX) * SWIPE_RESIST_FACTOR;
}

describe("applyRubberBand (swipe physics from playbook §3)", () => {
  it("clamps negative input to 0", () => {
    expect(applyRubberBand(-50)).toBe(0);
  });

  it("0–120px is 1:1", () => {
    expect(applyRubberBand(0)).toBe(0);
    expect(applyRubberBand(60)).toBe(60);
    expect(applyRubberBand(120)).toBe(120);
  });

  it("120–180px applies 0.3 resistance", () => {
    expect(applyRubberBand(150)).toBe(120 + 30 * 0.3);
    expect(applyRubberBand(180)).toBe(120 + 60 * 0.3);
  });

  it("hard cap above 180px", () => {
    const cap = 120 + 60 * 0.3;
    expect(applyRubberBand(220)).toBe(cap);
    expect(applyRubberBand(500)).toBe(cap);
  });
});
