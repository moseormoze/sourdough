import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>שמור</Button>);
    expect(screen.getByRole("button", { name: "שמור" })).toBeInTheDocument();
  });

  it("fires onClick when not disabled", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>שמור</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        שמור
      </Button>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders aria-busy and spinner when loading", () => {
    render(<Button loading>שומר</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toBeDisabled();
  });

  it("defaults type to button (not submit)", () => {
    render(<Button>שמור</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("applies accent variant class when variant=accent", () => {
    render(<Button variant="accent">המשך</Button>);
    expect(screen.getByRole("button").className).toMatch(/bg-accent/);
  });

  it("applies sm size class when size=sm", () => {
    render(<Button size="sm">קטן</Button>);
    expect(screen.getByRole("button").className).toMatch(/min-h-touch/);
  });
});
