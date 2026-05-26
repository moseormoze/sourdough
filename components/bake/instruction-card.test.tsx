import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InstructionCard } from "./instruction-card";

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
});
