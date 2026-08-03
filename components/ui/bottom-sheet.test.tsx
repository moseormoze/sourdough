import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { BottomSheet } from "./bottom-sheet";

// jsdom doesn't implement requestAnimationFrame — run callbacks synchronously
beforeAll(() => {
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

describe("BottomSheet", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <BottomSheet open={false} onClose={vi.fn()}>
        content
      </BottomSheet>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders dialog when open", () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()}>
        content
      </BottomSheet>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders title with aria-labelledby when provided", () => {
    render(
      <BottomSheet open={true} title="כותרת" onClose={vi.fn()}>
        content
      </BottomSheet>,
    );
    expect(screen.getByText("כותרת")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-labelledby");
  });

  it("omits aria-labelledby when no title", () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()}>
        content
      </BottomSheet>,
    );
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-labelledby");
  });

  it("calls onClose when scrim is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <BottomSheet open={true} onClose={onClose}>
        <button>btn</button>
      </BottomSheet>,
    );
    const scrim = container.querySelector("[aria-hidden]") as HTMLElement;
    fireEvent.click(scrim);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open={true} onClose={onClose}>
        <button>btn</button>
      </BottomSheet>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not call onClose on non-Escape keys", () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open={true} onClose={onClose}>
        <button>btn</button>
      </BottomSheet>,
    );
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("applies peek height by default", () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()}>
        content
      </BottomSheet>,
    );
    expect(screen.getByRole("dialog").className).toContain("56svh");
  });

  it("applies full height when size=full", () => {
    render(
      <BottomSheet open={true} size="full" onClose={vi.fn()}>
        content
      </BottomSheet>,
    );
    expect(screen.getByRole("dialog").className).toContain("88svh");
  });

  it("applies the redesigned pilot shell without changing the default shell", () => {
    const { rerender } = render(
      <BottomSheet open={true} variant="pilot" title="הסבר" onClose={vi.fn()}>
        content
      </BottomSheet>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("data-variant", "pilot");
    expect(screen.getByRole("dialog")).toHaveClass("rounded-t-[2.25rem]");
    expect(screen.getByRole("dialog")).toHaveClass(
      "bg-[linear-gradient(160deg,_#FFF8F1_0%,_#FFDDBD_22%,_#F7F0E7_55%,_#DDEDF2_100%)]",
    );
    expect(screen.getByRole("dialog")).not.toHaveClass("from-[#FFFDF9]");
    expect(screen.getByRole("heading", { name: "הסבר" })).toHaveClass("text-display-sm");
    expect(screen.getByRole("button", { name: "סגור" })).toHaveClass(
      "hover:bg-ink/[0.04]",
    );

    rerender(
      <BottomSheet open={true} title="ברירת מחדל" onClose={vi.fn()}>
        content
      </BottomSheet>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("data-variant", "default");
    expect(screen.getByRole("heading", { name: "ברירת מחדל" })).toHaveClass("text-heading");
  });

  it("removes dialog from DOM after close animation", async () => {
    const { rerender, container } = render(
      <BottomSheet open={true} onClose={vi.fn()}>
        content
      </BottomSheet>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    rerender(
      <BottomSheet open={false} onClose={vi.fn()}>
        content
      </BottomSheet>,
    );

    await waitFor(() => expect(container.firstChild).toBeNull(), {
      timeout: 500,
    });
  });

  it("focuses the close (×) button when opened", () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()}>
        <button data-testid="first">First</button>
        <button data-testid="second">Second</button>
      </BottomSheet>,
    );
    // The × button is the first focusable element in the panel
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "סגור" }));
  });

  it("wraps focus to last when Shift+Tab on the close button", () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()}>
        <button data-testid="first">First</button>
        <button data-testid="last">Last</button>
      </BottomSheet>,
    );
    const closeBtn = screen.getByRole("button", { name: "סגור" });
    closeBtn.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByTestId("last"));
  });

  it("dismisses on drag past threshold", () => {
    const onClose = vi.fn();
    const { container } = render(
      <BottomSheet open={true} onClose={onClose}>
        content
      </BottomSheet>,
    );
    const handle = container.querySelector(".cursor-grab") as HTMLElement;
    fireEvent.pointerDown(handle, { clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 90, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientY: 90, pointerId: 1 });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not move before the 5px drag threshold", () => {
    const { container } = render(
      <BottomSheet open={true} onClose={vi.fn()}>
        content
      </BottomSheet>,
    );
    const handle = container.querySelector(".cursor-grab") as HTMLElement;
    const dialog = screen.getByRole("dialog");
    fireEvent.pointerDown(handle, { clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 4, pointerId: 1 });
    expect(dialog.style.transform).toBe("translateY(0)");
  });

  it("moves 1:1 below the dismiss threshold", () => {
    const { container } = render(
      <BottomSheet open={true} onClose={vi.fn()}>
        content
      </BottomSheet>,
    );
    const handle = container.querySelector(".cursor-grab") as HTMLElement;
    const dialog = screen.getByRole("dialog");
    fireEvent.pointerDown(handle, { clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 50, pointerId: 1 });
    expect(dialog.style.transform).toBe("translateY(50px)");
  });

  it("applies resistance after 80px and caps the visual offset at 140px", () => {
    const { container } = render(
      <BottomSheet open={true} onClose={vi.fn()}>
        content
      </BottomSheet>,
    );
    const handle = container.querySelector(".cursor-grab") as HTMLElement;
    const dialog = screen.getByRole("dialog");
    fireEvent.pointerDown(handle, { clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 100, pointerId: 1 });
    expect(dialog.style.transform).toBe("translateY(86px)");
    fireEvent.pointerMove(handle, { clientY: 1000, pointerId: 1 });
    expect(dialog.style.transform).toBe("translateY(140px)");
  });

  it("dismisses a short drag when its velocity exceeds 0.5px/ms", () => {
    const onClose = vi.fn();
    const { container } = render(
      <BottomSheet open={true} onClose={onClose}>
        content
      </BottomSheet>,
    );
    const handle = container.querySelector(".cursor-grab") as HTMLElement;
    let call = 0;
    const now = vi
      .spyOn(Date, "now")
      .mockImplementation(() => (call++ === 0 ? 1_000 : 1_050));
    fireEvent.pointerDown(handle, { clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 30, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientY: 30, pointerId: 1 });
    now.mockRestore();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("snaps back without dismissing on pointer cancel", () => {
    const onClose = vi.fn();
    const { container } = render(
      <BottomSheet open={true} onClose={onClose}>
        content
      </BottomSheet>,
    );
    const handle = container.querySelector(".cursor-grab") as HTMLElement;
    const dialog = screen.getByRole("dialog");
    fireEvent.pointerDown(handle, { clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 90, pointerId: 1 });
    fireEvent.pointerCancel(handle, { clientY: 90, pointerId: 1 });
    expect(onClose).not.toHaveBeenCalled();
    expect(dialog.style.transform).toBe("translateY(0)");
    expect(dialog.style.transition).toContain("250ms");
  });

  it("gives the drag handle a 44px touch target", () => {
    const { container } = render(
      <BottomSheet open={true} onClose={vi.fn()}>
        content
      </BottomSheet>,
    );
    const handle = container.querySelector(".cursor-grab") as HTMLElement;
    expect(handle).toHaveClass("min-h-touch");
  });

  it("does not dismiss on drag below threshold", () => {
    const onClose = vi.fn();
    const { container } = render(
      <BottomSheet open={true} onClose={onClose}>
        content
      </BottomSheet>,
    );
    const handle = container.querySelector(".cursor-grab") as HTMLElement;
    // Mock Date.now so elapsed = 2000ms → velocity = 30/2000 = 0.015 < 0.5
    let call = 0;
    const base = 1_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => (call++ === 0 ? base : base + 2000));
    fireEvent.pointerDown(handle, { clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 30, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientY: 30, pointerId: 1 });
    vi.restoreAllMocks();
    expect(onClose).not.toHaveBeenCalled();
  });
});
