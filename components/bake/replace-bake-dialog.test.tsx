import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReplaceBakeDialog } from "./replace-bake-dialog";

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

describe("ReplaceBakeDialog", () => {
  it("renders the replace title and includes the old recipe name", () => {
    render(
      <ReplaceBakeDialog
        open
        recipeName="שיפון מותאם"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText("להחליף בייק?")).toBeInTheDocument();
    expect(screen.getByText(/שיפון מותאם/)).toBeInTheDocument();
  });

  it("calls onConfirm when 'כן, להחליף' clicked", () => {
    const onConfirm = vi.fn();
    render(
      <ReplaceBakeDialog open recipeName="x" onConfirm={onConfirm} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByRole("button", { name: "כן, להחליף" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when 'ביטול' clicked", () => {
    const onCancel = vi.fn();
    render(
      <ReplaceBakeDialog open recipeName="x" onConfirm={() => {}} onCancel={onCancel} />
    );
    fireEvent.click(screen.getByRole("button", { name: "ביטול" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
