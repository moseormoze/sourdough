import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecipeFormScreen } from "./recipe-form-screen";
import { ToastProvider } from "@/components/ui/toast";
import { listRecipes, saveRecipe } from "@/lib/storage/recipes";
import { routerMock } from "../../vitest.setup";
import type { RecipeFormValues } from "@/lib/validate-recipe";

const validValues: RecipeFormValues = {
  name: "כפרי",
  flour: { white: 80, wholeWheat: 20, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
  flourWeightGrams: 500,
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
    expect(screen.getByLabelText("משקל קמח")).toBeInTheDocument();
    expect(screen.getByLabelText("הידרציה")).toBeInTheDocument();
    expect(screen.getByLabelText("מלח")).toBeInTheDocument();
    expect(screen.getByLabelText("שאור")).toBeInTheDocument();
    expect(screen.getByLabelText("טמפ׳ מטבח")).toBeInTheDocument();
  });

  it("seeds flourWeightGrams to 500 in create mode", () => {
    renderForm();
    expect((screen.getByLabelText("משקל קמח") as HTMLInputElement).value).toBe("500");
  });

  it("renders flour weight before hydration in the DOM", () => {
    renderForm();
    const flourWeight = screen.getByLabelText("משקל קמח");
    const hydration = screen.getByLabelText("הידרציה");
    expect(
      flourWeight.compareDocumentPosition(hydration) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("shows flour weight error after blur on out-of-range value", () => {
    renderForm({ initialValues: { ...validValues, flourWeightGrams: 50 } });
    fireEvent.blur(screen.getByLabelText("משקל קמח"));
    expect(
      screen.getByText(/משקל קמח חייב להיות בין 100g ל-1500g/)
    ).toBeInTheDocument();
  });

  it("persists flourWeightGrams through save", () => {
    renderForm({ initialValues: { ...validValues, flourWeightGrams: 800 } });
    fireEvent.click(screen.getByRole("button", { name: "שמור" }));
    expect(listRecipes()).toHaveLength(1);
    expect(listRecipes()[0]?.flourWeightGrams).toBe(800);
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
      flour: { white: 80, wholeWheat: 20, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
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
      flour: { white: 80, wholeWheat: 20, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
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

describe("RecipeFormScreen — Israeli flour hydration note", () => {
  it("shows the flour-strength note under the hydration field", () => {
    renderForm();
    expect(screen.getByText(/קמח לחם/)).toBeInTheDocument();
    expect(screen.getByText(/70–72%/)).toBeInTheDocument();
  });
});

describe("RecipeFormScreen — Redesigned composition", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("wraps the content column in the ambient canvas", () => {
    const { container } = renderForm({ initialValues: validValues });
    const main = container.querySelector("main");
    expect(main).not.toBeNull();
    expect(main?.className).toContain("max-w-md");
    expect(main?.className).toContain("overflow-x-clip");
    expect(main?.parentElement?.className).toContain(
      "bg-[linear-gradient(160deg,_#FFF8F1_0%,_#FFDDBD_22%,_#F7F0E7_55%,_#DDEDF2_100%)]"
    );
  });

  it("groups the form into five glass cards", () => {
    const { container } = renderForm({ initialValues: validValues });
    const cards = container.querySelectorAll('[data-surface="glass"]');
    expect(cards).toHaveLength(5);
    cards.forEach((card) => {
      expect(card.className).toContain("rounded-[2rem]");
      expect(card.className).toContain("supports-[backdrop-filter]:backdrop-blur-md");
    });
  });

  it("renders the save CTA as charcoal in a sticky footer", () => {
    const { container } = renderForm({ initialValues: validValues });
    const save = screen.getByRole("button", { name: "שמור" });
    expect(save.className).toContain("bg-[#292A28]");
    expect(save.className).not.toContain("bg-accent");
    const footer = container.querySelector("[data-footer='sticky']");
    expect(footer).not.toBeNull();
    expect(footer?.className).toContain("sticky");
    expect(footer?.contains(save)).toBe(true);
  });

  it("has no accent-coloured controls left on the screen", () => {
    const { container } = renderForm({ initialValues: validValues });
    expect(container.innerHTML).not.toMatch(/(bg|text|ring|border)-accent/);
  });

  it("renders every field in the inset appearance (no legacy borders)", () => {
    const { container } = renderForm({ initialValues: validValues });
    const name = screen.getByLabelText("שם המתכון");
    expect(name.className).toContain("bg-paper/70");
    expect(name.className).toContain("rounded-2xl");

    const hydrationShell = screen.getByLabelText("הידרציה").parentElement;
    expect(hydrationShell?.className).toContain("rounded-full");
    expect(hydrationShell?.className).toContain("bg-paper/70");

    expect(container.innerHTML).not.toContain("border-line");
  });

  it("dresses the inclusion row as a tonal inset, not a bordered card", () => {
    const { container } = renderForm({
      initialValues: {
        ...validValues,
        inclusions: [{ name: "זיתים", amountGrams: 50 }],
      },
    });
    const row = container.querySelector("[data-inclusion-row]");
    expect(row).not.toBeNull();
    expect(row?.className).toContain("bg-ink/[0.04]");
    expect(row?.className).not.toContain("border");
  });
});
