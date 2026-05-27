import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { OptionalTimer } from "./optional-timer";

const noop = () => {};

describe("OptionalTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders 'התחל טיימר' when idle (no startedAt, no elapsed)", () => {
    render(
      <OptionalTimer
        durationSeconds={60}
        startedAt={null}
        elapsedSeconds={0}
        onStart={noop}
        onPause={noop}
        onResume={noop}
        onReset={noop}
      />
    );
    expect(screen.getByRole("button", { name: /התחל טיימר/ })).toBeInTheDocument();
  });

  it("calls onStart when the start button is clicked from idle", () => {
    const onStart = vi.fn();
    render(
      <OptionalTimer
        durationSeconds={60}
        startedAt={null}
        elapsedSeconds={0}
        onStart={onStart}
        onPause={noop}
        onResume={noop}
        onReset={noop}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /התחל טיימר/ }));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("renders MM:SS countdown and pause + reset buttons while running", () => {
    render(
      <OptionalTimer
        durationSeconds={120}
        startedAt={Date.now()}
        elapsedSeconds={0}
        onStart={noop}
        onPause={noop}
        onResume={noop}
        onReset={noop}
      />
    );
    expect(screen.getByText("02:00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "השהה" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "אפס" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "המשך" })).not.toBeInTheDocument();
  });

  it("ticks down each second", () => {
    render(
      <OptionalTimer
        durationSeconds={120}
        startedAt={Date.now()}
        elapsedSeconds={0}
        onStart={noop}
        onPause={noop}
        onResume={noop}
        onReset={noop}
      />
    );
    expect(screen.getByText("02:00")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByText("01:59")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(screen.getByText("00:59")).toBeInTheDocument();
  });

  it("renders frozen MM:SS + resume + reset buttons when paused", () => {
    render(
      <OptionalTimer
        durationSeconds={120}
        startedAt={null}
        elapsedSeconds={30}
        onStart={noop}
        onPause={noop}
        onResume={noop}
        onReset={noop}
      />
    );
    // 120 - 30 = 90 seconds left = 01:30
    expect(screen.getByText("01:30")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "המשך" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "אפס" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "השהה" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /התחל טיימר/ })).not.toBeInTheDocument();
  });

  it("paused display does not tick", () => {
    render(
      <OptionalTimer
        durationSeconds={120}
        startedAt={null}
        elapsedSeconds={30}
        onStart={noop}
        onPause={noop}
        onResume={noop}
        onReset={noop}
      />
    );
    expect(screen.getByText("01:30")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText("01:30")).toBeInTheDocument();
  });

  it("calls onPause when pause is clicked while running", () => {
    const onPause = vi.fn();
    render(
      <OptionalTimer
        durationSeconds={60}
        startedAt={Date.now()}
        elapsedSeconds={0}
        onStart={noop}
        onPause={onPause}
        onResume={noop}
        onReset={noop}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "השהה" }));
    expect(onPause).toHaveBeenCalledOnce();
  });

  it("calls onResume when resume is clicked while paused", () => {
    const onResume = vi.fn();
    render(
      <OptionalTimer
        durationSeconds={120}
        startedAt={null}
        elapsedSeconds={30}
        onStart={noop}
        onPause={noop}
        onResume={onResume}
        onReset={noop}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "המשך" }));
    expect(onResume).toHaveBeenCalledOnce();
  });

  it("calls onReset when reset is clicked (running or paused)", () => {
    const onReset = vi.fn();
    const { rerender } = render(
      <OptionalTimer
        durationSeconds={60}
        startedAt={Date.now()}
        elapsedSeconds={0}
        onStart={noop}
        onPause={noop}
        onResume={noop}
        onReset={onReset}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "אפס" }));
    expect(onReset).toHaveBeenCalledOnce();

    rerender(
      <OptionalTimer
        durationSeconds={60}
        startedAt={null}
        elapsedSeconds={20}
        onStart={noop}
        onPause={noop}
        onResume={noop}
        onReset={onReset}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "אפס" }));
    expect(onReset).toHaveBeenCalledTimes(2);
  });

  it("shows 'הסתיים' and only a reset button when the countdown reaches 0", () => {
    render(
      <OptionalTimer
        durationSeconds={2}
        startedAt={Date.now()}
        elapsedSeconds={0}
        onStart={noop}
        onPause={noop}
        onResume={noop}
        onReset={noop}
      />
    );
    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.getByText("הסתיים")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "השהה" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "המשך" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "אפס" })).toBeInTheDocument();
  });
});
