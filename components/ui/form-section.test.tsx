import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormSection } from "./form-section";

describe("FormSection", () => {
  it("renders children", () => {
    render(
      <FormSection>
        <div data-testid="child" />
      </FormSection>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(
      <FormSection title="פרטים">
        <div />
      </FormSection>
    );
    const heading = screen.getByRole("heading", { name: "פרטים" });
    expect(heading.tagName).toBe("H2");
  });

  it("renders description when provided", () => {
    render(
      <FormSection title="פרטים" description="מלא כדי לשמור">
        <div />
      </FormSection>
    );
    expect(screen.getByText("מלא כדי לשמור")).toBeInTheDocument();
  });
});
