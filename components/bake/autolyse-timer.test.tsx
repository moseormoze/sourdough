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
      options={[30 * 60, 45 * 60, 60 * 60]}
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

  it.each([
    ["idle", { startedAt: null, elapsedSeconds: 0 }],
    ["running", { startedAt: Date.now(), elapsedSeconds: 0 }],
    ["paused", { startedAt: null, elapsedSeconds: 60 }],
    ["finished", { startedAt: null, elapsedSeconds: DEFAULT_DURATION }],
  ] as const)("exposes the %s state for the page hierarchy", (state, props) => {
    renderTimer(props);
    expect(screen.getByTestId("autolyse-timer")).toHaveAttribute("data-state", state);
  });

  it("recomputes a finished timer from a start timestamp when the page reopens", () => {
    renderTimer({ startedAt: Date.now() - DEFAULT_DURATION * 1000 });

    expect(screen.getByTestId("autolyse-timer")).toHaveAttribute(
      "data-state",
      "finished",
    );
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("keeps the duration selector behind the requested CTA", () => {
    renderTimer();

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "הפעל טיימר" }));

    const dialog = screen.getByRole("dialog", { name: "בחירת זמן" });
    // T3: one column of the stage's curated stops, not free hours × minutes
    expect(within(dialog).getByRole("listbox")).toBeInTheDocument();
    expect(within(dialog).getAllByRole("option")).toHaveLength(3);
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
    fireEvent.click(within(dialog).getByRole("option", { name: "60 דקות" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "הפעל טיימר" }));

    expect(onStart).toHaveBeenCalledWith(60 * 60);
    act(() => vi.advanceTimersByTime(250));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("selects a stop by dragging the wheel and displays long timers as hours", () => {
    const onStart = vi.fn();
    const { rerender } = renderTimer({ onStart });
    fireEvent.click(screen.getByRole("button", { name: "הפעל טיימר" }));

    const dialog = screen.getByRole("dialog", { name: "בחירת זמן" });
    const wheel = within(dialog).getByRole("listbox");
    Object.defineProperty(wheel, "scrollTop", { value: 0, writable: true });
    fireEvent.scroll(wheel);
    act(() => vi.advanceTimersByTime(150));
    fireEvent.click(within(dialog).getByRole("button", { name: "הפעל טיימר" }));
    expect(onStart).toHaveBeenCalledWith(30 * 60);

    rerender(
      <AutolyseTimer
        durationSeconds={140 * 60}
        startedAt={Date.now()}
        elapsedSeconds={0}
        options={[30 * 60, 45 * 60, 60 * 60]}
        onStart={noop}
        onPause={noop}
        onResume={noop}
        onReset={noop}
        onSetRemaining={noop}
      />
    );
    expect(screen.getAllByText("02:20:00").length).toBeGreaterThan(0);
  });

  it("renders the compact page timer with pause and edit controls", () => {
    const onPause = vi.fn();
    renderTimer({ startedAt: Date.now(), onPause });

    expect(screen.getByText("45:00")).toBeInTheDocument();
    expect(screen.getByTestId("autolyse-timer-card")).toHaveAttribute(
      "data-variant",
      "compact",
    );
    expect(screen.getByTestId("autolyse-timer-card")).toHaveAttribute(
      "data-surface",
      "charcoal",
    );
    expect(
      within(screen.getByTestId("autolyse-timer-card")).getByRole("heading", {
        name: "טיימר",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("progressbar", { name: "זמן שנותר" })).not.toBeInTheDocument();
    expect(screen.getByTestId("autolyse-timer-signal")).toBeInTheDocument();
    expect(screen.getByTestId("autolyse-timer-smoke")).toHaveAttribute(
      "opacity",
      "0.18",
    );
    expect(screen.getByTestId("autolyse-timer-line")).not.toHaveAttribute(
      "stroke-dasharray",
    );
    expect(screen.getByTestId("autolyse-timer-line")).not.toHaveAttribute(
      "stroke-dashoffset",
    );
    expect(screen.queryByRole("button", { name: "פתח טיימר מורחב" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "השהה" }));
    expect(onPause).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "עריכת זמן" })).toHaveClass(
      "duration-fast",
    );
  });

  it("keeps countdown display out of BottomSheet and opens only the edit state", () => {
    renderTimer({ startedAt: Date.now() });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "עריכת זמן" }));

    const dialog = screen.getByRole("dialog", { name: "עריכת זמן שנותר" });
    expect(dialog).toHaveAttribute("data-variant", "pilot");
    expect(dialog).toHaveClass(
      "bg-[linear-gradient(160deg,_#FFF8F1_0%,_#FFDDBD_22%,_#F7F0E7_55%,_#DDEDF2_100%)]",
    );
    expect(within(dialog).getByTestId("duration-wheel")).toHaveAttribute(
      "data-surface",
      "glass",
    );
    expect(within(dialog).getByTestId("duration-wheel")).not.toHaveClass(
      "from-[#FFD0A0]/55",
    );
    expect(within(dialog).getByRole("listbox")).toBeInTheDocument();
    expect(within(dialog).queryByRole("progressbar", { name: "זמן שנותר" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "טיימר אוטוליזה" })).not.toBeInTheDocument();
  });

  it("edits the remaining time without resetting until save", () => {
    const onSetRemaining = vi.fn();
    renderTimer({ startedAt: Date.now(), onSetRemaining });
    fireEvent.click(screen.getByRole("button", { name: "עריכת זמן" }));

    const dialog = screen.getByRole("dialog", { name: "עריכת זמן שנותר" });
    fireEvent.click(within(dialog).getByRole("option", { name: "30 דקות" }));
    expect(onSetRemaining).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "שמור זמן" }));
    // one stop = one duration: picking "30 דקות" sets 30 minutes remaining
    expect(onSetRemaining).toHaveBeenCalledWith(30 * 60);
    act(() => vi.advanceTimersByTime(250));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps reset on the finished page card instead of opening another surface", () => {
    const onReset = vi.fn();
    renderTimer({ elapsedSeconds: DEFAULT_DURATION, onReset });

    expect(screen.getByText("00:00")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "התחל מחדש" }));
    expect(onReset).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows resume on the compact card while paused", () => {
    const onResume = vi.fn();
    renderTimer({ elapsedSeconds: 60, onResume });

    expect(screen.getByText("44:00")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "המשך" }));
    expect(onResume).toHaveBeenCalledOnce();
  });

  it("announces timer state changes without announcing every second", () => {
    const { rerender } = renderTimer({ elapsedSeconds: 60 });
    const status = screen.getByRole("status");

    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-atomic", "true");
    expect(status).toHaveTextContent("הטיימר מושהה");

    rerender(
      <AutolyseTimer
        durationSeconds={DEFAULT_DURATION}
        startedAt={Date.now()}
        elapsedSeconds={60}
        options={[30 * 60, 45 * 60, 60 * 60]}
        onStart={noop}
        onPause={noop}
        onResume={noop}
        onReset={noop}
        onSetRemaining={noop}
      />
    );
    expect(status).toHaveTextContent("הטיימר פועל");
    expect(status).not.toHaveTextContent("44:00");
  });
});
