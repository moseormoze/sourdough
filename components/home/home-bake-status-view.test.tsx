import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeBakeStatusView } from "./home-bake-status-view";

describe("HomeBakeStatusView", () => {
  it.each([
    ["running", "הטיימר פועל", "29:00"],
    ["paused", "הטיימר מושהה", "12:30"],
    ["finished", "הטיימר הסתיים", "00:00"],
  ] as const)("renders %s phase separately from its visible countdown", (phase, label, time) => {
    render(
      <HomeBakeStatusView
        status={{ kind: "timer", phase, secondsLeft: 0, formattedTime: time }}
      />,
    );

    const live = screen.getByRole("status");
    expect(live).toHaveTextContent(label);
    expect(live).not.toHaveTextContent(time);
    expect(screen.getByText(time)).toHaveAttribute("dir", "ltr");
  });

  it("uses the approved fold copy and decorative total dots", () => {
    const { container } = render(
      <HomeBakeStatusView status={{ kind: "folds", current: 2, total: 4 }} />,
    );

    expect(screen.getByText("2 / 4 קיפולים בוצעו")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "4");
    expect(container.querySelectorAll('[data-testid="home-fold-dot"]')).toHaveLength(4);
  });
});
