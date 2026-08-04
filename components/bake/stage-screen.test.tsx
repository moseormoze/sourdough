import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { StageScreen } from "./stage-screen";
import { getStage } from "@/lib/data/stages";
import { routerMock } from "../../vitest.setup";
import { strings } from "@/lib/strings";
import type { ActiveBake } from "@/lib/types/active-bake";

function makeApi() {
  return {
    advanceTo: vi.fn(),
    advanceSubStep: vi.fn(),
    startTimer: vi.fn(),
    setTimerRemaining: vi.fn(),
    pauseTimer: vi.fn(),
    resumeTimer: vi.fn(),
    resetTimer: vi.fn(),
    setDoughTemp: vi.fn(),
  };
}

function makeBake(currentStage: number, overrides: Partial<ActiveBake> = {}): ActiveBake {
  return {
    id: "ab",
    recipe: {
      id: "r",
      name: "כפרי",
      flour: { white: 80, wholeWheat: 20, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
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
    timerElapsedSeconds: 0,
    timerDurationSeconds: null,
    bakingMethod: "closed-vessel",
    feedAt: null,
    peakAt: null,
    feedRatio: 2 as const,
    retardHours: 12,
    doughTempC: null,
    ...overrides,
  };
}

beforeEach(() => {
  routerMock.push.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
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
    // Recipe 500g flour, 20% levain → 100g levain total at 1:2:2 → 20g starter + 40g water
    const bold20 = screen.getAllByText(/^20g$/);
    expect(bold20.length).toBeGreaterThanOrEqual(1);
    bold20.forEach((el) => {
      expect(el.tagName).toBe("STRONG");
      expect(el).toHaveClass("font-semibold");
    });
  });

  it("stage 1 step 3 shows the levain flour breakdown by recipe blend", () => {
    const stage = getStage(1)!;
    render(<StageScreen stage={stage} activeBake={makeBake(1)} api={makeApi()} />);
    // levainFlour=40g at 80/20 blend → 32g white + 8g wholeWheat
    expect(screen.getByText("32g").tagName).toBe("STRONG");
    expect(screen.getByText("8g").tagName).toBe("STRONG");
    expect(screen.getAllByText(/קמח לבן/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/קמח מלא/).length).toBeGreaterThan(0);
  });

  it("stage 1 renders both disclosures (briefing + todo note)", () => {
    const stage = getStage(1)!;
    render(<StageScreen stage={stage} activeBake={makeBake(1)} api={makeApi()} />);
    // feedRatio=2 → "1:2:2"
    expect(screen.getByText(/יחס האכלה: 1:2:2 \(סטארטר:קמח:מים\)/)).toBeInTheDocument();
    expect(screen.getByText(/הקמח של השאור כלול/)).toBeInTheDocument();
  });

  it("stage 2 renders the flour breakdown by type (80/20 blend → two bolded entries)", () => {
    const stage = getStage(2)!;
    render(<StageScreen stage={stage} activeBake={makeBake(2)} api={makeApi()} />);
    // 500g flour, 20% levain, 1:2:2 ratio → levainFlour=40g, starterFlour=10g
    // mixFlour = 500 - 40 - 10 = 450g at 80/20 → 360g white + 90g wholeWheat
    expect(screen.getByText("360g").tagName).toBe("STRONG");
    expect(screen.getByText("90g").tagName).toBe("STRONG");
    expect(screen.getByText(/קמח לבן/)).toBeInTheDocument();
    expect(screen.getByText(/קמח מלא/)).toBeInTheDocument();
  });

  it("stage 2 renders the compact pilot path without the old AI image", () => {
    const stage = getStage(2)!;
    render(<StageScreen stage={stage} activeBake={makeBake(2)} api={makeApi()} />);

    expect(screen.getByRole("region", { name: "מטרת השלב" })).toBeInTheDocument();
    expect(screen.queryByText(/עכשיו עוברים ללישה ומוסיפים את השאור/)).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
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
    expect(screen.queryByText(/יחס האכלה:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/הקמח של השאור כלול/)).not.toBeInTheDocument();
  });

  it("stage 1 shows a levain timer based on feed ratio and kitchen temp", () => {
    const stage = getStage(1)!;
    render(<StageScreen stage={stage} activeBake={makeBake(1)} api={makeApi()} />);
    expect(screen.getByRole("button", { name: /התחל טיימר/ })).toBeInTheDocument();
  });

  it("stage 1 checklist has title 'מתי להמשיך לשלב הבא'", () => {
    const stage = getStage(1)!;
    render(<StageScreen stage={stage} activeBake={makeBake(1)} api={makeApi()} />);
    expect(screen.getByText("מתי להמשיך לשלב הבא")).toBeInTheDocument();
  });

  it("stage 2 checklist has title 'מתי להמשיך לשלב הבא'", () => {
    const stage = getStage(2)!;
    render(<StageScreen stage={stage} activeBake={makeBake(2)} api={makeApi()} />);
    expect(screen.getByText("מתי להמשיך לשלב הבא")).toBeInTheDocument();
  });

  it("stage 1 check reads 'לפחות הוכפל בנפח'", () => {
    const stage = getStage(1)!;
    render(<StageScreen stage={stage} activeBake={makeBake(1)} api={makeApi()} />);
    expect(screen.getByText("השאור לפחות הוכפל בנפח")).toBeInTheDocument();
  });

  it("stage 2 does NOT show the generic levain timer", () => {
    const stage = getStage(2)!;
    render(<StageScreen stage={stage} activeBake={makeBake(2)} api={makeApi()} />);
    expect(screen.queryByRole("button", { name: "התחל טיימר" })).not.toBeInTheDocument();
  });

  it("stage 2 shows the configurable Autolysis timer", () => {
    const stage = getStage(2)!;
    const api = makeApi();
    render(<StageScreen stage={stage} activeBake={makeBake(2)} api={api} />);

    fireEvent.click(screen.getByRole("button", { name: "הפעל טיימר" }));
    const dialog = screen.getByRole("dialog", { name: "בחירת זמן" });
    fireEvent.click(within(dialog).getByRole("button", { name: "הפעל טיימר" }));
    expect(api.startTimer).toHaveBeenCalledWith(45 * 60);
  });

  it("does not show the Autolysis timer on other stages", () => {
    const stage = getStage(3)!;
    render(<StageScreen stage={stage} activeBake={makeBake(3)} api={makeApi()} />);
    expect(
      screen.queryByRole("button", { name: "הפעל טיימר" })
    ).not.toBeInTheDocument();
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
      screen.queryByRole("button", { name: /^חזרה$/ })
    ).not.toBeInTheDocument();
  });

  it("shows back button on stage 2+ and it returns to previous stage", () => {
    const stage = getStage(3)!;
    const api = makeApi();
    render(<StageScreen stage={stage} activeBake={makeBake(3)} api={api} />);
    fireEvent.click(screen.getByRole("button", { name: /^חזרה$/ }));
    expect(api.advanceTo).toHaveBeenCalledWith(2);
    expect(routerMock.push).toHaveBeenCalledWith("/bake/stage/2");
  });
});

