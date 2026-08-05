import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { HomeScreen } from "./home-screen";
import { getInstallEnvironment } from "@/lib/install-environment";
import { track } from "@/lib/analytics/track";
import { saveRecipe } from "@/lib/storage/recipes";
import { loadActiveBake, saveActiveBake } from "@/lib/storage/active-bake";
import { strings } from "@/lib/strings";
import type { ActiveBake } from "@/lib/types/active-bake";
import type { Recipe } from "@/lib/types/recipe";

vi.mock("@/lib/analytics/track", () => ({ track: vi.fn() }));
vi.mock("@/lib/install-environment", () => ({
  getInstallEnvironment: vi.fn(() => "none"),
}));
vi.mock("@/lib/hooks/use-install-prompt", () => ({
  useInstallPrompt: vi.fn(() => ({ promptEvent: null, installed: false })),
}));

const recipeInput = {
  name: "כפרי",
  flour: {
    white: 80,
    wholeWheat: 20,
    rye: 0,
    speltWhite: 0,
    speltWhole: 0,
    other: 0,
  },
  hydration: 75,
  salt: 2,
  levain: 20,
  flourWeightGrams: 500,
  kitchenTemp: 25,
  inclusions: [],
};

function seedActive(recipe: Recipe, overrides: Partial<ActiveBake> = {}) {
  saveActiveBake({
    id: "ab-1",
    recipe,
    startedAt: 1,
    currentStage: 4,
    stageStartedAt: 2,
    observationChecks: {},
    subStep: 0,
    timerStartedAt: null,
    timerElapsedSeconds: 0,
    timerDurationSeconds: null,
    bakingMethod: "closed-vessel",
    feedAt: null,
    peakAt: null,
    feedRatio: 2,
    retardHours: 12,
    doughTempC: null,
    ...overrides,
  });
}

beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
});

describe("HomeScreen — resolved states", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    (track as Mock).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    (getInstallEnvironment as Mock).mockReturnValue("none");
  });

  it("renders the fixed decorative logo and native fresh navigation", async () => {
    render(<HomeScreen />);

    const main = await screen.findByRole("main");
    await waitFor(() => expect(main).toHaveAttribute("aria-busy", "false"));
    expect(main).toHaveClass("pb-[calc(9.25rem+env(safe-area-inset-bottom))]");
    expect(main).not.toHaveClass(
      "bg-[linear-gradient(160deg,_#FFF8F1_0%,_#FFDDBD_22%,_#F7F0E7_55%,_#DDEDF2_100%)]",
    );
    expect(main.parentElement).toHaveClass(
      "bg-[linear-gradient(160deg,_#FFF8F1_0%,_#FFDDBD_22%,_#F7F0E7_55%,_#DDEDF2_100%)]",
    );
    expect(main.parentElement).toHaveClass("min-h-dvh");
    expect(main.parentElement?.className).not.toContain("max-w");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText(strings.home.subtitle)).toBeInTheDocument();
    const logo = document.querySelector('img[src*="logo.svg"]');
    expect(logo).toHaveAttribute("alt", "");
    expect(logo).toHaveAttribute("width", "96");
    expect(screen.getByRole("link", { name: strings.home.startBaking })).toHaveAttribute(
      "href",
      "/bake/new",
    );
    expect(screen.getByRole("link", { name: strings.home.myRecipes })).toHaveAttribute(
      "href",
      "/recipes",
    );
    expect(screen.getByRole("link", { name: strings.home.starterTracker })).toHaveAttribute(
      "href",
      "/starter",
    );
  });

  it("shows a positive recipe count but never zero", async () => {
    saveRecipe(recipeInput);
    saveRecipe({ ...recipeInput, name: "אחר" });
    render(<HomeScreen />);

    expect(await screen.findByRole("link", { name: "המתכונים שלי · 2" })).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("renders active context, fold progress and the real continue route", async () => {
    const recipe = saveRecipe({
      ...recipeInput,
      name: "לחםשלשישיארוךמאודללאמרווחים",
    });
    seedActive(recipe, { subStep: 2 });
    render(<HomeScreen />);

    expect(await screen.findByText("ממשיכים")).toBeInTheDocument();
    expect(screen.queryByText(strings.home.subtitle)).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "לחםשלשישיארוךמאודללאמרווחים",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("תסיסה ראשונית")).toBeInTheDocument();
    expect(screen.getByText("2 / 4 קיפולים בוצעו")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "המשך" })).toHaveAttribute(
      "href",
      "/bake/stage/4",
    );
    expect(screen.getByRole("link", { name: strings.home.startBakingAlt })).toHaveAttribute(
      "href",
      "/bake/new",
    );
  });

  it("ticks a running timer and gives it precedence over folds", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(100_000));
    const recipe = saveRecipe(recipeInput);
    seedActive(recipe, { subStep: 2, timerStartedAt: 40_000 });
    render(<HomeScreen />);

    await act(async () => {});
    expect(screen.getByText("29:00")).toBeInTheDocument();
    expect(screen.queryByText("2 / 4 קיפולים בוצעו")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1_000));
    expect(screen.getByText("28:59")).toBeInTheDocument();
  });

  it("tracks abandonment before clearing storage and returns focus to fresh start", async () => {
    const recipe = saveRecipe(recipeInput);
    seedActive(recipe);
    const order: string[] = [];
    (track as Mock).mockImplementation(() => {
      order.push("track");
      expect(loadActiveBake()).not.toBeNull();
    });
    render(<HomeScreen />);
    await screen.findByText("ממשיכים");

    fireEvent.click(screen.getByRole("button", { name: strings.bake.resumeBannerStop }));
    fireEvent.click(await screen.findByRole("button", { name: strings.bake.stopConfirm }));
    order.push(loadActiveBake() === null ? "cleared" : "not-cleared");

    const start = await screen.findByRole("link", { name: strings.home.startBaking });
    await waitFor(() => expect(start).toHaveFocus());
    expect(order).toEqual(["track", "cleared"]);
  });

  it("keeps an active bake when stop is cancelled", async () => {
    const recipe = saveRecipe(recipeInput);
    seedActive(recipe);
    render(<HomeScreen />);
    await screen.findByText("ממשיכים");

    fireEvent.click(screen.getByRole("button", { name: strings.bake.resumeBannerStop }));
    fireEvent.click(await screen.findByRole("button", { name: strings.bake.stopCancel }));
    expect(loadActiveBake()?.id).toBe("ab-1");
  });
});

describe("HomeScreen — install integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    (track as Mock).mockReset();
  });

  it("uses the Home appearance only in fresh state", async () => {
    (getInstallEnvironment as Mock).mockReturnValue("ios");
    render(<HomeScreen />);
    const banner = await screen.findByLabelText(strings.install.title);
    expect(banner).toHaveAttribute("data-appearance", "home");
  });

  it("does not show install while a bake is active", async () => {
    (getInstallEnvironment as Mock).mockReturnValue("ios");
    const recipe = saveRecipe(recipeInput);
    seedActive(recipe);
    render(<HomeScreen />);
    await screen.findByText("ממשיכים");
    expect(screen.queryByText(strings.install.title)).not.toBeInTheDocument();
  });
});
