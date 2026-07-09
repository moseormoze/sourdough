import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FeedingFormScreen } from "./feeding-form-screen";
import { ToastProvider } from "@/components/ui/toast";
import { routerMock } from "../../vitest.setup";
import { strings } from "@/lib/strings";
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

  it("does not block save when grams and time are empty", async () => {
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
    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith("/starter"));
  });

  it("save calls createFeeding with the correct payload in add mode", async () => {
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
    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith("/starter"));
  });

  it("save calls updateFeeding with the correct payload in edit mode", async () => {
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
    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith("/starter"));
  });

  it("navigates only after createFeeding resolves — not while pending", async () => {
    let resolveSave!: (value: unknown) => void;
    createFeedingMock.mockImplementationOnce(
      () => new Promise((resolve) => (resolveSave = resolve))
    );
    renderForm({ initialValues: validValues });

    fireEvent.click(screen.getByRole("button", { name: "שמור" }));

    expect(createFeedingMock).toHaveBeenCalledTimes(1);
    expect(routerMock.push).not.toHaveBeenCalled();
    expect(screen.queryByText(strings.starterTracker.form.savedToast)).not.toBeInTheDocument();

    resolveSave({});
    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith("/starter"));
    expect(screen.getByText(strings.starterTracker.form.savedToast)).toBeInTheDocument();
  });

  it("on save failure: stays on the form, shows the error toast, save button exits loading", async () => {
    createFeedingMock.mockRejectedValueOnce(new Error("network"));
    renderForm({ initialValues: validValues });

    fireEvent.click(screen.getByRole("button", { name: "שמור" }));

    await screen.findByText(strings.starterTracker.form.saveErrorToast);
    expect(routerMock.push).not.toHaveBeenCalled();
    const saveButton = screen.getByRole("button", { name: "שמור" });
    expect(saveButton).not.toHaveAttribute("aria-busy");
    expect(saveButton).toBeEnabled();
  });

  it("double-tap on save while pending does not call createFeeding twice", async () => {
    let resolveSave!: (value: unknown) => void;
    createFeedingMock.mockImplementationOnce(
      () => new Promise((resolve) => (resolveSave = resolve))
    );
    renderForm({ initialValues: validValues });

    const saveButton = screen.getByRole("button", { name: "שמור" });
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);

    expect(createFeedingMock).toHaveBeenCalledTimes(1);

    resolveSave({});
    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith("/starter"));
  });

  it("navigates only after deleteFeeding resolves — not while pending", async () => {
    let resolveDelete!: () => void;
    deleteFeedingMock.mockImplementationOnce(
      () => new Promise<void>((resolve) => (resolveDelete = resolve))
    );
    renderForm({ initialValues: validValues, feedingId: "feeding-1" });

    fireEvent.click(screen.getByRole("button", { name: "מחק" }));
    const confirmButtons = screen.getAllByRole("button", { name: "מחק" });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]!);

    expect(deleteFeedingMock).toHaveBeenCalledWith("feeding-1", "baker@example.com");
    expect(routerMock.push).not.toHaveBeenCalled();

    resolveDelete();
    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith("/starter"));
    expect(screen.getByText(strings.starterTracker.form.deletedToast)).toBeInTheDocument();
  });

  it("shows the delete button only in edit mode", () => {
    renderForm({ initialValues: validValues });
    expect(screen.queryByRole("button", { name: "מחק" })).not.toBeInTheDocument();

    renderForm({ initialValues: validValues, feedingId: "feeding-1" });
    expect(screen.getByRole("button", { name: "מחק" })).toBeInTheDocument();
  });

  it("delete flow: opens the dialog, confirm calls deleteFeeding and navigates", async () => {
    renderForm({ initialValues: validValues, feedingId: "feeding-1" });
    fireEvent.click(screen.getByRole("button", { name: "מחק" }));
    expect(screen.getByText("למחוק את ההאכלה הזו?")).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole("button", { name: "מחק" });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]!);

    expect(deleteFeedingMock).toHaveBeenCalledWith("feeding-1", "baker@example.com");
    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith("/starter"));
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

  describe("auto-calc flour/water from ratio × starter grams", () => {
    const grams = strings.starterTracker.grams;

    function starterInput() {
      return screen.getByLabelText(grams.starterLabel);
    }
    function flourInput() {
      return screen.getByLabelText(grams.flourLabel);
    }
    function waterInput() {
      return screen.getByLabelText(grams.waterLabel);
    }

    it("fills flour and water with starter × N when starter grams is typed with a ratio selected", () => {
      renderForm();
      fireEvent.click(screen.getByTestId("ratio-btn-3"));
      fireEvent.change(starterInput(), { target: { value: "13" } });
      expect(flourInput()).toHaveValue(39);
      expect(waterInput()).toHaveValue(39);
    });

    it("recomputes flour and water when the ratio changes while starter grams is set", () => {
      renderForm();
      fireEvent.click(screen.getByTestId("ratio-btn-3"));
      fireEvent.change(starterInput(), { target: { value: "13" } });
      fireEvent.click(screen.getByTestId("ratio-btn-2"));
      expect(flourInput()).toHaveValue(26);
      expect(waterInput()).toHaveValue(26);
    });

    it("never overwrites a manually edited field", () => {
      renderForm();
      fireEvent.click(screen.getByTestId("ratio-btn-3"));
      fireEvent.change(starterInput(), { target: { value: "13" } });
      fireEvent.change(flourInput(), { target: { value: "40" } });

      fireEvent.change(starterInput(), { target: { value: "20" } });
      expect(flourInput()).toHaveValue(40);
      expect(waterInput()).toHaveValue(60);

      fireEvent.click(screen.getByTestId("ratio-btn-4"));
      expect(flourInput()).toHaveValue(40);
      expect(waterInput()).toHaveValue(80);
    });

    it("clearing starter grams clears only automation-owned fields", () => {
      renderForm();
      fireEvent.click(screen.getByTestId("ratio-btn-3"));
      fireEvent.change(starterInput(), { target: { value: "13" } });
      fireEvent.change(flourInput(), { target: { value: "40" } });

      fireEvent.change(starterInput(), { target: { value: "" } });
      expect(flourInput()).toHaveValue(40);
      expect(waterInput()).not.toHaveValue();
    });

    it("edit mode: loaded values are user-owned — no auto-fill on load or on starter change", () => {
      renderForm({
        initialValues: { ...validValues, flourGrams: 80, waterGrams: 90 },
        feedingId: "feeding-1",
      });
      expect(flourInput()).toHaveValue(80);
      expect(waterInput()).toHaveValue(90);

      fireEvent.change(starterInput(), { target: { value: "60" } });
      expect(flourInput()).toHaveValue(80);
      expect(waterInput()).toHaveValue(90);
    });

    it("edit mode: empty loaded fields are still auto-filled on new interaction", () => {
      renderForm({
        initialValues: { ...validValues, flourGrams: "", waterGrams: "" },
        feedingId: "feeding-1",
      });
      fireEvent.change(starterInput(), { target: { value: "10" } });
      expect(flourInput()).toHaveValue(20);
      expect(waterInput()).toHaveValue(20);
    });

    it("auto-filled values are saved as regular values", async () => {
      renderForm();
      fireEvent.click(screen.getByTestId("ratio-btn-3"));
      fireEvent.change(starterInput(), { target: { value: "13" } });
      fireEvent.click(screen.getByRole("button", { name: "שמור" }));
      expect(createFeedingMock).toHaveBeenCalledWith(
        expect.objectContaining({
          ratio: 3,
          starterGrams: 13,
          flourGrams: 39,
          waterGrams: 39,
        })
      );
      await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith("/starter"));
    });
  });
});