describe("StageScreen — stage knowledge pilot", () => {
  it("applies the redesign only to the autolyse stage", () => {
    const { rerender } = render(
      <StageScreen stage={getStage(2)!} activeBake={makeBake(2)} api={makeApi()} />,
    );
    expect(screen.getByTestId("autolyse-redesign-pilot")).toBeInTheDocument();

    rerender(
      <StageScreen stage={getStage(3)!} activeBake={makeBake(3)} api={makeApi()} />,
    );
    expect(screen.queryByTestId("autolyse-redesign-pilot")).not.toBeInTheDocument();
  });

  it("shows the single guide trigger only on stage 2", () => {
    const { rerender } = render(
      <StageScreen stage={getStage(1)!} activeBake={makeBake(1)} api={makeApi()} />,
    );
    expect(screen.queryByRole("button", { name: "הסבר על אוטוליזה" })).not.toBeInTheDocument();

    rerender(
      <StageScreen stage={getStage(2)!} activeBake={makeBake(2)} api={makeApi()} />,
    );
    expect(screen.getByRole("button", { name: "הסבר על אוטוליזה" })).toBeInTheDocument();
    expect(screen.queryByText("שאלות נפוצות")).not.toBeInTheDocument();
    expect(screen.queryByText("משהו לא מסתדר?")).not.toBeInTheDocument();

    rerender(
      <StageScreen stage={getStage(3)!} activeBake={makeBake(3)} api={makeApi()} />,
    );
    expect(screen.queryByRole("button", { name: "הסבר על אוטוליזה" })).not.toBeInTheDocument();
  });

  it("places calibration between the locked instructions and the timer", () => {
    render(
      <StageScreen stage={getStage(2)!} activeBake={makeBake(2)} api={makeApi()} />,
    );

    const instructions = screen.getByRole("heading", { name: "מה לעשות" }).closest("section");
    const calibration = screen.getByTestId("autolyse-calibration");
    const timer = screen.getByRole("heading", { name: "טיימר" }).closest("section");

    expect(instructions).not.toBeNull();
    expect(timer).not.toBeNull();
    expect(
      instructions!.compareDocumentPosition(calibration) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      calibration.compareDocumentPosition(timer!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText("מיד אחרי הערבוב – הבצק עדיין גס ולא אחיד.")).toBeInTheDocument();
    expect(
      screen.getByText("אחרי המנוחה – הבצק מחובר יותר ונמתח בקלות רבה יותר."),
    ).toBeInTheDocument();
  });

  it("separates the initial mix check from the end-of-rest decision cues", () => {
    render(
      <StageScreen stage={getStage(2)!} activeBake={makeBake(2)} api={makeApi()} />,
    );

    const calibration = screen.getByTestId("autolyse-calibration");
    const readiness = screen.getByRole("region", { name: "מתי להמשיך לשלב הבא" });

    expect(within(calibration).getByText("אין כיסי קמח יבש")).toBeInTheDocument();
    expect(within(readiness).queryByText("אין כיסי קמח יבש")).not.toBeInTheDocument();
    expect(
      within(readiness).getByText("הבצק רך ונמתח מעט יותר בקלות"),
    ).toBeInTheDocument();
    expect(
      within(readiness).getByText("המרקם נראה מעט אחיד יותר, אבל עדיין יכול להיות גס ודביק"),
    ).toBeInTheDocument();
  });

  it("keeps stage chrome outside the first content card when the baker returns", () => {
    render(
      <StageScreen
        stage={getStage(2)!}
        activeBake={makeBake(2, {
          timerDurationSeconds: 45 * 60,
          timerElapsedSeconds: 60,
        })}
        api={makeApi()}
      />,
    );

    expect(screen.queryByTestId("autolyse-reentry-cue")).not.toBeInTheDocument();
    const page = screen.getByTestId("autolyse-redesign-pilot");
    const stageHeader = screen.getByTestId("autolyse-stage-header");
    const purposeCard = screen.getByTestId("autolyse-purpose-card");

    expect(page).toHaveAttribute(
      "data-colorway",
      "ambient-gradient",
    );
    expect(stageHeader).toHaveAttribute("data-surface", "none");
    expect(within(stageHeader).getByText("2/12")).toBeInTheDocument();
    expect(within(stageHeader).getByRole("button", { name: "פתח טיימליין" })).toBeInTheDocument();
    expect(within(stageHeader).getByRole("heading", { name: "אוטוליזה" })).toBeInTheDocument();
    expect(purposeCard).toHaveAttribute(
      "data-surface",
      "glass",
    );
    expect(within(purposeCard).getByRole("heading", { name: "מטרת השלב" })).toBeInTheDocument();
    expect(within(purposeCard).queryByText("2/12")).not.toBeInTheDocument();
    expect(screen.getByTestId("autolyse-instructions-surface")).toHaveAttribute(
      "data-surface",
      "glass",
    );
    const timer = screen.getByTestId("autolyse-timer");
    expect(within(timer).getByRole("heading", { name: "טיימר" })).toBeInTheDocument();
    expect(within(timer).getByRole("status")).toHaveTextContent("הטיימר מושהה");
    expect(within(timer).getByText("44:00")).toHaveAttribute("dir", "ltr");
  });

  it("keeps finished state in the page card and readiness criteria neutral", () => {
    render(
      <StageScreen
        stage={getStage(2)!}
        activeBake={makeBake(2, {
          timerDurationSeconds: 45 * 60,
          timerElapsedSeconds: 45 * 60,
        })}
        api={makeApi()}
      />,
    );

    expect(screen.queryByTestId("autolyse-reentry-cue")).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId("autolyse-timer")).getByRole("heading", { name: "טיימר" }),
    ).toBeInTheDocument();
    expect(within(screen.getByTestId("autolyse-timer")).getByRole("status")).toHaveTextContent(
      "הטיימר הסתיים",
    );
    expect(screen.getByRole("region", { name: "מתי להמשיך לשלב הבא" })).not.toHaveClass(
      "border-sage/60",
    );
    expect(screen.getByText(/עכשיו עוברים ללישה ומוסיפים את השאור/)).toBeInTheDocument();
  });

  it("owns one autolyse clock and stops it when the timer finishes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-03T10:00:00Z"));
    const setIntervalSpy = vi.spyOn(window, "setInterval");

    render(
      <StageScreen
        stage={getStage(2)!}
        activeBake={makeBake(2, {
          timerDurationSeconds: 2,
          timerStartedAt: Date.now(),
        })}
        api={makeApi()}
      />,
    );

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(2_000); });
    expect(screen.getByTestId("autolyse-timer")).toHaveAttribute("data-state", "finished");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps Next secondary and asks for confirmation before the timer finishes", () => {
    const api = makeApi();
    render(
      <StageScreen
        stage={getStage(2)!}
        activeBake={makeBake(2, {
          timerDurationSeconds: 45 * 60,
          timerElapsedSeconds: 60,
        })}
        api={api}
      />,
    );

    const next = screen.getByRole("button", { name: /^הבא$/ });
    expect(next).toHaveAttribute("data-priority", "secondary");
    expect(next).toHaveClass("flex-1");
    expect(next).toHaveClass("hover:!bg-paper/75");
    expect(screen.getByRole("button", { name: /^חזרה$/ })).toHaveClass(
      "hover:!bg-ink/[0.04]",
    );
    fireEvent.click(next);

    expect(api.advanceTo).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", { name: "אוטוליזה" });
    expect(dialog).toHaveAttribute("data-variant", "pilot");
    expect(within(dialog).getByTestId("autolyse-advance-status")).toHaveAttribute(
      "data-surface",
      "inset",
    );
    expect(within(dialog).getByText("הטיימר מושהה")).toBeInTheDocument();
    expect(within(dialog).getByText("44:00")).toHaveAttribute("dir", "ltr");
    expect(within(dialog).queryByText(/עכשיו עוברים/)).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /^הבא$/ })).toHaveClass("!text-ink");
    fireEvent.click(within(dialog).getByRole("button", { name: /^ביטול$/ }));
    expect(api.advanceTo).not.toHaveBeenCalled();

    fireEvent.click(next);
    const reopenedDialog = screen.getByRole("dialog", { name: "אוטוליזה" });
    fireEvent.click(within(reopenedDialog).getByRole("button", { name: /^הבא$/ }));
    expect(api.advanceTo).toHaveBeenCalledWith(3);
    expect(routerMock.push).toHaveBeenCalledWith("/bake/stage/3");
  });

  it("advances directly after the timer finishes without implying the dough was verified", () => {
    const api = makeApi();
    render(
      <StageScreen
        stage={getStage(2)!}
        activeBake={makeBake(2, {
          timerDurationSeconds: 45 * 60,
          timerElapsedSeconds: 45 * 60,
        })}
        api={api}
      />,
    );

    const next = screen.getByRole("button", { name: /^הבא$/ });
    expect(next).toHaveAttribute("data-priority", "secondary");
    expect(next).toHaveClass("flex-1");
    fireEvent.click(next);

    expect(api.advanceTo).toHaveBeenCalledWith(3);
    expect(screen.queryByRole("dialog", { name: "אוטוליזה" })).not.toBeInTheDocument();
  });

  it("opens one deep guide without changing bake or timer actions", () => {
    const api = makeApi();
    const activeBake = makeBake(2, {
      timerDurationSeconds: 45 * 60,
      timerElapsedSeconds: 120,
    });
    render(<StageScreen stage={getStage(2)!} activeBake={activeBake} api={api} />);
    const trigger = screen.getByRole("button", { name: "הסבר על אוטוליזה" });

    fireEvent.pointerDown(trigger, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerUp(trigger, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.click(trigger, { detail: 1 });

    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "להבין את הבצק" })).toBeInTheDocument();
    expect(activeBake.currentStage).toBe(2);
    expect(api.advanceTo).not.toHaveBeenCalled();
    expect(api.startTimer).not.toHaveBeenCalled();
    expect(api.pauseTimer).not.toHaveBeenCalled();
    expect(api.resumeTimer).not.toHaveBeenCalled();
    expect(api.resetTimer).not.toHaveBeenCalled();
    expect(api.setTimerRemaining).not.toHaveBeenCalled();
  });

  it("keeps sheet content through exit and then returns focus to its trigger", async () => {
    render(
      <StageScreen stage={getStage(2)!} activeBake={makeBake(2)} api={makeApi()} />,
    );
    const trigger = screen.getByRole("button", { name: "הסבר על אוטוליזה" });
    trigger.focus();
    fireEvent.click(trigger, { detail: 0 });

    fireEvent.click(screen.getByRole("button", { name: "סגור" }));
    expect(
      screen.getByText(/המטרה בשלב הזה היא לא לפתח את הבצק עד הסוף/),
    ).toBeInTheDocument();

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument(), {
      timeout: 500,
    });
    expect(document.activeElement).toBe(trigger);
  });

  it("keeps all existing stage-2 main-path copy unchanged", () => {
    const stage = getStage(2)!;
    expect(stage.briefing).toEqual({
      heading: "מטרת השלב",
      blurb:
        "לתת לקמח לספוג את המים ולהתחיל להתארגן, כדי שהערבוב בשלב הבא יהיה קל ואחיד יותר.",
      takeaways: [],
    });
    expect(stage.todo?.steps).toEqual([
      "שקלו {mixFlourBreakdown} לקערה גדולה.",
      "הוסיפו {autolyseWaterGrams} מים. שקלו בנפרד {saltReserveWaterGrams} מים ושמרו לשלב הבא.",
      "ערבבו ביד או בכף רק עד שכל הקמח רטוב ואין כיסים יבשים. לא לשים; הבצק אמור להישאר גס.",
      "כסו את הקערה במכסה, מגבת לחה או ניילון נצמד, כדי שפני הבצק לא יתייבשו, והניחו בטמפרטורת החדר 30–60 דקות.",
    ]);
    expect(stage.checks).toEqual([
      "אין כיסי קמח יבש",
      "הבצק רך ונמתח מעט יותר בקלות",
      "המרקם נראה מעט אחיד יותר, אבל עדיין יכול להיות גס ודביק",
    ]);
    expect(stage.transition).toBe(
      "עכשיו עוברים ללישה ומוסיפים את השאור, המלח והמים ששמרתם — אין זמן המתנה נוסף.",
    );
  });
});

