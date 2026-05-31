import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CompactBakeSummary } from "./compact-bake-summary";
import { calculateBakeSteps, DEFAULT_FEED_RATIO } from "@/lib/bake-timing";

// Fixed reference point
const now = new Date("2026-06-01T10:00:00");
const target = new Date("2026-06-02T10:00:00"); // tomorrow 10:00

const stepsReady    = calculateBakeSteps(target, 24, true,  12 * 3600);
const stepsNotReady = calculateBakeSteps(target, 24, false, 12 * 3600);

describe("CompactBakeSummary", () => {
  it("always renders the active-work row", () => {
    render(<CompactBakeSummary steps={stepsReady} feedRatio={DEFAULT_FEED_RATIO} now={now} />);
    expect(screen.getByTestId("active-window-row")).toBeInTheDocument();
  });

  it("always renders the ready-time row", () => {
    render(<CompactBakeSummary steps={stepsReady} feedRatio={DEFAULT_FEED_RATIO} now={now} />);
    expect(screen.getByTestId("ready-row")).toBeInTheDocument();
  });

  it("omits the feed row when no build step (starterReady=true)", () => {
    render(<CompactBakeSummary steps={stepsReady} feedRatio={DEFAULT_FEED_RATIO} now={now} />);
    expect(screen.queryByTestId("feed-row")).not.toBeInTheDocument();
  });

  it("shows the feed row when build step is present (starterReady=false)", () => {
    render(<CompactBakeSummary steps={stepsNotReady} feedRatio={DEFAULT_FEED_RATIO} now={now} />);
    expect(screen.getByTestId("feed-row")).toBeInTheDocument();
  });

  it("feed row contains a ratio label in dir=ltr", () => {
    render(<CompactBakeSummary steps={stepsNotReady} feedRatio={2} now={now} />);
    const row = screen.getByTestId("feed-row");
    expect(screen.getByTestId("feed-row").textContent).toMatch(/1:2:2/);
  });

  it("renders the timeline-disclosure trigger", () => {
    render(<CompactBakeSummary steps={stepsReady} feedRatio={DEFAULT_FEED_RATIO} now={now} />);
    expect(screen.getByTestId("timeline-trigger")).toBeInTheDocument();
  });

  it("calls onTimelineOpen when the disclosure trigger is pressed", () => {
    const onOpen = vi.fn();
    render(
      <CompactBakeSummary
        steps={stepsReady}
        feedRatio={DEFAULT_FEED_RATIO}
        now={now}
        onTimelineOpen={onOpen}
      />
    );
    fireEvent.click(screen.getByTestId("timeline-trigger"));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("has no dismiss button (build step is always required)", () => {
    render(<CompactBakeSummary steps={stepsNotReady} feedRatio={DEFAULT_FEED_RATIO} now={now} />);
    expect(screen.queryByTestId("feed-dismiss")).not.toBeInTheDocument();
  });
});
