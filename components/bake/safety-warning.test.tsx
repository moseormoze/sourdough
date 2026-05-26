import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SafetyWarning } from "./safety-warning";

describe("SafetyWarning", () => {
  it("renders the children as the warning body", () => {
    render(<SafetyWarning>קערה חייבת להיות עמידה לחום</SafetyWarning>);
    expect(screen.getByText(/קערה חייבת להיות עמידה לחום/)).toBeInTheDocument();
  });

  it("uses role='alert' so screen readers announce it", () => {
    render(<SafetyWarning>שים לב</SafetyWarning>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("includes an AlertTriangle decorative icon (aria-hidden)", () => {
    const { container } = render(<SafetyWarning>x</SafetyWarning>);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute("aria-hidden")).not.toBeNull();
  });

  it("applies danger styling to the wrapper", () => {
    render(<SafetyWarning>x</SafetyWarning>);
    const alert = screen.getByRole("alert");
    expect(alert.className).toMatch(/bg-danger-bg/);
    expect(alert.className).toMatch(/border-danger/);
  });
});
