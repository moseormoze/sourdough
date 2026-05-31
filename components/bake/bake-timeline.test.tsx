import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BakeTimeline, dayPrefix } from "./bake-timeline";
import { strings } from "@/lib/strings";
import { calculateBakeSteps } from "@/lib/bake-timing";

const s = strings.bakeScheduler;

// Fixed reference: 2026-06-01T10:00:00 local
const now = new Date("2026-06-01T10:00:00");

const today14h = new Date("2026-06-01T14:00:00");
const tomorrow9h = new Date("2026-06-02T09:00:00");
const dayAfter8h = new Date("2026-06-03T08:00:00");

// A realistic target ~40h out so the schedule spans multiple days.
const target = new Date("2026-06-03T18:00:00");
const stepsReady = calculateBakeSteps(target, 25, true);
const stepsNotReady = calculateBakeSteps(target, 25, false);

// ---------------------------------------------------------------------------
// dayPrefix helper
// ---------------------------------------------------------------------------

describe("dayPrefix", () => {
  it('returns "היום" for same calendar day', () => {
    expect(dayPrefix(today14h, now)).toBe("היום");
  });

  it('returns "מחר" for next calendar day', () => {
    expect(dayPrefix(tomorrow9h, now)).toBe("מחר");
  });

  it('returns "מחרתיים" for two days ahead', () => {
    expect(dayPrefix(dayAfter8h, now)).toBe("מחרתיים");
  });
});

// ---------------------------------------------------------------------------
// BakeTimeline component
// ---------------------------------------------------------------------------

describe("BakeTimeline", () => {
  it("renders the final ready label", () => {
    render(<BakeTimeline steps={stepsReady} now={now} />);
    expect(screen.getByText(s.timelineSteps.ready.label)).toBeInTheDocument();
  });

  it("renders mix, bulk, and the separated preheat + bake-in rows", () => {
    render(<BakeTimeline steps={stepsReady} now={now} />);
    expect(screen.getByText(s.timelineSteps.mix.label)).toBeInTheDocument();
    expect(screen.getByText(s.timelineSteps.bulk.label)).toBeInTheDocument();
    expect(screen.getByText(s.timelineSteps.preheat.label)).toBeInTheDocument();
    expect(screen.getByText(s.timelineSteps.bake.label)).toBeInTheDocument();
  });

  it("renders the build row when the build step is present", () => {
    render(<BakeTimeline steps={stepsNotReady} now={now} />);
    expect(screen.getByText(s.timelineSteps.build.label)).toBeInTheDocument();
  });

  it("does NOT render the build row when starter is ready", () => {
    render(<BakeTimeline steps={stepsReady} now={now} />);
    expect(screen.queryByText(s.timelineSteps.build.label)).not.toBeInTheDocument();
  });

  it("always shows the cooling recommendation as a trailing tip", () => {
    render(<BakeTimeline steps={stepsReady} now={now} />);
    expect(screen.getByText(new RegExp(s.coolingTip))).toBeInTheDocument();
  });

  it("renders the inline retard slider when editableRetard is provided", () => {
    const onChange = () => {};
    render(
      <BakeTimeline
        steps={stepsReady}
        now={now}
        editableRetard={{ hours: 12, min: 6, max: 72, onChange }}
      />,
    );
    expect(
      screen.getByRole("slider", { name: strings.bakeScheduler.retardSliderLabel }),
    ).toHaveValue("12");
  });
});
