import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BakeTimeline } from "./bake-timeline";
import { dayPrefix } from "./bake-timeline";
import { strings } from "@/lib/strings";
import type { BakeTimelinePoints } from "@/lib/bake-timing";

const s = strings.bakeScheduler;

// Fixed reference: 2026-06-01T10:00:00 local
const now = new Date("2026-06-01T10:00:00");

const today14h  = new Date("2026-06-01T14:00:00");
const tomorrow9h = new Date("2026-06-02T09:00:00");
const dayAfter8h = new Date("2026-06-03T08:00:00");

const basePoints: BakeTimelinePoints = {
  levainStart: today14h,
  bulkStart:   new Date("2026-06-02T00:00:00"),
  ovenStart:   new Date("2026-06-02T07:00:00"),
  breadReady:  tomorrow9h,
};

const pointsWithFeed: BakeTimelinePoints = {
  ...basePoints,
  feedAt: new Date("2026-06-01T12:00:00"),
};

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
  it('always renders "לחם מוכן"', () => {
    render(<BakeTimeline points={basePoints} now={now} />);
    expect(screen.getByText(s.timelineDoneLabel)).toBeInTheDocument();
  });

  it('always renders "שאור" and "תסיסה" and "אפייה"', () => {
    render(<BakeTimeline points={basePoints} now={now} />);
    expect(screen.getByText(s.timelineLevainLabel)).toBeInTheDocument();
    expect(screen.getByText(s.timelineBulkLabel)).toBeInTheDocument();
    expect(screen.getByText(s.timelineOvenLabel)).toBeInTheDocument();
  });

  it('renders "האכלה" row when feedAt is provided', () => {
    render(<BakeTimeline points={pointsWithFeed} now={now} />);
    expect(screen.getByText(s.timelineFeedLabel)).toBeInTheDocument();
  });

  it('does NOT render "האכלה" row when feedAt is undefined', () => {
    render(<BakeTimeline points={basePoints} now={now} />);
    expect(screen.queryByText(s.timelineFeedLabel)).not.toBeInTheDocument();
  });

  it('shows "היום" for a date on the same calendar day', () => {
    render(<BakeTimeline points={basePoints} now={now} />);
    const hits = screen.getAllByText("היום");
    expect(hits.length).toBeGreaterThan(0);
  });

  it('shows "מחר" for a date on the next calendar day', () => {
    render(<BakeTimeline points={basePoints} now={now} />);
    const hits = screen.getAllByText("מחר");
    expect(hits.length).toBeGreaterThan(0);
  });
});
