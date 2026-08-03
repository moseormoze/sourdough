import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StageKnowledgeTrigger } from "./stage-knowledge-hub";

describe("StageKnowledgeTrigger", () => {
  it("renders one direct, accessible entry to the guide", () => {
    render(<StageKnowledgeTrigger onOpen={() => {}} />);

    const button = screen.getByRole("button", { name: "הסבר על אוטוליזה" });
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(button).toHaveClass("min-h-touch");
    expect(button).toHaveClass("hover:bg-ink/[0.04]");
    expect(button).not.toHaveClass("hover:bg-bg-2");
    expect(button.className).toContain("focus-visible:ring-2");
    expect(button.querySelector("svg")).toHaveClass("lucide-graduation-cap");
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByText("שאלות נפוצות")).not.toBeInTheDocument();
    expect(screen.queryByText("משהו לא מסתדר?")).not.toBeInTheDocument();
  });

  it("opens exactly once after a tap", () => {
    const onOpen = vi.fn();
    render(<StageKnowledgeTrigger onOpen={onOpen} />);
    const button = screen.getByRole("button", { name: "הסבר על אוטוליזה" });

    fireEvent.pointerDown(button, { pointerId: 1, clientX: 10, clientY: 10 });
    expect(button).toHaveClass("scale-[0.965]");
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 10, clientY: 10 });
    fireEvent.click(button, { detail: 1 });

    expect(onOpen).toHaveBeenCalledOnce();
    expect(button).not.toHaveClass("scale-[0.965]");
  });

  it("opens from native keyboard activation", () => {
    const onOpen = vi.fn();
    render(<StageKnowledgeTrigger onOpen={onOpen} />);

    fireEvent.click(screen.getByRole("button", { name: "הסבר על אוטוליזה" }), {
      detail: 0,
    });

    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("suppresses opening when pointer movement exceeds 5px", () => {
    const onOpen = vi.fn();
    render(<StageKnowledgeTrigger onOpen={onOpen} />);
    const button = screen.getByRole("button", { name: "הסבר על אוטוליזה" });

    fireEvent.pointerDown(button, { pointerId: 1, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(button, { pointerId: 1, clientX: 10, clientY: 16 });
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 10, clientY: 16 });
    fireEvent.click(button, { detail: 1 });

    expect(button).not.toHaveClass("scale-[0.965]");
    expect(onOpen).not.toHaveBeenCalled();
  });

  it.each(["pointerCancel", "blur"] as const)(
    "cleans press state and does not open after %s",
    (eventName) => {
      const onOpen = vi.fn();
      render(<StageKnowledgeTrigger onOpen={onOpen} />);
      const button = screen.getByRole("button", { name: "הסבר על אוטוליזה" });

      fireEvent.pointerDown(button, { pointerId: 1, clientX: 0, clientY: 0 });
      if (eventName === "pointerCancel") {
        fireEvent.pointerCancel(button, { pointerId: 1 });
      } else {
        fireEvent.blur(button);
      }
      fireEvent.click(button, { detail: 1 });

      expect(button).not.toHaveClass("scale-[0.965]");
      expect(onOpen).not.toHaveBeenCalled();
    },
  );
});
