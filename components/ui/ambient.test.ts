import { describe, expect, it } from "vitest";
import { AMBIENT_CANVAS, AMBIENT_GLASS } from "./ambient";

describe("ambient class recipes", () => {
  it("keeps the canvas gradient byte-for-byte identical to the home screen", () => {
    expect(AMBIENT_CANVAS).toBe(
      "bg-[linear-gradient(160deg,_#FFF8F1_0%,_#FFDDBD_22%,_#F7F0E7_55%,_#DDEDF2_100%)]",
    );
  });

  it("keeps the glass surface recipe byte-for-byte identical to the home group", () => {
    expect(AMBIENT_GLASS).toBe(
      "rounded-[2rem] border border-paper/60 bg-[#FFF8F1]/95 shadow-[0_1px_0_rgba(255,255,255,0.65),0_14px_36px_rgba(80,61,45,0.07)] supports-[backdrop-filter]:bg-paper/35 supports-[backdrop-filter]:backdrop-blur-md",
    );
  });
});
