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

  it("every stage has a Hebrew briefing; only the Autolysis pilot omits takeaways", () => {
    for (const s of STAGES) {
      expect(s.briefing.heading.length).toBeGreaterThan(0);
      expect(s.briefing.blurb.length).toBeGreaterThan(0);
      if (s.n === 2) {
        expect(s.briefing.takeaways).toEqual([]);
      } else {
        expect(s.briefing.takeaways.length).toBeGreaterThan(0);
      }
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

describe("stage 2 — Autolysis content-layers pilot main path", () => {
  const stage = () => getStage(2)!;

  it("has one purpose, exactly four actions, and no redundant tip", () => {
    expect(stage().briefing).toEqual({
      heading: "מטרת השלב",
      blurb:
        "לתת לקמח לספוג את המים ולהתחיל להתארגן, כדי שהערבוב בשלב הבא יהיה קל ואחיד יותר.",
      takeaways: [],
    });
    expect(stage().todo?.steps).toEqual([
      "שקלו {mixFlourBreakdown} לקערה גדולה.",
      "הוסיפו {autolyseWaterGrams} מים. שקלו בנפרד {saltReserveWaterGrams} מים ושמרו לשלב הבא.",
      "ערבבו ביד או בכף רק עד שכל הקמח רטוב ואין כיסים יבשים. לא לשים; הבצק אמור להישאר גס.",
      "כסו את הקערה במכסה, מגבת לחה או ניילון נצמד, כדי שפני הבצק לא יתייבשו, והניחו בטמפרטורת החדר 30–60 דקות.",
    ]);
    expect(stage().todo?.tip).toBeUndefined();
  });

  it("has exactly three observable signs and one immediate transition", () => {
    expect(stage().checks).toEqual([
      "אין כיסי קמח יבש",
      "הבצק רך ונמתח מעט יותר בקלות",
      "המרקם נראה מעט אחיד יותר, אבל עדיין יכול להיות גס ודביק",
    ]);
    expect(stage().transition).toBe(
      "עכשיו עוברים ללישה ומוסיפים את השאור, המלח והמים ששמרתם — אין זמן המתנה נוסף."
    );
  });

  it("removes the AI image from stage 2 without changing neighboring stage media", () => {
    expect(stage().imageUrl).toBeUndefined();
    expect(stage().imageAlt).toBeUndefined();
    expect(getStage(1)?.imageUrl).toBe("/stages/1-levain.png");
    expect(getStage(3)?.imageUrl).toBe("/stages/3-mixed-dough.png");
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

// Live-bake feedback (2026-07, pre-shape): the video demoed a different school
// (wet-hand rounding, no folds) than the course's fold-like-a-sack method, and
// the copy never said where the dough rests or that spreading is normal.
describe("stage 5 — pre-shape clarity", () => {
  const s5 = () => getStage(5)!;

  it("uses the boule video that matches the fold-to-center method", () => {
    expect(s5().youtubeId).toBe("IWA0RAAsBHg");
  });

  it("teaches fold-edges-to-center like closing a sack", () => {
    expect(s5().todo!.steps.join(" ")).toContain("כמו סוגרים שק");
  });

  it("says the dough stays on the counter — not bowl, not basket", () => {
    const steps = s5().todo!.steps.join(" ");
    expect(steps).toContain("לא חוזרים לקערה");
    expect(steps).toContain("סלסלה");
  });

  it("sets expectations that relaxing during the bench rest is normal", () => {
    expect(s5().todo!.tip).toContain("יתרווח");
    expect(s5().checks!.join(" ")).toContain("תקין");
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

describe("stage reference photos — round 2", () => {
  // Reversed by discovery 20: the windowpane bar was unreachable at end-of-mix
  // with the app's own gentle-mix method, so the criterion and its check image
  // are gone. The main stage image is untouched (deferred to the images round).
  it("stage 3 no longer gates on a windowpane check image", () => {
    const s = getStage(3)!;
    expect(s.checkImageUrl).toBeUndefined();
    expect(JSON.stringify(s)).not.toContain("windowpane");
  });

  it("stage 6 carries a seam-up banneton check image", () => {
    const s = getStage(6)!;
    expect(s.checkImageUrl).toBe("/stages/6-banneton.png");
    expect(s.checkImageAlt).toContain("התפר");
  });

  it("stage 10 carries a crust-color stage image", () => {
    const s = getStage(10)!;
    expect(s.imageUrl).toBe("/stages/10-crust.png");
    expect(s.imageAlt).toContain("קרום");
  });

  it("stage 12 carries a crumb stage image", () => {
    const s = getStage(12)!;
    expect(s.imageUrl).toBe("/stages/12-crumb.png");
    expect(s.imageAlt).toContain("פירור");
  });

  it("stage 4's 4:3 check image declares its dimensions", () => {
    const s = getStage(4)!;
    expect(s.checkImageHeight).toBe(1055);
  });

  it("stage 7 carries a post-retard stage image", () => {
    const s = getStage(7)!;
    expect(s.imageUrl).toBe("/stages/7-retard-done.png");
    expect(s.imageAlt).toContain("התפחה קרה");
  });

  it("stage 12 notes that crumb varies with the flour mix", () => {
    expect(getStage(12)!.briefing.blurb).toContain("צפוף");
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

// Discovery 20 (live bake 2026-07-24): stage 3's finish bar described a developed,
// smooth dough no hand-mixed dough reaches at end-of-mix — real dough is uniform
// but sticky and shaggy. Strength arrives during the bulk folds, the cover
// instruction lived one screen ahead, and the bulk volume anchor was worded two
// different ways.
describe("stage reality copy (discovery 20)", () => {
  it("stage 3 and stage 6 carry English hints like their siblings", () => {
    expect(getStage(3)!.hint).toBe("(final mix)");
    expect(getStage(6)!.hint).toBe("(shaping)");
  });

  it("stage 3's bar is uniformity — smooth-and-elastic is gone everywhere", () => {
    const s = getStage(3)!;
    expect(s.checks!.join(" ")).toContain("אחיד");
    expect(s.checks!.join(" ")).not.toContain("חלק וגמיש");
    expect(s.briefing.takeaways.join(" ")).not.toContain("חלק וגמיש");
  });

  it("stage 3 says sticky-and-shaggy is the correct end state", () => {
    const all = [...getStage(3)!.todo!.steps, getStage(3)!.todo!.tip!].join(" ");
    expect(all).toContain("דביק ופרוע");
  });

  it("stage 3 ends with cover-and-move-on — no bowl-height marking (useless in a wide bowl)", () => {
    const s = getStage(3)!;
    expect(s.todo!.steps.at(-1)).toContain("כסו את הקערה");
    expect(JSON.stringify(s)).not.toContain("סמנו");
  });

  it("stage 3's tip defers strength to the bulk folds instead of gating on it", () => {
    expect(getStage(3)!.todo!.tip).toContain("קיפולים");
  });

  it("stage 4 anchors the volume to the end-of-mix level in every mention", () => {
    const s = getStage(4)!;
    expect(s.briefing.takeaways.join(" ")).toContain("בסוף הלישה");
    expect(s.briefing.takeaways.join(" ")).not.toContain("מאז שהשאור נכנס");
    expect(s.todo!.steps.at(-1)).toContain("בסוף הלישה");
    // No dangling reference to a mark that no longer exists (bowl-marking dropped).
    expect(JSON.stringify(s)).not.toContain("שסימנתם");
  });

  it("stage 4 closes the loop: smoothness arrives after 2–3 fold sets", () => {
    const foldStep = getStage(4)!.todo!.steps.find((s) => s.includes("סט אחד"))!;
    expect(foldStep).toContain("חלק ומתוח");
  });

  it("stage 6 ends by pointing forward to cover-and-fridge (the 6→7 seam)", () => {
    expect(getStage(6)!.todo!.steps.at(-1)).toContain("לשלב הבא");
  });
});

// Feedback 2026-07-24: every dough-cover instruction must name its method
// (plastic wrap / resting lid / damp towel / bag / shower cap / upturned bowl)
// — "cover the bowl" alone leaves the baker guessing. The first cover mention
// (autolyse) also states WHY: the surface must not dry into a skin.
describe("cover instructions name their method", () => {
  const METHODS = /ניילון|מכסה|מגבת|שקית|כובע מקלחת|קערה הפוכה/;

  it("stage 2 (autolyse) covers with named methods and states the why once", () => {
    const step = getStage(2)!.todo!.steps.find((s) => s.includes("כסו"))!;
    expect(step).toMatch(METHODS);
    expect(step).toContain("יתייבש");
  });

  it("stage 3's closing cover step names methods", () => {
    expect(getStage(3)!.todo!.steps.at(-1)).toMatch(METHODS);
  });

  it("stage 4 names methods both at rest (step 1) and at the quiet wait", () => {
    const steps = getStage(4)!.todo!.steps;
    expect(steps[0]).toMatch(METHODS);
    const quietWait = steps.find((s) => s.includes("ההמתנה השקטה"))!;
    expect(quietWait).toMatch(METHODS);
  });

  it("stage 5's covered bench rest names methods in the takeaway too", () => {
    expect(getStage(5)!.briefing.takeaways.join(" ")).toMatch(METHODS);
  });

  it("stage 6's forward pointer names the banneton cover method", () => {
    expect(getStage(6)!.todo!.steps.at(-1)).toMatch(/שקית|כובע מקלחת/);
  });
});

describe("stage 4 — bulk readiness gate (feature 31)", () => {
  const bulk = getStage(4)!;

  it("gates on four observable signs", () => {
    expect(bulk.checks).toEqual([
      "תפח משמעותית — 30–75% מהנפח שהיה בסוף הלישה",
      "רוטט כמו ג׳לי כשמנערים בעדינות את הקערה",
      "בועות על פני השטח ובדפנות",
      "משתחרר מדפנות הקערה ולא נדבק חזק",
    ]);
  });

  it("drops the judgment-dependent sign from the gate", () => {
    expect(bulk.checks!.some((c) => c.includes("קליל וגמיש"))).toBe(false);
  });

  it("frames the stage as the most decisive and the hardest to read", () => {
    expect(bulk.briefing.blurb).toContain("הכי משפיע על התוצאה");
    expect(bulk.briefing.blurb).toContain("אין דרך לתקן אותו אחר כך");
  });

  it("offers the opening photo as an optional step and adds no upload UI", () => {
    const photoStep = bulk.todo!.steps.find((s) => s.includes("צלמו"));
    expect(photoStep).toBeDefined();
    expect(photoStep).toMatch(/^אם תרצו/);
  });
});
