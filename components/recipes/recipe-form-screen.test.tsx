import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecipeFormScreen } from "./recipe-form-screen";
import { ToastProvider } from "@/components/ui/toast";
import { listRecipes, saveRecipe } from "@/lib/storage/recipes";
import { routerMock } from "../../vitest.setup";
import type { RecipeFormValues } from "@/lib/validate-recipe";

const validValues: RecipeFormValues = {
  name: "כפרי",
  flour: { white: 80, wholeWheat: 20, rye: 0, other: 0 },
  hydration: 75,
  salt: 2,
  levain: 20,
  kitchenTemp: 25,
  inclusions: [],
};

function renderForm(props: Parameters<typeof RecipeFormScreen>[0] = {}) {
  return render(
    <ToastProvider>
      <RecipeFormScreen {...props} />
    </ToastProvider>
  );
}

// Polyfill <dialog> for jsdom (used by DeleteConfirmDialog / DiscardChangesDialog).
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

describe("RecipeFormScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    routerMock.back.mockClear();
    routerMock.push.mockClear();
  });

  it("renders all field labels", () => {
    renderForm();
    expect(screen.getByLabelText("שם המתכון")).toBeInTheDocument();
    expect(screen.getByLabelText("לבן")).toBeInTheDocument();
    expect(screen.getByLabelText("הידרציה")).toBeInTheDocument();
    expect(screen.getByLabelText("מלח")).toBeInTheDocument();
    expect(screen.getByLabelText("שאור")).toBeInTheDocument();
    expect(screen.getByLabelText("טמפ׳ מטבח")).toBeInTheDocument();
  });

  it("fills initial values when provided", () => {
    renderForm({ initialValues: validValues });
    expect((screen.getByLabelText("שם המתכון") as HTMLInputElement).value).toBe(
      "כפרי"
    );
    expect((screen.getByLabelText("הידרציה") as HTMLInputElement).value).toBe(
      "75"
    );
  });

  it("does NOT show validation error before field is touched", () => {
    renderForm();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows name validation error after blur on empty name", () => {
    renderForm();
    fireEvent.blur(screen.getByLabelText("שם המתכון"));
    expect(screen.getByRole("alert")).toHaveTextContent(/חובה/);
  });

  it("shows hydration error after blur on out-of-range value", () => {
    renderForm({ initialValues: { ...validValues, hydration: 30 } });
    fireEvent.blur(screen.getByLabelText("הידרציה"));
    expect(
      screen.getByText(/הידרציה צריכה להיות בין 50% ל-100%/)
    ).toBeInTheDocument();
  });

  it("save persists a valid recipe to storage and navigates to /recipes", () => {
    renderForm({ initialValues: validValues });
    fireEvent.click(screen.getByRole("button", { name: "שמור" }));
    expect(listRecipes()).toHaveLength(1);
    expect(listRecipes()[0]?.name).toBe("כפרי");
    expect(routerMock.push).toHaveBeenCalledWith("/recipes");
  });

  it("does NOT save when invalid and floods errors instead", () => {
    renderForm({ initialValues: { ...validValues, hydration: 30 } });
    fireEvent.click(screen.getByRole("button", { name: "שמור" }));
    expect(listRecipes()).toHaveLength(0);
    expect(routerMock.push).not.toHaveBeenCalled();
    expect(
      screen.getByText(/הידרציה צריכה להיות בין 50% ל-100%/)
    ).toBeInTheDocument();
  });

  it("save in edit mode updates the existing recipe", () => {
    const created = saveRecipe({
      name: "ישן",
      flour: { white: 80, wholeWheat: 20, rye: 0, other: 0 },
      hydration: 75,
      salt: 2,
      levain: 20,
      kitchenTemp: 25,
      inclusions: [],
    });
    renderForm({
      initialValues: { ...validValues, name: "חדש" },
      recipeId: created.id,
    });
    fireEvent.click(screen.getByRole("button", { name: "שמור" }));
    expect(listRecipes()).toHaveLength(1);
    expect(listRecipes()[0]?.name).toBe("חדש");
    expect(listRecipes()[0]?.id).toBe(created.id);
  });

  it("custom onSubmit prop overrides built-in save (storage untouched)", () => {
    const onSubmit = vi.fn();
    renderForm({ initialValues: validValues, onSubmit });
    fireEvent.click(screen.getByRole("button", { name: "שמור" }));
    expect(onSubmit).toHaveBeenCalledWith(validValues, undefined);
    expect(listRecipes()).toHaveLength(0);
  });

  it("flour sum indicator updates when a flour field changes", () => {
    renderForm({ initialValues: validValues });
    expect(screen.getByText("100%")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("לבן"), { target: { value: "70" } });
    expect(screen.getByText("90%")).toBeInTheDocument();
  });

  it("cancel with no changes calls router.back", () => {
    renderForm({ initialValues: validValues });
    fireEvent.click(screen.getByRole("button", { name: "ביטול" }));
    expect(routerMock.back).toHaveBeenCalled();
  });

  it("cancel after edits opens the discard dialog (not immediate back)", () => {
    renderForm({ initialValues: validValues });
    fireEvent.change(screen.getByLabelText("שם המתכון"), {
      target: { value: "אחר" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ביטול" }));
    expect(routerMock.back).not.toHaveBeenCalled();
    expect(screen.getByText("לבטל את השינויים?")).toBeInTheDocument();
  });

  it("delete button appears in edit mode but not in create mode", () => {
    renderForm({ initialValues: validValues });
    expect(screen.queryByRole("button", { name: /מחק מתכון/ })).not.toBeInTheDocument();

    renderForm({ initialValues: validValues, recipeId: "x" });
    expect(screen.getByRole("button", { name: /מחק מתכון/ })).toBeInTheDocument();
  });

  it("delete flow: button opens dialog → confirm removes recipe + navigates", () => {
    const created = saveRecipe({
      name: "ישן",
      flour: { white: 80, wholeWheat: 20, rye: 0, other: 0 },
      hydration: 75,
      salt: 2,
      levain: 20,
      kitchenTemp: 25,
      inclusions: [],
    });
    renderForm({
      initialValues: { ...validValues, name: created.name },
      recipeId: created.id,
    });
    fireEvent.click(screen.getByRole("button", { name: /מחק מתכון/ }));
    expect(screen.getByText(/למחוק את "ישן"/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "מחק" }));
    expect(listRecipes()).toHaveLength(0);
    expect(routerMock.push).toHaveBeenCalledWith("/recipes");
  });
});
