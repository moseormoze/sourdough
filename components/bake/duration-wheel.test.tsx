import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { DurationWheel } from "./duration-wheel";

const MIN = 60;
const AUTOLYSE = [30 * MIN, 45 * MIN, 60 * MIN] as const;

describe("DurationWheel — curated stops", () => {
  it("renders exactly the stops it was given, and nothing else", () => {
    render(
      <DurationWheel options={AUTOLYSE} valueSeconds={45 * MIN} onChange={() => {}} />
    );
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options.map((o) => o.textContent?.trim())).toEqual([
      "30 דקות",
      "45 דקות",
      "60 דקות",
    ]);
  });

  it("marks only the current stop as selected", () => {
    render(
      <DurationWheel options={AUTOLYSE} valueSeconds={45 * MIN} onChange={() => {}} />
    );
    const selected = screen.getAllByRole("option").filter(
      (o) => o.getAttribute("aria-selected") === "true"
    );
    expect(selected).toHaveLength(1);
    expect(selected[0]!.textContent?.trim()).toBe("45 דקות");
  });

  it("emits the chosen stop in seconds", () => {
    const onChange = vi.fn();
    render(
      <DurationWheel options={AUTOLYSE} valueSeconds={45 * MIN} onChange={onChange} />
    );
    fireEvent.click(screen.getByRole("option", { name: "60 דקות" }));
    expect(onChange).toHaveBeenCalledWith(60 * MIN);
  });

  it("labels hour-scale stops in hours, not minutes", () => {
    render(
      <DurationWheel
        options={[8 * 3600, 12 * 3600, 16 * 3600]}
        valueSeconds={12 * 3600}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole("option", { name: "12 שעות" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "8 שעות" })).toBeInTheDocument();
  });

  it("can never emit a value outside its stops", () => {
    const onChange = vi.fn();
    render(
      <DurationWheel options={AUTOLYSE} valueSeconds={45 * MIN} onChange={onChange} />
    );
    screen.getAllByRole("option").forEach((o) => fireEvent.click(o));
    onChange.mock.calls.forEach(([value]) => {
      expect(AUTOLYSE).toContain(value);
    });
  });
});

// ui-playbook §1: the wheel settles scroll on a timer while its options are also
// tappable. A tap arriving mid-settle must win, or the pending scroll position
// silently overrides the baker's explicit choice.
describe("DurationWheel — scroll/tap race (state machine)", () => {
  it("a tap cancels a pending scroll settle instead of losing to it", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(
      <DurationWheel options={AUTOLYSE} valueSeconds={45 * MIN} onChange={onChange} />
    );
    const list = screen.getByRole("listbox");

    // the baker drags toward the first stop, then taps the last one before the
    // scroll has settled
    Object.defineProperty(list, "scrollTop", { value: 0, writable: true });
    fireEvent.scroll(list);
    fireEvent.click(screen.getByRole("option", { name: "60 דקות" }));
    act(() => { vi.advanceTimersByTime(500); });

    expect(onChange).toHaveBeenCalledWith(60 * MIN);
    expect(onChange).not.toHaveBeenCalledWith(30 * MIN);
    vi.useRealTimers();
  });

  it("momentum scroll right after a tap does not override the tap", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(
      <DurationWheel options={AUTOLYSE} valueSeconds={45 * MIN} onChange={onChange} />
    );
    const list = screen.getByRole("listbox");

    fireEvent.click(screen.getByRole("option", { name: "60 דקות" }));
    Object.defineProperty(list, "scrollTop", { value: 0, writable: true });
    fireEvent.scroll(list);
    act(() => { vi.advanceTimersByTime(150); });

    expect(onChange).toHaveBeenCalledWith(60 * MIN);
    expect(onChange).not.toHaveBeenCalledWith(30 * MIN);
    vi.useRealTimers();
  });

  it("a settled scroll with no competing tap still selects", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(
      <DurationWheel options={AUTOLYSE} valueSeconds={45 * MIN} onChange={onChange} />
    );
    const list = screen.getByRole("listbox");
    Object.defineProperty(list, "scrollTop", { value: 0, writable: true });
    fireEvent.scroll(list);
    act(() => { vi.advanceTimersByTime(500); });

    expect(onChange).toHaveBeenCalledWith(30 * MIN);
    vi.useRealTimers();
  });
});
