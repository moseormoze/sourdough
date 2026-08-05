import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TextInput } from "./text-input";

describe("TextInput", () => {
  it("renders label and associates it with the input", () => {
    render(<TextInput label="שם המתכון" />);
    const input = screen.getByLabelText("שם המתכון");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  // dir="auto" resolves from the *value*, so an empty field falls back to LTR and
  // its placeholder (the field's hint) aligns left inside an RTL form. Inheriting
  // the page direction keeps the hint on the RTL start edge; bidi still renders a
  // Latin value (an email) left-to-right inside the right-aligned field.
  it("inherits the page direction for type='text' so an empty field's hint aligns to the RTL start", () => {
    render(<TextInput label="שם" />);
    expect(screen.getByLabelText("שם")).not.toHaveAttribute("dir");
  });

  it("inherits the page direction for type='email' (empty value must not fall back to LTR)", () => {
    render(<TextInput label="אימייל" type="email" />);
    const input = screen.getByLabelText("אימייל");
    expect(input).not.toHaveAttribute("dir");
    expect(input).toHaveAttribute("type", "email");
  });

  it("inherits the page direction for type='text' when passed explicitly", () => {
    render(<TextInput label="שם המתכון" type="text" />);
    const input = screen.getByLabelText("שם המתכון");
    expect(input).not.toHaveAttribute("dir");
    expect(input).toHaveAttribute("type", "text");
  });

  it("still honours an explicit dir='auto'", () => {
    render(<TextInput label="שם" dir="auto" />);
    expect(screen.getByLabelText("שם")).toHaveAttribute("dir", "auto");
  });

  it("defaults to dir='ltr' for type='date'", () => {
    render(<TextInput label="תאריך" type="date" />);
    const input = screen.getByLabelText("תאריך");
    expect(input).toHaveAttribute("dir", "ltr");
    expect(input).toHaveAttribute("type", "date");
  });

  it("defaults to dir='ltr' for type='time'", () => {
    render(<TextInput label="שעה" type="time" />);
    const input = screen.getByLabelText("שעה");
    expect(input).toHaveAttribute("dir", "ltr");
    expect(input).toHaveAttribute("type", "time");
  });

  it("lets an explicit dir override the type='date' default", () => {
    render(<TextInput label="תאריך" type="date" dir="rtl" />);
    expect(screen.getByLabelText("תאריך")).toHaveAttribute("dir", "rtl");
  });

  it("lets an explicit dir override the type='time' default", () => {
    render(<TextInput label="שעה" type="time" dir="auto" />);
    expect(screen.getByLabelText("שעה")).toHaveAttribute("dir", "auto");
  });

  it("shows error as alert and sets aria-invalid", () => {
    render(<TextInput label="שם" error="שדה חובה" />);
    expect(screen.getByLabelText("שם")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("שדה חובה");
  });

  it("does not set aria-invalid when no error", () => {
    render(<TextInput label="שם" />);
    expect(screen.getByLabelText("שם")).not.toHaveAttribute("aria-invalid");
  });

  it("shows hint when no error", () => {
    render(<TextInput label="שם" hint="כל שם מותר" />);
    expect(screen.getByText("כל שם מותר")).toBeInTheDocument();
  });

  it("hides hint when error present", () => {
    render(<TextInput label="שם" hint="כל שם מותר" error="חובה" />);
    expect(screen.queryByText("כל שם מותר")).not.toBeInTheDocument();
  });

  it("forwards value and onChange", () => {
    const onChange = vi.fn();
    render(<TextInput label="שם" value="לחם" onChange={onChange} />);
    const input = screen.getByLabelText("שם") as HTMLInputElement;
    expect(input.value).toBe("לחם");
    fireEvent.change(input, { target: { value: "חלה" } });
    expect(onChange).toHaveBeenCalled();
  });
});

describe("TextInput — appearance", () => {
  it("defaults to the outline appearance (legacy bordered look)", () => {
    render(<TextInput label="שם" />);
    const input = screen.getByLabelText("שם");
    expect(input.className).toContain("border-line");
    expect(input.className).toContain("rounded-lg");
    expect(input.className).not.toContain("bg-paper/70");
  });

  it("renders the inset appearance as a borderless frosted field", () => {
    render(<TextInput label="שם" appearance="inset" />);
    const input = screen.getByLabelText("שם");
    expect(input.className).toContain("bg-paper/70");
    expect(input.className).toContain("rounded-2xl");
    expect(input.className).not.toContain("border-line");
  });

  it("shows a danger ring, not a border, for errors in the inset appearance", () => {
    render(<TextInput label="שם" appearance="inset" error="שדה חובה" />);
    const input = screen.getByLabelText("שם");
    expect(input.className).toContain("ring-danger/40");
    expect(input.className).not.toContain("border-danger");
  });
});
