import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChecklistReference } from "./checklist-reference";

describe("ChecklistReference", () => {
  it("renders nothing when items are empty", () => {
    const { container } = render(<ChecklistReference items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the default title and N items", () => {
    render(<ChecklistReference items={["בועות", "תפיחה", "ריח חמצמץ"]} />);
    expect(screen.getByText("מתי להמשיך לשלב הבא")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("does NOT render any interactive elements", () => {
    render(<ChecklistReference items={["בועות", "תפיחה"]} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("uses a custom title when provided", () => {
    render(<ChecklistReference items={["x"]} title="סימנים" />);
    expect(screen.getByText("סימנים")).toBeInTheDocument();
  });
});
