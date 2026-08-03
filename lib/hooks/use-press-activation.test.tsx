import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePressActivation } from "./use-press-activation";

function Harness({ onActivate }: { onActivate: () => void }) {
  const { isPressed, pressProps } = usePressActivation<HTMLButtonElement>(onActivate);
  return (
    <button type="button" data-pressed={isPressed ? "" : undefined} {...pressProps}>
      הפעלה
    </button>
  );
}

describe("usePressActivation", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("activates once through a native click", () => {
    const onActivate = vi.fn();
    render(<Harness onActivate={onActivate} />);

    fireEvent.click(screen.getByRole("button"), { detail: 0 });

    expect(onActivate).toHaveBeenCalledOnce();
  });

  it("previews a tap and activates once from the resulting click", () => {
    const onActivate = vi.fn();
    render(<Harness onActivate={onActivate} />);
    const button = screen.getByRole("button");

    fireEvent.pointerDown(button, { pointerId: 1, button: 0, clientX: 0, clientY: 0 });
    expect(button).toHaveAttribute("data-pressed");
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.click(button, { detail: 1 });

    expect(button).not.toHaveAttribute("data-pressed");
    expect(onActivate).toHaveBeenCalledOnce();
  });

  it("suppresses the physical click after movement exceeds 5px", () => {
    const onActivate = vi.fn();
    render(<Harness onActivate={onActivate} />);
    const button = screen.getByRole("button");

    fireEvent.pointerDown(button, { pointerId: 1, button: 0, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(button, { pointerId: 1, clientX: 6, clientY: 0 });
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 6, clientY: 0 });
    fireEvent.click(button, { detail: 1 });

    expect(button).not.toHaveAttribute("data-pressed");
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("does not suppress a keyboard or assistive-technology click after drag", () => {
    const onActivate = vi.fn();
    render(<Harness onActivate={onActivate} />);
    const button = screen.getByRole("button");

    fireEvent.pointerDown(button, { pointerId: 1, button: 0, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(button, { pointerId: 1, clientX: 10, clientY: 0 });
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 10, clientY: 0 });
    fireEvent.click(button, { detail: 0 });

    expect(onActivate).toHaveBeenCalledOnce();
  });

  it.each(["pointerCancel", "blur"] as const)("cleans press state after %s", (eventName) => {
    const onActivate = vi.fn();
    render(<Harness onActivate={onActivate} />);
    const button = screen.getByRole("button");

    fireEvent.pointerDown(button, { pointerId: 1, button: 0, clientX: 0, clientY: 0 });
    fireEvent[eventName](button);
    fireEvent.click(button, { detail: 1 });

    expect(button).not.toHaveAttribute("data-pressed");
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("clears the drag cooldown on unmount", () => {
    const { unmount } = render(<Harness onActivate={() => {}} />);
    const button = screen.getByRole("button");
    fireEvent.pointerDown(button, { pointerId: 1, button: 0, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(button, { pointerId: 1, clientX: 10, clientY: 0 });

    expect(vi.getTimerCount()).toBe(1);
    unmount();
    act(() => vi.runOnlyPendingTimers());
    expect(vi.getTimerCount()).toBe(0);
  });
});
