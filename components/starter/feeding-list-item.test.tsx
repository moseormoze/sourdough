import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeedingListItem, formatFedAt, summarizeGrams } from "./feeding-list-item";
import { routerMock } from "../../vitest.setup";
import type { Feeding } from "@/lib/types/feeding";

const sample: Feeding = {
  id: "feeding-1",
  email: "baker@example.com",
  ratio: 2,
  starterGrams: 50,
  flourGrams: 100,
  waterGrams: 100,
  fedAt: "2026-07-09T05:00:00.000Z",
  createdAt: "2026-07-09T05:00:01.000Z",
};

describe("formatFedAt", () => {
  it("formats using he-IL medium date + short time", () => {
    const formatted = formatFedAt(sample.fedAt);
    expect(formatted).toBe(
      new Intl.DateTimeFormat("he-IL", { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(sample.fedAt)
      )
    );
  });
});

describe("summarizeGrams", () => {
  it("joins all three gram fields when present", () => {
    expect(summarizeGrams(sample)).toBe("סטארטר 50גרם · קמח 100גרם · מים 100גרם");
  });

  it("omits fields that are null", () => {
    expect(
      summarizeGrams({ ...sample, flourGrams: null, waterGrams: null })
    ).toBe("סטארטר 50גרם");
  });

  it("returns an empty string when all gram fields are null", () => {
    expect(
      summarizeGrams({ ...sample, starterGrams: null, flourGrams: null, waterGrams: null })
    ).toBe("");
  });
});

describe("FeedingListItem", () => {
  beforeEach(() => {
    routerMock.push.mockClear();
  });

  it("renders the feed ratio label", () => {
    render(<FeedingListItem feeding={sample} />);
    expect(screen.getByText("1:2:2")).toBeInTheDocument();
  });

  it("renders the formatted fed-at date/time", () => {
    render(<FeedingListItem feeding={sample} />);
    expect(screen.getByText(formatFedAt(sample.fedAt))).toBeInTheDocument();
  });

  it("renders the grams summary when any gram field is present", () => {
    render(<FeedingListItem feeding={sample} />);
    expect(screen.getByText("סטארטר 50גרם · קמח 100גרם · מים 100גרם")).toBeInTheDocument();
  });

  it("does not render a grams summary line when all gram fields are null", () => {
    render(
      <FeedingListItem
        feeding={{ ...sample, starterGrams: null, flourGrams: null, waterGrams: null }}
      />
    );
    expect(screen.queryByText(/גרם/)).not.toBeInTheDocument();
  });

  it("navigates to /starter/[id]/edit when tapped", () => {
    render(<FeedingListItem feeding={sample} />);
    fireEvent.click(screen.getByRole("button"));
    expect(routerMock.push).toHaveBeenCalledWith("/starter/feeding-1/edit");
  });

  it("is a real button with a touch-target-safe class", () => {
    render(<FeedingListItem feeding={sample} />);
    expect(screen.getByRole("button")).toHaveClass("min-h-touch");
  });
});
