import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ValidationMessage } from "./validation-message";

describe("ValidationMessage", () => {
  it("renders nothing when message is empty", () => {
    const { container } = render(<ValidationMessage message="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when message is null", () => {
    const { container } = render(<ValidationMessage message={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the message with role=alert", () => {
    render(<ValidationMessage message="שדה חובה" />);
    const el = screen.getByRole("alert");
    expect(el).toHaveTextContent("שדה חובה");
  });

  it("uses aria-live polite", () => {
    render(<ValidationMessage message="שגיאה" />);
    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "polite");
  });
});
