import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InstructionCard } from "./instruction-card";
import type { BakeQuantities } from "@/lib/bake-math";

const sampleQuantities: BakeQuantities = {
  totalFlourGrams: 500,
  totalWaterGrams: 375,
  saltGrams: 10,
  levainTotalGrams: 100,
  levainBuild: {
    starterGrams: 33,
    waterGrams: 33,
    flourGrams: 33,
    flourBreakdown: [
      { type: "white", grams: 26 },
      { type: "wholeWheat", grams: 7 },
    ],
  },
  mixAdditions: {
    flourGrams: 451,
    flourBreakdown: [
      { type: "white", grams: 361 },
      { type: "wholeWheat", grams: 90 },
    ],
    waterGrams: 305,
    saltReserveWaterGrams: 20,
  },
};

describe("InstructionCard", () => {
  it("renders default title 'מה לעשות'", () => {
    render(<InstructionCard steps={["ערבבו קמח ומים"]} />);
    expect(screen.getByText("מה לעשות")).toBeInTheDocument();
  });

  it("renders the steps as an ordered list", () => {
    render(<InstructionCard steps={["שקלו קמח", "הוסיפו מים", "ערבבו"]} />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("שקלו קמח");
    expect(items[2]).toHaveTextContent("ערבבו");
  });

  it("renders a custom title when provided", () => {
    render(<InstructionCard steps={["x"]} title="הוראות מיוחדות" />);
    expect(screen.getByText("הוראות מיוחדות")).toBeInTheDocument();
  });

  it("renders a tip when provided", () => {
    render(<InstructionCard steps={["x"]} tip="הרטיבו את היד" />);
    expect(screen.getByText("טיפ:")).toBeInTheDocument();
    expect(screen.getByText(/הרטיבו את היד/)).toBeInTheDocument();
  });

  it("omits the tip block when not provided", () => {
    render(<InstructionCard steps={["x"]} />);
    expect(screen.queryByText("טיפ:")).not.toBeInTheDocument();
  });

  it("substitutes a known placeholder with a bolded number when quantities are provided", () => {
    render(
      <InstructionCard
        steps={["ערבבו {starterGrams} סטארטר עם {levainWaterGrams} מים"]}
        quantities={sampleQuantities}
      />
    );
    const strongs = screen.getAllByText(/^33g$/);
    expect(strongs).toHaveLength(2);
    expect(strongs[0]?.tagName).toBe("STRONG");
    expect(strongs[0]).toHaveClass("font-semibold");
  });

  it("leaves placeholders untouched when no quantities are provided", () => {
    render(<InstructionCard steps={["ערבבו {starterGrams} סטארטר"]} />);
    expect(screen.getByRole("listitem")).toHaveTextContent("{starterGrams}");
  });

  it("leaves an unknown placeholder untouched even with quantities", () => {
    render(
      <InstructionCard
        steps={["ערבבו {wrongName} סטארטר"]}
        quantities={sampleQuantities}
      />
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("{wrongName}");
  });

  it("renders a footer note when provided", () => {
    render(
      <InstructionCard
        steps={["x"]}
        note="הקמח של השאור כלול בתוך 100% הקמח."
      />
    );
    expect(screen.getByText(/הערה:/)).toBeInTheDocument();
    expect(screen.getByText(/הקמח של השאור כלול/)).toBeInTheDocument();
  });

  it("omits the note when not provided", () => {
    render(<InstructionCard steps={["x"]} />);
    expect(screen.queryByText(/הערה:/)).not.toBeInTheDocument();
  });

  it("renders **markdown bold** segments as <strong>", () => {
    render(
      <InstructionCard
        steps={["**אם כלי סגור** — פתחו את הכלי, שימו את הבצק."]}
      />
    );
    const bolded = screen.getByText("אם כלי סגור");
    expect(bolded.tagName).toBe("STRONG");
    expect(bolded).toHaveClass("font-semibold");
  });

  it("processes bold inside tip + note as well", () => {
    render(
      <InstructionCard
        steps={["x"]}
        tip="הקפידו על **טמפ׳ נכונה** — זה קריטי"
        note="הערה על **קמח** שצריך לבחור"
      />
    );
    expect(screen.getByText("טמפ׳ נכונה").tagName).toBe("STRONG");
    expect(screen.getByText("קמח").tagName).toBe("STRONG");
  });

  it("renders flour breakdown token with bolded per-type grams + Hebrew labels", () => {
    render(
      <InstructionCard
        steps={["שקלו {mixFlourBreakdown} לקערה גדולה."]}
        quantities={sampleQuantities}
      />
    );
    const item = screen.getByRole("listitem");
    expect(item).toHaveTextContent(/361g.*קמח לבן.*90g.*קמח מלא/);
    expect(screen.getByText("361g").tagName).toBe("STRONG");
    expect(screen.getByText("90g").tagName).toBe("STRONG");
  });

  it("flour breakdown joins last item with 'ו-' (Hebrew 'and')", () => {
    render(
      <InstructionCard
        steps={["שקלו {mixFlourBreakdown}."]}
        quantities={sampleQuantities}
      />
    );
    expect(screen.getByRole("listitem")).toHaveTextContent(/ו-/);
  });

  it("flour breakdown with single type uses no separator", () => {
    const oneTypeQuantities: BakeQuantities = {
      ...sampleQuantities,
      mixAdditions: {
        ...sampleQuantities.mixAdditions,
        flourBreakdown: [{ type: "white", grams: 451 }],
      },
    };
    render(
      <InstructionCard
        steps={["שקלו {mixFlourBreakdown}."]}
        quantities={oneTypeQuantities}
      />
    );
    const item = screen.getByRole("listitem");
    expect(item).toHaveTextContent(/451g קמח לבן/);
    expect(item.textContent).not.toContain("ו-");
  });

  it("handles multiple placeholders mixed with text in a single step", () => {
    render(
      <InstructionCard
        steps={[
          "שקלו {totalFlourGrams} קמח והוסיפו {saltGrams} מלח",
        ]}
        quantities={sampleQuantities}
      />
    );
    const item = screen.getByRole("listitem");
    expect(item).toHaveTextContent("500g");
    expect(item).toHaveTextContent("10g");
  });
});
