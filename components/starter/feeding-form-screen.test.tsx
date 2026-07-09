import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeedingFormScreen } from "./feeding-form-screen";
import { ToastProvider } from "@/components/ui/toast";
import { routerMock } from "../../vitest.setup";
import type { FeedingFormValues } from "@/lib/validate-feeding";

const createFeedingMock = vi.fn().mockResolvedValue({});
const updateFeedingMock = vi.fn().mockResolvedValue({});
const deleteFeedingMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/storage/feedings", () => ({
  createFeeding: (...args: unknown[]) => createFeedingMock(...args),
  updateFeeding: (...args: unknown[]) => updateFeedingMock(...args),
  deleteFeeding: (...args: unknown[]) => deleteFeedingMock(...args),
}));

vi.mock("@/lib/storage/identity", () => ({
  loadIdentity: () => ({
    name: "אילון",
    email: "baker@example.com",
    identifiedAt: "2026-07-01T00:00:00.000Z",
  }),
}));

// Polyfill <dialog> for jsdom (used by DeleteFeedingDialog / DiscardChangesDialog).
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

const validValues: FeedingFormValues = {
  ratio: 2,
  starterGrams: 50,
  flourGrams: 100,
  waterGrams: 100,
  fedAtDate: "2026-07-09",
  fedAtTime: "08:30",
};

function renderForm(props: Parameters<typeof FeedingFormScreen>[0] = {}) {
  return render(
    <ToastProvider>
      <FeedingFormScreen {...props} />
    </ToastProvider>
  );
}

describe("FeedingFormScreen", () => {
  beforeEach(() => {
    createFeedingMock.mockClear();
    updateFeedingMock.mockClear();
    deleteFeedingMock.mockClear();
    routerMock.back.mockClear();
    routerMock.push.mockClear();
  });

  it("blocks save when ratio is missing", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "שמור" }));
    expect(createFeedingMock).not.toHaveBeenCalled();
    expect(screen.getByText("בחרו יחס האכלה")).toBeInTheDocument();
  });

  it("blocks save when date is missing", () => {
    renderForm({ initialValues: validValues });
    fireEvent.change(screen.getByLabelText("תאריך"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "שמור" }));
    expect(createFeedingMock).not.toHaveBeenCalled();
    expect(screen.getByText("תאריך ההאכלה הוא שדה חובה")).toBeInTheDocument();
  });

  it("does not block save when grams and time are empty", () => {
    renderForm({
      initialValues: {
        ...validValues,
        starterGrams: "",
        flourGrams: "",
        waterGrams: "",
        fedAtTime: "",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "שמור" }));
    expect(createFeedingMock).toHaveBeenCalled();
  });

  it("save calls createFeeding with the correct payload in add mode", () => {
    renderForm({ initialValues: validValues });
    fireEvent.click(screen.getByRole("button", { name: "שמור" }));
    expect(createFeedingMock).toHaveBeenCalledWith({
      email: "baker@example.com",
      ratio: 2,
      starterGrams: 50,
      flourGrams: 100,
      waterGrams: 100,
      fedAt: expect.any(String),
    });
    expect(routerMock.push).toHaveBeenCalledWith("/starter");
  });

  it("save calls updateFeeding with the correct payload in edit mode", () => {
    renderForm({ initialValues: validValues, feedingId: "feeding-1" });
    fireEvent.click(screen.getByRole("button", { name: "שמור" }));
    expect(updateFeedingMock).toHaveBeenCalledWith(
      "feeding-1",
      expect.objectContaining({
        email: "baker@example.com",
        ratio: 2,
        starterGrams: 50,
        flourGrams: 100,
        waterGrams: 100,
      })
    );
    expect(routerMock.push).toHaveBeenCalledWith("/starter");
  });

  it("shows the delete button only in edit mode", () => {
    renderForm({ initialValues: validValues });
    expect(screen.queryByRole("button", { name: "מחק" })).not.toBeInTheDocument();

    renderForm({ initialValues: validValues, feedingId: "feeding-1" });
    expect(screen.getByRole("button", { name: "מחק" })).toBeInTheDocument();
  });

  it("delete flow: opens the dialog, confirm calls deleteFeeding and navigates", () => {
    renderForm({ initialValues: validValues, feedingId: "feeding-1" });
    fireEvent.click(screen.getByRole("button", { name: "מחק" }));
    expect(screen.getByText("למחוק את ההאכלה הזו?")).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole("button", { name: "מחק" });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]!);

    expect(deleteFeedingMock).toHaveBeenCalledWith("feeding-1", "baker@example.com");
    expect(routerMock.push).toHaveBeenCalledWith("/starter");
  });

  it("cancel opens the discard dialog after a dirty edit, not immediate back", () => {
    renderForm({ initialValues: validValues });
    fireEvent.change(screen.getByLabelText("תאריך"), { target: { value: "2026-08-01" } });
    fireEvent.click(screen.getByRole("button", { name: "ביטול" }));
    expect(routerMock.back).not.toHaveBeenCalled();
    expect(screen.getByText("לבטל את השינויים?")).toBeInTheDocument();
  });

  it("cancel with no changes calls router.back immediately", () => {
    renderForm({ initialValues: validValues });
    fireEvent.click(screen.getByRole("button", { name: "ביטול" }));
    expect(routerMock.back).toHaveBeenCalled();
  });
});
