import { describe, it, expect, beforeAll, beforeEach, afterEach, vi, type Mock } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HomeScreen } from "./home-screen";
import { saveRecipe } from "@/lib/storage/recipes";
import { loadActiveBake, saveActiveBake } from "@/lib/storage/active-bake";
import { getInstallEnvironment } from "@/lib/install-environment";
import { strings } from "@/lib/strings";
import type { Recipe } from "@/lib/types/recipe";

vi.mock("@/lib/install-environment", () => ({
  getInstallEnvironment: vi.fn(() => "none"),
}));
vi.mock("@/lib/hooks/use-install-prompt", () => ({
  useInstallPrompt: vi.fn(() => ({ promptEvent: null, installed: false })),
}));

const sample = {
  name: "כפרי",
  flour: { white: 80, wholeWheat: 20, rye: 0, other: 0 },
  hydration: 75,
  salt: 2,
  levain: 20,
  kitchenTemp: 25,
  inclusions: [],
};

function seedActive(recipe: Recipe) {
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
      bakingMethod: "closed-vessel",
      feedAt: null,
      peakAt: null,
      feedRatio: 2 as const,
      retardHours: 12,
      doughTempC: null,
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

describe("HomeScreen", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders wordmark and subtitle in fresh (no active bake) state", () => {
    render(<HomeScreen />);
    expect(screen.getByText("כיכר")).toBeInTheDocument();
    expect(screen.getByText("מה אופים היום?")).toBeInTheDocument();
  });

  it("hides the subtitle when an active bake exists (the banner is the answer)", async () => {
    const recipe = saveRecipe(sample);
    seedActive(recipe);
    render(<HomeScreen />);
    await screen.findByText("ממשיכים");
    expect(screen.queryByText("מה אופים היום?")).not.toBeInTheDocument();
  });

  it("renders the SVG logo with the wordmark as alt text", () => {
    render(<HomeScreen />);
    const logo = screen.getByRole("img", { name: "כיכר" });
    expect(logo).toBeInTheDocument();
    expect(logo.getAttribute("src")).toContain("logo.svg");
  });

  it("renders the CTAs in fresh state", async () => {
    render(<HomeScreen />);
    expect(await screen.findByText("התחל אפייה")).toBeInTheDocument();
    expect(screen.getByText("המתכונים שלי")).toBeInTheDocument();
  });

  it("shows recipe count when > 0", async () => {
    saveRecipe(sample);
    saveRecipe({ ...sample, name: "אחר" });
    render(<HomeScreen />);
    expect(await screen.findByText("2")).toBeInTheDocument();
  });

  it("does not show recipe count when 0", async () => {
    render(<HomeScreen />);
    await screen.findByText("התחל אפייה");
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows the resume banner with active bake; new-bake CTA demotes to 'אפייה חדשה'", async () => {
    const recipe = saveRecipe(sample);
    seedActive(recipe);
    render(<HomeScreen />);
    expect(await screen.findByText("ממשיכים")).toBeInTheDocument();
    expect(screen.getByText("כפרי")).toBeInTheDocument();
    expect(screen.getByText("אפייה חדשה")).toBeInTheDocument();
    expect(screen.queryByText("התחל אפייה")).not.toBeInTheDocument();
    expect(screen.getByText("המתכונים שלי")).toBeInTheDocument();
  });

  it("banner 'סיים בייק' opens the StopBakeDialog; confirm clears the active bake", async () => {
    const recipe = saveRecipe(sample);
    seedActive(recipe);
    render(<HomeScreen />);
    await screen.findByText("ממשיכים");

    fireEvent.click(screen.getByRole("button", { name: "סיים בייק" }));
    expect(await screen.findByText("להפסיק את הבייק?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "כן, להפסיק" }));
    await waitFor(() => expect(loadActiveBake()).toBeNull());
    // Banner is gone
    await waitFor(() => {
      expect(screen.queryByText("ממשיכים")).not.toBeInTheDocument();
    });
  });

  it("banner 'סיים בייק' cancel keeps the active bake", async () => {
    const recipe = saveRecipe(sample);
    seedActive(recipe);
    render(<HomeScreen />);
    await screen.findByText("ממשיכים");

    fireEvent.click(screen.getByRole("button", { name: "סיים בייק" }));
    fireEvent.click(await screen.findByRole("button", { name: "לא, להמשיך" }));
    expect(loadActiveBake()?.id).toBe("ab-1");
  });
});

describe("HomeScreen — install banner integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    (getInstallEnvironment as Mock).mockImplementation(() => "none");
  });

  it("shows the install banner below the CTAs when installable and no bake is active", async () => {
    (getInstallEnvironment as Mock).mockReturnValue("ios");
    render(<HomeScreen />);
    expect(await screen.findByText(strings.install.title)).toBeInTheDocument();
  });

  it("hides the install banner while a bake is active (no competition with ResumeBanner)", async () => {
    (getInstallEnvironment as Mock).mockReturnValue("ios");
    const recipe = saveRecipe(sample);
    seedActive(recipe);
    render(<HomeScreen />);
    await screen.findByText("ממשיכים");
    expect(screen.queryByText(strings.install.title)).not.toBeInTheDocument();
  });
});
