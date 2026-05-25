import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StageHeader } from "./stage-header";
import { getStage } from "@/lib/data/stages";

describe("StageHeader", () => {
  it("renders stage name and duration label", () => {
    const stage = getStage(4)!;
    render(<StageHeader stage={stage} totalStages={12} />);
    expect(screen.getByText(stage.name)).toBeInTheDocument();
    expect(screen.getByText(stage.durationLabel)).toBeInTheDocument();
  });

  it("renders the hint inline-ltr when present", () => {
    const stage = getStage(1)!; // has hint "(levain)"
    render(<StageHeader stage={stage} totalStages={12} />);
    expect(screen.getByText("(levain)")).toBeInTheDocument();
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
});
