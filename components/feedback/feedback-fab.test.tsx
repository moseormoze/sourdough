import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FeedbackFab } from "./feedback-fab";
import { strings } from "@/lib/strings";

vi.mock("./feedback-sheet", () => ({
  FeedbackSheet: ({ open }: { open: boolean }) => (
    <div data-testid="feedback-sheet" data-open={open} />
  ),
}));

describe("FeedbackFab", () => {
  it("renders the fab button with correct aria-label", () => {
    render(<FeedbackFab />);
    expect(screen.getByRole("button", { name: strings.feedback.fabLabel })).toBeInTheDocument();
  });

  it("sheet is closed by default", () => {
    render(<FeedbackFab />);
    expect(screen.getByTestId("feedback-sheet")).toHaveAttribute("data-open", "false");
  });

  it("clicking the fab opens the sheet", () => {
    render(<FeedbackFab />);
    fireEvent.click(screen.getByRole("button", { name: strings.feedback.fabLabel }));
    expect(screen.getByTestId("feedback-sheet")).toHaveAttribute("data-open", "true");
  });
});
