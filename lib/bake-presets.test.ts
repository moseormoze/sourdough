import { describe, it, expect } from "vitest";
import { computePresetSchedule, PRESET_DEFAULT_RATIOS, type PresetKey } from "./bake-presets";
import { earliestReadyAt, calculateBakeSteps, RETARD_MIN_SECS, RETARD_MAX_SECS } from "./bake-timing";
import { ActiveBakeSchema } from "./types/active-bake";

const ACTIVE_KEYS = new Set(["mix", "bulk", "shape", "preheat", "bake"]);
const TEMP = 25;

function activeStepHours(readyAt: Date, retardSecs: number) {
  return calculateBakeSteps(readyAt, TEMP, true, retardSecs).filter((s) =>
    ACTIVE_KEYS.has(s.key),
  ).map((s) => s.startAt.getHours() + s.startAt.getMinutes() / 60);
}

function allInWindow(hours: number[]) {
  return hours.every((h) => h >= 7 && h < 23);
}

describe("computePresetSchedule", () => {
  describe("fast — 08:00 start, target 22:00 (8h retard floor)", () => {
    const now = new Date("2025-06-10T08:00:00");

    it("readyAt is at 22:00 (same or next day)", () => {
      const r = computePresetSchedule("fast", now, TEMP, true);
      expect(r.retardSecs).toBe(8 * 3600);
      expect(r.readyAt.getHours()).toBe(22);
    });

    it("all active steps in 07:00–23:00 window", () => {
      const r = computePresetSchedule("fast", now, TEMP, true);
      expect(allInWindow(activeStepHours(r.readyAt, r.retardSecs))).toBe(true);
    });

    it("readyAt >= earliestReadyAt", () => {
      const r = computePresetSchedule("fast", now, TEMP, true);
      expect(r.readyAt.getTime()).toBeGreaterThanOrEqual(
        earliestReadyAt(TEMP, now, true, r.retardSecs).getTime(),
      );
    });
  });

  describe("classic — 20:00 start, next-day target 10:00", () => {
    const now = new Date("2025-06-10T20:00:00");

    it("readyAt is next day at 10:00", () => {
      const r = computePresetSchedule("classic", now, TEMP, true);
      expect(r.retardSecs).toBe(12 * 3600);
      expect(r.readyAt.getHours()).toBe(10);
      expect(r.readyAt.getDate()).toBeGreaterThan(now.getDate());
    });

    it("all active steps in window", () => {
      const r = computePresetSchedule("classic", now, TEMP, true);
      expect(allInWindow(activeStepHours(r.readyAt, r.retardSecs))).toBe(true);
    });

    it("readyAt >= earliestReadyAt", () => {
      const r = computePresetSchedule("classic", now, TEMP, true);
      expect(r.readyAt.getTime()).toBeGreaterThanOrEqual(
        earliestReadyAt(TEMP, now, true, r.retardSecs).getTime(),
      );
    });
  });

  describe("classic-late — 09:00 start, target 17:00", () => {
    const now = new Date("2025-06-10T09:00:00");

    it("readyAt is at 17:00 with 16h retard", () => {
      const r = computePresetSchedule("classic-late", now, TEMP, true);
      expect(r.retardSecs).toBe(16 * 3600);
      expect(r.readyAt.getHours()).toBe(17);
    });

    it("all active steps in window", () => {
      const r = computePresetSchedule("classic-late", now, TEMP, true);
      expect(allInWindow(activeStepHours(r.readyAt, r.retardSecs))).toBe(true);
    });
  });

  describe("long — any start", () => {
    const now = new Date("2025-06-10T12:00:00");

    it("readyAt is at 18:00 (total bake >> 28h ahead)", () => {
      const r = computePresetSchedule("long", now, TEMP, true);
      expect(r.retardSecs).toBe(28 * 3600);
      expect(r.readyAt.getHours()).toBe(18);
      const hoursAhead = (r.readyAt.getTime() - now.getTime()) / 3600000;
      expect(hoursAhead).toBeGreaterThanOrEqual(28);
    });

    it("all active steps in window", () => {
      const r = computePresetSchedule("long", now, TEMP, true);
      expect(allInWindow(activeStepHours(r.readyAt, r.retardSecs))).toBe(true);
    });

    it("readyAt >= earliestReadyAt", () => {
      const r = computePresetSchedule("long", now, TEMP, true);
      expect(r.readyAt.getTime()).toBeGreaterThanOrEqual(
        earliestReadyAt(TEMP, now, true, r.retardSecs).getTime(),
      );
    });
  });

  describe("feedRatio — each preset returns its default ratio", () => {
    const now = new Date("2025-06-10T08:00:00");

    it("fast returns ratio 3 (1:3:3 — evening feed, morning mix)", () => {
      expect(computePresetSchedule("fast", now, TEMP, true).feedRatio).toBe(3);
    });
    it("classic returns ratio 2 (1:2:2 — morning feed, afternoon mix)", () => {
      expect(computePresetSchedule("classic", now, TEMP, true).feedRatio).toBe(2);
    });
    it("classic-late returns ratio 2 (1:2:2 — morning feed, late-afternoon mix)", () => {
      expect(computePresetSchedule("classic-late", now, TEMP, true).feedRatio).toBe(2);
    });
    it("long returns ratio 3 (1:3:3 — evening feed, morning mix next day)", () => {
      expect(computePresetSchedule("long", now, TEMP, true).feedRatio).toBe(3);
    });

    it("PRESET_DEFAULT_RATIOS is exported and complete", () => {
      expect(PRESET_DEFAULT_RATIOS.fast).toBe(3);
      expect(PRESET_DEFAULT_RATIOS.classic).toBe(2);
      expect(PRESET_DEFAULT_RATIOS["classic-late"]).toBe(2);
      expect(PRESET_DEFAULT_RATIOS.long).toBe(3);
    });
  });

  describe("edge — 23:00 start, does not crash", () => {
    const now = new Date("2025-06-10T23:00:00");

    it.each(["fast", "classic", "classic-late", "long"] as const)(
      "%s returns a valid future date",
      (key) => {
        const r = computePresetSchedule(key, now, TEMP, true);
        expect(r.readyAt.getTime()).toBeGreaterThan(now.getTime());
        expect(r.retardSecs).toBeGreaterThan(0);
      },
    );
  });

  describe("all presets: readyAt >= earliestReadyAt at various times", () => {
    const times = [
      new Date("2025-06-10T06:00:00"),
      new Date("2025-06-10T14:00:00"),
      new Date("2025-06-10T22:00:00"),
    ];

    it.each(["fast", "classic", "classic-late", "long"] as const)(
      "%s respects the floor at all sample times",
      (key) => {
        for (const now of times) {
          const r = computePresetSchedule(key, now, TEMP, true);
          const floor = earliestReadyAt(TEMP, now, true, r.retardSecs);
          expect(r.readyAt.getTime()).toBeGreaterThanOrEqual(floor.getTime());
        }
      },
    );
  });
});

// Regression: the fast preset used to carry a 6h retard — below the schema's
// 8h floor — so starting a bake from it produced an ActiveBake that
// loadActiveBake() rejected, bouncing the user home and losing the bake.
describe("preset ↔ schema alignment", () => {
  const KEYS: PresetKey[] = ["fast", "classic", "classic-late", "long"];
  const now = new Date("2025-06-10T08:00:00");

  it("every preset retard is inside the engine bounds", () => {
    for (const k of KEYS) {
      const r = computePresetSchedule(k, now, TEMP, true);
      expect(r.retardSecs, k).toBeGreaterThanOrEqual(RETARD_MIN_SECS);
      expect(r.retardSecs, k).toBeLessThanOrEqual(RETARD_MAX_SECS);
    }
  });

  it("every preset retard round-trips through ActiveBakeSchema", () => {
    for (const k of KEYS) {
      const r = computePresetSchedule(k, now, TEMP, true);
      const parsed = ActiveBakeSchema.shape.retardHours.safeParse(r.retardSecs / 3600);
      expect(parsed.success, `${k}: ${r.retardSecs / 3600}h must satisfy the schema`).toBe(true);
    }
  });
});
