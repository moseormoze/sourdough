import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChooserScreen } from "./chooser-screen";

vi.mock("@/lib/hooks/use-active-bake", () => ({
  useActiveBake: () => ({
    activeBake: null,
    loading: true,
    abandon: vi.fn(),
  }),
}));

describe("ChooserScreen — loading gate", () => {
  it("shows only inert placeholders until the active bake resolves", () => {
    const { container } = render(<ChooserScreen />);

    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("heading", { level: 1, name: "בייק חדש" })).toBeInTheDocument();

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent("חזרה");

    expect(container.querySelectorAll('div[aria-hidden="true"]')).toHaveLength(2);
  });
});
