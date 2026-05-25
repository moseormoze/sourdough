import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InstructionCard } from "./instruction-card";

describe("InstructionCard", () => {
  it("renders default title 'מה לעשות'", () => {
    render(<InstructionCard text="ערבבו קמח ומים" />);
    expect(screen.getByText("מה לעשות")).toBeInTheDocument();
  });

  it("renders the instruction text", () => {
    render(<InstructionCard text="ערבבו קמח ומים" />);
    expect(screen.getByText("ערבבו קמח ומים")).toBeInTheDocument();
  });

  it("renders a custom title when provided", () => {
    render(<InstructionCard text="x" title="הוראות מיוחדות" />);
    expect(screen.getByText("הוראות מיוחדות")).toBeInTheDocument();
  });
});
