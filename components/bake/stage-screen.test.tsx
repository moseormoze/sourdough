import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StageScreen } from "./stage-screen";
import { getStage } from "@/lib/data/stages";
import { routerMock } from "../../vitest.setup";
import type { ActiveBake } from "@/lib/types/active-bake";

function makeApi() {
  return {
    advanceTo: vi.fn(),
    advanceSubStep: vi.fn(),
    startTimer: vi.fn(),
    stopTimer: vi.fn(),
  };
}

function makeBake(currentStage: number, overrides: Partial<ActiveBake> = {}): ActiveBake {
  return {
    id: "ab",
    recipe: {
      id: "r",
      name: "כפרי",
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
    startedAt: 1,
    currentStage,
    stageStartedAt: 1,
    observationChecks: {},
    subStep: 0,
    timerStartedAt: null,
    ...overrides,
  };
}

beforeEach(() => {
  routerMock.push.mockClear();
});

describe("StageScreen — basic stage", () => {
  it("renders briefing, instructions, and checklist", () => {
    const stage = getStage(1)!;
    render(<StageScreen stage={stage} activeBake={makeBake(1)} api={makeApi()} />);
    expect(screen.getByText(stage.briefing.heading)).toBeInTheDocument();
    expect(screen.getByText(stage.todo!.steps[0]!)).toBeInTheDocument();
    expect(screen.getByText(stage.checks![0]!)).toBeInTheDocument();
  });

  it("stage 1 substitutes placeholder tokens with bolded gram values", () => {
    const stage = getStage(1)!;
    render(<StageScreen stage={stage} activeBake={makeBake(1)} api={makeApi()} />);
    // Recipe 500g flour, 20% levain → 100g levain total → ~33g starter + 33g water
    const bold33 = screen.getAllByText(/^33g$/);
    expect(bold33.length).toBeGreaterThanOrEqual(2);
    bold33.forEach((el) => {
      expect(el.tagName).toBe("STRONG");
      expect(el).toHaveClass("font-semibold");
    });
  });

  it("stage 1 step 3 shows the levain flour breakdown by recipe blend", () => {
    const stage = getStage(1)!;
    render(<StageScreen stage={stage} activeBake={makeBake(1)} api={makeApi()} />);
    // 33g levain flour, 80/20 blend → 26g white + 7g wholeWheat
    expect(screen.getByText("26g").tagName).toBe("STRONG");
    expect(screen.getByText("7g").tagName).toBe("STRONG");
    expect(screen.getAllByText(/קמח לבן/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/קמח מלא/).length).toBeGreaterThan(0);
  });

  it("stage 1 renders both disclosures (briefing + todo note)", () => {
    const stage = getStage(1)!;
    render(<StageScreen stage={stage} activeBake={makeBake(1)} api={makeApi()} />);
    expect(screen.getByText(/הנחה: סטארטר ב-100% הידרציה/)).toBeInTheDocument();
    expect(screen.getByText(/הקמח של השאור כלול/)).toBeInTheDocument();
  });

  it("stage 2 renders the flour breakdown by type (80/20 blend → two bolded entries)", () => {
    const stage = getStage(2)!;
    render(<StageScreen stage={stage} activeBake={makeBake(2)} api={makeApi()} />);
    // Country preset 500g flour, 80/20 blend → mixFlour = 451g → 361g white + 90g wholeWheat
    expect(screen.getByText("361g").tagName).toBe("STRONG");
    expect(screen.getByText("90g").tagName).toBe("STRONG");
    expect(screen.getByText(/קמח לבן/)).toBeInTheDocument();
    expect(screen.getByText(/קמח מלא/)).toBeInTheDocument();
  });

  it("stage 3 renders salt as a bolded number", () => {
    const stage = getStage(3)!;
    render(<StageScreen stage={stage} activeBake={makeBake(3)} api={makeApi()} />);
    // salt = 10g
    expect(screen.getByText(/^10g$/).tagName).toBe("STRONG");
  });

  it("stages 4+ do NOT show the stage-1 disclosures", () => {
    const stage = getStage(4)!;
    render(<StageScreen stage={stage} activeBake={makeBake(4)} api={makeApi()} />);
    expect(screen.queryByText(/הנחה: סטארטר ב-100% הידרציה/)).not.toBeInTheDocument();
    expect(screen.queryByText(/הקמח של השאור כלול/)).not.toBeInTheDocument();
  });

  it("primary action moves to next stage", () => {
    const stage = getStage(1)!;
    const api = makeApi();
    render(<StageScreen stage={stage} activeBake={makeBake(1)} api={api} />);
    fireEvent.click(screen.getByRole("button", { name: /הבא — אוטוליזה/ }));
    expect(api.advanceTo).toHaveBeenCalledWith(2);
    expect(routerMock.push).toHaveBeenCalledWith("/bake/stage/2");
  });

  it("does NOT show back button on stage 1", () => {
    const stage = getStage(1)!;
    render(<StageScreen stage={stage} activeBake={makeBake(1)} api={makeApi()} />);
    expect(
      screen.queryByRole("button", { name: /חזרה לשלב הקודם/ })
    ).not.toBeInTheDocument();
  });

  it("shows back button on stage 2+ and it returns to previous stage", () => {
    const stage = getStage(3)!;
    const api = makeApi();
    render(<StageScreen stage={stage} activeBake={makeBake(3)} api={api} />);
    fireEvent.click(screen.getByRole("button", { name: /חזרה לשלב הקודם/ }));
    expect(api.advanceTo).toHaveBeenCalledWith(2);
    expect(routerMock.push).toHaveBeenCalledWith("/bake/stage/2");
  });
});

describe("StageScreen — bulk (stage 4) sub-step flow", () => {
  it("primary always shows 'הבא — עיצוב ראשוני' (folds are optional)", () => {
    const stage = getStage(4)!;
    render(
      <StageScreen stage={stage} activeBake={makeBake(4, { subStep: 0 })} api={makeApi()} />
    );
    expect(screen.getByRole("button", { name: /הבא — עיצוב ראשוני/ })).toBeInTheDocument();
  });

  it("in-page 'סיימתי קיפול' button advances subStep without leaving the stage", () => {
    const stage = getStage(4)!;
    const api = makeApi();
    render(
      <StageScreen stage={stage} activeBake={makeBake(4, { subStep: 0 })} api={api} />
    );
    fireEvent.click(screen.getByRole("button", { name: "סיימתי קיפול" }));
    expect(api.advanceSubStep).toHaveBeenCalledOnce();
    expect(api.advanceTo).not.toHaveBeenCalled();
  });

  it("hides the in-page 'סיימתי קיפול' button once all folds are done", () => {
    const stage = getStage(4)!;
    render(
      <StageScreen stage={stage} activeBake={makeBake(4, { subStep: 4 })} api={makeApi()} />
    );
    expect(screen.queryByRole("button", { name: "סיימתי קיפול" })).not.toBeInTheDocument();
  });

  it("primary advances to stage 5 regardless of fold count", () => {
    const stage = getStage(4)!;
    const api = makeApi();
    render(
      <StageScreen stage={stage} activeBake={makeBake(4, { subStep: 0 })} api={api} />
    );
    fireEvent.click(screen.getByRole("button", { name: /הבא — עיצוב ראשוני/ }));
    expect(api.advanceTo).toHaveBeenCalledWith(5);
    expect(routerMock.push).toHaveBeenCalledWith("/bake/stage/5");
  });

  it("shows the optional 30-min rest timer inside the folds section", () => {
    const stage = getStage(4)!;
    render(<StageScreen stage={stage} activeBake={makeBake(4)} api={makeApi()} />);
    const timer = screen.getByRole("button", { name: /התחל טיימר/ });
    const foldsSection = screen.getByText("קיפולים").closest("section");
    expect(foldsSection).toContainElement(timer);
  });

  it("shows the '30 or 40 min between folds' hint near the timer", () => {
    const stage = getStage(4)!;
    render(<StageScreen stage={stage} activeBake={makeBake(4)} api={makeApi()} />);
    expect(screen.getByText(/30 דקות בין קיפולים — אפשר גם 40/)).toBeInTheDocument();
  });
});

describe("StageScreen — timer stage", () => {
  it("shows the optional timer button in idle state", () => {
    const stage = getStage(7)!;
    render(<StageScreen stage={stage} activeBake={makeBake(7)} api={makeApi()} />);
    expect(screen.getByRole("button", { name: /התחל טיימר/ })).toBeInTheDocument();
  });

  it("'הבא' is still enabled regardless of timer state", () => {
    const stage = getStage(7)!;
    const api = makeApi();
    render(<StageScreen stage={stage} activeBake={makeBake(7)} api={api} />);
    const nextBtn = screen.getByRole("button", { name: /הבא —/ });
    expect(nextBtn).not.toBeDisabled();
    fireEvent.click(nextBtn);
    expect(api.advanceTo).toHaveBeenCalledWith(8);
  });

  it("clicking 'התחל טיימר' calls startTimer", () => {
    const stage = getStage(7)!;
    const api = makeApi();
    render(<StageScreen stage={stage} activeBake={makeBake(7)} api={api} />);
    fireEvent.click(screen.getByRole("button", { name: /התחל טיימר/ }));
    expect(api.startTimer).toHaveBeenCalledOnce();
  });
});

describe("StageScreen — done (stage 12)", () => {
  it("primary says 'סיימתי' and navigates to /bake/done", () => {
    const stage = getStage(12)!;
    const api = makeApi();
    render(<StageScreen stage={stage} activeBake={makeBake(12)} api={api} />);
    fireEvent.click(screen.getByRole("button", { name: "סיימתי" }));
    expect(routerMock.push).toHaveBeenCalledWith("/bake/done");
  });

  it("done stage has no checklist (none defined in data)", () => {
    const stage = getStage(12)!;
    render(<StageScreen stage={stage} activeBake={makeBake(12)} api={makeApi()} />);
    expect(screen.queryByText("איך לדעת שזה בסדר")).not.toBeInTheDocument();
  });
});
