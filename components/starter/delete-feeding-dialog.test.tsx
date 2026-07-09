import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteFeedingDialog } from "./delete-feeding-dialog";

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

describe("DeleteFeedingDialog", () => {
  it("renders the generic confirm copy when open", () => {
    render(<DeleteFeedingDialog open onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText("למחוק את ההאכלה הזו?")).toBeInTheDocument();
  });

  it("calls onConfirm when the confirm button is pressed", () => {
    const onConfirm = vi.fn();
    render(<DeleteFeedingDialog open onConfirm={onConfirm} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "מחק" }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("calls onCancel when the cancel button is pressed", () => {
    const onCancel = vi.fn();
    render(<DeleteFeedingDialog open onConfirm={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "ביטול" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("does not render dialog content when closed", () => {
    render(<DeleteFeedingDialog open={false} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByText("למחוק את ההאכלה הזו?")?.closest("dialog")?.hasAttribute("open")).toBeFalsy();
  });
});
