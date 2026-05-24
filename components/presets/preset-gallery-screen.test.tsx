import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PresetGalleryScreen } from "./preset-gallery-screen";
import { routerMock } from "../../vitest.setup";
import { PRESETS } from "@/lib/presets";

describe("PresetGalleryScreen", () => {
  beforeEach(() => {
    routerMock.push.mockClear();
    routerMock.back.mockClear();
  });

  it("renders the page title", () => {
    render(<PresetGalleryScreen />);
    expect(screen.getByRole("heading", { name: "מאיפה להתחיל?" })).toBeInTheDocument();
  });

  it("renders all 6 preset cards", () => {
    render(<PresetGalleryScreen />);
    for (const p of PRESETS) {
      expect(screen.getByText(p.name)).toBeInTheDocument();
    }
  });

  it("clicking a preset card navigates to /recipes/new/{id}", () => {
    render(<PresetGalleryScreen />);
    const country = PRESETS[0]!;
    const btn = screen.getByRole("button", { name: country.name });
    fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(btn, { clientX: 0, clientY: 0 });
    expect(routerMock.push).toHaveBeenCalledWith(`/recipes/new/${country.id}`);
  });

  it("'התחל מאפס' navigates to /recipes/new/scratch", () => {
    render(<PresetGalleryScreen />);
    fireEvent.click(screen.getByRole("button", { name: "התחל מאפס" }));
    expect(routerMock.push).toHaveBeenCalledWith("/recipes/new/scratch");
  });

  it("back button calls router.back()", () => {
    render(<PresetGalleryScreen />);
    fireEvent.click(screen.getByRole("button", { name: /חזרה/ }));
    expect(routerMock.back).toHaveBeenCalled();
  });
});
