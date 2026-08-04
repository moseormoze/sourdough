import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { act, render, screen, fireEvent } from "@testing-library/react";
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
  afterEach(() => {
    vi.useRealTimers();
  });
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

  it("keeps defaults unchanged and gives Home a glass shell", () => {
    const { rerender } = render(
      <Dialog open onClose={vi.fn()} title="בית" appearance="home" />,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("data-appearance", "home");
    expect(dialog.firstElementChild).toHaveClass("rounded-[2rem]");
    expect(dialog.firstElementChild).toHaveClass("supports-[backdrop-filter]:backdrop-blur-xl");

    rerender(<Dialog open onClose={vi.fn()} title="רגיל" />);
    expect(screen.getByRole("dialog")).toHaveAttribute("data-appearance", "default");
  });

  it("lets the Home dialog finish its 200ms exit before closing", () => {
    vi.useFakeTimers();
    const onAfterClose = vi.fn();
    const { rerender } = render(
      <Dialog
        open
        onClose={vi.fn()}
        onAfterClose={onAfterClose}
        title="בית"
        appearance="home"
      />,
    );

    rerender(
      <Dialog
        open={false}
        onClose={vi.fn()}
        onAfterClose={onAfterClose}
        title="בית"
        appearance="home"
      />,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("open");
    act(() => vi.advanceTimersByTime(199));
    expect(screen.getByRole("dialog")).toHaveAttribute("open");
    act(() => vi.advanceTimersByTime(1));
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
    expect(onAfterClose).toHaveBeenCalledOnce();
  });
});
