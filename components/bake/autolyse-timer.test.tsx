import type { ComponentProps } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AutolyseTimer } from "./autolyse-timer";

const noop = () => {};
const DEFAULT_DURATION = 45 * 60;

function renderTimer(
  overrides: Partial<ComponentProps<typeof AutolyseTimer>> = {}
) {
  return render(
    <AutolyseTimer
      durationSeconds={DEFAULT_DURATION}
      startedAt={null}
      elapsedSeconds={0}
      onStart={noop}
      onPause={noop}
      onResume={noop}
      onReset={noop}
      onSetRemaining={noop}
      {...overrides}
    />
  );
}

describe("AutolyseTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-02T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the duration selector behind the requested CTA", () => {
    renderTimer();

    expect(screen.queryByRole("listbox", { name: "שעות" })).not.toBeInTheDocument();
    expect(screen.queryByRole("listbox", { name: "דקות" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "הפעל טיימר" }));

    const dialog = screen.getByRole("dialog", { name: "בחירת זמן" });
    expect(within(dialog).getByRole("listbox", { name: "שעות" })).toBeInTheDocument();
    expect(within(dialog).getByRole("listbox", { name: "דקות" })).toBeInTheDocument();
    expect(within(dialog).getByRole("option", { name: "0 שעות" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(within(dialog).getByRole("option", { name: "45 דקות" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("starts with the duration selected in the wheel", () => {
    const onStart = vi.fn();
    renderTimer({ onStart });
    fireEvent.click(screen.getByRole("button", { name: "הפעל טיימר" }));

    const dialog = screen.getByRole("dialog", { name: "בחירת זמן" });
    fireEvent.click(within(dialog).getByRole("option", { name: "1 שעה" }));
    fireEvent.click(within(dialog).getByRole("option", { name: "30 דקות" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "הפעל טיימר" }));

    expect(onStart).toHaveBeenCalledWith(90 * 60);
  });

  it("selects an hour by dragging the wheel and displays long timers as hours", () => {
    const onStart = vi.fn();
    const { rerender } = renderTimer({ onStart });
    fireEvent.click(screen.getByRole("button", { name: "הפעל טיימר" }));

    const dialog = screen.getByRole("dialog", { name: "בחירת זמן" });
    const hoursWheel = within(dialog).getByRole("listbox", { name: "שעות" });
    const minutesWheel = within(dialog).getByRole("listbox", { name: "דקות" });
    Object.defineProperty(hoursWheel, "scrollTop", { value: 2 * 56, writable: true });
    Object.defineProperty(minutesWheel, "scrollTop", { value: 4 * 56, writable: true });
    fireEvent.scroll(hoursWheel);
    fireEvent.scroll(minutesWheel);
    act(() => vi.advanceTimersByTime(100));
    fireEvent.click(within(dialog).getByRole("button", { name: "הפעל טיימר" }));
    expect(onStart).toHaveBeenCalledWith(140 * 60);

    rerender(
      <AutolyseTimer
        durationSeconds={140 * 60}
        startedAt={Date.now()}
        elapsedSeconds={0}
        onStart={noop}
        onPause={noop}
        onResume={noop}
        onReset={noop}
        onSetRemaining={noop}
      />
    );
    expect(screen.getAllByText("02:20:00").length).toBeGreaterThan(0);
  });

  it("renders a compact running card with direct pause and edit controls", () => {
    const onPause = vi.fn();
    renderTimer({ startedAt: Date.now(), onPause });

    expect(screen.getByText("45:00")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "השהה" }));
    expect(onPause).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "עריכת זמן" })).toBeInTheDocument();
  });

  it("opens the expanded draining countdown from the compact card", () => {
    renderTimer({ startedAt: Date.now() });
    fireEvent.click(screen.getByRole("button", { name: "פתח טיימר מורחב" }));

    const dialog = screen.getByRole("dialog", { name: "טיימר אוטוליזה" });
    expect(within(dialog).getByText("45:00")).toBeInTheDocument();
    expect(within(dialog).getByRole("progressbar", { name: "זמן שנותר" })).toHaveAttribute(
      "aria-valuenow",
      String(DEFAULT_DURATION)
    );

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(within(dialog).getByText("44:55")).toBeInTheDocument();
  });

  it("edits the remaining time without resetting until save", () => {
    const onSetRemaining = vi.fn();
    renderTimer({ startedAt: Date.now(), onSetRemaining });
    fireEvent.click(screen.getByRole("button", { name: "עריכת זמן" }));

    const dialog = screen.getByRole("dialog", { name: "עריכת זמן שנותר" });
    fireEvent.click(within(dialog).getByRole("option", { name: "1 שעה" }));
    fireEvent.click(within(dialog).getByRole("option", { name: "30 דקות" }));
    expect(onSetRemaining).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "שמור זמן" }));
    expect(onSetRemaining).toHaveBeenCalledWith(90 * 60);
  });

  it("shows resume on the compact card while paused", () => {
    const onResume = vi.fn();
    renderTimer({ elapsedSeconds: 60, onResume });

    expect(screen.getByText("44:00")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "המשך" }));
    expect(onResume).toHaveBeenCalledOnce();
  });
});
