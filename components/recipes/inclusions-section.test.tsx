import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InclusionsSection } from "./inclusions-section";
import type { InclusionInput } from "@/lib/validate-recipe";

const ROW: InclusionInput = { name: "זיתים", amountGrams: 50 };

describe("InclusionsSection", () => {
  it("renders the title and add button when empty (no row inputs)", () => {
    render(<InclusionsSection value={[]} onChange={() => {}} />);
    expect(screen.getByText("תוספות (אופציונלי)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /הוסף תוספת/ })).toBeInTheDocument();
    expect(screen.queryByLabelText("שם")).not.toBeInTheDocument();
  });

  it("clicking 'הוסף תוספת' appends a new empty row", () => {
    const onChange = vi.fn();
    render(<InclusionsSection value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /הוסף תוספת/ }));
    expect(onChange).toHaveBeenCalledWith([{ name: "", amountGrams: "" }]);
  });

  it("renders existing rows with their values", () => {
    render(<InclusionsSection value={[ROW]} onChange={() => {}} />);
    expect((screen.getByLabelText("שם") as HTMLInputElement).value).toBe("זיתים");
  });

  it("editing a row calls onChange with the updated array", () => {
    const onChange = vi.fn();
    render(<InclusionsSection value={[ROW]} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("שם"), { target: { value: "אגוזים" } });
    expect(onChange).toHaveBeenCalledWith([{ name: "אגוזים", amountGrams: 50 }]);
  });

  it("removing a row removes it from the array", () => {
    const onChange = vi.fn();
    render(
      <InclusionsSection
        value={[ROW, { name: "אגוזים", amountGrams: 30 }]}
        onChange={onChange}
      />
    );
    const removeButtons = screen.getAllByRole("button", { name: /^מחק/ });
    fireEvent.click(removeButtons[0]!);
    expect(onChange).toHaveBeenCalledWith([{ name: "אגוזים", amountGrams: 30 }]);
  });

  it("does NOT show error when showErrors[i] is false", () => {
    render(
      <InclusionsSection
        value={[{ name: "", amountGrams: "" }]}
        onChange={() => {}}
        errors={[{ name: "חובה", amountGrams: "חיובי" }]}
        showErrors={[false]}
      />
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows error when showErrors[i] is true", () => {
    render(
      <InclusionsSection
        value={[{ name: "", amountGrams: "" }]}
        onChange={() => {}}
        errors={[{ name: "חובה", amountGrams: "חיובי" }]}
        showErrors={[true]}
      />
    );
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
  });
});
