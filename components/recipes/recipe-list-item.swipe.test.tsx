import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecipeListItem } from "./recipe-list-item";
import { routerMock } from "../../vitest.setup";
import type { Recipe } from "@/lib/types/recipe";

// Drive performance.now() manually so velocity (dx/dt) is deterministic.
// Each call returns the next scheduled tick; tests advance the tick between
// pointer events so dt is realistic.
let tick = 0;
function advance(ms: number) {
  tick += ms;
}

const recipe: Recipe = {
  id: "r-1",
  name: "כפרי",
  flour: { white: 80, wholeWheat: 20, rye: 0, speltWhite: 0, speltWhole: 0, other: 0 },
  hydration: 75,
  salt: 2,
  levain: 20,
  flourWeightGrams: 500,
  kitchenTemp: 25,
  inclusions: [],
  createdAt: 1000,
  updatedAt: 2000,
};

describe("RecipeListItem — swipe state machine", () => {
  let perfSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    routerMock.push.mockClear();
    tick = 0;
    perfSpy = vi.spyOn(performance, "now").mockImplementation(() => tick);
  });

  afterEach(() => {
    perfSpy.mockRestore();
  });

  it("a tap (no drag) still navigates to edit", () => {
    const onCommit = vi.fn();
    render(<RecipeListItem recipe={recipe} onCommitDelete={onCommit} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 10, clientY: 10 });
    fireEvent.pointerUp(btn, { clientX: 10, clientY: 10 });
    expect(routerMock.push).toHaveBeenCalledWith("/recipes/r-1/edit");
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("a small SLOW horizontal nudge (< distance + low velocity) does NOT commit and does NOT navigate", () => {
    const onCommit = vi.fn();
    render(<RecipeListItem recipe={recipe} onCommitDelete={onCommit} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 10, clientY: 10 });
    advance(200);
    fireEvent.pointerMove(btn, { clientX: 30, clientY: 10 });
    advance(200);
    fireEvent.pointerMove(btn, { clientX: 50, clientY: 10 });
    advance(200);
    fireEvent.pointerUp(btn, { clientX: 50, clientY: 10 });
    // distance 40 < 60 and velocity 20/200 = 0.1 < 0.5 → no commit
    expect(onCommit).not.toHaveBeenCalled();
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("a horizontal drag past commit-distance triggers onCommitDelete", () => {
    const onCommit = vi.fn();
    render(<RecipeListItem recipe={recipe} onCommitDelete={onCommit} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 10, clientY: 10 });
    advance(50);
    fireEvent.pointerMove(btn, { clientX: 50, clientY: 10 });
    advance(50);
    fireEvent.pointerMove(btn, { clientX: 90, clientY: 10 });
    advance(50);
    fireEvent.pointerMove(btn, { clientX: 130, clientY: 10 });
    advance(50);
    fireEvent.pointerUp(btn, { clientX: 130, clientY: 10 });
    expect(onCommit).toHaveBeenCalledWith(recipe);
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("a fast flick (high velocity, low distance) also commits", () => {
    const onCommit = vi.fn();
    render(<RecipeListItem recipe={recipe} onCommitDelete={onCommit} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 10, clientY: 10 });
    advance(10);
    fireEvent.pointerMove(btn, { clientX: 30, clientY: 10 });
    advance(10);
    // 30px in 10ms = 3 px/ms — well above 0.5 threshold
    fireEvent.pointerMove(btn, { clientX: 60, clientY: 10 });
    advance(10);
    fireEvent.pointerUp(btn, { clientX: 60, clientY: 10 });
    expect(onCommit).toHaveBeenCalled();
  });

  it("vertical motion (scroll) cancels the gesture and does not navigate or commit", () => {
    const onCommit = vi.fn();
    render(<RecipeListItem recipe={recipe} onCommitDelete={onCommit} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(btn, { clientX: 12, clientY: 60 });
    fireEvent.pointerUp(btn, { clientX: 12, clientY: 60 });
    expect(onCommit).not.toHaveBeenCalled();
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("offset attribute updates while dragging", () => {
    render(<RecipeListItem recipe={recipe} onCommitDelete={() => {}} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(btn, { clientX: 50, clientY: 10 });
    expect(btn).toHaveAttribute("data-offset", "40");
    fireEvent.pointerMove(btn, { clientX: 200, clientY: 10 });
    // Past resist range; offset rubber-bands and caps below the raw delta
    const offsetAttr = Number(btn.getAttribute("data-offset"));
    expect(offsetAttr).toBeLessThan(200);
    expect(offsetAttr).toBeGreaterThan(120);
  });
});
