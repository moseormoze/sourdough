import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeedingGramsInput, type FeedingGrams } from "./feeding-grams-input";
import { strings } from "@/lib/strings";

const EMPTY: FeedingGrams = { starterGrams: "", flourGrams: "", waterGrams: "" };

describe("FeedingGramsInput", () => {
  it("renders three fields with correct labels and unit", () => {
    render(<FeedingGramsInput value={EMPTY} onChange={vi.fn()} />);
    expect(screen.getByLabelText(strings.starterTracker.grams.starterLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(strings.starterTracker.grams.flourLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(strings.starterTracker.grams.waterLabel)).toBeInTheDocument();
    expect(screen.getAllByText(strings.starterTracker.grams.unit)).toHaveLength(3);
  });

  it("renders compact inputs — no −/+ stepper buttons that overflow narrow viewports", () => {
    render(<FeedingGramsInput value={EMPTY} onChange={vi.fn()} />);
    expect(screen.queryByLabelText(strings.common.decrement)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(strings.common.increment)).not.toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("treats all-empty values as valid — no error is shown", () => {
    render(<FeedingGramsInput value={EMPTY} onChange={vi.fn()} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("updating one field does not affect the others", () => {
    const onChange = vi.fn();
    const value: FeedingGrams = { starterGrams: 50, flourGrams: 100, waterGrams: 100 };
    render(<FeedingGramsInput value={value} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(strings.starterTracker.grams.flourLabel), {
      target: { value: "120" },
    });

    expect(onChange).toHaveBeenCalledWith({
      starterGrams: 50,
      flourGrams: 120,
      waterGrams: 100,
    });
  });

  it("clearing a field emits empty string for that field only", () => {
    const onChange = vi.fn();
    const value: FeedingGrams = { starterGrams: 50, flourGrams: 100, waterGrams: 100 };
    render(<FeedingGramsInput value={value} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(strings.starterTracker.grams.starterLabel), {
      target: { value: "" },
    });

    expect(onChange).toHaveBeenCalledWith({
      starterGrams: "",
      flourGrams: 100,
      waterGrams: 100,
    });
  });

  it("does not use physical left/right/ml/mr classes anywhere in the rendered output", () => {
    const { container } = render(<FeedingGramsInput value={EMPTY} onChange={vi.fn()} />);
    const classNames = Array.from(container.querySelectorAll<HTMLElement>("*"))
      .map((el) => el.className)
      .join(" ");
    expect(classNames).not.toMatch(/(^|\s)ml-/);
    expect(classNames).not.toMatch(/(^|\s)mr-/);
    expect(classNames).not.toMatch(/(^|\s)left-/);
    expect(classNames).not.toMatch(/(^|\s)right-/);
  });
});
