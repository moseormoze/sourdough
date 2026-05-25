import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecipeFormScreen } from "./recipe-form-screen";
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

describe("RecipeFormScreen", () => {
  beforeEach(() => {
    routerMock.back.mockClear();
  });

  it("renders all field labels", () => {
    render(<RecipeFormScreen />);
    expect(screen.getByLabelText("שם המתכון")).toBeInTheDocument();
    expect(screen.getByLabelText("לבן")).toBeInTheDocument();
    expect(screen.getByLabelText("הידרציה")).toBeInTheDocument();
    expect(screen.getByLabelText("מלח")).toBeInTheDocument();
    expect(screen.getByLabelText("שאור")).toBeInTheDocument();
    expect(screen.getByLabelText("טמפ׳ מטבח")).toBeInTheDocument();
  });

  it("fills initial values when provided", () => {
    render(<RecipeFormScreen initialValues={validValues} />);
    expect((screen.getByLabelText("שם המתכון") as HTMLInputElement).value).toBe("כפרי");
    expect((screen.getByLabelText("הידרציה") as HTMLInputElement).value).toBe("75");
  });

  it("does NOT show validation error before field is touched", () => {
    render(<RecipeFormScreen />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows name validation error after blur on empty name", () => {
    render(<RecipeFormScreen />);
    const name = screen.getByLabelText("שם המתכון");
    fireEvent.blur(name);
    expect(screen.getByRole("alert")).toHaveTextContent(/חובה/);
  });

  it("shows hydration error after blur on out-of-range value", () => {
    render(<RecipeFormScreen initialValues={{ ...validValues, hydration: 30 }} />);
    fireEvent.blur(screen.getByLabelText("הידרציה"));
    expect(
      screen.getByText(/הידרציה צריכה להיות בין 50% ל-100%/)
    ).toBeInTheDocument();
  });

  it("calls onSubmit with values when valid + save pressed", () => {
    const onSubmit = vi.fn();
    render(<RecipeFormScreen initialValues={validValues} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "שמור" }));
    expect(onSubmit).toHaveBeenCalledWith(validValues, undefined);
  });

  it("does NOT call onSubmit when invalid (flagging all touched on save attempt)", () => {
    const onSubmit = vi.fn();
    render(
      <RecipeFormScreen
        initialValues={{ ...validValues, hydration: 30 }}
        onSubmit={onSubmit}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "שמור" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText(/הידרציה צריכה להיות בין 50% ל-100%/)
    ).toBeInTheDocument();
  });

  it("passes recipeId through to onSubmit when editing", () => {
    const onSubmit = vi.fn();
    render(
      <RecipeFormScreen
        initialValues={validValues}
        recipeId="abc-123"
        onSubmit={onSubmit}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "שמור" }));
    expect(onSubmit).toHaveBeenCalledWith(validValues, "abc-123");
  });

  it("flour sum indicator updates when a flour field changes", () => {
    render(<RecipeFormScreen initialValues={validValues} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("לבן"), { target: { value: "70" } });
    expect(screen.getByText("90%")).toBeInTheDocument();
  });

  it("cancel button calls router.back", () => {
    render(<RecipeFormScreen />);
    fireEvent.click(screen.getByRole("button", { name: "ביטול" }));
    expect(routerMock.back).toHaveBeenCalled();
  });
});
