import { describe, it, expect } from "vitest";
import { strings } from "./strings";

// Copy contracts from the 2026-07 content audit.
describe("strings — done screen", () => {
  it("does not treat the already-completed cooling hour as a future instruction", () => {
    expect(strings.bake.doneBlurb).not.toContain("אחרי לפחות שעה");
  });
});

describe("strings — retard naming", () => {
  it("uses התפחה במקרר, matching the stage name", () => {
    expect(strings.bakeScheduler.timelineSteps.retard.label).toBe("התפחה במקרר");
    expect(strings.bakeScheduler.retardSliderLabel).toContain("במקרר");
  });
});
