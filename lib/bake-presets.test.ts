import { describe, it, expect } from "vitest";
import { computePresetSchedule } from "./bake-presets";
import { earliestReadyAt, calculateBakeSteps } from "./bake-timing";

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
  describe("fast — 08:00 start, target 20:00", () => {
    const now = new Date("2025-06-10T08:00:00");

    it("readyAt is at 20:00 (same or next day)", () => {
      const r = computePresetSchedule("fast", now, TEMP, true);
      expect(r.retardSecs).toBe(6 * 3600);
      expect(r.readyAt.getHours()).toBe(20);
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
