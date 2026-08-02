import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getStageKnowledge } from "@/lib/data/stage-knowledge";
import { StageKnowledgeSheet } from "./stage-knowledge-sheet";

const content = getStageKnowledge(2)!;

describe("StageKnowledgeSheet", () => {
  it("renders one full-height learn dialog with all five sections", () => {
    render(
      <StageKnowledgeSheet open kind="learn" content={content} onClose={() => {}} />,
    );

    const dialogs = screen.getAllByRole("dialog");
    expect(dialogs).toHaveLength(1);
    expect(dialogs[0]?.className).toContain("88svh");
    expect(screen.getByRole("heading", { name: content.learn.title })).toBeInTheDocument();
    for (const section of content.learn.sections) {
      expect(screen.getByRole("heading", { name: section.heading })).toBeInTheDocument();
      expect(screen.getByText(section.body)).toBeInTheDocument();
    }
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(document.querySelector("video")).not.toBeInTheDocument();
  });

  it("shows every FAQ answer without accordions", () => {
    render(<StageKnowledgeSheet open kind="faq" content={content} onClose={() => {}} />);

    expect(screen.getByRole("heading", { name: "שאלות נפוצות" })).toBeInTheDocument();
    for (const faq of content.faqs) {
      const question = screen.getByRole("heading", { name: faq.question });
      expect(question).toBeInTheDocument();
      expect(question.closest("section")).toHaveTextContent(faq.answer);
    }
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("shows both troubleshooting scenarios and wraps numeric ranges LTR", () => {
    render(
      <StageKnowledgeSheet
        open
        kind="troubleshooting"
        content={content}
        onClose={() => {}}
      />,
    );

    expect(screen.getByRole("heading", { name: "אבחון מהיר" })).toBeInTheDocument();
    for (const scenario of content.troubleshooting) {
      const title = screen.getByRole("heading", { name: scenario.title });
      expect(title).toBeInTheDocument();
      for (const action of scenario.actions) {
        expect(title.closest("section")).toHaveTextContent(action);
      }
    }
    for (const range of screen.getAllByText(/^(30–60|5–10)$/)) {
      expect(range).toHaveAttribute("dir", "ltr");
      expect(range).toHaveClass("num");
    }
  });

  it("keeps content mounted during the 200ms close animation", async () => {
    const { rerender } = render(
      <StageKnowledgeSheet open kind="learn" content={content} onClose={() => {}} />,
    );

    rerender(
      <StageKnowledgeSheet open={false} kind="learn" content={content} onClose={() => {}} />,
    );

    expect(screen.getByText(content.learn.intro)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument(), {
      timeout: 500,
    });
  });

  it("delegates close to the shared BottomSheet", () => {
    const onClose = vi.fn();
    render(<StageKnowledgeSheet open kind="faq" content={content} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "סגור" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
