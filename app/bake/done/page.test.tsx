import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DonePage from "./page";
import { saveRecipe } from "@/lib/storage/recipes";
import { saveActiveBake, loadActiveBake } from "@/lib/storage/active-bake";
import { routerMock } from "../../../vitest.setup";

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
    bakingMethod: "closed-vessel",
    feedAt: null,
    peakAt: null,
    feedRatio: 2 as const,
    retardHours: 12,
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
