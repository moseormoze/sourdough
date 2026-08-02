import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AUTOLYSE_KNOWLEDGE_ENTRIES } from "@/lib/data/stage-knowledge";
import { StageKnowledgeHub } from "./stage-knowledge-hub";

describe("StageKnowledgeHub", () => {
  it("renders the three full-row entries as accessible buttons", () => {
    render(
      <StageKnowledgeHub
        entries={AUTOLYSE_KNOWLEDGE_ENTRIES}
        onOpen={() => {}}
      />,
    );

    expect(screen.getByRole("heading", { name: "עוד על האוטוליזה" })).toBeInTheDocument();
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveAccessibleName(/מה קורה לבצק בזמן המנוחה/);
    expect(buttons[1]).toHaveAccessibleName(/שאלות נפוצות/);
    expect(buttons[2]).toHaveAccessibleName(/משהו לא מסתדר/);

    for (const button of buttons) {
      expect(button).toHaveClass("min-h-cta");
      expect(button.className).toContain("focus-visible:ring-2");
    }
  });

  it("opens exactly once after a tap", () => {
    const onOpen = vi.fn();
    render(
      <StageKnowledgeHub entries={AUTOLYSE_KNOWLEDGE_ENTRIES} onOpen={onOpen} />,
    );
    const button = screen.getByRole("button", { name: /מה קורה לבצק בזמן המנוחה/ });

    fireEvent.pointerDown(button, { pointerId: 1, clientX: 10, clientY: 10 });
    expect(button).toHaveClass("scale-[0.965]");
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 10, clientY: 10 });
    fireEvent.click(button, { detail: 1 });

    expect(onOpen).toHaveBeenCalledOnce();
    expect(onOpen).toHaveBeenCalledWith("learn");
    expect(button).not.toHaveClass("scale-[0.965]");
  });

  it("lets the native button open from keyboard activation", () => {
    const onOpen = vi.fn();
    render(
      <StageKnowledgeHub entries={AUTOLYSE_KNOWLEDGE_ENTRIES} onOpen={onOpen} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /שאלות נפוצות/ }), {
      detail: 0,
    });

    expect(onOpen).toHaveBeenCalledOnce();
    expect(onOpen).toHaveBeenCalledWith("faq");
  });

  it("opens a different row when blur from the previously focused row arrives mid-press", () => {
    const onOpen = vi.fn();
    render(
      <StageKnowledgeHub entries={AUTOLYSE_KNOWLEDGE_ENTRIES} onOpen={onOpen} />,
    );
    const learn = screen.getByRole("button", { name: /מה קורה לבצק בזמן המנוחה/ });
    const faq = screen.getByRole("button", { name: /שאלות נפוצות/ });
    learn.focus();

    fireEvent.pointerDown(faq, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.blur(learn);
    fireEvent.pointerUp(faq, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.click(faq, { detail: 1 });

    expect(onOpen).toHaveBeenCalledOnce();
    expect(onOpen).toHaveBeenCalledWith("faq");
  });

  it("suppresses opening when pointer movement exceeds 5px", () => {
    const onOpen = vi.fn();
    render(
      <StageKnowledgeHub entries={AUTOLYSE_KNOWLEDGE_ENTRIES} onOpen={onOpen} />,
    );
    const button = screen.getByRole("button", { name: /משהו לא מסתדר/ });

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
      render(
        <StageKnowledgeHub entries={AUTOLYSE_KNOWLEDGE_ENTRIES} onOpen={onOpen} />,
      );
      const button = screen.getByRole("button", { name: /שאלות נפוצות/ });

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
