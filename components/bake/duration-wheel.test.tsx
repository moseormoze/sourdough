import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import { DurationWheel } from "./duration-wheel";

function renderWheel(valueMinutes = 45, onChange = vi.fn()) {
  render(<DurationWheel valueMinutes={valueMinutes} onChange={onChange} />);
  return {
    onChange,
    hours: screen.getByRole("listbox", { name: "שעות" }),
    minutes: screen.getByRole("listbox", { name: "דקות" }),
  };
}

// User decision 2026-08-06: the baker picks the exact minute, on two scrollable
// columns, with no curated list and no restricted range.
describe("DurationWheel — two free columns", () => {
  it("offers every hour from 0 to 23", () => {
    const { hours } = renderWheel();
    const options = within(hours).getAllByRole("option");
    expect(options).toHaveLength(24);
    expect(options[0]).toHaveTextContent("00");
    expect(options[23]).toHaveTextContent("23");
  });

  it("offers every single minute from 0 to 59, not 5-minute steps", () => {
    const { minutes } = renderWheel();
    const options = within(minutes).getAllByRole("option");
    expect(options).toHaveLength(60);
    expect(options.map((o) => o.textContent?.trim())).toContain("37");
    expect(options.map((o) => o.textContent?.trim())).toContain("59");
  });

  it("picks an exact odd minute", () => {
    const { minutes, onChange } = renderWheel(45);
    fireEvent.click(within(minutes).getByRole("option", { name: "37 דקות" }));
    expect(onChange).toHaveBeenCalledWith(37);
  });

  it("combines the hour column with the minute column", () => {
    const { hours, onChange } = renderWheel(45);
    fireEvent.click(within(hours).getByRole("option", { name: "2 שעות" }));
    expect(onChange).toHaveBeenCalledWith(2 * 60 + 45);
  });

  it("keeps both columns scrollable", () => {
    const { hours, minutes } = renderWheel();
    [hours, minutes].forEach((column) => {
      expect(column.className).toContain("overflow-y-auto");
      expect(column.className).toContain("snap-y");
    });
  });

  it("marks the current value in each column", () => {
    const { hours, minutes } = renderWheel(2 * 60 + 7);
    expect(within(hours).getByRole("option", { name: "2 שעות" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(within(minutes).getByRole("option", { name: "7 דקות" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });
});

// ui-playbook §1: each column settles scroll on a timer while its options are
// also tappable, so a tap arriving mid-settle used to lose to the pending scroll
// position. The tap must win.
describe("DurationWheel — scroll/tap race (state machine)", () => {
  it("a tap cancels a pending scroll settle instead of losing to it", () => {
    vi.useFakeTimers();
    const { minutes, onChange } = renderWheel(45);

    Object.defineProperty(minutes, "scrollTop", { value: 0, writable: true });
    fireEvent.scroll(minutes);
    fireEvent.click(within(minutes).getByRole("option", { name: "37 דקות" }));
    act(() => { vi.advanceTimersByTime(500); });

    expect(onChange).toHaveBeenCalledWith(37);
    expect(onChange).not.toHaveBeenCalledWith(0);
    vi.useRealTimers();
  });

  it("momentum scroll right after a tap does not override the tap", () => {
    vi.useFakeTimers();
    const { minutes, onChange } = renderWheel(45);

    fireEvent.click(within(minutes).getByRole("option", { name: "37 דקות" }));
    Object.defineProperty(minutes, "scrollTop", { value: 0, writable: true });
    fireEvent.scroll(minutes);
    act(() => { vi.advanceTimersByTime(150); });

    expect(onChange).toHaveBeenCalledWith(37);
    expect(onChange).not.toHaveBeenCalledWith(0);
    vi.useRealTimers();
  });

  it("a settled scroll with no competing tap still selects", () => {
    vi.useFakeTimers();
    const { minutes, onChange } = renderWheel(45);

    Object.defineProperty(minutes, "scrollTop", { value: 12 * 56, writable: true });
    fireEvent.scroll(minutes);
    act(() => { vi.advanceTimersByTime(500); });

    expect(onChange).toHaveBeenCalledWith(12);
    vi.useRealTimers();
  });
});
