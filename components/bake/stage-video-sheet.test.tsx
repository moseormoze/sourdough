import { describe, it, expect, vi, afterEach } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { StageVideoSheet } from "./stage-video-sheet";
import { strings } from "@/lib/strings";

const youtubeId = "vkJqIwbapf0";

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    get: () => value,
  });
}

afterEach(() => {
  setOnline(true);
});

function open(props: Partial<React.ComponentProps<typeof StageVideoSheet>> = {}) {
  const onClose = props.onClose ?? vi.fn();
  const result = render(
    <StageVideoSheet
      open
      onClose={onClose}
      youtubeId={youtubeId}
      orientation="portrait"
      {...props}
    />,
  );
  return { ...result, onClose };
}

describe("StageVideoSheet", () => {
  it("renders nothing while closed", () => {
    const { container } = render(
      <StageVideoSheet
        open={false}
        onClose={() => {}}
        youtubeId={youtubeId}
        orientation="portrait"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("plays a portrait asset in a 9:16 frame", () => {
    const { container } = open();
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe!.parentElement!.className).toContain("aspect-[9/16]");
    expect(iframe!.parentElement!.className).not.toContain("aspect-video");
  });

  it("plays a landscape asset in a 16:9 frame", () => {
    const { container } = open({ orientation: "landscape" });
    const iframe = container.querySelector("iframe");
    expect(iframe!.parentElement!.className).toContain("aspect-video");
    expect(iframe!.parentElement!.className).not.toContain("aspect-[9/16]");
  });

  it("starts muted, looping, inline, with controls and no related videos", () => {
    const { container } = open();
    const src = container.querySelector("iframe")!.getAttribute("src")!;
    expect(src).toContain(`youtube.com/embed/${youtubeId}`);
    for (const param of [
      "autoplay=1",
      "mute=1",
      "loop=1",
      `playlist=${youtubeId}`,
      "controls=1",
      "playsinline=1",
      "modestbranding=1",
      "rel=0",
    ]) {
      expect(src).toContain(param);
    }
  });

  it("gives the player an accessible title", () => {
    const { container } = open({ caption: "Milk and Pop" });
    expect(container.querySelector("iframe")!.getAttribute("title")).toBeTruthy();
  });

  it("renders the source caption", () => {
    open({ caption: "Milk and Pop" });
    expect(screen.getByText("Milk and Pop")).toBeInTheDocument();
  });

  it("always offers the external escape route beneath the player", () => {
    const { container } = open();
    const link = screen.getByRole("link", { name: strings.bake.stageVideo.watchOnYouTube });
    expect(link).toHaveAttribute("href", `https://www.youtube.com/watch?v=${youtubeId}`);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(link.className).toContain("min-h-touch");

    // beneath, not above
    const nodes = Array.from(container.querySelectorAll("iframe, a"));
    expect(nodes.indexOf(container.querySelector("iframe")!)).toBeLessThan(
      nodes.indexOf(link),
    );
  });

  it("honours an explicit watchUrl over the derived one", () => {
    open({ watchUrl: "https://www.youtube.com/shorts/vkJqIwbapf0" });
    expect(
      screen.getByRole("link", { name: strings.bake.stageVideo.watchOnYouTube }),
    ).toHaveAttribute("href", "https://www.youtube.com/shorts/vkJqIwbapf0");
  });

  it("replaces the player with a message and the link when offline", () => {
    setOnline(false);
    const { container } = open();
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByText(strings.bake.stageVideo.offline)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: strings.bake.stageVideo.watchOnYouTube }),
    ).toBeInTheDocument();
  });

  it("recovers the player when the connection comes back while open", () => {
    setOnline(false);
    const { container } = open();
    expect(container.querySelector("iframe")).toBeNull();
    act(() => {
      setOnline(true);
      window.dispatchEvent(new Event("online"));
    });
    expect(container.querySelector("iframe")).toBeInTheDocument();
  });

  it("keeps the BottomSheet drag-dismiss contract", () => {
    const { container, onClose } = open();
    const handle = container.querySelector(".cursor-grab")!;
    fireEvent.pointerDown(handle, { clientY: 0 });
    fireEvent.pointerMove(handle, { clientY: 100 });
    fireEvent.pointerUp(handle, { clientY: 100 });
    expect(onClose).toHaveBeenCalled();
  });

  it("dismisses on a short flick (velocity rule)", () => {
    const { container, onClose } = open();
    const handle = container.querySelector(".cursor-grab")!;
    fireEvent.pointerDown(handle, { clientY: 0 });
    fireEvent.pointerMove(handle, { clientY: 20 });
    fireEvent.pointerUp(handle, { clientY: 20 });
    expect(onClose).toHaveBeenCalled();
  });

  it("snaps back on a short, slow drag", () => {
    vi.useFakeTimers();
    try {
      const { container, onClose } = open();
      const handle = container.querySelector(".cursor-grab")!;
      fireEvent.pointerDown(handle, { clientY: 0 });
      fireEvent.pointerMove(handle, { clientY: 20 });
      vi.advanceTimersByTime(400); // 20px / 400ms = 0.05px/ms — well under 0.5
      fireEvent.pointerUp(handle, { clientY: 20 });
      expect(onClose).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not dismiss when the pointer never crosses the 5px drag threshold", () => {
    const { container, onClose } = open();
    const handle = container.querySelector(".cursor-grab")!;
    fireEvent.pointerDown(handle, { clientY: 0 });
    fireEvent.pointerMove(handle, { clientY: 3 });
    fireEvent.pointerUp(handle, { clientY: 3 });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes on Escape once the panel is revealed", async () => {
    const { onClose } = open();
    await waitFor(() => {
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("closes from the header button", () => {
    const { onClose } = open();
    fireEvent.click(screen.getByRole("button", { name: "סגור" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("returns focus to whatever opened it", async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            נגן
          </button>
          <StageVideoSheet
            open={open}
            onClose={() => setOpen(false)}
            youtubeId={youtubeId}
            orientation="portrait"
          />
        </>
      );
    }
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "נגן" });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "סגור" }));
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
