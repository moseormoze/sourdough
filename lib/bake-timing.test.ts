import { describe, it, expect } from "vitest";
import { adjustDurationSeconds, tempAdjustedDurationLabel, BASE_TEMP_C } from "./bake-timing";

describe("adjustDurationSeconds", () => {
  it("returns base unchanged at BASE_TEMP_C", () => {
    const base = 10 * 3600; // 10h
    expect(adjustDurationSeconds(base, BASE_TEMP_C)).toBe(base);
  });

  it("shortens duration when warmer than base", () => {
    const base = 10 * 3600;
    const result = adjustDurationSeconds(base, 34);
    expect(result).toBeLessThan(base);
  });

  it("lengthens duration when cooler than base", () => {
    const base = 10 * 3600;
    const result = adjustDurationSeconds(base, 14);
    expect(result).toBeGreaterThan(base);
  });

  it("doubles duration for 10°C drop (Q10 rule)", () => {
    const base = 4 * 3600;
    const cooler = adjustDurationSeconds(base, BASE_TEMP_C - 10);
    expect(cooler).toBeCloseTo(base * 2, -2); // within ~100s
  });

  it("halves duration for 10°C rise (Q10 rule)", () => {
    const base = 4 * 3600;
    const warmer = adjustDurationSeconds(base, BASE_TEMP_C + 10);
    expect(warmer).toBeCloseTo(base / 2, -2);
  });
});

describe("tempAdjustedDurationLabel", () => {
  it("returns hours label for multi-hour durations", () => {
    const label = tempAdjustedDurationLabel(10 * 3600, BASE_TEMP_C);
    expect(label).toBe("כ-10 שעות");
  });

  it("returns minutes label for sub-hour durations", () => {
    // 30 min at base temp
    const label = tempAdjustedDurationLabel(30 * 60, BASE_TEMP_C);
    expect(label).toBe("כ-30 דקות");
  });

  it("reflects shorter time in a warmer kitchen (Israeli summer 30°C)", () => {
    // levain base 10h → should be noticeably shorter at 30°C
    const label = tempAdjustedDurationLabel(10 * 3600, 30);
    // At 30°C (6°C above 24°C): factor ≈ 0.66 → ~6.6h → "כ-7 שעות"
    expect(label).toBe("כ-7 שעות");
  });

  it("reflects longer time in a cooler kitchen (Israeli winter 18°C)", () => {
    // levain base 10h → should be noticeably longer at 18°C
    const label = tempAdjustedDurationLabel(10 * 3600, 18);
    // At 18°C (6°C below 24°C): factor ≈ 1.52 → ~15.2h → "כ-15 שעות"
    expect(label).toBe("כ-15 שעות");
  });
});
