import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StageVideoCard } from "./stage-video-card";

const label = "ככה נראה בצק מוכן";
const caption = "Milk and Pop";

function renderCard(onOpen = vi.fn()) {
  render(<StageVideoCard label={label} caption={caption} onOpen={onOpen} />);
  return { button: screen.getByRole("button"), onOpen };
}

describe("StageVideoCard", () => {
  it("renders the label and the source caption", () => {
    const { button } = renderCard();
    expect(button.textContent).toContain(label);
    expect(button.textContent).toContain(caption);
  });

  it("never renders a player or an external asset while idle", () => {
    const { container } = render(
      <StageVideoCard label={label} caption={caption} onOpen={() => {}} />,
    );
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.innerHTML).not.toContain("ytimg");
    expect(container.innerHTML).not.toContain("youtube.com");
  });

  it("exposes the label and the source as one accessible name", () => {
    renderCard();
    expect(
      screen.getByRole("button", { name: new RegExp(`${label}.*${caption}`) }),
    ).toBeInTheDocument();
  });

  it("meets the 44px touch floor and drives its own press visual", () => {
    const { button } = renderCard();
    expect(button.className).toContain("min-h-touch");
    expect(button).toHaveAttribute("data-manual-press", "true");
  });

  // Playbook §1 — Idle → Press → Open | Cancel → Idle
  it("shows press feedback on pointer down and clears it on pointer up", () => {
    const { button } = renderCard();
    fireEvent.pointerDown(button, { clientX: 0, clientY: 0 });
    expect(button).toHaveAttribute("data-pressed");
    fireEvent.pointerUp(button, { clientX: 0, clientY: 0 });
    expect(button).not.toHaveAttribute("data-pressed");
  });

  it("opens on a tap", () => {
    const { button, onOpen } = renderCard();
    fireEvent.pointerDown(button, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(button, { clientX: 0, clientY: 0 });
    fireEvent.click(button, { detail: 1 });
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("does not open when the pointer drags past the 5px threshold", () => {
    const { button, onOpen } = renderCard();
    fireEvent.pointerDown(button, { clientX: 0, clientY: 0 });
    fireEvent.pointerMove(button, { clientX: 0, clientY: 24 });
    expect(button).not.toHaveAttribute("data-pressed");
    fireEvent.pointerUp(button, { clientX: 0, clientY: 24 });
    fireEvent.click(button, { detail: 1 });
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("does not open when the press is cancelled", () => {
    const { button, onOpen } = renderCard();
    fireEvent.pointerDown(button, { clientX: 0, clientY: 0 });
    fireEvent.pointerCancel(button);
    expect(button).not.toHaveAttribute("data-pressed");
    fireEvent.click(button, { detail: 1 });
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("does not open when focus leaves mid-press, and resets its press flags", () => {
    const { button, onOpen } = renderCard();
    fireEvent.pointerDown(button, { clientX: 0, clientY: 0 });
    fireEvent.blur(button);
    expect(button).not.toHaveAttribute("data-pressed");
    fireEvent.click(button, { detail: 1 });
    expect(onOpen).not.toHaveBeenCalled();

    // cleanup (§8): the next honest tap still works
    fireEvent.pointerDown(button, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(button, { clientX: 0, clientY: 0 });
    fireEvent.click(button, { detail: 1 });
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("opens from the keyboard (click with no pointer detail)", () => {
    const { button, onOpen } = renderCard();
    fireEvent.click(button, { detail: 0 });
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
