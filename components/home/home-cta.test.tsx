import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HomeCta } from "./home-cta";
import { routerMock } from "../../vitest.setup";

describe("HomeCta", () => {
  beforeEach(() => {
    routerMock.push.mockClear();
  });

  it("renders label and icon", () => {
    render(<HomeCta href="/x" icon={<svg data-testid="icn" />} label="המתכונים שלי" />);
    expect(screen.getByText("המתכונים שלי")).toBeInTheDocument();
    expect(screen.getByTestId("icn")).toBeInTheDocument();
  });

  it("does not render count when count is 0", () => {
    render(<HomeCta href="/x" icon={<svg />} label="המתכונים שלי" count={0} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("does not render count when count is undefined", () => {
    render(<HomeCta href="/x" icon={<svg />} label="x" />);
    expect(screen.getByRole("button")).toHaveAccessibleName("x");
  });

  it("renders count when greater than 0", () => {
    render(<HomeCta href="/x" icon={<svg />} label="המתכונים שלי" count={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("navigates to href on pointer up (without drag)", () => {
    render(<HomeCta href="/recipes" icon={<svg />} label="x" />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 10, clientY: 10 });
    fireEvent.pointerUp(btn, { clientX: 10, clientY: 10 });
    expect(routerMock.push).toHaveBeenCalledWith("/recipes");
  });

  it("does NOT navigate when pointer moves > 5px before up", () => {
    render(<HomeCta href="/recipes" icon={<svg />} label="x" />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(btn, { clientX: 30, clientY: 10 });
    fireEvent.pointerUp(btn, { clientX: 30, clientY: 10 });
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("applies data-pressed during press, cleared after", () => {
    render(<HomeCta href="/x" icon={<svg />} label="x" />);
    const btn = screen.getByRole("button");
    expect(btn).not.toHaveAttribute("data-pressed");
    fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
    expect(btn).toHaveAttribute("data-pressed");
    fireEvent.pointerUp(btn, { clientX: 0, clientY: 0 });
    expect(btn).not.toHaveAttribute("data-pressed");
  });

  it("navigates on Enter key", () => {
    render(<HomeCta href="/recipes" icon={<svg />} label="x" />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(routerMock.push).toHaveBeenCalledWith("/recipes");
  });

  it("navigates on Space key", () => {
    render(<HomeCta href="/recipes" icon={<svg />} label="x" />);
    fireEvent.keyDown(screen.getByRole("button"), { key: " " });
    expect(routerMock.push).toHaveBeenCalledWith("/recipes");
  });
});
