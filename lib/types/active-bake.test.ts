import { describe, it, expect } from "vitest";
import { ActiveBakeSchema } from "./active-bake";

const baseBake = {
  id: "b1",
  recipe: {
    id: "r1",
    name: "כפרי",
    flour: { white: 100, wholeWheat: 0, rye: 0, other: 0 },
    flourWeightGrams: 500,
    hydration: 75,
    salt: 2,
    levain: 20,
    kitchenTemp: 25,
    inclusions: [],
    createdAt: 1_000,
    updatedAt: 2_000,
  },
  startedAt: 1_000,
  currentStage: 1,
  stageStartedAt: 1_000,
};

describe("ActiveBakeSchema — bakingMethod", () => {
  it("defaults to 'closed-vessel' when missing (legacy active bake)", () => {
    const parsed = ActiveBakeSchema.parse(baseBake);
    expect(parsed.bakingMethod).toBe("closed-vessel");
  });

  it("accepts 'open-with-steam'", () => {
    const parsed = ActiveBakeSchema.parse({ ...baseBake, bakingMethod: "open-with-steam" });
    expect(parsed.bakingMethod).toBe("open-with-steam");
  });

  it("accepts 'other'", () => {
    const parsed = ActiveBakeSchema.parse({ ...baseBake, bakingMethod: "other" });
    expect(parsed.bakingMethod).toBe("other");
  });

  it("rejects an unknown method value", () => {
    expect(() =>
      ActiveBakeSchema.parse({ ...baseBake, bakingMethod: "microwave" })
    ).toThrow();
  });
});
