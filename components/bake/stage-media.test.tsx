import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StageMedia } from "./stage-media";

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
});
