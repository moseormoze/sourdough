import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChooserCard } from "./chooser-card";
import { AMBIENT_GLASS } from "@/components/ui/ambient";

const summary = [
  { value: "80%", label: "לבן" },
  { value: "75%", label: "הידרציה" },
];

describe("ChooserCard", () => {
  it("renders name and the isolated summary parts", () => {
    render(<ChooserCard name="כפרי קלאסי" summary={summary} onSelect={() => {}} />);
    expect(screen.getByText("כפרי קלאסי")).toBeInTheDocument();
    const btn = screen.getByRole("button");
    expect(btn.textContent).toContain("80% לבן · 75% הידרציה");
    expect(btn.querySelectorAll('span[dir="ltr"].num')).toHaveLength(2);
  });

  it("renders as a glass tile without the retired clamp hacks", () => {
    render(<ChooserCard name="x" summary={summary} onSelect={() => {}} />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain(AMBIENT_GLASS);
    expect(btn.className).not.toContain("bg-paper ");
    expect(btn.innerHTML).not.toContain("line-clamp");
    expect(btn.innerHTML).not.toContain("min-h-[2.9em]");
  });

  it("shows the wheat placeholder tile when there is no image", () => {
    const { container } = render(
      <ChooserCard name="x" summary={summary} onSelect={() => {}} />,
    );
    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"] svg')).toBeInTheDocument();
  });

  it("falls back to the wheat placeholder when the image fails to load", () => {
    const { container } = render(
      <ChooserCard name="x" summary={summary} imageSrc="/presets/x.webp" onSelect={() => {}} />,
    );
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    fireEvent.error(img!);
    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"] svg')).toBeInTheDocument();
  });

  it("gives press feedback by scaling and flattening the shadow", () => {
    render(<ChooserCard name="x" summary={summary} onSelect={() => {}} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
    expect(btn).toHaveAttribute("data-pressed");
    expect(btn.className).toContain("scale-[0.97]");
    expect(btn.className).toContain("shadow-none");
    fireEvent.pointerUp(btn, { clientX: 0, clientY: 0 });
    expect(btn).not.toHaveAttribute("data-pressed");
  });

  it("fires onSelect on tap (no drag)", () => {
    const onSelect = vi.fn();
    render(<ChooserCard name="x" summary={summary} onSelect={onSelect} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 10, clientY: 10 });
    fireEvent.pointerUp(btn, { clientX: 10, clientY: 10 });
    fireEvent.click(btn, { detail: 1 });
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("does NOT fire onSelect when pointer drags > 5px", () => {
    const onSelect = vi.fn();
    render(<ChooserCard name="x" summary={summary} onSelect={onSelect} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 0, clientY: 0 });
    fireEvent.pointerMove(btn, { clientX: 30, clientY: 0 });
    fireEvent.pointerUp(btn, { clientX: 30, clientY: 0 });
    fireEvent.click(btn, { detail: 1 });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("fires onSelect from native keyboard activation", () => {
    const onSelect = vi.fn();
    render(<ChooserCard name="x" summary={summary} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button"), { detail: 0 });
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
