import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChooserLoadingState } from "./chooser-loading-state";

describe("ChooserLoadingState", () => {
  it("renders two inert glass placeholders without controls or copy", () => {
    const { container } = render(<ChooserLoadingState />);

    const placeholders = container.querySelectorAll('div[aria-hidden="true"]');
    expect(placeholders).toHaveLength(2);
    for (const placeholder of placeholders) {
      expect(placeholder.className).toContain("rounded-[2rem]");
      expect(placeholder.className).toContain("border-paper/60");
      expect(placeholder).toHaveTextContent("");
    }
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
