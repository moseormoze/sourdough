import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Briefing } from "./briefing";

const sample = {
  heading: "התחלת הבייק",
  blurb: "מה זה השלב הזה",
  takeaways: ["נקודה ראשונה", "נקודה שניה", "נקודה שלישית"],
};

describe("Briefing", () => {
  it("renders heading + blurb", () => {
    render(<Briefing briefing={sample} />);
    expect(screen.getByText(sample.heading)).toBeInTheDocument();
    expect(screen.getByText(sample.blurb)).toBeInTheDocument();
  });

  it("renders all takeaways as list items", () => {
    render(<Briefing briefing={sample} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("נקודה ראשונה");
  });

  it("section has aria-label matching the heading", () => {
    render(<Briefing briefing={sample} />);
    expect(screen.getByLabelText(sample.heading)).toBeInTheDocument();
  });
});
