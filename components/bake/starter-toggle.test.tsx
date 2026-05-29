import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarterToggle } from "./starter-toggle";

describe("StarterToggle", () => {
  it("renders the label", () => {
    render(<StarterToggle label="הסטארטר כבר בשיא?" value={true} onChange={() => {}} />);
    expect(screen.getByText("הסטארטר כבר בשיא?")).toBeInTheDocument();
  });

  it("'כן' option is active when value=true", () => {
    render(<StarterToggle label="label" value={true} onChange={() => {}} />);
    const yesOption = screen.getByRole("radio", { name: "כן" });
    expect(yesOption).toHaveAttribute("aria-checked", "true");
    const noOption = screen.getByRole("radio", { name: "לא" });
    expect(noOption).toHaveAttribute("aria-checked", "false");
  });

  it("'לא' option is active when value=false", () => {
    render(<StarterToggle label="label" value={false} onChange={() => {}} />);
    const noOption = screen.getByRole("radio", { name: "לא" });
    expect(noOption).toHaveAttribute("aria-checked", "true");
    const yesOption = screen.getByRole("radio", { name: "כן" });
    expect(yesOption).toHaveAttribute("aria-checked", "false");
  });

  it("clicking 'לא' calls onChange(false)", () => {
    const onChange = vi.fn();
    render(<StarterToggle label="label" value={true} onChange={onChange} />);
    const noOption = screen.getByRole("radio", { name: "לא" });
    fireEvent.pointerDown(noOption);
    fireEvent.pointerUp(noOption);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("clicking 'כן' calls onChange(true)", () => {
    const onChange = vi.fn();
    render(<StarterToggle label="label" value={false} onChange={onChange} />);
    const yesOption = screen.getByRole("radio", { name: "כן" });
    fireEvent.pointerDown(yesOption);
    fireEvent.pointerUp(yesOption);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
