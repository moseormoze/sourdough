import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { OptionalTimer } from "./optional-timer";

describe("OptionalTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders 'התחל טיימר' when startedAt is null", () => {
    render(
      <OptionalTimer
        durationSeconds={60}
        startedAt={null}
        onStart={() => {}}
        onStop={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: /התחל טיימר/ })).toBeInTheDocument();
  });

  it("calls onStart when the start button is clicked", () => {
    const onStart = vi.fn();
    render(
      <OptionalTimer
        durationSeconds={60}
        startedAt={null}
        onStart={onStart}
        onStop={() => {}}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /התחל טיימר/ }));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("renders MM:SS countdown when running", () => {
    const startedAt = Date.now();
    render(
      <OptionalTimer
        durationSeconds={120}
        startedAt={startedAt}
        onStart={() => {}}
        onStop={() => {}}
      />
    );
    expect(screen.getByText("02:00")).toBeInTheDocument();
  });

  it("ticks down each second", () => {
    const startedAt = Date.now();
    render(
      <OptionalTimer
        durationSeconds={120}
        startedAt={startedAt}
        onStart={() => {}}
        onStop={() => {}}
      />
    );
    expect(screen.getByText("02:00")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("01:59")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("00:59")).toBeInTheDocument();
  });

  it("shows 'הסתיים' when the countdown reaches 0", () => {
    const startedAt = Date.now();
    render(
      <OptionalTimer
        durationSeconds={2}
        startedAt={startedAt}
        onStart={() => {}}
        onStop={() => {}}
      />
    );
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText("הסתיים")).toBeInTheDocument();
  });

  it("calls onStop when the stop button is clicked while running", () => {
    const onStop = vi.fn();
    render(
      <OptionalTimer
        durationSeconds={60}
        startedAt={Date.now()}
        onStart={() => {}}
        onStop={onStop}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "עצור" }));
    expect(onStop).toHaveBeenCalledOnce();
  });
});
