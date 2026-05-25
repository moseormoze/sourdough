import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StopBakeDialog } from "./stop-bake-dialog";

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

describe("StopBakeDialog", () => {
  it("renders the stop title and includes the recipe name in the body", () => {
    render(
      <StopBakeDialog
        open
        recipeName="לחם של שישי"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText("להפסיק את הבייק?")).toBeInTheDocument();
    expect(screen.getByText(/לחם של שישי/)).toBeInTheDocument();
  });

  it("calls onConfirm when 'כן, להפסיק' clicked", () => {
    const onConfirm = vi.fn();
    render(
      <StopBakeDialog open recipeName="x" onConfirm={onConfirm} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByRole("button", { name: "כן, להפסיק" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when 'לא, להמשיך' clicked", () => {
    const onCancel = vi.fn();
    render(
      <StopBakeDialog open recipeName="x" onConfirm={() => {}} onCancel={onCancel} />
    );
    fireEvent.click(screen.getByRole("button", { name: "לא, להמשיך" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
