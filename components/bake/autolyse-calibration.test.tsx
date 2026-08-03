import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AutolyseCalibration } from "./autolyse-calibration";

describe("AutolyseCalibration", () => {
  it("keeps both approved comparison captions visible in the text fallback", () => {
    render(<AutolyseCalibration initialCheck="אין כיסי קמח יבש" />);

    expect(screen.getByTestId("autolyse-calibration")).toBeInTheDocument();
    expect(screen.getByText("אין כיסי קמח יבש")).toBeInTheDocument();
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

  it("links the compact calibration entry to the approved Short without a broken embed", () => {
    render(<AutolyseCalibration initialCheck="אין כיסי קמח יבש" />);

    const link = screen.getByRole("link", {
      name: /מיד אחרי הערבוב.*אחרי המנוחה/,
    });
    expect(link).toHaveAttribute("href", "https://www.youtube.com/shorts/0JzkxDMnDhI");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(link).toHaveAttribute("data-surface", "inset");
    expect(link).toHaveClass("bg-ink/[0.035]");
    expect(link).not.toHaveClass("shadow-sm");
    expect(link).toHaveClass("block");
    expect(screen.queryByTitle(/מיד אחרי הערבוב/)).not.toBeInTheDocument();
    expect(document.querySelector("iframe")).not.toBeInTheDocument();
  });
});
