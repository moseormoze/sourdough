import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BakeStubScreen } from "./bake-stub-screen";
import { routerMock } from "../../vitest.setup";

describe("BakeStubScreen", () => {
  beforeEach(() => {
    routerMock.push.mockClear();
  });

  it("shows the coming-soon title", () => {
    render(<BakeStubScreen />);
    expect(screen.getByText("מצב אפייה — בקרוב")).toBeInTheDocument();
  });

  it("shows the explanatory body", () => {
    render(<BakeStubScreen />);
    expect(
      screen.getByText("הזרימה הזאת תיכנס בקרוב. בינתיים, תכין את המתכונים שלך.")
    ).toBeInTheDocument();
  });

  it("back button navigates to /", () => {
    render(<BakeStubScreen />);
    fireEvent.click(screen.getByRole("button", { name: /חזרה/ }));
    expect(routerMock.push).toHaveBeenCalledWith("/");
  });
});
