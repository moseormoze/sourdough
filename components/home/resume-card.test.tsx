import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResumeCard } from "./resume-card";
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
    kitchenTemp: 25,
    inclusions: [],
    createdAt: 1,
    updatedAt: 1,
  },
  startedAt: 100,
  currentStage: 4,
  stageStartedAt: 200,
  observationChecks: {},
};

describe("ResumeCard", () => {
  beforeEach(() => {
    routerMock.push.mockClear();
  });

  it("renders heading and recipe name", () => {
    render(<ResumeCard activeBake={activeBake} onAbandonRequest={() => {}} />);
    expect(screen.getByText("ממשיכים את הבייק שלך")).toBeInTheDocument();
    expect(screen.getByText("לחם של שישי")).toBeInTheDocument();
  });

  it("renders the current stage number", () => {
    render(<ResumeCard activeBake={activeBake} onAbandonRequest={() => {}} />);
    expect(screen.getByText(/שלב 4/)).toBeInTheDocument();
  });

  it("primary CTA navigates to /bake/stage/{currentStage}", () => {
    render(<ResumeCard activeBake={activeBake} onAbandonRequest={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "המשך לבייק" }));
    expect(routerMock.push).toHaveBeenCalledWith("/bake/stage/4");
  });

  it("ghost button calls onAbandonRequest (does NOT directly abandon)", () => {
    const onAbandonRequest = vi.fn();
    render(<ResumeCard activeBake={activeBake} onAbandonRequest={onAbandonRequest} />);
    fireEvent.click(screen.getByRole("button", { name: "ביטול בייק" }));
    expect(onAbandonRequest).toHaveBeenCalledOnce();
  });
});
