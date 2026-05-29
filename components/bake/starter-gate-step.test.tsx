import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarterGateStep } from "./starter-gate-step";

describe("StarterGateStep", () => {
  it("renders the question text", () => {
    render(<StarterGateStep onReady={() => {}} onNotReady={() => {}} />);
    expect(screen.getByText("הסטארטר שלך בשיא?")).toBeInTheDocument();
  });

  it("renders education blurb with float test mention", () => {
    render(<StarterGateStep onReady={() => {}} onNotReady={() => {}} />);
    expect(screen.getByText(/float test/)).toBeInTheDocument();
  });

  it("renders both CTA buttons", () => {
    render(<StarterGateStep onReady={() => {}} onNotReady={() => {}} />);
    expect(screen.getByText("כן, הסטארטר בשיא")).toBeInTheDocument();
    expect(screen.getByText("לא, צריך לתכנן")).toBeInTheDocument();
  });

  it("calls onReady when 'כן' is clicked", () => {
    const onReady = vi.fn();
    render(<StarterGateStep onReady={onReady} onNotReady={() => {}} />);
    fireEvent.click(screen.getByText("כן, הסטארטר בשיא"));
    expect(onReady).toHaveBeenCalledOnce();
  });

  it("calls onNotReady when 'לא' is clicked", () => {
    const onNotReady = vi.fn();
    render(<StarterGateStep onReady={() => {}} onNotReady={onNotReady} />);
    fireEvent.click(screen.getByText("לא, צריך לתכנן"));
    expect(onNotReady).toHaveBeenCalledOnce();
  });

  it("renders the levain image", () => {
    render(<StarterGateStep onReady={() => {}} onNotReady={() => {}} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", expect.stringContaining("שאור פעיל"));
  });
});
