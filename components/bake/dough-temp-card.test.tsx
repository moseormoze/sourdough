import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DoughTempCard } from "./dough-temp-card";
import { strings } from "@/lib/strings";
import type { Flour } from "@/lib/types/recipe";

const WHITE: Flour = { white: 100, wholeWheat: 0, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 };
const BASE_SECS = 4 * 3600;

function renderCard(
  overrides: Partial<{
    doughTempC: number | null;
    kitchenTempC: number;
    onChange: (t: number | null) => void;
  }> = {}
) {
  const onChange = overrides.onChange ?? vi.fn();
  render(
    <DoughTempCard
      doughTempC={overrides.doughTempC ?? null}
      kitchenTempC={overrides.kitchenTempC ?? 24}
      flour={WHITE}
      baseSecs={BASE_SECS}
      onChange={onChange}
    />
  );
  return { onChange };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DoughTempCard — empty → editing → save", () => {
  it("starts collapsed with the prompt and a 'מדדתי' button; no input yet", () => {
    renderCard();
    expect(screen.getByText(strings.bake.doughTemp.prompt)).toBeInTheDocument();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  it("opens the input pre-filled with the kitchen temp", () => {
    renderCard({ kitchenTempC: 26 });
    fireEvent.click(screen.getByRole("button", { name: strings.bake.doughTemp.measured }));
    expect(screen.getByRole("spinbutton")).toHaveValue(26);
  });

  it("saving a valid value calls onChange with the number", () => {
    const { onChange } = renderCard();
    fireEvent.click(screen.getByRole("button", { name: strings.bake.doughTemp.measured }));
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "26.5" } });
    fireEvent.click(screen.getByRole("button", { name: strings.bake.doughTemp.save }));
    expect(onChange).toHaveBeenCalledWith(26.5);
  });

  it("out-of-range value disables save and shows the range error", () => {
    const { onChange } = renderCard();
    fireEvent.click(screen.getByRole("button", { name: strings.bake.doughTemp.measured }));
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "40" } });
    expect(screen.getByText(strings.bake.doughTemp.rangeError)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: strings.bake.doughTemp.save })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: strings.bake.doughTemp.save }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("cancel closes the editor without calling onChange", () => {
    const { onChange } = renderCard();
    fireEvent.click(screen.getByRole("button", { name: strings.bake.doughTemp.measured }));
    fireEvent.click(screen.getByRole("button", { name: strings.bake.doughTemp.cancel }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    expect(screen.getByText(strings.bake.doughTemp.prompt)).toBeInTheDocument();
  });
});

describe("DoughTempCard — shadow line", () => {
  it("warmer dough: range label + 'start checking earlier' + the signs rule", () => {
    // 4h base, kitchen 24° (official 4h), dough 26° → 3h29m → delta ≈ 31min
    renderCard({ doughTempC: 26, kitchenTempC: 24 });
    const line = screen.getByText(/לפי טמפ׳ הבצק/);
    expect(line).toHaveTextContent("בין 2 ל-4 שעות");
    expect(line).toHaveTextContent(strings.bake.doughTemp.hintEarly);
    expect(line).toHaveTextContent(strings.bake.doughTemp.signsRule);
  });

  it("cooler dough: 'more time than usual'", () => {
    // dough 22° → 4h36m → delta ≈ −36min
    renderCard({ doughTempC: 22, kitchenTempC: 24 });
    expect(screen.getByText(/לפי טמפ׳ הבצק/)).toHaveTextContent(
      strings.bake.doughTemp.hintLater
    );
  });

  it("near-identical temps: 'close to the regular estimate'", () => {
    // dough 24.5° → delta ≈ 8min, inside the ±20min band
    renderCard({ doughTempC: 24.5, kitchenTempC: 24 });
    expect(screen.getByText(/לפי טמפ׳ הבצק/)).toHaveTextContent(
      strings.bake.doughTemp.hintSimilar
    );
  });

  it("edit reopens the input with the measured value; removal calls onChange(null)", () => {
    const { onChange } = renderCard({ doughTempC: 26 });
    fireEvent.click(screen.getByRole("button", { name: strings.bake.doughTemp.edit }));
    expect(screen.getByRole("spinbutton")).toHaveValue(26);
    fireEvent.click(screen.getByRole("button", { name: strings.bake.doughTemp.remove }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
