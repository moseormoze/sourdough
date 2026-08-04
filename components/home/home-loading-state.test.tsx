import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeLoadingState } from "./home-loading-state";

describe("HomeLoadingState", () => {
  it("renders inert neutral placeholders without controls or visible copy", () => {
    const { container } = render(<HomeLoadingState />);

    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent("התחל אפייה");
  });
});
