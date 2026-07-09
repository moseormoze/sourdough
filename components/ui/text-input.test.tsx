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

  it("defaults to dir='auto' for mixed-language input", () => {
    render(<TextInput label="שם" />);
    expect(screen.getByLabelText("שם")).toHaveAttribute("dir", "auto");
  });

  it("keeps dir='auto' by default for type='email' (regression)", () => {
    render(<TextInput label="אימייל" type="email" />);
    const input = screen.getByLabelText("אימייל");
    expect(input).toHaveAttribute("dir", "auto");
    expect(input).toHaveAttribute("type", "email");
  });

  it("keeps dir='auto' by default for type='text' (regression)", () => {
    render(<TextInput label="שם המתכון" type="text" />);
    const input = screen.getByLabelText("שם המתכון");
    expect(input).toHaveAttribute("dir", "auto");
    expect(input).toHaveAttribute("type", "text");
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
