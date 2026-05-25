import { describe, it, expect } from "vitest";
import { STAGES, TOTAL_STAGES, getStage } from "./stages";

describe("STAGES data", () => {
  it("ships exactly 12 stages", () => {
    expect(STAGES).toHaveLength(12);
    expect(TOTAL_STAGES).toBe(12);
  });

  it("stages are numbered 1..12 in order", () => {
    STAGES.forEach((s, i) => expect(s.n).toBe(i + 1));
  });

  it("stages 1, 2, 3, 5, 6 are 'check'", () => {
    [1, 2, 3, 5, 6].forEach((n) => expect(getStage(n)?.type).toBe("check"));
  });

  it("stage 4 is 'bulk' with subSteps=4", () => {
    const s = getStage(4)!;
    expect(s.type).toBe("bulk");
    expect(s.subSteps).toBe(4);
  });

  it("stages 7-11 are 'timer' with positive durationSeconds", () => {
    [7, 8, 9, 10, 11].forEach((n) => {
      const s = getStage(n)!;
      expect(s.type).toBe("timer");
      expect(s.durationSeconds).toBeGreaterThan(0);
    });
  });

  it("stage 12 is 'done'", () => {
    expect(getStage(12)?.type).toBe("done");
  });

  it("every stage has Hebrew briefing with heading + blurb + takeaways", () => {
    for (const s of STAGES) {
      expect(s.briefing.heading.length).toBeGreaterThan(0);
      expect(s.briefing.blurb.length).toBeGreaterThan(0);
      expect(s.briefing.takeaways.length).toBeGreaterThan(0);
    }
  });

  it("check-type stages have todo + checks", () => {
    for (const s of STAGES) {
      if (s.type === "check" || s.type === "bulk") {
        expect(s.todo).toBeTruthy();
        expect(s.checks?.length).toBeGreaterThan(0);
      }
    }
  });

  it("timer-type stages have a todo (but no checks needed)", () => {
    for (const s of STAGES) {
      if (s.type === "timer") {
        expect(s.todo).toBeTruthy();
      }
    }
  });

  it("getStage returns null for unknown n", () => {
    expect(getStage(0)).toBeNull();
    expect(getStage(13)).toBeNull();
    expect(getStage(99)).toBeNull();
  });

  it("only stage 4 has subSteps", () => {
    for (const s of STAGES) {
      if (s.n === 4) {
        expect(s.subSteps).toBe(4);
      } else {
        expect(s.subSteps).toBeUndefined();
      }
    }
  });
});
