import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AbandonBakeDialog } from "./abandon-bake-dialog";

beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
});

describe("AbandonBakeDialog", () => {
  it("renders the locked title and description with recipe name when open", () => {
    render(
      <AbandonBakeDialog
        open={true}
        recipeName="כפרי קלאסי"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText("לוותר על הבייק הנוכחי?")).toBeInTheDocument();
    expect(screen.getByText(/כפרי קלאסי/)).toBeInTheDocument();
  });

  it("does not render content when closed", () => {
    render(
      <AbandonBakeDialog
        open={false}
        recipeName="x"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    const dialog = document.querySelector("dialog");
    expect(dialog).not.toHaveAttribute("open");
  });

  it("calls onConfirm when 'כן, ויתור' is clicked", () => {
    const onConfirm = vi.fn();
    render(
      <AbandonBakeDialog
        open={true}
        recipeName="x"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "כן, ויתור" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when ביטול is clicked", () => {
    const onCancel = vi.fn();
    render(
      <AbandonBakeDialog
        open={true}
        recipeName="x"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "ביטול" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
