import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResumeBanner } from "./resume-banner";
import { routerMock } from "../../vitest.setup";
import type { ActiveBake } from "@/lib/types/active-bake";

const activeBake: ActiveBake = {
  id: "ab-1",
  recipe: {
    id: "r-1",
    name: "לחם של שישי",
    flour: { white: 80, wholeWheat: 20, rye: 0, other: 0 },
    hydration: 75,
    salt: 2,
    levain: 20,
    flourWeightGrams: 500,
    kitchenTemp: 25,
    inclusions: [],
    createdAt: 1,
    updatedAt: 1,
  },
  startedAt: 100,
  currentStage: 4,
  stageStartedAt: 200,
  observationChecks: {},
  subStep: 0,
  timerStartedAt: null,
  bakingMethod: "dutch-oven",
};

describe("ResumeBanner", () => {
  beforeEach(() => {
    routerMock.push.mockClear();
  });

  it("renders the resume label + recipe name + stage number", () => {
    render(<ResumeBanner activeBake={activeBake} onStopRequest={() => {}} />);
    expect(screen.getByText("ממשיכים")).toBeInTheDocument();
    expect(screen.getByText("לחם של שישי")).toBeInTheDocument();
    expect(screen.getByText("שלב 4")).toBeInTheDocument();
  });

  it("primary 'המשך' navigates to /bake/stage/{currentStage}", () => {
    render(<ResumeBanner activeBake={activeBake} onStopRequest={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "המשך" }));
    expect(routerMock.push).toHaveBeenCalledWith("/bake/stage/4");
  });

  it("'סיים בייק' calls onStopRequest (does not directly clear)", () => {
    const onStopRequest = vi.fn();
    render(<ResumeBanner activeBake={activeBake} onStopRequest={onStopRequest} />);
    fireEvent.click(screen.getByRole("button", { name: "סיים בייק" }));
    expect(onStopRequest).toHaveBeenCalledOnce();
  });
});
