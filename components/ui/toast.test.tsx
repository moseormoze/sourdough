import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ToastProvider, useToast } from "./toast";

function Harness({ onReady }: { onReady: (api: ReturnType<typeof useToast>) => void }) {
  const api = useToast();
  onReady(api);
  return null;
}

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a message after show() is called", () => {
    let api: ReturnType<typeof useToast> | null = null;
    render(
      <ToastProvider>
        <Harness onReady={(a) => (api = a)} />
      </ToastProvider>
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    act(() => api?.show("המתכון נשמר"));
    expect(screen.getByRole("status")).toHaveTextContent("המתכון נשמר");
  });

  it("auto-dismisses after default 2400ms", () => {
    let api: ReturnType<typeof useToast> | null = null;
    render(
      <ToastProvider>
        <Harness onReady={(a) => (api = a)} />
      </ToastProvider>
    );
    act(() => api?.show("נשמר"));
    expect(screen.queryByRole("status")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2399);
    });
    expect(screen.queryByRole("status")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("replaces previous toast instead of stacking", () => {
    let api: ReturnType<typeof useToast> | null = null;
    render(
      <ToastProvider>
        <Harness onReady={(a) => (api = a)} />
      </ToastProvider>
    );
    act(() => api?.show("ראשון"));
    act(() => api?.show("שני"));
    const statuses = screen.getAllByRole("status");
    expect(statuses).toHaveLength(1);
    expect(statuses[0]).toHaveTextContent("שני");
  });

  it("renders action button with longer 5s default duration", () => {
    let api: ReturnType<typeof useToast> | null = null;
    const onPress = vi.fn();
    render(
      <ToastProvider>
        <Harness onReady={(a) => (api = a)} />
      </ToastProvider>
    );
    act(() => api?.show("נמחק", { action: { label: "בטל", onPress } }));
    expect(screen.getByRole("button", { name: "בטל" })).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(screen.queryByRole("status")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("dismiss() cancels the active toast", () => {
    let api: ReturnType<typeof useToast> | null = null;
    render(
      <ToastProvider>
        <Harness onReady={(a) => (api = a)} />
      </ToastProvider>
    );
    act(() => api?.show("שלום"));
    expect(screen.queryByRole("status")).toBeInTheDocument();
    act(() => api?.dismiss());
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("throws when useToast is used outside provider", () => {
    const original = console.error;
    console.error = () => {};
    expect(() => render(<Harness onReady={() => {}} />)).toThrow();
    console.error = original;
  });
});
