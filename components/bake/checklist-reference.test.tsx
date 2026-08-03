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

  it("uses neutral reference markers in the pilot instead of verified checkmarks", () => {
    const { container } = render(
      <ChecklistReference items={["בועות", "תפיחה"]} variant="pilot" />,
    );
    expect(container.querySelectorAll("svg")).toHaveLength(0);
    expect(container.querySelectorAll('[data-indicator="reference"]')).toHaveLength(2);
    expect(screen.getByRole("region", { name: "מתי להמשיך לשלב הבא" })).toHaveAttribute(
      "data-surface",
      "glass",
    );
  });

  it("keeps established checkmarks outside the pilot", () => {
    const { container } = render(<ChecklistReference items={["בועות", "תפיחה"]} />);
    expect(container.querySelectorAll("svg")).toHaveLength(2);
    expect(container.querySelectorAll('[data-indicator="reference"]')).toHaveLength(0);
  });

  it("uses a custom title when provided", () => {
    render(<ChecklistReference items={["x"]} title="סימנים" />);
    expect(screen.getByText("סימנים")).toBeInTheDocument();
  });

  it("renders a reference image when imageUrl is provided", () => {
    render(
      <ChecklistReference
        items={["בועות"]}
        imageUrl="/stages/4-bulk-done.png"
        imageAlt="בצק שתפח בסוף התסיסה"
      />
    );
    const img = screen.getByRole("img", { name: "בצק שתפח בסוף התסיסה" });
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("4-bulk-done");
  });

  it("renders no image when imageUrl is absent", () => {
    const { container } = render(<ChecklistReference items={["בועות"]} />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("renders an optional non-interactive transition after the signs", () => {
    render(
      <ChecklistReference
        items={["אין כיסי קמח יבש"]}
        transition="עכשיו עוברים ללישה ומוסיפים את השאור"
      />
    );
    expect(screen.getByText("עכשיו עוברים ללישה ומוסיפים את השאור")).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});
