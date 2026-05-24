import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Dialog } from "./dialog";

// jsdom does not implement <dialog>.showModal / close — polyfill.
beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
});

describe("Dialog", () => {
  it("does not render content when closed", () => {
    render(<Dialog open={false} onClose={() => {}} title="מחיקה?" />);
    const dialog = document.querySelector("dialog");
    expect(dialog).not.toHaveAttribute("open");
  });

  it("renders title and description when open", () => {
    render(
      <Dialog
        open={true}
        onClose={() => {}}
        title='למחוק את "כפרי"?'
        description="הפעולה לא ניתנת לביטול"
      />
    );
    expect(screen.getByText('למחוק את "כפרי"?')).toBeInTheDocument();
    expect(screen.getByText("הפעולה לא ניתנת לביטול")).toBeInTheDocument();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    render(<Dialog open={true} onClose={onClose} title="title" />);
    const dialog = document.querySelector("dialog");
    if (!dialog) throw new Error("dialog not found");
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalled();
  });

  it("does NOT call onClose when content is clicked", () => {
    const onClose = vi.fn();
    render(
      <Dialog open={true} onClose={onClose} title="title" description="desc" />
    );
    fireEvent.click(screen.getByText("desc"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders custom actions", () => {
    render(
      <Dialog
        open={true}
        onClose={() => {}}
        title="title"
        actions={<button>שמור</button>}
      />
    );
    expect(screen.getByRole("button", { name: "שמור" })).toBeInTheDocument();
  });
});
