import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeNavGroup } from "./home-nav-group";

describe("HomeNavGroup", () => {
  it("renders the pre-extraction glass group classes byte-for-byte", () => {
    const { container } = render(
      <HomeNavGroup>
        <a href="/recipes">מתכונים</a>
      </HomeNavGroup>,
    );

    expect(container.querySelector("nav")?.className).toBe(
      "overflow-hidden rounded-[2rem] border border-paper/60 bg-[#FFF8F1]/95 shadow-[0_1px_0_rgba(255,255,255,0.65),0_14px_36px_rgba(80,61,45,0.07)] supports-[backdrop-filter]:bg-paper/35 supports-[backdrop-filter]:backdrop-blur-md [&>*+*]:border-t [&>*+*]:border-ink/[0.06]",
    );
  });
});
