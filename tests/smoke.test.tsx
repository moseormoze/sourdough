import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/app/page";

describe("T1 scaffold — home page smoke", () => {
  it("renders the Kikar wordmark", () => {
    render(<Home />);
    expect(screen.getByText("כיכר")).toBeInTheDocument();
  });

  it("renders the home subtitle", () => {
    render(<Home />);
    expect(screen.getByText("מה אופים היום?")).toBeInTheDocument();
  });
});
