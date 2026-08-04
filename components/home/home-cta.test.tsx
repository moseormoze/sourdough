import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeCta } from "./home-cta";

describe("HomeCta", () => {
  it("uses native link semantics for the charcoal focus action", () => {
    render(
      <HomeCta
        href="/bake/new"
        icon={<svg data-testid="icon" />}
        label="התחל אפייה"
        variant="focus"
      />,
    );

    const link = screen.getByRole("link", { name: "התחל אפייה" });
    expect(link).toHaveAttribute("href", "/bake/new");
    expect(link).toHaveAttribute("data-variant", "focus");
    expect(link).toHaveClass("bg-[#292A28]");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders a nav row and exposes a positive count once", () => {
    render(
      <HomeCta
        href="/recipes"
        icon={<svg />}
        label="המתכונים שלי"
        count={3}
        variant="nav-row"
      />,
    );

    const link = screen.getByRole("link", { name: "המתכונים שלי · 3" });
    expect(link).toHaveAttribute("href", "/recipes");
    expect(link).toHaveAttribute("data-variant", "nav-row");
    expect(screen.getByText("3")).toHaveAttribute("dir", "ltr");
  });

  it.each([0, undefined])("omits a non-positive recipe count (%s)", (count) => {
    render(
      <HomeCta
        href="/recipes"
        icon={<svg />}
        label="המתכונים שלי"
        count={count}
        variant="nav-row"
      />,
    );

    expect(screen.getByRole("link")).toHaveAccessibleName("המתכונים שלי");
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows and clears the explicit press preview", () => {
    render(
      <HomeCta href="/x" icon={<svg />} label="x" variant="nav-row" />,
    );
    const link = screen.getByRole("link");

    fireEvent.pointerDown(link, { clientX: 10, clientY: 10, pointerId: 1 });
    expect(link).toHaveAttribute("data-pressed");
    fireEvent.pointerMove(link, { clientX: 16, clientY: 10, pointerId: 1 });
    expect(link).not.toHaveAttribute("data-pressed");
  });

  it("marks manual press handling so global :active does not override it", () => {
    render(
      <HomeCta href="/x" icon={<svg />} label="x" variant="focus" />,
    );
    expect(screen.getByRole("link")).toHaveAttribute("data-manual-press", "true");
  });
});
