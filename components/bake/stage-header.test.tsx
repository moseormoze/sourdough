import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StageHeader } from "./stage-header";
import { getStage } from "@/lib/data/stages";

describe("StageHeader", () => {
  it("renders stage name and duration label", () => {
    const stage = getStage(4)!;
    render(<StageHeader stage={stage} totalStages={12} />);
    expect(screen.getByText(stage.name)).toBeInTheDocument();
    expect(screen.getByText(stage.durationLabel)).toBeInTheDocument();
  });

  it("bulk label is flour-aware and uses the planner's range style", () => {
    const stage = getStage(4)!;
    render(
      <StageHeader
        stage={stage}
        totalStages={12}
        kitchenTemp={24}
        flour={{ white: 0, wholeWheat: 0, rye: 100, speltWhite: 0, speltWhole: 0, other: 0 }}
      />
    );
    // 4h × 0.8 (rye) = 3h12m → range "בין 2 ל-4 שעות" + folds suffix
    expect(screen.getByText(/בין 2 ל-4 שעות · 3–4 קיפולים/)).toBeInTheDocument();
  });

  it("renders the stage name including levain term", () => {
    const stage = getStage(1)!; // name includes "(levain)"
    render(<StageHeader stage={stage} totalStages={12} />);
    expect(screen.getByText(/levain/i)).toBeInTheDocument();
  });

  it("renders the counter N/12", () => {
    const stage = getStage(4)!;
    render(<StageHeader stage={stage} totalStages={12} />);
    expect(screen.getByText("4/12")).toBeInTheDocument();
  });

  it("renders the progress bar with correct aria values", () => {
    const stage = getStage(7)!;
    render(<StageHeader stage={stage} totalStages={12} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "7");
    expect(bar).toHaveAttribute("aria-valuemax", "12");
  });

  it("back link points to /", () => {
    const stage = getStage(1)!;
    render(<StageHeader stage={stage} totalStages={12} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/");
  });

  it("without onTimelineOpen: no timeline button rendered", () => {
    const stage = getStage(4)!;
    render(<StageHeader stage={stage} totalStages={12} />);
    expect(screen.queryByLabelText("פתח טיימליין")).not.toBeInTheDocument();
  });

  it("with onTimelineOpen: renders a tappable timeline button", () => {
    const stage = getStage(4)!;
    render(<StageHeader stage={stage} totalStages={12} onTimelineOpen={vi.fn()} />);
    expect(screen.getByLabelText("פתח טיימליין")).toBeInTheDocument();
  });

  it("tapping the timeline button calls onTimelineOpen", () => {
    const onTimelineOpen = vi.fn();
    const stage = getStage(4)!;
    render(<StageHeader stage={stage} totalStages={12} onTimelineOpen={onTimelineOpen} />);
    const button = screen.getByLabelText("פתח טיימליין");
    fireEvent.pointerDown(button, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(button, { clientX: 0, clientY: 0 });
    expect(onTimelineOpen).toHaveBeenCalledOnce();
  });

  it("dragging on the button does NOT call onTimelineOpen", () => {
    const onTimelineOpen = vi.fn();
    const stage = getStage(4)!;
    render(<StageHeader stage={stage} totalStages={12} onTimelineOpen={onTimelineOpen} />);
    const button = screen.getByLabelText("פתח טיימליין");
    fireEvent.pointerDown(button, { clientX: 0, clientY: 0 });
    fireEvent.pointerMove(button, { clientX: 20, clientY: 20 });
    fireEvent.pointerUp(button, { clientX: 20, clientY: 20 });
    expect(onTimelineOpen).not.toHaveBeenCalled();
  });

  it("progress bar is present regardless of onTimelineOpen", () => {
    const stage = getStage(4)!;
    const { rerender } = render(<StageHeader stage={stage} totalStages={12} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    rerender(<StageHeader stage={stage} totalStages={12} onTimelineOpen={vi.fn()} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
