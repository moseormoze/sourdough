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

  const SUPPORTED_TOKENS = new Set([
    "starterGrams",
    "levainWaterGrams",
    "levainFlourGrams",
    "totalFlourGrams",
    "autolyseWaterGrams",
    "levainTotalGrams",
    "saltGrams",
    "saltReserveWaterGrams",
    "mixFlourBreakdown",
    "levainFlourBreakdown",
  ]);

  function tokensIn(text: string): string[] {
    const matches: string[] = [];
    const regex = /\{(\w+)\}/g;
    let m;
    while ((m = regex.exec(text)) !== null) {
      if (m[1]) matches.push(m[1]);
    }
    return matches;
  }

  it("stages 1, 2, 3 contain placeholder tokens in their todo steps", () => {
    for (const n of [1, 2, 3]) {
      const stage = getStage(n)!;
      const allText = stage.todo!.steps.join(" ");
      expect(tokensIn(allText).length, `stage ${n} should have tokens`).toBeGreaterThan(0);
    }
  });

  it("stages 4-12 contain no placeholder tokens (procedural only)", () => {
    for (const s of STAGES) {
      if (s.n >= 4 && s.todo) {
        const allText = [...s.todo.steps, s.todo.tip ?? ""].join(" ");
        expect(tokensIn(allText), `stage ${s.n} must have no tokens`).toEqual([]);
      }
    }
  });

  it("every token used in stage data is in the supported set", () => {
    for (const s of STAGES) {
      if (!s.todo) continue;
      const allText = [...s.todo.steps, s.todo.tip ?? ""].join(" ");
      for (const token of tokensIn(allText)) {
        expect(SUPPORTED_TOKENS.has(token), `stage ${s.n} uses unknown token {${token}}`).toBe(true);
      }
    }
  });

  it("stages 8, 9, 10 define byMethod with stone-with-steam + tray-with-bowl variants", () => {
    for (const n of [8, 9, 10]) {
      const stage = getStage(n)!;
      expect(stage.byMethod, `stage ${n} should have byMethod`).toBeDefined();
      expect(stage.byMethod?.["stone-with-steam"]).toBeDefined();
      expect(stage.byMethod?.["tray-with-bowl"]).toBeDefined();
    }
  });

  it("stages without byMethod fall back to base content", () => {
    for (const s of STAGES) {
      if ([8, 9, 10].includes(s.n)) continue;
      expect(s.byMethod, `stage ${s.n} should NOT define byMethod`).toBeUndefined();
    }
  });

  it("tray-with-bowl variant at stage 8 includes a safety warning", () => {
    const stage = getStage(8)!;
    expect(stage.byMethod?.["tray-with-bowl"]?.warning).toMatch(/250°C/);
  });
});
