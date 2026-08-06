import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StageMedia } from "./stage-media";
import { strings } from "@/lib/strings";

describe("StageMedia", () => {
  it("renders nothing when no image and no video are provided", () => {
    const { container } = render(<StageMedia />);
    expect(container.firstChild).toBeNull();
  });

  it("renders an image when imageUrl is provided", () => {
    render(<StageMedia imageUrl="/stages/1-levain.png" imageAlt="שאור בשיא" />);
    const img = screen.getByRole("img", { name: "שאור בשיא" });
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("1-levain");
  });

  it("renders a decorative image (empty alt) when imageAlt is not provided", () => {
    const { container } = render(<StageMedia imageUrl="/stages/1-levain.png" />);
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("alt")).toBe("");
  });

  it("renders a YouTube iframe when youtubeId is provided", () => {
    const { container } = render(<StageMedia youtubeId="abc123XYZ_" />);
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe?.getAttribute("src")).toContain("youtube.com/embed/abc123XYZ_");
    expect(iframe?.getAttribute("src")).toContain("mute=1");
    expect(iframe?.getAttribute("src")).toContain("loop=1");
    expect(iframe?.getAttribute("src")).toContain("playlist=abc123XYZ_");
  });

  it("renders a videoCaption beneath the iframe when provided", () => {
    render(
      <StageMedia youtubeId="abc123XYZ_" videoCaption="קיפול עדין — Maurizio Leo" />
    );
    expect(screen.getByText(/קיפול עדין — Maurizio Leo/)).toBeInTheDocument();
  });

  it("renders both image and video when both are provided (image first)", () => {
    const { container } = render(
      <StageMedia
        imageUrl="/stages/9-scoring.png"
        imageAlt="חריצה ב-45°"
        youtubeId="abc123XYZ_"
      />
    );
    const img = screen.getByRole("img", { name: "חריצה ב-45°" });
    const iframe = container.querySelector("iframe");
    expect(img).toBeInTheDocument();
    expect(iframe).toBeInTheDocument();
    // DOM order: image should come before iframe
    const imgPosition = Array.from(container.querySelectorAll("img, iframe")).indexOf(img);
    const iframePosition = Array.from(container.querySelectorAll("img, iframe")).indexOf(
      iframe!
    );
    expect(imgPosition).toBeLessThan(iframePosition);
  });

  it("embeds inline when the orientation is explicitly landscape (unchanged path)", () => {
    const { container } = render(
      <StageMedia youtubeId="abc123XYZ_" youtubeOrientation="landscape" />,
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe!.parentElement!.className).toContain("aspect-video");
    expect(container.querySelector("button")).toBeNull();
  });
});

describe("StageMedia — portrait assets", () => {
  const label = "ככה נראה בצק מוכן";

  it("renders a card instead of an inline player — never an iframe in the page flow", () => {
    const { container } = render(
      <StageMedia
        youtubeId="vkJqIwbapf0"
        youtubeOrientation="portrait"
        videoCaption="Milk and Pop"
        videoLabel={label}
        onOpenVideo={() => {}}
      />,
    );
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByRole("button", { name: new RegExp(label) })).toBeInTheDocument();
  });

  it("asks the screen to open the player, and mounts no sheet of its own", () => {
    const onOpenVideo = vi.fn();
    const { container } = render(
      <StageMedia
        youtubeId="vkJqIwbapf0"
        youtubeOrientation="portrait"
        videoCaption="Milk and Pop"
        videoLabel={label}
        onOpenVideo={onOpenVideo}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: new RegExp(label) }), { detail: 0 });
    expect(onOpenVideo).toHaveBeenCalledTimes(1);
    // the sheet belongs to the screen — mounted here it would sit under the FAB
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("falls back to a generic label when the stage supplies none", () => {
    render(
      <StageMedia youtubeId="vkJqIwbapf0" youtubeOrientation="portrait" onOpenVideo={() => {}} />,
    );
    expect(
      screen.getByRole("button", { name: new RegExp(strings.bake.stageVideo.playerTitle) }),
    ).toBeInTheDocument();
  });

  it("does not throw when tapped without a handler", () => {
    render(<StageMedia youtubeId="vkJqIwbapf0" youtubeOrientation="portrait" videoLabel={label} />);
    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: new RegExp(label) }), { detail: 0 }),
    ).not.toThrow();
  });

  it("still renders an image above a portrait card", () => {
    const { container } = render(
      <StageMedia
        imageUrl="/stages/9-scoring.png"
        imageAlt="חריצה ב-45°"
        youtubeId="vkJqIwbapf0"
        youtubeOrientation="portrait"
        videoLabel={label}
        onOpenVideo={() => {}}
      />,
    );
    const nodes = Array.from(container.querySelectorAll("img, button"));
    expect(nodes[0]!.tagName).toBe("IMG");
    expect(nodes[1]!.tagName).toBe("BUTTON");
  });
});
