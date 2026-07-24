import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BakePlannerScreen } from "./bake-planner-screen";
import { strings } from "@/lib/strings";
import type { Recipe } from "@/lib/types/recipe";

const s = strings.bakeScheduler;

const baseRecipe: Recipe = {
  id: "test-recipe-1",
  name: "לחם כפרי",
  flour: { white: 80, wholeWheat: 20, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
  hydration: 75,
  salt: 2,
  levain: 20,
  flourWeightGrams: 500,
  kitchenTemp: 25,
  inclusions: [],
  createdAt: 1000,
  updatedAt: 1000,
};

describe("BakePlannerScreen — manual-first", () => {
  let onConfirm: ReturnType<typeof vi.fn>;
  let onBack: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onConfirm = vi.fn();
    onBack = vi.fn();
  });

  function renderScreen() {
    render(
      <BakePlannerScreen recipe={baseRecipe} onConfirm={onConfirm} onBack={onBack} />,
    );
  }

  function presetChip(name: string) {
    return screen.getByRole("radio", { name });
  }

  // ---------------------------------------------------------------------------
  // Framing
  // ---------------------------------------------------------------------------

  it("renders the title and recipe name", () => {
    renderScreen();
    expect(screen.getByText(s.headerTitle)).toBeInTheDocument();
    expect(screen.getByText(baseRecipe.name)).toBeInTheDocument();
  });

  it("renders the schedule framing title and subtitle (kept)", () => {
    renderScreen();
    expect(screen.getByText(s.scheduleSectionTitle)).toBeInTheDocument();
    expect(screen.getByText(s.scheduleSectionSubtitle)).toBeInTheDocument();
  });

  it("renders the temperature importance hint", () => {
    renderScreen();
    expect(screen.getByText(s.tempImportantHint)).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Preset chips (seed, not mode)
  // ---------------------------------------------------------------------------

  it("renders the 'התחל מתבנית' preset row label", () => {
    renderScreen();
    expect(screen.getByText(s.presetRowLabel)).toBeInTheDocument();
  });

  it("renders all four preset chips by name", () => {
    renderScreen();
    expect(presetChip(s.presets.fast.name)).toBeInTheDocument();
    expect(presetChip(s.presets.classic.name)).toBeInTheDocument();
    expect(presetChip(s.presets.classicLate.name)).toBeInTheDocument();
    expect(presetChip(s.presets.long.name)).toBeInTheDocument();
  });

  it("no 'לכוונן בעצמי' card exists anymore (manual is the surface)", () => {
    renderScreen();
    expect(screen.queryByRole("radio", { name: s.presets.manual.name })).not.toBeInTheDocument();
  });

  it("no preset is selected by default (all chips aria-checked=false)", () => {
    renderScreen();
    const chips = screen
      .getAllByRole("radio")
      .filter((c) => c.hasAttribute("data-preset"));
    expect(chips).toHaveLength(4);
    chips.forEach((c) => expect(c).toHaveAttribute("aria-checked", "false"));
  });

  it("old preset pills (הערב/מחר בבוקר/ערב שבת/בוקר שבת) are not rendered", () => {
    renderScreen();
    expect(screen.queryByRole("button", { name: "הערב" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "מחר בבוקר" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ערב שבת" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "בוקר שבת" })).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Manual controls visible by default (the core change)
  // ---------------------------------------------------------------------------

  it("direction toggle is visible by default — no mode selection needed", () => {
    renderScreen();
    expect(screen.getByRole("radio", { name: s.directionEnd })).toBeVisible();
    expect(screen.getByRole("radio", { name: s.directionStart })).toBeVisible();
  });

  it("RatioControl is visible by default", () => {
    renderScreen();
    expect(screen.getByTestId("ratio-control")).toBeInTheDocument();
  });

  it("RatioControl has 5 ratio buttons", () => {
    renderScreen();
    expect(screen.getAllByTestId(/^ratio-btn-/)).toHaveLength(5);
  });

  it("full timeline is visible inline by default (all steps shown)", () => {
    renderScreen();
    expect(screen.getByText(s.timelineSteps.build.label)).toBeInTheDocument();
    expect(screen.getByText(s.timelineSteps.bake.label)).toBeInTheDocument();
    expect(screen.getByText(s.timelineSteps.preheat.label)).toBeInTheDocument();
  });

  it("CTA is enabled by default (manual is always a valid state)", () => {
    renderScreen();
    expect(screen.getByRole("button", { name: s.startButton })).not.toBeDisabled();
  });

  it("no StarterToggle (build step always present)", () => {
    renderScreen();
    expect(screen.queryByRole("radio", { name: s.starterYes })).not.toBeInTheDocument();
    expect(screen.queryByTestId("feed-dismiss")).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Preset seeds values + selection state
  // ---------------------------------------------------------------------------

  it("selecting a preset marks that chip aria-checked=true", async () => {
    renderScreen();
    fireEvent.click(presetChip(s.presets.classic.name));
    await waitFor(() => {
      expect(presetChip(s.presets.classic.name)).toHaveAttribute("aria-checked", "true");
    });
  });

  it("selecting a preset forces 'מתי לסיים' direction", async () => {
    renderScreen();
    fireEvent.click(presetChip(s.presets.classic.name));
    await waitFor(() => {
      expect(screen.getByText(s.readyQuestion)).toBeInTheDocument();
    });
  });

  it("CTA stays enabled after selecting a preset", async () => {
    renderScreen();
    fireEvent.click(presetChip(s.presets.fast.name));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: s.startButton })).not.toBeDisabled();
    });
  });

  it("manual day change clears the selected preset", async () => {
    renderScreen();
    fireEvent.click(presetChip(s.presets.classic.name));
    await waitFor(() =>
      expect(presetChip(s.presets.classic.name)).toHaveAttribute("aria-checked", "true"),
    );
    // pick a different day pill (second available day)
    const dayButtons = screen.getAllByTestId(/^day-pill-/);
    fireEvent.click(dayButtons.at(-1)!);
    await waitFor(() => {
      expect(presetChip(s.presets.classic.name)).toHaveAttribute("aria-checked", "false");
    });
  });

  it("changing the ratio clears the selected preset", async () => {
    renderScreen();
    fireEvent.click(presetChip(s.presets.classic.name));
    await waitFor(() =>
      expect(presetChip(s.presets.classic.name)).toHaveAttribute("aria-checked", "true"),
    );
    const ratioBtns = screen.getAllByTestId(/^ratio-btn-/);
    fireEvent.click(ratioBtns.at(-1)!);
    await waitFor(() => {
      expect(presetChip(s.presets.classic.name)).toHaveAttribute("aria-checked", "false");
    });
  });

  // ---------------------------------------------------------------------------
  // Direction toggle + timeline sheet
  // ---------------------------------------------------------------------------

  it("switching to 'מתי להתחיל' shows the start question + ready result", async () => {
    renderScreen();
    const startBtn = screen.getByRole("radio", { name: s.directionStart });
    fireEvent.pointerDown(startBtn);
    fireEvent.pointerUp(startBtn);
    await waitFor(() => {
      expect(screen.getByText(s.readyQuestionStart)).toBeInTheDocument();
      expect(screen.getByTestId("ready-result")).toBeInTheDocument();
    });
  });

  it("there is no compact summary or timeline sheet trigger anymore", () => {
    renderScreen();
    expect(screen.queryByTestId("compact-summary")).not.toBeInTheDocument();
    expect(screen.queryByTestId("timeline-trigger")).not.toBeInTheDocument();
  });

  it("retard slider is inline in the timeline (default 12h, max 48)", () => {
    renderScreen();
    const slider = screen.getByRole("slider", { name: s.retardSliderLabel });
    expect(slider).toHaveValue("12");
    expect(slider).toHaveAttribute("max", "48");
  });

  it("editing the retard slider clears the selected preset", async () => {
    renderScreen();
    fireEvent.click(presetChip(s.presets.classic.name));
    await waitFor(() =>
      expect(presetChip(s.presets.classic.name)).toHaveAttribute("aria-checked", "true"),
    );
    fireEvent.change(screen.getByRole("slider", { name: s.retardSliderLabel }), {
      target: { value: "24" },
    });
    await waitFor(() => {
      expect(presetChip(s.presets.classic.name)).toHaveAttribute("aria-checked", "false");
    });
  });

  // ---------------------------------------------------------------------------
  // Precise time entry + past hours (Feature 24)
  // ---------------------------------------------------------------------------

  it("renders a precise time input (type=time)", () => {
    renderScreen();
    expect(screen.getByLabelText(s.exactTimeLabel)).toHaveAttribute("type", "time");
  });

  it("shows the past-time hint in start mode and hides it in end mode", async () => {
    renderScreen(); // default direction = start
    expect(screen.getByText(s.pastHint)).toBeInTheDocument();
    const endBtn = screen.getByRole("radio", { name: s.directionEnd });
    fireEvent.pointerDown(endBtn);
    fireEvent.pointerUp(endBtn);
    await waitFor(() =>
      expect(screen.queryByText(s.pastHint)).not.toBeInTheDocument(),
    );
  });

  it("accepts an exact minute value (e.g. 15:34)", () => {
    renderScreen();
    const input = screen.getByLabelText(s.exactTimeLabel) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "15:34" } });
    expect(input.value).toBe("15:34");
  });

  it("lets you pick an earlier hour today in start mode (floor is 00:00)", () => {
    renderScreen();
    const input = screen.getByLabelText(s.exactTimeLabel) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "05:15" } });
    expect(input.value).toBe("05:15");
  });

  it("changing the exact time clears a selected preset", async () => {
    renderScreen();
    fireEvent.click(presetChip(s.presets.classic.name));
    await waitFor(() =>
      expect(presetChip(s.presets.classic.name)).toHaveAttribute("aria-checked", "true"),
    );
    fireEvent.change(screen.getByLabelText(s.exactTimeLabel), {
      target: { value: "21:07" },
    });
    await waitFor(() =>
      expect(presetChip(s.presets.classic.name)).toHaveAttribute("aria-checked", "false"),
    );
  });

  // ---------------------------------------------------------------------------
  // Confirm
  // ---------------------------------------------------------------------------

  it("confirming with the default manual state calls onConfirm", async () => {
    renderScreen();
    fireEvent.click(screen.getByRole("button", { name: s.startButton }));
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ name: baseRecipe.name }),
        "closed-vessel",
        expect.any(Date), // feedAt
        expect.any(Date), // peakAt
        expect.any(Number), // feedRatio
        expect.any(Number), // retardHours
      );
    });
  });

  it("confirming after a preset calls onConfirm", async () => {
    renderScreen();
    fireEvent.click(presetChip(s.presets.classic.name));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: s.startButton })).not.toBeDisabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: s.startButton }));
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ name: baseRecipe.name }),
        "closed-vessel",
        expect.any(Date),
        expect.any(Date),
        expect.any(Number),
        expect.any(Number),
      );
    });
  });

  it("selecting a different baking method passes it to onConfirm", async () => {
    renderScreen();
    fireEvent.click(screen.getByText("אפייה פתוחה + תבנית אדים"));
    fireEvent.click(screen.getByRole("button", { name: s.startButton }));
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith(
        expect.objectContaining({ name: baseRecipe.name }),
        "open-with-steam",
        expect.any(Date),
        expect.any(Date),
        expect.any(Number),
        expect.any(Number),
      );
    });
  });

  it("back button calls onBack", () => {
    renderScreen();
    fireEvent.click(screen.getByRole("button", { name: s.backToChooser }));
    expect(onBack).toHaveBeenCalled();
  });
});
