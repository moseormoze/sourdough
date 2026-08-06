import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import StagePage from "./page";
import { saveRecipe } from "@/lib/storage/recipes";
import { saveActiveBake } from "@/lib/storage/active-bake";
import { getStage } from "@/lib/data/stages";
import { routerMock, paramsMock } from "../../../../vitest.setup";

const sample = {
  name: "כפרי",
  flour: { white: 80, wholeWheat: 20, rye: 0, other: 0 },
  hydration: 75,
  salt: 2,
  levain: 20,
  kitchenTemp: 25,
  inclusions: [],
};

function seedActive(currentStage: number) {
  const recipe = saveRecipe(sample);
  saveActiveBake({
    id: "ab",
    recipe,
    startedAt: 1,
    currentStage,
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

describe("/bake/stage/[n] page", () => {
  beforeEach(() => {
    localStorage.clear();
    routerMock.replace.mockClear();
    routerMock.push.mockClear();
    // reset params
    for (const k of Object.keys(paramsMock)) delete paramsMock[k];
  });

  it("renders the StageScreen when the active bake is on the requested stage", async () => {
    seedActive(4);
    paramsMock.n = "4";
    render(<StagePage />);
    // Stage 4 specifics from lib/data/stages.ts
    expect(await screen.findByText("תסיסה ראשונית")).toBeInTheDocument();
    expect(screen.getByText("4/12")).toBeInTheDocument();
  });

  it("redirects to / when there is no active bake", async () => {
    paramsMock.n = "1";
    render(<StagePage />);
    await waitFor(() => {
      expect(routerMock.replace).toHaveBeenCalledWith("/");
    });
  });

  // T1 (feature 27): an already-completed stage stays readable, so the baker can
  // re-read an earlier step while the current wait keeps running. Only skipping
  // ahead is still redirected.
  it("renders an earlier stage without redirecting", async () => {
    seedActive(7);
    paramsMock.n = "3";
    render(<StagePage />);
    await waitFor(() => {
      expect(screen.getByText(getStage(3)!.briefing.heading)).toBeInTheDocument();
    });
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it("redirects when the URL stage is ahead of the bake", async () => {
    seedActive(3);
    paramsMock.n = "7";
    render(<StagePage />);
    await waitFor(() => {
      expect(routerMock.replace).toHaveBeenCalledWith("/bake/stage/3");
    });
  });

  it("redirects when the URL stage is out of range", async () => {
    seedActive(2);
    paramsMock.n = "99";
    render(<StagePage />);
    await waitFor(() => {
      expect(routerMock.replace).toHaveBeenCalledWith("/bake/stage/2");
    });
  });

  it("redirects when the URL stage is not a number", async () => {
    seedActive(5);
    paramsMock.n = "abc";
    render(<StagePage />);
    await waitFor(() => {
      expect(routerMock.replace).toHaveBeenCalledWith("/bake/stage/5");
    });
  });
});
