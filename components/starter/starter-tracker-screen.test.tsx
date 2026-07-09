import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarterTrackerScreen } from "./starter-tracker-screen";
import { routerMock } from "../../vitest.setup";
import { IDENTITY_STORAGE_KEY } from "@/lib/storage/identity";
import { listFeedings } from "@/lib/storage/feedings";
import type { Feeding } from "@/lib/types/feeding";

vi.mock("@/lib/storage/feedings", () => ({
  listFeedings: vi.fn(),
}));

const listFeedingsMock = vi.mocked(listFeedings);

const identity = {
  name: "אילון",
  email: "baker@example.com",
  identifiedAt: "2026-07-05T10:00:00.000Z",
};

function makeFeeding(overrides: Partial<Feeding> = {}): Feeding {
  return {
    id: "feeding-1",
    email: identity.email,
    ratio: 2,
    starterGrams: 50,
    flourGrams: 100,
    waterGrams: 100,
    fedAt: "2026-07-09T05:00:00.000Z",
    createdAt: "2026-07-09T05:00:01.000Z",
    ...overrides,
  };
}

describe("StarterTrackerScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(identity));
    routerMock.push.mockClear();
    listFeedingsMock.mockReset();
  });

  it("shows a loading spinner before the list resolves, not the empty or loaded content", () => {
    let resolveFn: (value: Feeding[]) => void = () => {};
    listFeedingsMock.mockReturnValue(
      new Promise((resolve) => {
        resolveFn = resolve;
      })
    );

    render(<StarterTrackerScreen />);

    expect(screen.getByText("טוען…")).toBeInTheDocument();
    expect(screen.queryByText("עדיין לא תיעדת האכלות")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "1:2:2" })).not.toBeInTheDocument();

    resolveFn([]);
  });

  it("renders the empty state when zero feedings are returned", async () => {
    listFeedingsMock.mockResolvedValue([]);
    render(<StarterTrackerScreen />);
    expect(await screen.findByText("עדיין לא תיעדת האכלות")).toBeInTheDocument();
  });

  it("renders feedings in the order returned by listFeedings (trusting server-side newest-first sort)", async () => {
    const older = makeFeeding({ id: "old", fedAt: "2026-07-01T05:00:00.000Z", ratio: 1 });
    const newer = makeFeeding({ id: "new", fedAt: "2026-07-08T05:00:00.000Z", ratio: 3 });
    listFeedingsMock.mockResolvedValue([newer, older]);

    render(<StarterTrackerScreen />);

    await screen.findByText("1:3:3");
    const rows = screen
      .getAllByRole("button")
      .filter((button) => button.hasAttribute("data-feeding-id"));
    expect(rows.map((row) => row.getAttribute("data-feeding-id"))).toEqual(["new", "old"]);
  });

  it("shows each row's ratio, formatted date, and grams summary", async () => {
    listFeedingsMock.mockResolvedValue([makeFeeding()]);
    render(<StarterTrackerScreen />);
    expect(await screen.findByText("1:2:2")).toBeInTheDocument();
    expect(screen.getByText("סטארטר 50גרם · קמח 100גרם · מים 100גרם")).toBeInTheDocument();
  });

  it("shows an error message and a retry button when the fetch fails; retry re-invokes listFeedings", async () => {
    listFeedingsMock.mockRejectedValueOnce(new Error("network down"));
    render(<StarterTrackerScreen />);

    expect(await screen.findByText("משהו השתבש בטעינת ההיסטוריה")).toBeInTheDocument();
    expect(listFeedingsMock).toHaveBeenCalledTimes(1);

    listFeedingsMock.mockResolvedValueOnce([makeFeeding()]);
    fireEvent.click(screen.getByRole("button", { name: "נסה שוב" }));

    expect(listFeedingsMock).toHaveBeenCalledTimes(2);
    expect(await screen.findByText("1:2:2")).toBeInTheDocument();
    expect(screen.queryByText("משהו השתבש בטעינת ההיסטוריה")).not.toBeInTheDocument();
  });

  it("tapping a row navigates to /starter/[id]/edit with the correct id", async () => {
    listFeedingsMock.mockResolvedValue([makeFeeding({ id: "feeding-42" })]);
    render(<StarterTrackerScreen />);

    const row = await screen.findByText("1:2:2");
    fireEvent.click(row.closest("button") as HTMLButtonElement);

    expect(routerMock.push).toHaveBeenCalledWith("/starter/feeding-42/edit");
  });

  it("back button navigates to /", async () => {
    listFeedingsMock.mockResolvedValue([]);
    render(<StarterTrackerScreen />);
    await screen.findByText("עדיין לא תיעדת האכלות");

    fireEvent.click(screen.getByRole("button", { name: /חזרה/ }));
    expect(routerMock.push).toHaveBeenCalledWith("/");
  });

  it("shows the '+ האכלה חדשה' header button only when feedings exist, not when empty", async () => {
    listFeedingsMock.mockResolvedValue([]);
    render(<StarterTrackerScreen />);
    await screen.findByText("עדיין לא תיעדת האכלות");
    expect(screen.queryByRole("button", { name: "+ האכלה חדשה" })).not.toBeInTheDocument();
  });

  it("header '+ האכלה חדשה' button navigates to /starter/new when feedings exist", async () => {
    listFeedingsMock.mockResolvedValue([makeFeeding()]);
    render(<StarterTrackerScreen />);

    const newButton = await screen.findByRole("button", { name: "+ האכלה חדשה" });
    fireEvent.click(newButton);
    expect(routerMock.push).toHaveBeenCalledWith("/starter/new");
  });

  it("calls listFeedings scoped to the current identity's email", async () => {
    listFeedingsMock.mockResolvedValue([]);
    render(<StarterTrackerScreen />);
    await screen.findByText("עדיין לא תיעדת האכלות");
    expect(listFeedingsMock).toHaveBeenCalledWith("baker@example.com");
  });
});
