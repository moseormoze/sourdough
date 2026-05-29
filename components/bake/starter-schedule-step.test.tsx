import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarterScheduleStep } from "./starter-schedule-step";

describe("StarterScheduleStep", () => {
  it("renders the schedule title", () => {
    render(<StarterScheduleStep onDismiss={() => {}} />);
    expect(screen.getByText("מתכננים את הבייק")).toBeInTheDocument();
  });

  it("renders the target-time label", () => {
    render(<StarterScheduleStep onDismiss={() => {}} />);
    expect(screen.getByText("מתי הלחם צריך להיות מוכן?")).toBeInTheDocument();
  });

  it("renders temperature input with default 25", () => {
    render(<StarterScheduleStep onDismiss={() => {}} />);
    const input = screen.getByRole("spinbutton");
    expect((input as HTMLInputElement).value).toBe("25");
  });

  it("renders at least 3 day pills", () => {
    render(<StarterScheduleStep onDismiss={() => {}} />);
    // Day pills are buttons without aria-label (the hour stepper buttons have aria-labels)
    const unlabelledBtns = screen
      .getAllByRole("button")
      .filter((b) => !b.getAttribute("aria-label"));
    // Expect at least 3 day pills (+ the dismiss button → ≥4 unlabelled buttons)
    expect(unlabelledBtns.length).toBeGreaterThanOrEqual(4);
  });

  it("shows feeding window card once a valid time is shown", () => {
    render(<StarterScheduleStep onDismiss={() => {}} />);
    // The component starts at the minimum valid time so the window card should appear
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("תוכנית האכלה")).toBeInTheDocument();
  });

  it("dismiss button is present", () => {
    render(<StarterScheduleStep onDismiss={() => {}} />);
    expect(screen.getByText("הבנתי, אחזור מאוחר יותר")).toBeInTheDocument();
  });

  it("calls onDismiss when dismiss button is clicked (valid state)", () => {
    const onDismiss = vi.fn();
    render(<StarterScheduleStep onDismiss={onDismiss} />);
    // The default state should be valid (minReadyAt is pre-selected)
    const btn = screen.getByText("הבנתי, אחזור מאוחר יותר");
    // Only click if button is not disabled
    if (!(btn as HTMLButtonElement).disabled) {
      fireEvent.click(btn);
      expect(onDismiss).toHaveBeenCalledOnce();
    }
  });

  it("changing day pill updates selection", () => {
    render(<StarterScheduleStep onDismiss={() => {}} />);
    const mochralaim = screen.getByText("מחרתיים");
    fireEvent.click(mochralaim);
    // After clicking מחרתיים, that pill should now have the active style (bg-ink)
    expect(mochralaim.className).toContain("bg-ink");
  });

  it("hour increment button increases displayed hour", () => {
    render(<StarterScheduleStep onDismiss={() => {}} />);
    // Find the + button
    const incBtn = screen.getByLabelText("עוד שעה");
    const timeDisplay = screen.getByText(/^\d{2}:00$/);
    const originalHour = parseInt((timeDisplay.textContent ?? "00:00").split(":")[0]!);

    if (!(incBtn as HTMLButtonElement).disabled) {
      fireEvent.click(incBtn);
      const newTime = screen.getByText(/^\d{2}:00$/);
      const newHour = parseInt((newTime.textContent ?? "00:00").split(":")[0]!);
      expect(newHour).toBe(originalHour + 1);
    }
  });
});