describe("StageScreen — bulk (stage 4) sub-step flow", () => {
  it("primary always shows 'הבא' (folds are optional)", () => {
    const stage = getStage(4)!;
    render(
      <StageScreen stage={stage} activeBake={makeBake(4, { subStep: 0 })} api={makeApi()} />
    );
    expect(screen.getByRole("button", { name: /^הבא$/ })).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole("button", { name: /^הבא$/ }));
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

  it("shows the fold interval hint near the timer", () => {
    const stage = getStage(4)!;
    render(<StageScreen stage={stage} activeBake={makeBake(4)} api={makeApi()} />);
    expect(screen.getByText(/המרווחים יכולים לגדול ככל שהבצק מתחזק/)).toBeInTheDocument();
  });

  it("swaps to the quiet-wait message once all folds are done", () => {
    const stage = getStage(4)!;
    render(
      <StageScreen stage={stage} activeBake={makeBake(4, { subStep: 4 })} api={makeApi()} />
    );
    expect(screen.getByText(/כל הקיפולים בוצעו/)).toBeInTheDocument();
    expect(
      screen.queryByText(/המרווחים יכולים לגדול ככל שהבצק מתחזק/)
    ).not.toBeInTheDocument();
  });

  it("does not show the quiet-wait message while folds remain", () => {
    const stage = getStage(4)!;
    render(
      <StageScreen stage={stage} activeBake={makeBake(4, { subStep: 2 })} api={makeApi()} />
    );
    expect(screen.queryByText(/כל הקיפולים בוצעו/)).not.toBeInTheDocument();
    expect(screen.getByText(/המרווחים יכולים לגדול ככל שהבצק מתחזק/)).toBeInTheDocument();
  });
});

describe("StageScreen — bakingMethod variants (stages 8-10)", () => {
  it("stage 8 with method='closed-vessel' uses the base content (סיר)", () => {
    const stage = getStage(8)!;
    render(
      <StageScreen
        stage={stage}
        activeBake={makeBake(8, { bakingMethod: "closed-vessel" })}
        api={makeApi()}
      />
    );
    expect(screen.getByText(/מחממים את התנור והסיר/)).toBeInTheDocument();
  });

  it("stage 8 with method='open-with-steam' uses the open-surface variant", () => {
    const stage = getStage(8)!;
    render(
      <StageScreen
        stage={stage}
        activeBake={makeBake(8, { bakingMethod: "open-with-steam" })}
        api={makeApi()}
      />
    );
    expect(screen.getByText(/מחממים משטח אפייה \+ תבנית אדים/)).toBeInTheDocument();
    expect(screen.queryByText(/מחממים את התנור והסיר/)).not.toBeInTheDocument();
  });

  it("stage 8 with method='other' uses the generic variant", () => {
    const stage = getStage(8)!;
    render(
      <StageScreen
        stage={stage}
        activeBake={makeBake(8, { bakingMethod: "other" })}
        api={makeApi()}
      />
    );
    expect(screen.getByText(/מחממים את התנור והציוד שלכם/)).toBeInTheDocument();
  });

  it("stage 9 with method='open-with-steam' uses the open-surface variant", () => {
    const stage = getStage(9)!;
    render(
      <StageScreen
        stage={stage}
        activeBake={makeBake(9, { bakingMethod: "open-with-steam" })}
        api={makeApi()}
      />
    );
    expect(screen.getByText(/20 דקות עם אדים חיצוניים/)).toBeInTheDocument();
  });

  it("stage 9 with method='other' uses the generic variant", () => {
    const stage = getStage(9)!;
    render(
      <StageScreen
        stage={stage}
        activeBake={makeBake(9, { bakingMethod: "other" })}
        api={makeApi()}
      />
    );
    expect(screen.getByText(/20 דקות עם אדים — לפי הסטאפ שלכם/)).toBeInTheDocument();
  });

  it("stage 10 with method='open-with-steam' uses the open-surface variant", () => {
    const stage = getStage(10)!;
    render(
      <StageScreen
        stage={stage}
        activeBake={makeBake(10, { bakingMethod: "open-with-steam" })}
        api={makeApi()}
      />
    );
    expect(screen.getByText(/מוציאים את האדים/)).toBeInTheDocument();
  });

  it("stage 10 with method='other' uses the generic variant", () => {
    const stage = getStage(10)!;
    render(
      <StageScreen
        stage={stage}
        activeBake={makeBake(10, { bakingMethod: "other" })}
        api={makeApi()}
      />
    );
    expect(screen.getByText(/מסירים את האדים — לפי הסטאפ שלכם/)).toBeInTheDocument();
  });

  it("stage 1 is unaffected by bakingMethod choice", () => {
    const stage = getStage(1)!;
    render(
      <StageScreen
        stage={stage}
        activeBake={makeBake(1, { bakingMethod: "open-with-steam" })}
        api={makeApi()}
      />
    );
    // base briefing heading still renders
    expect(screen.getByText(stage.briefing.heading)).toBeInTheDocument();
  });

  it("stage 8 with method='other' renders a SafetyWarning above the briefing", () => {
    const stage = getStage(8)!;
    render(
      <StageScreen
        stage={stage}
        activeBake={makeBake(8, { bakingMethod: "other" })}
        api={makeApi()}
      />
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/250°C/);
    expect(alert).toHaveTextContent(/זכוכית רגילה תיסדק/);
  });

  it("stage 8 with method='closed-vessel' does NOT render a SafetyWarning", () => {
    const stage = getStage(8)!;
    render(
      <StageScreen
        stage={stage}
        activeBake={makeBake(8, { bakingMethod: "closed-vessel" })}
        api={makeApi()}
      />
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("stage 8 with method='open-with-steam' does NOT render a SafetyWarning", () => {
    const stage = getStage(8)!;
    render(
      <StageScreen
        stage={stage}
        activeBake={makeBake(8, { bakingMethod: "open-with-steam" })}
        api={makeApi()}
      />
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
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
    const nextBtn = screen.getByRole("button", { name: /^הבא$/ });
    expect(nextBtn).not.toBeDisabled();
    fireEvent.click(nextBtn);
    expect(api.advanceTo).toHaveBeenCalledWith(8);
  });

  it("clicking 'התחל טיימר' calls startTimer", () => {
    const stage = getStage(7)!;
    const api = makeApi();
    render(<StageScreen stage={stage} activeBake={makeBake(7)} api={api} />);
    fireEvent.click(screen.getByRole("button", { name: /התחל טיימר/ }));
    expect(api.startTimer).toHaveBeenCalledWith();
  });
});

describe("StageScreen — in-bake timeline sheet", () => {
  it("timeline sheet is not visible by default", () => {
    const stage = getStage(1)!;
    render(<StageScreen stage={stage} activeBake={makeBake(1)} api={makeApi()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("tapping the stepper opens the timeline sheet", () => {
    const stage = getStage(1)!;
    render(<StageScreen stage={stage} activeBake={makeBake(1)} api={makeApi()} />);
    const button = screen.getByLabelText("פתח טיימליין");
    fireEvent.pointerDown(button, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(button, { clientX: 0, clientY: 0 });
    fireEvent.click(button, { detail: 1 });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closing the sheet via ✕ hides it", () => {
    const stage = getStage(3)!;
    render(<StageScreen stage={stage} activeBake={makeBake(3)} api={makeApi()} />);
    const button = screen.getByLabelText("פתח טיימליין");
    fireEvent.pointerDown(button, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(button, { clientX: 0, clientY: 0 });
    fireEvent.click(button, { detail: 1 });
    fireEvent.click(screen.getByLabelText("סגור טיימליין"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
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
    expect(screen.queryByText("מתי להמשיך לשלב הבא")).not.toBeInTheDocument();
  });
});

describe("StageScreen — end-of-bulk reference photo (stage 4)", () => {
  it("renders the check image inside the checklist card", () => {
    const stage = getStage(4)!;
    render(<StageScreen stage={stage} activeBake={makeBake(4)} api={makeApi()} />);
    expect(
      screen.getByRole("img", { name: stage.checkImageAlt! })
    ).toBeInTheDocument();
  });
});

describe("StageScreen — rescue entry (feature 20)", () => {
  it("shows the rescue trigger on stages with rescue content", () => {
    for (const n of [4, 5, 6, 7]) {
      const { unmount } = render(
        <StageScreen stage={getStage(n)!} activeBake={makeBake(n)} api={makeApi()} />
      );
      expect(
        screen.getByRole("button", { name: /^משהו לא מסתדר\?$/ }),
        `stage ${n}`
      ).toBeInTheDocument();
      unmount();
    }
  });

  it("hides the rescue trigger on stages without rescue content", () => {
    for (const n of [2, 9, 12]) {
      const { unmount } = render(
        <StageScreen stage={getStage(n)!} activeBake={makeBake(n)} api={makeApi()} />
      );
      expect(
        screen.queryByRole("button", { name: /^משהו לא מסתדר\?$/ }),
        `stage ${n}`
      ).not.toBeInTheDocument();
      unmount();
    }
  });

  it("opens the rescue sheet, keeps fold progress, and closes cleanly", async () => {
    render(
      <StageScreen
        stage={getStage(4)!}
        activeBake={makeBake(4, { subStep: 2 })}
        api={makeApi()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /משהו לא מסתדר/ }));
    expect(
      screen.getByRole("dialog", { name: "אבחון מהיר" })
    ).toBeInTheDocument();
    expect(screen.getByText(/קיפולים בוצעו/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "סגור" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "אבחון מהיר" })
      ).not.toBeInTheDocument()
    );
    expect(screen.getByText(/קיפולים בוצעו/)).toBeInTheDocument();
  });
});

describe("StageScreen — dough temp shadow (stage 4)", () => {
  it("stage 4 shows the measurement prompt; skipping changes nothing else", () => {
    const stage = getStage(4)!;
    render(<StageScreen stage={stage} activeBake={makeBake(4)} api={makeApi()} />);
    expect(screen.getByText(strings.bake.doughTemp.prompt)).toBeInTheDocument();
    expect(screen.queryByText(/לפי טמפ׳ הבצק/)).not.toBeInTheDocument();
  });

  it("non-bulk stages do not render the card", () => {
    const stage = getStage(3)!;
    render(<StageScreen stage={stage} activeBake={makeBake(3)} api={makeApi()} />);
    expect(screen.queryByText(strings.bake.doughTemp.prompt)).not.toBeInTheDocument();
  });

  it("a stored measurement renders the shadow line on load", () => {
    const stage = getStage(4)!;
    render(
      <StageScreen
        stage={stage}
        activeBake={makeBake(4, { doughTempC: 28 })}
        api={makeApi()}
      />
    );
    expect(screen.getByText(/לפי טמפ׳ הבצק/)).toBeInTheDocument();
  });

  it("saving a measurement calls api.setDoughTemp with the value", () => {
    const stage = getStage(4)!;
    const api = makeApi();
    render(<StageScreen stage={stage} activeBake={makeBake(4)} api={api} />);
    fireEvent.click(screen.getByRole("button", { name: strings.bake.doughTemp.measured }));
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "27.5" } });
    fireEvent.click(screen.getByRole("button", { name: strings.bake.doughTemp.save }));
    expect(api.setDoughTemp).toHaveBeenCalledWith(27.5);
  });
});
