import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyFeedingsState } from "./empty-feedings-state";
import { routerMock } from "../../vitest.setup";

describe("EmptyFeedingsState", () => {
  beforeEach(() => {
    routerMock.push.mockClear();
  });

  it("renders the empty title and description", () => {
    render(<EmptyFeedingsState />);
    expect(screen.getByText("עדיין לא תיעדת האכלות")).toBeInTheDocument();
    expect(
      screen.getByText("הוסף את ההאכלה הראשונה שלך כדי להתחיל לעקוב")
    ).toBeInTheDocument();
  });

  it("renders a primary CTA labelled '+ האכלה ראשונה'", () => {
    render(<EmptyFeedingsState />);
    expect(screen.getByRole("button", { name: "+ האכלה ראשונה" })).toBeInTheDocument();
  });

  it("navigates to /starter/new when the CTA is clicked", () => {
    render(<EmptyFeedingsState />);
    fireEvent.click(screen.getByRole("button", { name: "+ האכלה ראשונה" }));
    expect(routerMock.push).toHaveBeenCalledWith("/starter/new");
  });
});
