import { describe, expect, it } from "vitest";
import {
  emptyFeedingFormValues,
  hasAnyError,
  validateFeeding,
  type FeedingFormValues,
} from "./validate-feeding";

function fullValidValues(): FeedingFormValues {
  return {
    ratio: 2,
    starterGrams: 50,
    flourGrams: 100,
    waterGrams: 100,
    fedAtDate: "2026-07-09",
    fedAtTime: "08:30",
  };
}

describe("emptyFeedingFormValues", () => {
  it("defaults ratio to null and grams/time to empty strings", () => {
    const values = emptyFeedingFormValues();
    expect(values.ratio).toBeNull();
    expect(values.starterGrams).toBe("");
    expect(values.flourGrams).toBe("");
    expect(values.waterGrams).toBe("");
    expect(values.fedAtTime).toBe("");
  });

  it("defaults fedAtDate to today in local YYYY-MM-DD form", () => {
    const values = emptyFeedingFormValues();
    expect(values.fedAtDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
    expect(values.fedAtDate).toBe(expected);
  });
});

describe("validateFeeding", () => {
  it("errors when ratio is missing", () => {
    const errors = validateFeeding({ ...fullValidValues(), ratio: null });
    expect(errors.ratio).toBeTruthy();
  });

  it("errors when fedAtDate is missing", () => {
    const errors = validateFeeding({ ...fullValidValues(), fedAtDate: "" });
    expect(errors.fedAtDate).toBeTruthy();
  });

  it("does not error when grams and time are empty (optional)", () => {
    const errors = validateFeeding({
      ...fullValidValues(),
      starterGrams: "",
      flourGrams: "",
      waterGrams: "",
      fedAtTime: "",
    });
    expect(errors.starterGrams).toBeNull();
    expect(errors.flourGrams).toBeNull();
    expect(errors.waterGrams).toBeNull();
    expect(errors.fedAtTime).toBeNull();
  });

  it("errors when a gram field is negative", () => {
    expect(validateFeeding({ ...fullValidValues(), starterGrams: -5 }).starterGrams).toBeTruthy();
    expect(validateFeeding({ ...fullValidValues(), flourGrams: -1 }).flourGrams).toBeTruthy();
    expect(validateFeeding({ ...fullValidValues(), waterGrams: -1 }).waterGrams).toBeTruthy();
  });

  it("produces no errors for a fully valid input", () => {
    const errors = validateFeeding(fullValidValues());
    expect(hasAnyError(errors)).toBe(false);
  });

  it("hasAnyError is true when any field has an error", () => {
    const errors = validateFeeding({ ...fullValidValues(), ratio: null });
    expect(hasAnyError(errors)).toBe(true);
  });
});
