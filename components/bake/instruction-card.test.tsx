import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InstructionCard } from "./instruction-card";
import type { BakeQuantities } from "@/lib/bake-math";

const sampleQuantities: BakeQuantities = {
  totalFlourGrams: 500,
  totalWaterGrams: 375,
  saltGrams: 10,
  levainTotalGrams: 100,
  levainBuild: { starterGrams: 33, waterGrams: 33, flourGrams: 33 },
  mixAdditions: { flourGrams: 384, waterGrams: 305, saltReserveWaterGrams: 20 },
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
