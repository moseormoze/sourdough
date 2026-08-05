import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DonePage from "./page";
import { saveRecipe } from "@/lib/storage/recipes";
import { saveActiveBake, loadActiveBake } from "@/lib/storage/active-bake";
import { routerMock } from "../../../vitest.setup";
import { AMBIENT_CANVAS, AMBIENT_CHARCOAL } from "@/components/ui/ambient";

const sample = {
  name: "כפרי",
  flour: { white: 80, wholeWheat: 20, rye: 0, other: 0 },
  hydration: 75,
  salt: 2,
  levain: 20,
  kitchenTemp: 25,
  inclusions: [],
};

function seedActive() {
  const recipe = saveRecipe(sample);
  saveActiveBake({
    id: "ab-done",
    recipe,
    startedAt: 1,
    currentStage: 12,
    stageStartedAt: 2,
    observationChecks: {},
    subStep: 0,
    timerStartedAt: null,
    timerElapsedSeconds: 0,
    timerDurationSeconds: null,
    bakingMethod: "closed-vessel",
    feedAt: null,
    peakAt: null,
    feedRatio: 2 as const,
    retardHours: 12,
    doughTempC: null,
  });
}

describe("/bake/done page", () => {
  beforeEach(() => {
    localStorage.clear();
    routerMock.push.mockClear();
    routerMock.replace.mockClear();
  });

  it("renders the celebration title + blurb when a bake exists", async () => {
    seedActive();
    render(<DonePage />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "הלחם מוכן!" })).toBeInTheDocument();
    });
    expect(screen.getByText(/24–48 שעות עבודה/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "סיימתי" })).toBeInTheDocument();
  });

  it("clicking 'סיימתי' clears the active bake and navigates to /", async () => {
    seedActive();
    render(<DonePage />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "סיימתי" })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "סיימתי" }));
    expect(loadActiveBake()).toBeNull();
    expect(routerMock.push).toHaveBeenCalledWith("/");
  });

  it("clicking 'חזרה למסך הבית' header link also clears + navigates", async () => {
    seedActive();
    render(<DonePage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /חזרה למסך הבית/ })
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /חזרה למסך הבית/ }));
    expect(loadActiveBake()).toBeNull();
    expect(routerMock.push).toHaveBeenCalledWith("/");
  });

  it("redirects to / when there is no active bake", async () => {
    render(<DonePage />);
    await waitFor(() => {
      expect(routerMock.replace).toHaveBeenCalledWith("/");
    });
  });
});

describe("/bake/done page — redesigned composition", () => {
  beforeEach(() => {
    localStorage.clear();
    routerMock.push.mockClear();
    routerMock.replace.mockClear();
  });

  it("wraps the screen in the shared ambient canvas", async () => {
    seedActive();
    const { container } = render(<DonePage />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "הלחם מוכן!" })).toBeInTheDocument();
    });
    const main = container.querySelector("main");
    expect(main?.parentElement?.className).toContain(AMBIENT_CANVAS);
  });

  it("renders the primary CTA filled charcoal, not the legacy accent fill", async () => {
    seedActive();
    render(<DonePage />);
    const cta = await screen.findByRole("button", { name: "סיימתי" });
    expect(cta.className).toContain(AMBIENT_CHARCOAL);
    expect(cta.className).not.toContain("bg-accent");
  });

  it("has no accent-colored surfaces anywhere on the screen", async () => {
    seedActive();
    const { container } = render(<DonePage />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "הלחם מוכן!" })).toBeInTheDocument();
    });
    const accentSurfaces = container.querySelectorAll('[class*="bg-accent"]');
    expect(accentSurfaces.length).toBe(0);
  });

  it("keeps the back-to-home control as a real button with unchanged accessible name", async () => {
    seedActive();
    render(<DonePage />);
    const back = await screen.findByRole("button", { name: /חזרה למסך הבית/ });
    expect(back.tagName).toBe("BUTTON");
  });
});
