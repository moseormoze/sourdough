import { describe, it, expect } from "vitest";
import { RESCUE_STAGES, getRescue } from "./rescue";

describe("rescue content (feature 20)", () => {
  it("covers exactly stages 4-7", () => {
    expect(RESCUE_STAGES).toEqual([4, 5, 6, 7]);
    for (const n of [4, 5, 6, 7]) {
      expect(getRescue(n), `stage ${n}`).not.toBeNull();
    }
  });

  it("returns null for every other stage", () => {
    for (const n of [1, 2, 3, 8, 9, 10, 11, 12, 0, 13]) {
      expect(getRescue(n), `stage ${n}`).toBeNull();
    }
  });

  it("every stage carries three verdicts in ok/under/over order with content", () => {
    for (const n of [4, 5, 6, 7]) {
      const r = getRescue(n)!;
      expect(r.intro.length).toBeGreaterThan(0);
      expect(r.verdicts.map((v) => v.id)).toEqual(["ok", "under", "over"]);
      for (const v of r.verdicts) {
        expect(v.title.length, `stage ${n}/${v.id} title`).toBeGreaterThan(0);
        expect(v.signs.length, `stage ${n}/${v.id} signs`).toBeGreaterThan(0);
        expect(v.steps.length, `stage ${n}/${v.id} steps`).toBeGreaterThan(0);
      }
    }
  });

  it("over-fermentation in stages 4-6 prescribes the cold-rescue path", () => {
    for (const n of [4, 5, 6]) {
      const over = getRescue(n)!.verdicts[2];
      const text = over.steps.join(" ");
      expect(text, `stage ${n} fridge`).toContain("מקרר");
      expect(text, `stage ${n} short retard`).toContain("8–16");
    }
  });

  it("over-fermentation in stages 4-6 offers the pan-bread and focaccia fallbacks", () => {
    for (const n of [4, 5, 6]) {
      const text = getRescue(n)!.verdicts[2].steps.join(" ");
      expect(text, `stage ${n} pan`).toContain("תבנית");
      expect(text, `stage ${n} focaccia`).toContain("פוקאצ׳ה");
    }
  });

  it("stage 7 over-fermentation says bake now, never extend", () => {
    const text = getRescue(7)!.verdicts[2].steps.join(" ");
    expect(text).toContain("אל תאריכו");
  });

  it("stage 7 under-fermentation normalizes small rise in the fridge", () => {
    const text = getRescue(7)!.verdicts[1].steps.join(" ");
    expect(text).toContain("נורמלי");
  });

  it("under-fermentation never tells the baker to add anything to the dough", () => {
    for (const n of [4, 5, 6, 7]) {
      const text = getRescue(n)!.verdicts[1].steps.join(" ");
      expect(text, `stage ${n}`).not.toContain("הוסיפו קמח");
      expect(text, `stage ${n}`).not.toContain("הוסיפו שמרים");
    }
  });
});
