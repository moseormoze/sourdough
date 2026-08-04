import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { HomeBakeStatus } from "@/lib/home-bake-status";
import { ResumeBanner } from "./resume-banner";

const stage = { number: 4, total: 12, name: "תסיסה ראשונית" };

function renderBanner(
  status: HomeBakeStatus = { kind: "none" },
  onStopRequest = vi.fn(),
) {
  return render(
    <ResumeBanner
      recipeName="לחםשלשישיארוךמאודללאמרווחים"
      stage={stage}
      status={status}
      continueHref="/bake/stage/4"
      onStopRequest={onStopRequest}
    />,
  );
}

describe("ResumeBanner", () => {
  it("renders a non-interactive card with recipe, stage and progress semantics", () => {
    renderBanner();

    expect(screen.getByText("ממשיכים")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "לחםשלשישיארוךמאודללאמרווחים", level: 2 }),
    ).not.toHaveClass("truncate");
    expect(screen.getByText("תסיסה ראשונית")).toBeInTheDocument();
    const progress = screen.getByRole("progressbar");
    expect(progress).toHaveAttribute("aria-valuemin", "1");
    expect(progress).toHaveAttribute("aria-valuemax", "12");
    expect(progress).toHaveAttribute("aria-valuenow", "4");
    expect(progress.children).toHaveLength(12);
  });

  it("uses a native continue link and a distinct stop button", () => {
    const onStopRequest = vi.fn();
    renderBanner({ kind: "none" }, onStopRequest);

    expect(screen.getByRole("link", { name: "המשך" })).toHaveAttribute(
      "href",
      "/bake/stage/4",
    );
    fireEvent.click(screen.getByRole("button", { name: "סיים בייק" }));
    expect(onStopRequest).toHaveBeenCalledOnce();
  });

  it("renders a timer status without putting the countdown in the live region", () => {
    renderBanner({
      kind: "timer",
      phase: "running",
      secondsLeft: 29 * 60,
      formattedTime: "29:00",
    });

    const live = screen.getByRole("status");
    expect(live).toHaveTextContent("הטיימר פועל");
    expect(live).not.toHaveTextContent("29:00");
    expect(screen.getByText("29:00")).toHaveAttribute("dir", "ltr");
  });

  it("renders fold text once and total decorative dots", () => {
    const { container } = renderBanner({ kind: "folds", current: 2, total: 4 });

    expect(screen.getAllByText("2 / 4 קיפולים בוצעו")).toHaveLength(1);
    expect(container.querySelectorAll('[data-testid="home-fold-dot"]')).toHaveLength(4);
    expect(container.querySelector('[data-testid="home-fold-dots"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
