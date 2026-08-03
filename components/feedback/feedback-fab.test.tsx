import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, it, expect, vi } from "vitest";
import { FeedbackFab } from "./feedback-fab";
import { strings } from "@/lib/strings";
import { pathnameMock } from "../../vitest.setup";

vi.mock("./feedback-sheet", () => ({
  FeedbackSheet: ({ open }: { open: boolean }) => (
    <div data-testid="feedback-sheet" data-open={open} />
  ),
}));

describe("FeedbackFab", () => {
  beforeEach(() => pathnameMock.mockReturnValue("/"));

  it("renders the fab button with correct aria-label", () => {
    render(<FeedbackFab />);
    expect(screen.getByRole("button", { name: strings.feedback.fabLabel })).toBeInTheDocument();
  });

  it("stays out of the active bake workflow", () => {
    pathnameMock.mockReturnValue("/bake/stage/2");
    render(<FeedbackFab />);

    expect(screen.queryByRole("button", { name: strings.feedback.fabLabel })).not.toBeInTheDocument();
  });

  it("does not change the existing feedback entry on other bake stages", () => {
    pathnameMock.mockReturnValue("/bake/stage/3");
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

  it("cancels activation after the pointer turns into a drag", () => {
    render(<FeedbackFab />);
    const button = screen.getByRole("button", { name: strings.feedback.fabLabel });

    fireEvent.pointerDown(button, { clientX: 0, clientY: 0 });
    fireEvent.pointerMove(button, { clientX: 12, clientY: 12 });
    fireEvent.pointerUp(button, { clientX: 12, clientY: 12 });
    fireEvent.click(button, { detail: 1 });

    expect(button).toHaveAttribute("data-manual-press", "true");
    expect(screen.getByTestId("feedback-sheet")).toHaveAttribute("data-open", "false");
  });
});
