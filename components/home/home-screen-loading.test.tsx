import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeScreen } from "./home-screen";
import { strings } from "@/lib/strings";

vi.mock("@/lib/hooks/use-active-bake", () => ({
  useActiveBake: () => ({
    activeBake: null,
    loading: true,
    abandon: vi.fn(),
  }),
}));

vi.mock("@/components/onboarding/install-banner", () => ({
  InstallBanner: () => <div data-testid="install-banner" />,
}));

describe("HomeScreen — loading gate", () => {
  it("shows only inert placeholders until active bake resolves", () => {
    const { container } = render(<HomeScreen />);

    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText(strings.home.subtitle)).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByTestId("install-banner")).not.toBeInTheDocument();
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });
});
