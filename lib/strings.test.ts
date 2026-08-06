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

describe("strings — stage knowledge", () => {
  it("keeps the approved autolyse guide copy in the shared Hebrew string catalog", () => {
    const knowledge = strings.bake.stageKnowledge;

    expect(knowledge.trigger).toBe("הסבר על אוטוליזה");
    expect(knowledge.calibration).toEqual({
      before: "מיד אחרי הערבוב – הבצק עדיין גס ולא אחיד.",
      after: "אחרי המנוחה – הבצק מחובר יותר ונמתח בקלות רבה יותר.",
      caveat:
        "המראה תלוי בקמח ובהידרציה; השוו את הבצק לעצמו בתחילת המנוחה, לא למראה קבוע אחד.",
    });
    expect(knowledge.guide.title).toBe("להבין את הבצק");
    expect(knowledge.guide.recipeContext.guidance).toHaveProperty("generic");
    expect(knowledge.guide.recipeContext.guidance).not.toHaveProperty("white");
    expect(knowledge).not.toHaveProperty("faqTitle");
    expect(knowledge).not.toHaveProperty("troubleshootingTitle");
  });
});

describe("strings — reusable bake status", () => {
  it("aliases the existing timer states and fold progress without changing copy", () => {
    expect(strings.bake.timerStatus).toEqual({
      running: "הטיימר פועל",
      paused: "הטיימר מושהה",
      finished: "הטיימר הסתיים",
    });
    expect(strings.bake.bakeTimer.running).toBe(strings.bake.timerStatus.running);
    expect(strings.bake.bakeTimer.paused).toBe(strings.bake.timerStatus.paused);
    expect(strings.bake.bakeTimer.finished).toBe(strings.bake.timerStatus.finished);
    expect(strings.bake.foldProgress(2, 4)).toBe("2 / 4 קיפולים בוצעו");
  });
});
