import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
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

  it("stages 8, 9, 10 define byMethod with open-with-steam + other variants", () => {
    for (const n of [8, 9, 10]) {
      const stage = getStage(n)!;
      expect(stage.byMethod, `stage ${n} should have byMethod`).toBeDefined();
      expect(stage.byMethod?.["open-with-steam"]).toBeDefined();
      expect(stage.byMethod?.["other"]).toBeDefined();
    }
  });

  it("stages without byMethod fall back to base content", () => {
    for (const s of STAGES) {
      if ([8, 9, 10].includes(s.n)) continue;
      expect(s.byMethod, `stage ${s.n} should NOT define byMethod`).toBeUndefined();
    }
  });

  it("other variant at stage 8 includes a safety warning", () => {
    const stage = getStage(8)!;
    expect(stage.byMethod?.["other"]?.warning).toMatch(/250°C/);
  });
});

// Content contracts from live-bake feedback (2026-07): a real bake stalled because
// the copy conflated "done folding" with "done with bulk", counted bulk from the
// autolyse, and sent a fine just-past-peak levain back to a rebuild.
describe("stage 4 — bulk fermentation copy", () => {
  const stage = () => getStage(4)!;

  it("introduces the professional term באלק and anchors bulk to levain-in", () => {
    expect(stage().briefing.blurb).toContain("באלק");
    expect(stage().briefing.blurb).toContain("מהרגע שהשאור נכנס");
  });

  it("states that finishing the folds is not finishing the stage", () => {
    expect(stage().briefing.takeaways.join(" ")).toContain(
      "סוף הקיפולים ≠ סוף השלב"
    );
  });

  it("has a dedicated quiet-wait step after the last fold", () => {
    const steps = stage().todo!.steps;
    expect(steps.some((s) => s.includes("ההמתנה השקטה"))).toBe(true);
  });

  it("anchors the 30–75% rise to the end-of-mix volume", () => {
    const steps = stage().todo!.steps;
    const last = steps[steps.length - 1]!;
    expect(last).toContain("30–75%");
    expect(last).toContain("בסוף הלישה");
  });
});

describe("stage 4 — end-of-bulk reference photo", () => {
  it("carries a checklist image showing what done dough looks like", () => {
    const s = getStage(4)!;
    expect(s.checkImageUrl).toBe("/stages/4-bulk-done.png");
    expect(s.checkImageAlt).toContain("תפח");
  });
});

describe("stage image assets", () => {
  it("every referenced stage image exists in /public", () => {
    for (const s of STAGES) {
      for (const url of [s.imageUrl, s.checkImageUrl].filter(Boolean) as string[]) {
        const p = path.join(process.cwd(), "public", url);
        expect(
          fs.existsSync(p),
          `stage ${s.n} references ${url} but the file is missing from public/`
        ).toBe(true);
      }
    }
  });
});

describe("stage 1 — levain peak tolerance", () => {
  it("allows a levain slightly past peak instead of demanding a rebuild", () => {
    const tip = getStage(1)!.todo!.tip!;
    expect(tip).toContain("עבר את השיא");
    expect(tip).not.toContain("אל תפספסו");
  });
});

describe("stage 3 — quantity tolerance", () => {
  it("carries a note that small levain deviations are fine", () => {
    expect(getStage(3)!.todoNote).toContain("10%");
  });
});

// 2026-07 content audit: uncovered-bake numbers must agree across the label,
// takeaways, steps, tips, and every bakingMethod variant (source: baking-reference.md).
describe("stage 10 — uncovered bake consistency", () => {
  const s10 = () => getStage(10)!;

  it("every variant lowers the oven temp after removing the steam source", () => {
    const variants = [
      s10().todo!.steps,
      s10().byMethod!["open-with-steam"]!.todo.steps,
      s10().byMethod!.other!.todo.steps,
    ];
    for (const steps of variants) {
      expect(steps.join(" ")).toContain("190–210°C");
    }
  });

  it("has no 230°C reduction target, no 96–98 or 20–25 stragglers", () => {
    const json = JSON.stringify(s10());
    expect(json).not.toContain("230°C");
    expect(json).not.toContain("96–98");
    expect(json).not.toContain("20–25");
    expect(json).toContain("96–99");
  });
});

describe("stage 12 — done copy after the cooling stage", () => {
  it("does not re-instruct the cooling hour that stage 11 already covered", () => {
    expect(getStage(12)!.briefing.blurb).not.toContain("תנו ללחם להצטנן");
  });
});

// 2026-07 engine review + second live-bake feedback round.
describe("engine-review copy contracts", () => {
  it("stage 4 quiet-wait step states the 1–2h duration up front (not only at 4/4 folds)", () => {
    const step = getStage(4)!.todo!.steps.find((s) => s.includes("ההמתנה השקטה"))!;
    expect(step).toContain("שעה-שעתיים");
  });

  it("stage 2 reserve water is weighed separately, not held back from the measured water", () => {
    const step = getStage(2)!.todo!.steps.find((s) =>
      s.includes("{saltReserveWaterGrams}")
    )!;
    expect(step).toContain("בנפרד");
    expect(step).not.toContain("(שמרו");
  });

  it("stage 1 suggests building a ~10% spare before the weighing steps", () => {
    const steps = getStage(1)!.todo!.steps;
    const spareIdx = steps.findIndex((s) => s.includes("עודף"));
    const weighIdx = steps.findIndex((s) => s.includes("{levainWaterGrams}"));
    expect(spareIdx).toBeGreaterThanOrEqual(0);
    expect(spareIdx).toBeLessThan(weighIdx);
  });

  it("stage 3 weighs the exact levain amount instead of adding 'all of it'", () => {
    const step = getStage(3)!.todo!.steps[0]!;
    expect(step).toContain("שקלו {levainTotalGrams}");
    expect(step).toContain("היתרה");
  });

  it("stage 1 drops the dead 10h base; static label matches the step copy", () => {
    const s1 = getStage(1)!;
    expect(s1.durationLabel).toBe("8–12 שעות");
    expect(s1.tempSensitiveBaseSecs).toBeUndefined();
  });
});
