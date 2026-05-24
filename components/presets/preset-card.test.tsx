import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PresetCard } from "./preset-card";
import { PRESETS } from "@/lib/presets";

const sample = PRESETS[0]!;

describe("PresetCard", () => {
  it("renders preset name and blurb", () => {
    render(<PresetCard preset={sample} onSelect={() => {}} />);
    expect(screen.getByText(sample.name)).toBeInTheDocument();
    expect(screen.getByText(sample.blurb)).toBeInTheDocument();
  });

  it("renders hydration summary", () => {
    render(<PresetCard preset={sample} onSelect={() => {}} />);
    expect(screen.getByText(`${sample.data.hydration}%`)).toBeInTheDocument();
    expect(screen.getByText(/הידרציה/)).toBeInTheDocument();
  });

  it("fires onSelect on pointer up without drag", () => {
    const onSelect = vi.fn();
    render(<PresetCard preset={sample} onSelect={onSelect} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 10, clientY: 10 });
    fireEvent.pointerUp(btn, { clientX: 10, clientY: 10 });
    expect(onSelect).toHaveBeenCalledWith(sample);
  });

  it("does NOT fire onSelect when pointer drags > 5px", () => {
    const onSelect = vi.fn();
    render(<PresetCard preset={sample} onSelect={onSelect} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(btn, { clientX: 25, clientY: 10 });
    fireEvent.pointerUp(btn, { clientX: 25, clientY: 10 });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("applies data-pressed during press", () => {
    render(<PresetCard preset={sample} onSelect={() => {}} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
    expect(btn).toHaveAttribute("data-pressed");
    fireEvent.pointerUp(btn, { clientX: 0, clientY: 0 });
    expect(btn).not.toHaveAttribute("data-pressed");
  });

  it("includes preset id as data attribute", () => {
    render(<PresetCard preset={sample} onSelect={() => {}} />);
    expect(screen.getByRole("button")).toHaveAttribute("data-preset-id", sample.id);
  });

  it("fires onSelect on Enter key", () => {
    const onSelect = vi.fn();
    render(<PresetCard preset={sample} onSelect={onSelect} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith(sample);
  });
});
