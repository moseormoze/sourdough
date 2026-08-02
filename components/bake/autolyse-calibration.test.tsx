import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AutolyseCalibration } from "./autolyse-calibration";

describe("AutolyseCalibration", () => {
  it("keeps both approved comparison captions visible in the text fallback", () => {
    render(<AutolyseCalibration />);

    expect(screen.getByTestId("autolyse-calibration")).toBeInTheDocument();
    expect(screen.getByText("מיד אחרי הערבוב – הבצק עדיין גס ולא אחיד.")).toBeInTheDocument();
    expect(
      screen.getByText("אחרי המנוחה – הבצק מחובר יותר ונמתח בקלות רבה יותר."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "המראה תלוי בקמח ובהידרציה; השוו את הבצק לעצמו בתחילת המנוחה, לא למראה קבוע אחד.",
      ),
    ).toBeInTheDocument();
  });

  it("embeds the approved Short without autoplay or a local media copy", () => {
    render(<AutolyseCalibration />);

    const player = screen.getByTitle(
      "מיד אחרי הערבוב – הבצק עדיין גס ולא אחיד. אחרי המנוחה – הבצק מחובר יותר ונמתח בקלות רבה יותר.",
    );

    expect(player.tagName).toBe("IFRAME");
    expect(player).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/8PpC8eZPTgY?playsinline=1&rel=0",
    );
    expect(player).toHaveAttribute("loading", "lazy");
    expect(player).toHaveAttribute("allowfullscreen");
    expect(player.getAttribute("src")).not.toContain("autoplay=1");
    expect(document.querySelector("video")).not.toBeInTheDocument();
  });
});
