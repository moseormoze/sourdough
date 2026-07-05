import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RescueSheet } from "./rescue-sheet";
import { getRescue } from "@/lib/data/rescue";

describe("RescueSheet", () => {
  it("renders nothing for a stage without rescue content", () => {
    const { container } = render(
      <RescueSheet stageN={2} isOpen={true} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the intro and all three verdicts for stage 5", () => {
    render(<RescueSheet stageN={5} isOpen={true} onClose={() => {}} />);
    const rescue = getRescue(5)!;
    expect(screen.getByText(rescue.intro)).toBeInTheDocument();
    for (const v of rescue.verdicts) {
      expect(screen.getByText(v.title)).toBeInTheDocument();
    }
  });

  it("renders signs as list items and steps as ordered steps", () => {
    render(<RescueSheet stageN={4} isOpen={true} onClose={() => {}} />);
    const over = getRescue(4)!.verdicts[2];
    expect(screen.getByText(over.signs[0]!)).toBeInTheDocument();
    expect(screen.getByText(over.steps[0]!)).toBeInTheDocument();
  });

  it("closes via the close button", () => {
    const onClose = vi.fn();
    render(<RescueSheet stageN={5} isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "סגור" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("is not rendered when closed", () => {
    render(<RescueSheet stageN={5} isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
