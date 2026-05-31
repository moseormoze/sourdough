import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BakeTimelineSheet } from "./bake-timeline-sheet";

const defaultProps = {
  isOpen: true,
  currentStage: 3,
  kitchenTemp: 24,
  feedRatio: 2 as const,
  retardHours: 12,
  onClose: vi.fn(),
};

beforeEach(() => {
  defaultProps.onClose.mockClear();
});

describe("BakeTimelineSheet", () => {
  it("is not accessible when isOpen is false", () => {
    render(<BakeTimelineSheet {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("is accessible when isOpen is true", () => {
    render(<BakeTimelineSheet {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders all 12 stages", () => {
    render(<BakeTimelineSheet {...defaultProps} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(12);
  });

  it("renders stage names from the stages data", () => {
    render(<BakeTimelineSheet {...defaultProps} />);
    expect(screen.getByText(/בניית שאור/)).toBeInTheDocument();
    expect(screen.getByText("תסיסה ראשונית")).toBeInTheDocument();
  });

  it("marks stages before currentStage as past", () => {
    render(<BakeTimelineSheet {...defaultProps} currentStage={4} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveAttribute("data-state", "past"); // stage 1
    expect(items[1]).toHaveAttribute("data-state", "past"); // stage 2
    expect(items[2]).toHaveAttribute("data-state", "past"); // stage 3
  });

  it("marks currentStage as current", () => {
    render(<BakeTimelineSheet {...defaultProps} currentStage={4} />);
    const items = screen.getAllByRole("listitem");
    expect(items[3]).toHaveAttribute("data-state", "current"); // stage 4
  });

  it("marks stages after currentStage as future", () => {
    render(<BakeTimelineSheet {...defaultProps} currentStage={4} />);
    const items = screen.getAllByRole("listitem");
    expect(items[4]).toHaveAttribute("data-state", "future");  // stage 5
    expect(items[11]).toHaveAttribute("data-state", "future"); // stage 12
  });

  it("when on stage 1, only stage 1 is current and all others are future", () => {
    render(<BakeTimelineSheet {...defaultProps} currentStage={1} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveAttribute("data-state", "current");
    expect(items[1]).toHaveAttribute("data-state", "future");
    expect(items[11]).toHaveAttribute("data-state", "future");
  });

  it("when on stage 12, all previous stages are past", () => {
    render(<BakeTimelineSheet {...defaultProps} currentStage={12} />);
    const items = screen.getAllByRole("listitem");
    expect(items[10]).toHaveAttribute("data-state", "past");
    expect(items[11]).toHaveAttribute("data-state", "current");
  });

  it("stage 1 shows a range label based on feedRatio and kitchenTemp", () => {
    // starterPeakSecs(24, 2) = 8h → durationRangeLabel → "בין 6 ל-8 שעות"
    render(<BakeTimelineSheet {...defaultProps} currentStage={1} kitchenTemp={24} feedRatio={2} />);
    expect(screen.getByText("בין 6 ל-8 שעות")).toBeInTheDocument();
  });

  it("stage 1 label changes with feedRatio (ratio 5 = longer peak)", () => {
    // starterPeakSecs(24, 5) = 14h → durationRangeLabel → "בין 11 ל-14 שעות"
    render(<BakeTimelineSheet {...defaultProps} currentStage={1} kitchenTemp={24} feedRatio={5} />);
    expect(screen.getByText("בין 11 ל-14 שעות")).toBeInTheDocument();
  });

  it("stage 7 shows the chosen retard hours", () => {
    render(<BakeTimelineSheet {...defaultProps} retardHours={16} />);
    expect(screen.getByText("16 שעות")).toBeInTheDocument();
  });

  it("stage 4 (bulk) uses temp-adjusted label", () => {
    // stage 4: tempSensitiveBaseSecs=4h, at kitchenTemp=24 (BASE_TEMP_C) → "כ-4 שעות"
    render(<BakeTimelineSheet {...defaultProps} currentStage={1} kitchenTemp={24} />);
    expect(screen.getByText(/כ-4 שעות/)).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    render(<BakeTimelineSheet {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("סגור טיימליין"));
    expect(defaultProps.onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the backdrop is clicked", () => {
    render(<BakeTimelineSheet {...defaultProps} />);
    fireEvent.click(screen.getByTestId("timeline-backdrop"));
    expect(defaultProps.onClose).toHaveBeenCalledOnce();
  });
});
