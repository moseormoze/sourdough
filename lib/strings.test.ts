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

describe("strings — flour labels", () => {
  it("carries a label for the legacy `other` flour bucket", () => {
    expect(strings.bake.flourTypeLabels.other).toBe("קמח אחר");
  });
});

describe("strings — configurable timer", () => {
  it("formats minute and hour choices in Hebrew", () => {
    expect(strings.bake.timerDuration(45 * 60)).toBe("45 דקות");
    expect(strings.bake.timerDuration(60 * 60)).toBe("שעה");
    expect(strings.bake.timerDuration(90 * 60)).toBe("שעה ו-30 דקות");
    expect(strings.bake.timerDuration(2 * 60 * 60)).toBe("שעתיים");
  });
});
